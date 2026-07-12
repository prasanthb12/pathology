let viewer = null;
let currentCaseData = null;
let activeOverlayElements = [];
let currentCaseKey = 'case_a';
let showOverlays = true;
let showStroma = false;
let showTissue = true;
let stromaSvgOverlay = null;

// Immersive clinical study cases to simulate real patient pathways and prevent automation bias
const studyCases = {
    case_a: {
        fileName: "Arthur_Miller_Sigmoid_Mass.png",
        grade: "Adenocarcinoma (TUM)",
        confidence_score: 0.9420,
        homogeneity_score: 0.8845,
        requires_expert_review: false,
        biomarkers: {
            lymphovascular_invasion: true,
            tumor_necrosis: true
        },
        ai_summary: "Patient Arthur Miller (68 y/o male) presents with a highly elevated serum CEA of 14.2 ng/mL and symptoms of LLQ abdominal pain and weight loss. The histopathological analysis of the sigmoid colon lesion reveals poorly differentiated Adenocarcinoma (TUM). The tissue exhibits complete loss of gland crypt architecture, extensive chaotic sheets of atypical epithelial cells, and a desmoplastic stromal response. High-density nuclear piling with severe atypia is prominent in multiple foci, confirming active invasive malignant infiltration. Expert surgical review of margins recommended.",
        fhir: {
            resourceType: "Bundle",
            type: "collection",
            entry: [
                {
                    resource: {
                        resourceType: "Patient",
                        id: "pat-arthur-miller",
                        gender: "male",
                        birthDate: "1958-04-12",
                        name: [{"family": "Miller", "given": ["Arthur"]}]
                    }
                },
                {
                    resource: {
                        resourceType: "Observation",
                        id: "obs-symptoms",
                        status: "final",
                        code: {
                            coding: [{"system": "http://loinc.org", "code": "10160-0", "display": "History of Present Illness"}]
                        },
                        valueString: "68-year-old male presenting with localized lower left quadrant abdominal pain, unexplained weight loss (15 lbs in 3 months), and intermittent hematochezia. Colonoscopy revealed an ulcerated, stenosing mass in the sigmoid colon."
                    }
                },
                {
                    resource: {
                        resourceType: "Observation",
                        id: "obs-cea",
                        status: "final",
                        code: {
                            coding: [{"system": "http://loinc.org", "code": "4544-3", "display": "CEA [Mass/Volume] in Serum or Plasma"}]
                        },
                        valueQuantity: {
                            value: 14.2,
                            unit: "ng/mL",
                            system: "http://unitsofmeasure.org",
                            code: "ng/mL"
                        }
                    }
                }
            ]
        },
        nuclei_clusters: [
            {"x": 100, "y": 80, "w": 120, "h": 130, "area": 12000},
            {"x": 300, "y": 220, "w": 140, "h": 140, "area": 16500},
            {"x": 150, "y": 350, "w": 130, "h": 120, "area": 14500}
        ],
        evidence_steps: [
            {
                "step_number": 1,
                "title": "Glandular Disorganization",
                "description": "Highly chaotic epithelial sheets with complete breakdown of structural glandular crypts. No open lumens or basal rows intact.",
                "coordinates": {"x": 100, "y": 80, "w": 120, "h": 130}
            },
            {
                "step_number": 2,
                "title": "Nuclear Stratification & Piling",
                "description": "Severe nuclear crowding with multiple overlapping layers of hyperchromatic, enlarged nucleoli indicating high mitotic action.",
                "coordinates": {"x": 300, "y": 220, "w": 140, "h": 140}
            },
            {
                "step_number": 3,
                "title": "Stroma-Malignant Border Invasion",
                "description": "Basement membranes are entirely breached. Malignant epithelial clusters are actively infiltrating the surrounding fibrous collagen matrix.",
                "coordinates": {"x": 150, "y": 350, "w": 130, "h": 120}
            }
        ],
        detailed_analysis: {
            glandular_complexity: "High",
            immune_infiltration: "Moderate (Stromal)",
            stroma_to_tumor: {
                stroma: 35,
                tumor: 65,
                density: "Dense Desmoplastic"
            },
            tissue_artifacts: "None",
            nuclear_polarity: "Lost",
            nucleoli: "Multiple/Pleomorphic",
            nuclear_pleomorphism: "Severe"
        }
    },
    case_b: {
        fileName: "Elena_Rodriguez_Sigmoid_Polyp.png",
        grade: "Low-Grade Dysplasia (LGD)",
        confidence_score: 0.9150,
        homogeneity_score: 0.5840,
        requires_expert_review: false,
        biomarkers: {
            lymphovascular_invasion: false,
            tumor_necrosis: false
        },
        ai_summary: "Patient Elena Rodriguez (54 y/o female) exhibits a normal serum CEA of 1.8 ng/mL and is under routine colonoscopy surveillance. Histopathology of the resected sessile polyp shows Low-Grade Dysplasia (LGD). Crypt structures are largely intact and well-organized, but line elements exhibit nuclear enlargement and crowded pseudostratification confined to the basal half of the mucosa. There is focal goblet cell depletion but absolutely no signs of basement membrane breaching or stromal invasion, aligning with a favorable non-invasive prognosis.",
        fhir: {
            resourceType: "Bundle",
            type: "collection",
            entry: [
                {
                    resource: {
                        resourceType: "Patient",
                        id: "pat-elena-rodriguez",
                        gender: "female",
                        birthDate: "1972-09-24",
                        name: [{"family": "Rodriguez", "given": ["Elena"]}]
                    }
                },
                {
                    resource: {
                        resourceType: "Observation",
                        id: "obs-symptoms",
                        status: "final",
                        code: {
                            coding: [{"system": "http://loinc.org", "code": "10160-0", "display": "History of Present Illness"}]
                        },
                        valueString: "54-year-old female under routine surveillance colonoscopy due to a prior history of adenomatous polyps. Current screening revealed a 1.2 cm sessile polyp in the transverse colon. Patient reports minor bloating but no weight loss or hematochezia."
                    }
                },
                {
                    resource: {
                        resourceType: "Observation",
                        id: "obs-cea",
                        status: "final",
                        code: {
                            coding: [{"system": "http://loinc.org", "code": "4544-3", "display": "CEA [Mass/Volume] in Serum or Plasma"}]
                        },
                        valueQuantity: {
                            value: 1.8,
                            unit: "ng/mL",
                            system: "http://unitsofmeasure.org",
                            code: "ng/mL"
                        }
                    }
                }
            ]
        },
        nuclei_clusters: [
            {"x": 200, "y": 120, "w": 100, "h": 90, "area": 8500},
            {"x": 80, "y": 280, "w": 110, "h": 100, "area": 9500},
            {"x": 320, "y": 300, "w": 90, "h": 100, "area": 7500}
        ],
        evidence_steps: [
            {
                "step_number": 1,
                "title": "Basally-Confined Crowding",
                "description": "Crypt lining shows nuclear enlargement and pseudostratification, restricted to the basal 50% of the cells.",
                "coordinates": {"x": 200, "y": 120, "w": 100, "h": 90}
            },
            {
                "step_number": 2,
                "title": "Preserved Crypt Architecture",
                "description": "Slightly crowded but structurally intact parallel mucosal crypt margins with zero invasive stromal breach.",
                "coordinates": {"x": 80, "y": 280, "w": 110, "h": 100}
            },
            {
                "step_number": 3,
                "title": "Goblet Cell Depletion",
                "description": "Focal depletion of intracellular mucin droplets within hyperactive mucosal lining cells, confirming low-grade dysplastic transformation.",
                "coordinates": {"x": 320, "y": 300, "w": 90, "h": 100}
            }
        ],
        detailed_analysis: {
            glandular_complexity: "Medium",
            immune_infiltration: "Sparse",
            stroma_to_tumor: {
                stroma: 42,
                tumor: 58,
                density: "Loose/Inert"
            },
            tissue_artifacts: "Folds (border zone)",
            nuclear_polarity: "Partially Preserved",
            nucleoli: "Prominent",
            nuclear_pleomorphism: "Moderate"
        }
    },
    case_c: {
        fileName: "Wei_Chen_Sigmoid_Mucosa.png",
        grade: "Normal (NORM)",
        confidence_score: 0.9850,
        homogeneity_score: 0.1250,
        requires_expert_review: false,
        biomarkers: {
            lymphovascular_invasion: false,
            tumor_necrosis: false
        },
        ai_summary: "Patient Wei Chen (42 y/o male) exhibits a normal serum CEA level of 0.9 ng/mL and normal crypt margins. Histopathology reveals completely healthy sigmoid mucosa classified as Normal (NORM). Open, active mucosal lumens lined with mucin-secreting goblet cells are evenly arranged in parallel columns. Nuclei maintain a perfect single-layered basal polarity with uniform shape and zero mitotic abnormalities, indicating healthy, non-neoplastic tissue.",
        fhir: {
            resourceType: "Bundle",
            type: "collection",
            entry: [
                {
                    resource: {
                        resourceType: "Patient",
                        id: "pat-wei-chen",
                        gender: "male",
                        birthDate: "1984-02-18",
                        name: [{"family": "Chen", "given": ["Wei"]}]
                    }
                },
                {
                    resource: {
                        resourceType: "Observation",
                        id: "obs-symptoms",
                        status: "final",
                        code: {
                            coding: [{"system": "http://loinc.org", "code": "10160-0", "display": "History of Present Illness"}]
                        },
                        valueString: "42-year-old male presenting with mild chronic bloating and dyspepsia. Diagnostic colonoscopy was performed, and mucosal biopsies were taken from a normal-appearing sigmoid colon to rule out microscopic colitis."
                    }
                },
                {
                    resource: {
                        resourceType: "Observation",
                        id: "obs-cea",
                        status: "final",
                        code: {
                            coding: [{"system": "http://loinc.org", "code": "4544-3", "display": "CEA [Mass/Volume] in Serum or Plasma"}]
                        },
                        valueQuantity: {
                            value: 0.9,
                            unit: "ng/mL",
                            system: "http://unitsofmeasure.org",
                            code: "ng/mL"
                        }
                    }
                }
            ]
        },
        nuclei_clusters: [
            {"x": 150, "y": 150, "w": 90, "h": 90, "area": 7000},
            {"x": 300, "y": 150, "w": 95, "h": 95, "area": 7500},
            {"x": 220, "y": 320, "w": 100, "h": 100, "area": 8500}
        ],
        evidence_steps: [
            {
                "step_number": 1,
                "title": "Intact Basal Polarity",
                "description": "Nuclei are perfectly organized in a neat, uniform row at the absolute base of the epithelial cells, with basal polarity fully intact.",
                "coordinates": {"x": 150, "y": 150, "w": 90, "h": 90}
            },
            {
                "step_number": 2,
                "title": "Active Goblet Secretion",
                "description": "Clear, wide mucosal lumens lined by highly active goblet cells actively secreting normal, clear mucin.",
                "coordinates": {"x": 300, "y": 150, "w": 95, "h": 95}
            },
            {
                "step_number": 3,
                "title": "Orderly Crypt Architecture",
                "description": "Perfect cross-sections of healthy mucosal crypts, displaying uniform shape and surrounded by a thin, benign stroma layer.",
                "coordinates": {"x": 220, "y": 320, "w": 100, "h": 100}
            }
        ],
        detailed_analysis: {
            glandular_complexity: "Low",
            immune_infiltration: "None",
            stroma_to_tumor: {
                stroma: 15,
                tumor: 85,
                density: "Loose/Inert"
            },
            tissue_artifacts: "None",
            nuclear_polarity: "Preserved",
            nucleoli: "Inconspicuous",
            nuclear_pleomorphism: "Mild"
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Setup Navigation Tabs
    const tabEvidenceBtn = document.getElementById('tab-evidence-btn');
    const tabFhirBtn = document.getElementById('tab-fhir-btn');
    const tabEvidenceContent = document.getElementById('tab-evidence-content');
    const tabFhirContent = document.getElementById('tab-fhir-content');

    tabEvidenceBtn.addEventListener('click', () => {
        tabEvidenceBtn.classList.add('active', 'text-slate-200');
        tabEvidenceBtn.classList.remove('text-slate-400');
        tabFhirBtn.classList.remove('active', 'text-slate-200');
        tabFhirBtn.classList.add('text-slate-400');
        
        tabEvidenceContent.classList.remove('hidden');
        tabFhirContent.classList.add('hidden');
    });

    tabFhirBtn.addEventListener('click', () => {
        tabFhirBtn.classList.add('active', 'text-slate-200');
        tabFhirBtn.classList.remove('text-slate-400');
        tabEvidenceBtn.classList.remove('active', 'text-slate-200');
        tabEvidenceBtn.classList.add('text-slate-400');
        
        tabFhirContent.classList.remove('hidden');
        tabEvidenceContent.classList.add('hidden');
    });

    // Layer Toggle Buttons
    const toggleTissueBtn = document.getElementById('toggle-tissue-btn');
    const toggleOverlayBtn = document.getElementById('toggle-overlay-btn');
    const toggleStromaBtn = document.getElementById('toggle-stroma-btn');

    // Make H&E Core active by default
    toggleTissueBtn.classList.add('bg-accent/25', 'text-accent', 'border-accent/30');
    toggleTissueBtn.classList.remove('bg-slate-900', 'text-slate-300', 'border-slate-800');

    toggleTissueBtn.addEventListener('click', () => {
        showTissue = !showTissue;
        updateTissueVisibility();
        if (showTissue) {
            toggleTissueBtn.classList.add('bg-accent/25', 'text-accent', 'border-accent/30');
            toggleTissueBtn.classList.remove('bg-slate-900', 'text-slate-300', 'border-slate-800');
        } else {
            toggleTissueBtn.classList.remove('bg-accent/25', 'text-accent', 'border-accent/30');
            toggleTissueBtn.classList.add('bg-slate-900', 'text-slate-300', 'border-slate-800');
        }
    });

    toggleStromaBtn.addEventListener('click', () => {
        showStroma = !showStroma;
        const stromaSvg = document.getElementById('osd-stroma-svg');
        if (showStroma) {
            toggleStromaBtn.classList.add('bg-purple-900/35', 'text-purple-300', 'border-purple-800');
            toggleStromaBtn.classList.remove('bg-slate-900', 'text-slate-300', 'border-slate-800');
            if (stromaSvg) stromaSvg.classList.remove('hidden');
        } else {
            toggleStromaBtn.classList.remove('bg-purple-900/35', 'text-purple-300', 'border-purple-800');
            toggleStromaBtn.classList.add('bg-slate-900', 'text-slate-300', 'border-slate-800');
            if (stromaSvg) stromaSvg.classList.add('hidden');
        }
    });

    toggleOverlayBtn.addEventListener('click', () => {
        showOverlays = !showOverlays;
        if (showOverlays) {
            toggleOverlayBtn.classList.add('bg-accent/25', 'text-accent', 'border-accent/30');
            toggleOverlayBtn.classList.remove('bg-slate-900', 'text-slate-300', 'border-slate-800');
            activeOverlayElements.forEach(el => el.classList.remove('hidden'));
        } else {
            toggleOverlayBtn.classList.remove('bg-accent/25', 'text-accent', 'border-accent/30');
            toggleOverlayBtn.classList.add('bg-slate-900', 'text-slate-300', 'border-slate-800');
            activeOverlayElements.forEach(el => el.classList.add('hidden'));
        }
    });


    // Setup File Upload
    const uploadInput = document.getElementById('upload-patch');
    uploadInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        await processUploadedFile(file);
    });

    // Setup custom FHIR Ingest buttons
    const fhirIngestBtn = document.getElementById('ingest-fhir-btn');
    const fhirResetBtn = document.getElementById('reset-fhir-btn');
    const fhirJsonInput = document.getElementById('fhir-json-input');

    fhirIngestBtn.addEventListener('click', () => {
        try {
            const rawText = fhirJsonInput.value.trim();
            if (!rawText) throw new Error("FHIR text area is empty.");
            const parsedObj = JSON.parse(rawText);
            ingestFhirData(parsedObj);
            alert("Custom FHIR Bundle ingested in-memory successfully! View 'FHIR Patient Case' tab.");
            tabFhirBtn.click(); // auto switch to show it
        } catch (err) {
            alert("Error Ingesting FHIR: " + err.message);
        }
    });

    fhirResetBtn.addEventListener('click', () => {
        fhirJsonInput.value = '';
        if (currentCaseData) {
            ingestFhirData(currentCaseData.fhir);
        }
    });

    // Setup Download Report Button listener
    const downloadReportBtn = document.getElementById('download-report-btn');
    if (downloadReportBtn) {
        downloadReportBtn.addEventListener('click', () => {
            if (!currentCaseData) {
                alert("No active pathology data available to download. Please upload an H&E patch first.");
                return;
            }
            
            const patientName = document.getElementById('patient-name').innerText || "Anonymous Patient";
            const patientAge = document.getElementById('patient-age').innerText || "Age N/A";
            const patientGender = document.getElementById('patient-gender').innerText || "Gender Unknown";
            const fileName = document.getElementById('file-name-display').innerText || "Unnamed_Patch";
            const folderName = currentCaseData.folder_name || "Local Workspace";
            
            const detailed = currentCaseData.detailed_analysis || {};
            const stromaPct = detailed.stroma_to_tumor?.stroma ?? 0;
            const tumorPct = detailed.stroma_to_tumor?.tumor ?? 0;
            const density = detailed.stroma_to_tumor?.density || "N/A";
            
            const biomarkers = currentCaseData.biomarkers || {};
            const lviStatus = biomarkers.lymphovascular_invasion ? "DETECTED" : "NOT DETECTED";
            const necrosisStatus = biomarkers.tumor_necrosis ? "DETECTED" : "NOT DETECTED";
            
            const timestamp = new Date().toLocaleString();
            
            let evidenceStr = "";
            if (currentCaseData.evidence_steps) {
                currentCaseData.evidence_steps.forEach(step => {
                    const c = step.coordinates || {x:0, y:0, w:0, h:0};
                    evidenceStr += `Step ${step.step_number}: ${step.title}\n`;
                    evidenceStr += `  Description: ${step.description}\n`;
                    evidenceStr += `  Coordinates: X: ${c.x}, Y: ${c.y}, Width: ${c.w}, Height: ${c.h}\n\n`;
                });
            }

            const reportText = `======================================================================
ONCOPATHAI CLINICAL HISTOPATHOLOGY WORKSTATION REPORT
======================================================================
Generated Date:          ${timestamp}
Compliance Validation:   HIPAA & DPDPA 2023 Compliant Sandbox
Resident Agent Status:   Online (GPU Accelerated Local Inference)

----------------------------------------------------------------------
PATIENT & LESION METADATA
----------------------------------------------------------------------
Patient Name:            ${patientName}
Age & Gender:            ${patientAge} / ${patientGender}
Uploaded Folder Name:    ${folderName}
Uploaded Image File:     ${fileName}

----------------------------------------------------------------------
AI INFERENCE & HISTOLOGY GRADINGS
----------------------------------------------------------------------
Predicted Class/Grade:   ${currentCaseData.grade}
Confidence Score (AUC):  ${(currentCaseData.confidence_score * 100).toFixed(2)}% (AUC: ${currentCaseData.confidence_score.toFixed(4)})
Homogeneity Index:       ${currentCaseData.homogeneity_score.toFixed(4)}
Expert Pathologist Triage: ${currentCaseData.requires_expert_review || currentCaseData.confidence_score < 0.85 ? 'REQUIRED (Low confidence flag)' : 'NOT REQUIRED (Automated clearance)'}

----------------------------------------------------------------------
CYTOLOGICAL & STROMAL PARAMETERS
----------------------------------------------------------------------
Stromal proportion:       ${stromaPct}%
Tumor proportion:         ${tumorPct}%
Stromal Density Class:    ${density}
Glandular Complexity:     ${detailed.glandular_complexity || 'N/A'}
Immune Infiltration:      ${detailed.immune_infiltration || 'N/A'}
Nuclear Polarity Status:  ${detailed.nuclear_polarity || 'N/A'}
Nucleoli Type:            ${detailed.nucleoli || 'N/A'}
Nuclear Pleomorphism:     ${detailed.nuclear_pleomorphism || 'N/A'}
Tissue Artifacts:         ${detailed.tissue_artifacts || 'None'}

----------------------------------------------------------------------
PROGNOSTIC BIOMARKERS
----------------------------------------------------------------------
Lymphovascular Invasion (LVI): ${lviStatus}
Tumor Necrosis Core:           ${necrosisStatus}

----------------------------------------------------------------------
RESIDENT AGENT CLINICAL PATHWAY REASONING
----------------------------------------------------------------------
${currentCaseData.ai_summary || "No reasoning summary available."}

----------------------------------------------------------------------
EVIDENCE WALKTHROUGH STEPS (RULE 3 VALIDATION)
----------------------------------------------------------------------
${evidenceStr || "No evidence steps mapped."}
======================================================================
This document is a formal clinical pathology brief. All features and
visual-linguistic summaries were processed inside a secure on-premise
local environment using MedSigLIP and MedGemma.
======================================================================`;

            // Download file
            const blob = new Blob([reportText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Pathology_Report_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
});

// Load a built-in interactive study case
function loadStudyCase(caseKey) {
    currentCaseKey = caseKey;
    const caseData = studyCases[caseKey];
    if (!caseData) return;
    
    currentCaseData = caseData;
    
    // Display File Name
    const fileNameDisplay = document.getElementById('file-name-display');
    fileNameDisplay.innerText = caseData.fileName;
    fileNameDisplay.classList.remove('hidden');

    // Display image in OpenSeadragon (simulate pyramidal high-resolution loading via sample H&E pattern)
    const placeholder = document.getElementById('placeholder');
    placeholder.style.display = 'none';

    if (viewer) {
        viewer.destroy();
    }

    let mockHEUrl = "";
    if (caseKey === 'case_a') {
        mockHEUrl = "https://images.unsplash.com/photo-1579154204601-01588f351167?w=1000&auto=format&fit=crop"; // dark cellular purple H&E look
    } else if (caseKey === 'case_b') {
        mockHEUrl = "https://images.unsplash.com/photo-1579154341098-e4e15867af15?w=1000&auto=format&fit=crop"; // red crypt dysplasia structure
    } else {
        mockHEUrl = "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1000&auto=format&fit=crop"; // clean organized blue cell columns
    }

    viewer = OpenSeadragon({
        id: "osd-viewer",
        prefixUrl: "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/",
        tileSources: {
            type: 'image',
            url: mockHEUrl
        },
        showNavigationControl: true,
        animationTime: 0.6,
        blendTime: 0.1,
        constrainDuringPan: true,
        maxZoomPixelRatio: 3,
        visibilityRatio: 1.0
    });

    viewer.addHandler('open', () => {
        renderNucleiOverlays(caseData.nuclei_clusters);
        renderStromaOverlay(caseData.nuclei_clusters);
        updateTissueVisibility();
    });

    // Populate Results sidebar
    document.getElementById('evidence-empty').style.display = 'none';
    const resultsPanel = document.getElementById('results-panel');
    resultsPanel.classList.remove('hidden');

    const gradeEl = document.getElementById('grade-result');
    gradeEl.innerText = caseData.grade;

    if (caseData.grade === "Adenocarcinoma (TUM)") {
        gradeEl.className = "text-xl font-extrabold text-danger drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]";
        document.getElementById('confidence-bar').className = "bg-danger h-full transition-all duration-500";
    } else if (caseData.grade.includes("High-Grade") || caseData.grade === "Suspicious for Invasion (SFI)") {
        gradeEl.className = "text-xl font-bold text-warning drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]";
        document.getElementById('confidence-bar').className = "bg-warning h-full transition-all duration-500";
    } else if (caseData.grade.includes("Low-Grade")) {
        gradeEl.className = "text-xl font-bold text-orange-400";
        document.getElementById('confidence-bar').className = "bg-orange-400 h-full transition-all duration-500";
    } else if (caseData.grade === "Normal (NORM)") {
        gradeEl.className = "text-xl font-bold text-success";
        document.getElementById('confidence-bar').className = "bg-success h-full transition-all duration-500";
    } else {
        gradeEl.className = "text-xl font-bold text-slate-300";
        document.getElementById('confidence-bar').className = "bg-slate-400 h-full transition-all duration-500";
    }

    // Set AUC statistics
    document.getElementById('confidence-score').innerText = caseData.confidence_score.toFixed(4);
    document.getElementById('homogeneity-score').innerText = caseData.homogeneity_score.toFixed(4);
    document.getElementById('confidence-bar').style.width = `${caseData.confidence_score * 100}%`;

    // Render new requested clinical parameters
    renderDetailedAnalysis(caseData.detailed_analysis);

    // Expert Triage Check
    const triageAlert = document.getElementById('triage-alert');
    if (caseData.requires_expert_review || caseData.confidence_score < 0.85) {
        triageAlert.classList.remove('hidden');
    } else {
        triageAlert.classList.add('hidden');
    }

    // Render Biomarkers Checklist
    const biomarkersList = document.getElementById('biomarkers-list');
    biomarkersList.innerHTML = '';
    const biomarkersKeys = [
        { key: 'lymphovascular_invasion', label: 'Lymphovascular Invasion (LVI)' },
        { key: 'tumor_necrosis', label: 'Tumor Necrosis / Necrotic Core' }
    ];

    biomarkersKeys.forEach(b => {
        const detected = caseData.biomarkers[b.key];
        const badge = detected 
            ? `<span class="ml-auto text-[10px] bg-danger/15 text-danger border border-danger/25 px-2 py-0.5 rounded font-medium">Detected</span>` 
            : `<span class="ml-auto text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-normal">Not Detected</span>`;
        const dotColor = detected ? 'bg-danger glow-active' : 'bg-slate-700';
        
        biomarkersList.innerHTML += `
            <li class="flex items-center text-xs text-slate-300">
                <span class="w-2 h-2 rounded-full ${dotColor} mr-2.5 shadow-[0_0_8px_rgba(244,63,94,${detected ? '0.6' : '0'})]"></span> 
                <span>${b.label}</span>
                ${badge}
            </li>
        `;
    });

    document.getElementById('ai-reasoning-summary').innerText = caseData.ai_summary;

    renderWalkthroughSteps(caseData.evidence_steps);

    // Ingest FHIR Clinical Bundle
    ingestFhirData(caseData.fhir);
    document.getElementById('fhir-json-input').value = JSON.stringify(caseData.fhir, null, 2);
}

// Render cytological and stromal parameters to UI (STR bar, nuclear polarity, TILs, pleomorphism, nucleoli, artifacts)
function renderDetailedAnalysis(detailed) {
    if (!detailed) return;
    
    // 1. Stromal to tumor bar proportion
    const stromaPct = detailed.stroma_to_tumor.stroma;
    const tumorPct = detailed.stroma_to_tumor.tumor;
    
    const stromaBar = document.getElementById('detailed-str-stroma-bar');
    const tumorBar = document.getElementById('detailed-str-tumor-bar');
    
    stromaBar.style.width = `${stromaPct}%`;
    stromaBar.innerText = `Stroma ${stromaPct}%`;
    
    tumorBar.style.width = `${tumorPct}%`;
    tumorBar.innerText = `Tumor ${tumorPct}%`;
    
    document.getElementById('detailed-str-density').innerText = detailed.stroma_to_tumor.density;
    
    // 2. Cytological badges
    document.getElementById('detailed-glandular').innerText = detailed.glandular_complexity;
    document.getElementById('detailed-immune').innerText = detailed.immune_infiltration;
    document.getElementById('detailed-polarity').innerText = detailed.nuclear_polarity;
    document.getElementById('detailed-nucleoli').innerText = detailed.nucleoli;
    document.getElementById('detailed-pleomorphism').innerText = detailed.nuclear_pleomorphism;
    
    const artifactsEl = document.getElementById('detailed-artifacts');
    artifactsEl.innerText = detailed.tissue_artifacts;
    
    // If there is any artifact, color it warning orange to flag review
    if (detailed.tissue_artifacts !== "None" && detailed.tissue_artifacts !== "") {
        artifactsEl.className = "font-bold text-warning animate-pulse";
    } else {
        artifactsEl.className = "font-semibold text-slate-400";
    }
}

// Custom overlay generation inside OpenSeadragon coordinates
function renderNucleiOverlays(clusters) {
    activeOverlayElements.forEach(el => {
        try { viewer.removeOverlay(el); } catch(err){}
    });
    activeOverlayElements = [];

    if (!clusters) return;

    clusters.forEach((c, idx) => {
        const el = document.createElement('div');
        el.className = `nuclei-highlight-box ${showOverlays ? '' : 'hidden'}`;
        el.id = `osd-overlay-cluster-${idx}`;
        el.title = `Nuclei Cluster #${idx + 1} (Area: ${c.area}px)`;
        
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            highlightWalkthroughStep(idx);
        });

        const rect = new OpenSeadragon.Rect(c.x / 512, c.y / 512, c.w / 512, c.h / 512);
        viewer.addOverlay({
            element: el,
            location: rect
        });
        
        activeOverlayElements.push(el);
    });
}

// Render dynamic segmented stroma mask using SVG EvenOdd fill rule to exclude nuclei regions
function renderStromaOverlay(clusters) {
    if (stromaSvgOverlay) {
        try { viewer.removeOverlay(stromaSvgOverlay); } catch(err){}
        stromaSvgOverlay = null;
    }
    
    if (!clusters) return;
    
    const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    el.setAttribute("viewBox", "0 0 512 512");
    el.setAttribute("width", "100%");
    el.setAttribute("height", "100%");
    el.style.pointerEvents = "none";
    el.id = "osd-stroma-svg";
    if (!showStroma) el.classList.add("hidden");
    
    // Draw outer boundary and cut holes for nuclei clusters using Even-Odd filling
    let pathData = "M 0 0 L 512 0 L 512 512 L 0 512 Z ";
    clusters.forEach(c => {
        pathData += `M ${c.x} ${c.y} L ${c.x + c.w} ${c.y} L ${c.x + c.w} ${c.y + c.h} L ${c.x} ${c.y + c.h} Z `;
    });
    
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("fill", "rgba(147, 51, 234, 0.28)");
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute("stroke", "rgba(147, 51, 234, 0.45)");
    path.setAttribute("stroke-width", "1.5");
    path.setAttribute("stroke-dasharray", "3,3");
    
    el.appendChild(path);
    
    const rect = new OpenSeadragon.Rect(0, 0, 1, 1);
    viewer.addOverlay({
        element: el,
        location: rect
    });
    stromaSvgOverlay = el;
}

// Update primary H&E tiled image visibility based on H&E Core layer visibility toggle
function updateTissueVisibility() {
    if (viewer && viewer.world.getItemCount() > 0) {
        try {
            viewer.world.getItemAt(0).setOpacity(showTissue ? 1.0 : 0.0);
        } catch(err) {
            console.error("Error setting H&E Core opacity:", err);
        }
    }
}

// Injects timeline elements for walkthrough (Rule 3)
function renderWalkthroughSteps(steps) {
    const container = document.getElementById('walkthrough-timeline');
    container.innerHTML = '';

    if (!steps) return;

    steps.forEach((step, idx) => {
        const el = document.createElement('div');
        el.id = `walkthrough-step-card-${idx}`;
        el.className = "glass-card p-3 rounded-lg cursor-pointer flex items-start space-x-3 transition-all duration-300 relative border-l-2 border-l-slate-700";
        el.innerHTML = `
            <div class="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-accent shrink-0">
                ${step.step_number}
            </div>
            <div>
                <h5 class="text-xs font-semibold text-slate-200 tracking-wide">${step.title}</h5>
                <p class="text-[10px] text-slate-400 mt-1 leading-relaxed">${step.description}</p>
                <div class="mt-2 text-[9px] text-accent font-semibold tracking-wider uppercase flex items-center">
                    <span class="mr-1">📍</span> Focus Coordinate Cluster
                </div>
            </div>
        `;

        el.addEventListener('click', () => {
            highlightWalkthroughStep(idx);
        });

        container.appendChild(el);
    });
}

// Action which zooms the OpenSeadragon viewport into specific coordinates (Rule 3)
function highlightWalkthroughStep(index) {
    if (!currentCaseData || !currentCaseData.evidence_steps) return;
    const step = currentCaseData.evidence_steps[index];
    if (!step) return;

    const stepCards = document.querySelectorAll('[id^="walkthrough-step-card-"]');
    stepCards.forEach(c => {
        c.className = "glass-card p-3 rounded-lg cursor-pointer flex items-start space-x-3 transition-all duration-300 relative border-l-2 border-l-slate-700";
    });

    const activeCard = document.getElementById(`walkthrough-step-card-${index}`);
    if (activeCard) {
        activeCard.className = "glass-card p-3 rounded-lg cursor-pointer flex items-start space-x-3 transition-all duration-300 relative border-l-2 border-l-success bg-slate-800/60 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
    }

    const overlayElements = document.querySelectorAll('.nuclei-highlight-box');
    overlayElements.forEach(el => el.classList.remove('active-step'));

    const targetOverlay = document.getElementById(`osd-overlay-cluster-${index}`);
    if (targetOverlay) {
        targetOverlay.classList.add('active-step');
    }

    const c = step.coordinates;
    const padding = 0.05;
    const rect = new OpenSeadragon.Rect(
        (c.x / 512) - padding,
        (c.y / 512) - padding,
        (c.w / 512) + (padding * 2),
        (c.h / 512) + (padding * 2)
    );
    
    viewer.viewport.fitBounds(rect, false);
}

// Sync the patient clinical context with the backend to keep visual features and patient profiles aligned
async function syncPatientContextWithBackend(fhirBundle) {
    try {
        const response = await fetch('/api/upload_patient_fhir', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fhirBundle)
        });
        if (!response.ok) {
            console.error("Failed to sync patient context with backend.");
        }
    } catch (err) {
        console.error("Error syncing patient context:", err);
    }
}

