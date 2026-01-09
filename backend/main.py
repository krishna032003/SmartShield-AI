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

# --- DYNAMIC MERCHANT DATABASE (In-Memory Learning) ---
# Starts with initial hardcoded data, but GROWS as new threats are found.
dynamic_merchant_db = {
    # Safe Merchants
    "starbucks@okhdfc": {"trust_score": 98, "status": "Verified", "category": "Safe"},
    "grocery@upi": {"trust_score": 90, "status": "Verified", "category": "Safe"},
    "uber@hdfcbank": {"trust_score": 95, "status": "Verified", "category": "Safe"},
    
    # Known Fraud Merchants
    "winner@paytm": {"trust_score": 0, "status": "Blacklisted", "category": "Fraud"},
    "support@bank-verify": {"trust_score": 0, "status": "Blacklisted", "category": "Fraud"},
    "refund@scammer": {"trust_score": 0, "status": "Blacklisted", "category": "Fraud"}
}

FRAUD_KEYWORDS = ["scam", "free", "lottery", "winner", "prize", "urgent", "claim", "gift"]

@app.post("/scan_qr")
async def scan_qr(request: QRRequest):
    qr_text = request.qr_text.lower() # Normalize to lowercase
    
    # 1. CHECK DYNAMIC DATABASE FIRST
    if request.qr_text in dynamic_merchant_db:
        merchant = dynamic_merchant_db[request.qr_text]
        if merchant["status"] == "Blacklisted":
            return {
                "status": "FRAUD",
                "score": merchant["trust_score"],
                "message": "High Risk: Known Blacklisted Merchant"
            }
        else:
            return {
                "status": "SAFE",
                "score": merchant["trust_score"],
                "message": f"Verified Safe: {merchant.get('category', 'Merchant')}"
            }

    # 2. DYNAMIC LEARNING: Check for suspicious patterns in NEW merchants
    for keyword in FRAUD_KEYWORDS:
        if keyword in qr_text:
            # --- AUTO-UPDATE LOGIC ---
            print(f"⚠️  New Threat Detected & Added to Blocklist: {request.qr_text}")
            
            # Add to Database dynamically
            dynamic_merchant_db[request.qr_text] = {
                "trust_score": 0, 
                "status": "Blacklisted", 
                "category": "Fraud"
            }
            
            return {
                "status": "FRAUD",
                "score": 0,
                "message": f"High Risk Detected: Suspicious keyword '{keyword}' found (Database Updated)"
            }
            
    # 3. DEFAULT SAFE (Unknown Merchant)
    return {"status": "SAFE", "score": 80, "message": "Low Risk: Unknown Identity"}
