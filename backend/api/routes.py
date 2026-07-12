from fastapi import APIRouter, UploadFile, File, HTTPException
from services.triage_engine import analyze_patch
from services.llm_service import MedGemmaService
import io
import cv2
import numpy as np

router = APIRouter()

# Keep a simple in-memory session cache for the active patient clinical history to merge with histopathology logic
latest_patient_context = {
    "patient": {"name": "Arthur Miller", "age": "68 y/o", "gender": "Male"},
    "history_text": "68-year-old male presenting with localized lower left quadrant abdominal pain, unexplained weight loss (15 lbs in 3 months), and intermittent hematochezia. Prior colonoscopy revealed an ulcerated, stenosing mass in the sigmoid colon."
}

@router.post("/analyze_patch")
async def process_patch(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    image_bytes = await file.read()
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
         raise HTTPException(status_code=400, detail="Invalid image data")
         
    # resize to 512x512 if not already
    if image.shape[:2] != (512, 512):
        image = cv2.resize(image, (512, 512))
        
    result = analyze_patch(image)
    
    # Run active local MedGemma MLX visual-linguistic reasoning on slide features + patient context!
    llm_service = MedGemmaService.get_instance()
    
    grade = result["grade"]
    patient = latest_patient_context["patient"]
    history = latest_patient_context["history_text"]
    
    # Generate live model diagnostic report
    result["ai_reasoning_summary"] = llm_service.generate_reasoning(grade, patient, history)
    
    return result

@router.post("/upload_patient_fhir")
async def upload_patient_fhir(data: dict):
    """
    Parses an HL7 FHIR Bundle for colorectal cancer clinical pathways.
    Extracts demographics, CEA biomarkers (LOINC 4544-3), and active clinical history.
    """
    try:
        resource_type = data.get("resourceType")
        if not resource_type:
            raise HTTPException(status_code=400, detail="Not a valid FHIR Resource")
            
        patient_info = {"name": "Unknown Patient", "age": "N/A", "gender": "unknown"}
        clinical_history = []
        lab_markers = []
        
        resources = []
        if resource_type == "Bundle":
            entries = data.get("entry", [])
            resources = [e.get("resource", {}) for e in entries if "resource" in e]
        else:
            resources = [data]
            
        for res in resources:
            r_type = res.get("resourceType")
            if r_type == "Patient":
                # Extract name
                names = res.get("name", [])
                if names:
                    family = names[0].get("family", "")
                    givens = " ".join(names[0].get("given", []))
                    patient_info["name"] = f"{givens} {family}".strip() or "Unknown Patient"
                # Extract gender
                patient_info["gender"] = res.get("gender", "unknown").capitalize()
                # Calculate age from birthDate
                birth_date = res.get("birthDate")
                if birth_date:
                    from datetime import datetime
                    try:
                        b_dt = datetime.strptime(birth_date, "%Y-%m-%d")
                        age = datetime.now().year - b_dt.year
                        patient_info["age"] = f"{age} y/o"
                    except Exception:
                        patient_info["age"] = birth_date
                        
            elif r_type == "Observation":
                code_data = res.get("code", {}).get("coding", [{}])[0]
                code_val = code_data.get("code")
                display_val = code_data.get("display", "Observation")
                
                # Check for CEA marker (LOINC 4544-3)
                if code_val == "4544-3" or "cea" in display_val.lower():
                    val_quantity = res.get("valueQuantity", {})
                    val_num = val_quantity.get("value", 0.0)
                    unit = val_quantity.get("unit", "ng/mL")
                    lab_markers.append({
                        "name": "Carcinoembryonic Antigen (CEA)",
                        "code": "LOINC 4544-3",
                        "value": val_num,
                        "unit": unit,
                        "status": "High" if val_num > 5.0 else "Normal",
                        "reference_range": "0 - 5.0 ng/mL"
                    })
                else:
                    # Generic history or symptoms
                    val_str = res.get("valueString")
                    if val_str:
                        clinical_history.append({
                            "category": display_val,
                            "text": val_str
                        })
                        
        # Fallback if no details extracted
        if not clinical_history:
            clinical_history.append({
                "category": "History of Present Illness",
                "text": "No active patient history ingested. Standard local diagnostics active."
            })
            
        # Compile patient history text for MedGemma prompt integration
        hist_text = " ".join([h["text"] for h in clinical_history])
        
        # Cache active session patient history
        global latest_patient_context
        latest_patient_context = {
            "patient": patient_info,
            "history_text": hist_text
        }
            
        return {
            "status": "success",
            "patient": patient_info,
            "clinical_history": clinical_history,
            "lab_markers": lab_markers,
            "raw_fhir_parsed": True
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"FHIR Parsing failed: {str(e)}")