// Ingest and Parse HL7 FHIR Bundle Resource (Rule 2)
function ingestFhirData(fhirBundle) {
    if (!fhirBundle || !fhirBundle.entry) return;
    
    // Proactively sync patient context to the backend session cache
    syncPatientContextWithBackend(fhirBundle);

    let patientResource = null;
    let observations = [];
    
    fhirBundle.entry.forEach(entry => {
        const res = entry.resource;
        if (!res) return;
        if (res.resourceType === 'Patient') {
            patientResource = res;
        } else if (res.resourceType === 'Observation') {
            observations.push(res);
        }
    });

    // Render Demographics
    if (patientResource) {
        const names = patientResource.name || [{}];
        const given = (names[0].given || []).join(' ');
        const family = names[0].family || '';
        document.getElementById('patient-name').innerText = `${given} ${family}`.trim() || 'Unknown Patient';
        document.getElementById('patient-gender').innerText = (patientResource.gender || 'unknown').toUpperCase();
        
        if (patientResource.birthDate) {
            const birthYear = new Date(patientResource.birthDate).getFullYear();
            const currentYear = new Date().getFullYear();
            document.getElementById('patient-age').innerText = `${currentYear - birthYear} y/o`;
        } else {
            document.getElementById('patient-age').innerText = 'Age N/A';
        }
        
        document.getElementById('patient-avatar').innerText = patientResource.gender === 'female' ? '👩' : '👨';
    }

    // Render Timeline / Observations
    const historyList = document.getElementById('clinical-history-list');
    historyList.innerHTML = '';
    
    const loincContainer = document.getElementById('loinc-markers-container');
    loincContainer.innerHTML = '';

    let hasLabs = false;

    observations.forEach(obs => {
        const coding = obs.code?.coding?.[0] || {};
        const code = coding.code;
        const display = coding.display || 'Clinical Observation';

        if (code === '4544-3' || display.toLowerCase().includes('cea')) {
            hasLabs = true;
            const valNum = obs.valueQuantity?.value || 0.0;
            const unit = obs.valueQuantity?.unit || 'ng/mL';
            const isHigh = valNum > 5.0;
            
            const maxVal = 20.0;
            const pct = Math.min(100, (valNum / maxVal) * 100);
            const statusColor = isHigh ? 'bg-danger text-danger' : 'bg-success text-success';
            const statusLabel = isHigh ? 'High (Abnormal)' : 'Normal';
            const borderCol = isHigh ? 'border-danger/35 bg-danger/10' : 'border-success/35 bg-success/10';

            loincContainer.innerHTML += `
                <div class="border ${borderCol} p-3.5 rounded-lg space-y-2">
                    <div class="flex justify-between items-center text-xs">
                        <span class="font-bold text-slate-200">CEA Serum Tumor Marker</span>
                        <span class="font-mono bg-slate-900 px-2 py-0.5 rounded text-[10px] text-slate-400">LOINC ${code}</span>
                    </div>
                    <div class="flex justify-between items-end mt-1.5">
                        <div class="flex items-baseline space-x-1.5">
                            <span class="text-2xl font-extrabold ${isHigh ? 'text-danger' : 'text-success'}">${valNum}</span>
                            <span class="text-xs text-slate-400 font-medium">${unit}</span>
                        </div>
                        <span class="text-[10px] font-semibold uppercase tracking-wider ${statusColor}">${statusLabel}</span>
                    </div>
                    
                    <div class="w-full bg-slate-950 rounded-full h-1 mt-2.5 overflow-hidden">
                        <div class="h-full ${isHigh ? 'bg-danger' : 'bg-success'}" style="width: ${pct}%"></div>
                    </div>
                    <div class="flex justify-between text-[8px] text-slate-500 font-mono mt-1">
                        <span>Min (0.0)</span>
                        <span>Normal Threshold (5.0)</span>
                        <span>Elevated (20.0+)</span>
                    </div>
                </div>
            `;
        } else {
            const textVal = obs.valueString || obs.valueCodeableConcept?.text || '';
            if (textVal) {
                historyList.innerHTML += `
                    <div class="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                        <div class="flex justify-between text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">
                            <span>${display}</span>
                            <span class="text-[9px] font-normal text-slate-600">Observation</span>
                        </div>
                        <p class="text-xs text-slate-300 leading-relaxed font-medium">${textVal}</p>
                    </div>
                `;
            }
        }
    });

    if (!hasLabs) {
        loincContainer.innerHTML = `
            <div class="text-center py-6 text-slate-600 text-xs italic border border-dashed border-slate-800 rounded-lg">
                No active LOINC standard laboratory metrics parsed from custom FHIR resource.
            </div>
        `;
    }
}

