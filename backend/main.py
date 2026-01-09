from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Model
class QRRequest(BaseModel):
    qr_text: str

# Mock Database
SAFE_MERCHANTS = {
    "starbucks@okhdfc": "Starbucks",
    "grocery@upi": "Local Grocery",
    "uber@hdfcbank": "Uber Rides"
}

FRAUD_MERCHANTS = {
    "winner@paytm": "Fake Lottery Scam",
    "support@bank-verify": "Phishing Scam",
    "refund@scammer": "Refund Fraud"
}

FRAUD_KEYWORDS = ["scam", "free", "lottery", "winner", "prize", "urgent"]

@app.post("/scan_qr")
async def scan_qr(request: QRRequest):
    qr_text = request.qr_text.lower()
    
    # Check for direct fraud merchant match
    if request.qr_text in FRAUD_MERCHANTS:
        return {
            "status": "FRAUD",
            "score": 95,
            "message": "High Risk Detected: Known Fraud Merchant"
        }
    
    # Check for fraud keywords
    for keyword in FRAUD_KEYWORDS:
        if keyword in qr_text:
             return {
                "status": "FRAUD",
                "score": 95,
                "message": f"High Risk Detected: Suspicious keyword '{keyword}' found"
            }
            
    # Check if safe merchant
    if request.qr_text in SAFE_MERCHANTS:
         return {
            "status": "SAFE",
            "score": 10,
            "message": "Verified Safe Merchant"
        }

    # Default safe (or unknown but low risk for this simple logic)
    return {"status": "SAFE", "score": 10, "message": "Low Risk"}
