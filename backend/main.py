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

# --- 3. DATABASE CONNECTION (SQLite - SmartShield) ---
from database import get_merchant, add_merchant, get_all_merchants

FRAUD_KEYWORDS = ["scam", "free", "lottery", "winner", "prize", "urgent", "claim", "gift", "doubler", "investment"]

@app.get("/merchants")
async def get_merchants():
    """Fetch all merchants for the dashboard."""
    merchants = get_all_merchants()
    return merchants

@app.post("/scan_qr")
async def scan_qr(request: QRRequest):
    qr_text = request.qr_text.lower() # Normalize to lowercase
    
    # --- STEP 1: DATABASE CHECK (The "Bank" Verification) ---
    merchant = get_merchant(qr_text)
    
    if merchant:
        # A. WHITELIST CHECK (Trusted)
        if merchant["trust_score"] == 100:
            return {
                "status": "SAFE",
                "score": 100,
                "message": f"SAFE - Verified Merchant: {merchant['legal_name']}"
            }
            
        # B. BLACKLIST CHECK (Fraud)
        elif merchant["trust_score"] == 0:
            return {
                "status": "FRAUD",
                "score": 0,
                "message": f"DANGER - Known Fraud: {merchant['legal_name']}"
            }
            
        # C. GRAYLIST (Neutral/Local Shops)
        else:
            return {
                "status": "SAFE" if merchant["trust_score"] > 40 else "FRAUD",
                "score": merchant["trust_score"],
                "message": f"Merchant: {merchant['legal_name']} (Score: {merchant['trust_score']})"
            }

    # --- STEP 2: ML/HEURISTIC CHECK (Fallback for Unknowns) ---
    # (If not in DB, analyze the text pattern)
    is_suspicious = False
    matched_keyword = ""
    
    for keyword in FRAUD_KEYWORDS:
        if keyword in qr_text:
            is_suspicious = True
            matched_keyword = keyword
            break
            
    if is_suspicious:
        # Case A: Unknown but looks like Fraud -> Add to DB as Blacklist
        print(f"⚠️  New Threat Detected: {request.qr_text}")
        
        add_merchant(
            upi_id=request.qr_text,
            legal_name="Suspicious Unknown ID",
            trust_score=0,
            category="Fraud",
            is_verified=False
        )
        
        return {
            "status": "FRAUD",
            "score": 0,
            "message": f"DANGER - Suspicious keyword '{matched_keyword}' found."
        }
    else:
        # Case B: Unknown and looks Clean -> Add as Neutral (Score 50)
        # "Neutral" indicates we are tracking it, but haven't verified it yet.
        print(f"ℹ️  New Unknown Merchant: {request.qr_text}")
        
        add_merchant(
            upi_id=request.qr_text,
            legal_name="Unknown Merchant",
            trust_score=50,
            category="Uncategorized",
            is_verified=False
        )
        
        return {
            "status": "SAFE",
            "score": 50,
            "message": "SAFE - First time seen. Added to tracking."
        }
