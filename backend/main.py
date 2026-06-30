import os
import re
import cv2
import numpy as np
import pandas as pd
from io import BytesIO
from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Business Card Scanner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable for OCR (Lazy Loading)
ocr_model = None

def get_ocr():
    """Lazy load the OCR model on the first request to prevent Cloud Run startup crashes"""
    global ocr_model
    if ocr_model is None:
        import easyocr
        # Use only Arabic and English as per EasyOCR model compatibility rules
        ocr_model = easyocr.Reader(['ar', 'en'], gpu=False)
    return ocr_model

def extract_entities(text_lines):
    """Parses EasyOCR text into structured fields: Name, Company, Phone Number, Email, Address"""
    entities = {
        "Name": "", 
        "Company": "", 
        "Phone Number": "", 
        "Email": "", 
        "Address": "",
        "Validation": "Valid"
    }
    
    email_pattern = re.compile(r'[\w\.-]+@[\w\.-]+')
    unassigned = []

    for line in text_lines:
        line_clean = line.strip()
        
        # Extract email and clean email prefixes
        emails = email_pattern.findall(line_clean)
        if emails and not entities["Email"]:
            entities["Email"] = emails[0]
            continue
            
        # Clean common phone prefixes and check if line is a phone number
        line_no_phone_prefix = re.sub(r'^(tel|phone|p|m|mobile|t|fax|f|h|mob)\s*[:.-]?\s*', '', line_clean, flags=re.IGNORECASE)
        if sum(c.isdigit() for c in line_no_phone_prefix) >= 8 and not entities["Phone Number"]:
             entities["Phone Number"] = line_no_phone_prefix.strip()
             continue
             
        # Skip web addresses
        if "www." in line_clean.lower() or ".com" in line_clean.lower() or "http" in line_clean.lower():
            continue 
            
        if len(line_clean) > 2:
            # Clean common label prefixes for names, companies, and addresses
            cleaned_line = re.sub(r'^(name|company|co|address|addr|location|loc)\s*[:.-]?\s*', '', line_clean, flags=re.IGNORECASE)
            unassigned.append(cleaned_line.strip())
    
    if len(unassigned) > 0: entities["Name"] = unassigned[0]
    if len(unassigned) > 1: entities["Company"] = unassigned[1]
    if len(unassigned) > 2: entities["Address"] = ", ".join(unassigned[2:])
    
    # Validation Rules
    if len(text_lines) < 3 or (not entities["Phone Number"] and not entities["Email"] and not entities["Name"]):
        entities["Validation"] = "Invalid card detected"
    
    return entities

@app.post("/process-card/")
async def process_card(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")

    processed_records = []
    
    try:
        model = get_ocr()
        
        for file in files:
            # Type checking
            if file.content_type not in ["image/jpeg", "image/png", "image/jpg", "image/webp"]:
                processed_records.append({
                    "Name": "", "Company": "", "Phone Number": "", "Email": "", "Address": "",
                    "Validation": "Invalid file type"
                })
                continue
                
            contents = await file.read()
            nparr = np.frombuffer(contents, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                processed_records.append({
                    "Name": "", "Company": "", "Phone Number": "", "Email": "", "Address": "",
                    "Validation": "Corrupted image data"
                })
                continue

            result = model.readtext(img)
            
            if not result:
                processed_records.append({
                    "Name": "", "Company": "", "Phone Number": "", "Email": "", "Address": "",
                    "Validation": "Invalid card detected"
                })
                continue
                 
            text_lines = [item[1] for item in result]
            parsed_data = extract_entities(text_lines)
            processed_records.append(parsed_data)
        
        # Consolidate all rows
        df = pd.DataFrame(processed_records)
        
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Contacts')
            
        output.seek(0)
        headers = {
            'Content-Disposition': 'attachment; filename="contact_details_batch.xlsx"',
            'Access-Control-Expose-Headers': 'Content-Disposition'
        }
        
        return Response(
            content=output.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers=headers
        )
    except Exception as e:
        print(f"Error: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.get("/")
@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)