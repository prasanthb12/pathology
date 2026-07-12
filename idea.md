Mission: Build a high-fidelity clinical dashboard for colorectal cancer (CRC) histology classification.

Objective: Provide an automated "Resident Agent" that grades H&E tissue patches and detects biomarkers to resolve inter-observer variability between pathologists.

Core Functionalities:
Image Upload: Support for 512 x 512 pixel patches in JPEG/PNG and pyramidal Whole Slide Image (WSI) viewing using OpenSeadragon.
AI Analysis Interface:Integrate MedSigLIP for zero-shot feature extraction and Google Path Foundation for generating 384-dimensional embeddings.
Utilize Gemma 4 (31B Dense) as the reasoning backbone to perform "visual-linguistic reasoning" on the tissue architecture.

Grading Module: Identify and label as following 7 classes

Normal (NORM): Characterized by healthy mucosa with organized "crypts," neat rows of nuclei at the base (basal polarity), and clear open lumens .

Low-Grade Dysplasia (LGD): Early-stage noninvasive tumors exhibiting initial architectural changes without high-grade complexity.

High-Grade Dysplasia (HGD): A transition phase where structure is nearly chaotic; often systematically confused with invasive malignancy due to overlapping visual signals like nuclear piling.

Adenocarcinoma (TUM): Invasive malignant patterns ranging from well-differentiated (organized circles) to poorly differentiated (chaotic "sheets").

Suspicious for Invasion (SFI): High-uncertainty regions where the model must predict invasion depth and identify subtle breaks in the basement membrane.

Inflammation (INF): Presence of macrophages, granulation tissue, and neutrophils indicating chronic injury or immune response.

Resection Edge (RE): Assessment of circumferential (radial), mesenteric, or mucosal margins to identify residual invasive or non-invasive tumor post-excision.

Prognostic Biomarkers as following two classes:

Lymphovascular Invasion (LVI): Identification of cancer cells within blood or lymph channels, a critical predictor of metastasis ``.

Tumor Necrosis: Detection of "dead zones" within malignant masses, which serves as a linear probe marker for identifying the most aggressive tumor growth 

Confidence Triage: Flag any result with a confidence score below 0.85 (aiming for the 0.90 AUC baseline) for "Expert-in-the-loop" review.

On the dashboard display the file name uploaded. 