// Handle client-side file upload and trigger real FastAPI backend analysis endpoint
async function processUploadedFile(file) {
    const placeholder = document.getElementById('placeholder');
    placeholder.style.display = 'none';

    // Set local image URL inside OpenSeadragon
    const imageUrl = URL.createObjectURL(file);
    
    // Display File Name on screen
    const fileNameDisplay = document.getElementById('file-name-display');
    fileNameDisplay.innerText = file.name;
    fileNameDisplay.classList.remove('hidden');

    if (viewer) {
        viewer.destroy();
    }

    viewer = OpenSeadragon({
        id: "osd-viewer",
        prefixUrl: "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/",
        tileSources: {
            type: 'image',
            url: imageUrl
        },
        showNavigationControl: true,
        animationTime: 0.6,
        blendTime: 0.1,
        constrainDuringPan: true,
        maxZoomPixelRatio: 3
    });

    // Call real backend FastAPI API
    const formData = new FormData();
    formData.append('file', file);

    const resultsPanel = document.getElementById('results-panel');
    const emptyState = document.getElementById('evidence-empty');
    const gpuStatusCard = document.getElementById('local-gpu-status-card');

    try {
        // Show local GPU running background execution indicator card!
        gpuStatusCard.classList.remove('hidden');
        resultsPanel.classList.add('opacity-30');
        emptyState.style.display = 'none';
        resultsPanel.classList.remove('hidden');
        
        document.getElementById('grade-result').innerText = "GPU Inference Active...";
        document.getElementById('ai-reasoning-summary').innerText = "Loading prompt and tokenizing on GPU...";

        // Set up anonymous upload context
        const uploadFhirBundle = {
            resourceType: "Bundle",
            type: "collection",
            entry: [
                {
                    resource: {
                        resourceType: "Patient",
                        id: "pat-uploaded",
                        gender: "unknown",
                        name: [{"family": "Patient", "given": ["Anonymous"]}]
                    }
                },
                {
                    resource: {
                        resourceType: "Observation",
                        id: "obs-uploaded-symptom",
                        status: "final",
                        code: {
                            coding: [{"system": "http://loinc.org", "code": "10160-0", "display": "Case Context"}]
                        },
                        valueString: `Active pathology review for slide patch upload "${file.name}". Image scaled automatically to 512x512 pixels. Sandboxed local container processing.`
                    }
                }
            ]
        };

        // Sync clean anonymous context to backend first to prevent mixing of cases
        await syncPatientContextWithBackend(uploadFhirBundle);

        const response = await fetch('/api/analyze_patch', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error("Analysis request failed.");

        const data = await response.json();
        
        // Hide local GPU active running background status card!
        gpuStatusCard.classList.add('hidden');
        resultsPanel.classList.remove('opacity-30');

        // Cache returned data to active session
        currentCaseData = {
            grade: data.grade,
            confidence_score: data.confidence_score,
            homogeneity_score: data.homogeneity_score,
            requires_expert_review: data.requires_expert_review,
            biomarkers: data.biomarkers,
            ai_summary: data.ai_reasoning_summary || `The Resident Agent completed visual-linguistic reasoning on H&E file "${file.name}". Classified as "${data.grade}" with an AUC confidence of ${data.confidence_score.toFixed(4)}.`,
            nuclei_clusters: data.nuclei_clusters,
            evidence_steps: data.evidence_steps,
            detailed_analysis: data.detailed_analysis,
            file_name: file.name,
            folder_name: file.webkitRelativePath ? file.webkitRelativePath.split('/').slice(0, -1).join('/') : "Local Workspace",
            fhir: {
                resourceType: "Bundle",
                type: "collection",
                entry: [
                    {
                        resource: {
                            resourceType: "Patient",
                            id: "pat-uploaded",
                            gender: "unknown",
                            name: [{"family": "Patient", "given": ["Anonymous"]}]
                        }
                    },
                    {
                        resource: {
                            resourceType: "Observation",
                            id: "obs-uploaded-symptom",
                            status: "final",
                            code: {
                                coding: [{"system": "http://loinc.org", "code": "10160-0", "display": "Case Context"}]
                            },
                            valueString: `Active pathology review for slide patch upload "${file.name}". Image scaled automatically to 512x512 pixels. Sandboxed local container processing.`
                        }
                    }
                ]
            }
        };

        // Render response data to UI
        const gradeEl = document.getElementById('grade-result');
        gradeEl.innerText = data.grade;

        if (data.grade === "Adenocarcinoma (TUM)") {
            gradeEl.className = "text-xl font-extrabold text-danger drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]";
            document.getElementById('confidence-bar').className = "bg-danger h-full transition-all duration-500";
        } else if (data.grade.includes("High-Grade") || data.grade === "Suspicious for Invasion (SFI)" || data.requires_expert_review) {
            gradeEl.className = "text-xl font-bold text-warning drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]";
            document.getElementById('confidence-bar').className = "bg-warning h-full transition-all duration-500";
        } else if (data.grade.includes("Low-Grade")) {
            gradeEl.className = "text-xl font-bold text-orange-400";
            document.getElementById('confidence-bar').className = "bg-orange-400 h-full transition-all duration-500";
        } else if (data.grade === "Normal (NORM)") {
            gradeEl.className = "text-xl font-bold text-success";
            document.getElementById('confidence-bar').className = "bg-success h-full transition-all duration-500";
        } else {
            gradeEl.className = "text-xl font-bold text-slate-300";
            document.getElementById('confidence-bar').className = "bg-slate-400 h-full transition-all duration-500";
        }

        // Set Statistics
        document.getElementById('confidence-score').innerText = data.confidence_score.toFixed(4);
        document.getElementById('homogeneity-score').innerText = data.homogeneity_score.toFixed(4);
        document.getElementById('confidence-bar').style.width = `${data.confidence_score * 100}%`;

        // Render cytological detailed badges and stromal proportion bars
        renderDetailedAnalysis(data.detailed_analysis);

        // Expert Threshold Check
        const triageAlert = document.getElementById('triage-alert');
        if (data.requires_expert_review || data.confidence_score < 0.85) {
            triageAlert.classList.remove('hidden');
        } else {
            triageAlert.classList.add('hidden');
        }

        // Render Biomarkers Checklist
        const biomarkersList = document.getElementById('biomarkers-list');
        biomarkersList.innerHTML = '';
        const biomarkersKeys = [
            { key: 'lymphovascular_invasion', label: 'Lymphovascular Invasion (LVI)' },
            { key: 'tumor_necrosis', label: 'Tumor Necrosis / Necrotic Core' }
        ];

        biomarkersKeys.forEach(b => {
            const detected = data.biomarkers[b.key];
            const badge = detected 
                ? `<span class="ml-auto text-[10px] bg-danger/15 text-danger border border-danger/25 px-2 py-0.5 rounded font-medium">Detected</span>` 
                : `<span class="ml-auto text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-normal">Not Detected</span>`;
            const dotColor = detected ? 'bg-danger glow-active' : 'bg-slate-700';
            
            biomarkersList.innerHTML += `
                <li class="flex items-center text-xs text-slate-300">
                    <span class="w-2 h-2 rounded-full ${dotColor} mr-2.5 shadow-[0_0_8px_rgba(244,63,94,${detected ? '0.6' : '0'})]"></span> 
                    <span>${b.label}</span>
                    ${badge}
                </li>
            `;
        });

        // Set AI Text summary and render overlays
        document.getElementById('ai-reasoning-summary').innerText = currentCaseData.ai_summary;
        
        // Render OSD Highlights
        renderNucleiOverlays(data.nuclei_clusters);
        renderStromaOverlay(data.nuclei_clusters);
        updateTissueVisibility();
        renderWalkthroughSteps(data.evidence_steps);

        // Ingest dummy Patient details
        ingestFhirData(currentCaseData.fhir);
        document.getElementById('fhir-json-input').value = JSON.stringify(currentCaseData.fhir, null, 2);

    } catch (error) {
        console.error(error);
        alert("Fatal Error processing local histopathology image patch: " + error.message);
        gpuStatusCard.classList.add('hidden');
        resultsPanel.classList.remove('opacity-30');
        document.getElementById('grade-result').innerText = "Process Error";
    }
}
