import sqlite3
from database import init_db, add_merchant, get_db_connection

def seed_data():
    init_db()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if data already exists
    count = cursor.execute("SELECT COUNT(*) FROM merchants").fetchone()[0]
    if count > 0:
        print(f"ℹ️  Database already contains {count} records. Skipping seed.")
        conn.close()
        return

    print("🌱 Seeding Real-World Data...")

    # 1. Trusted Brands (50+)
    trusted_brands = [
        # Retail & Shopping
        ("amazon@upi", "Amazon India", 100, "Shopping", True),
        ("flipkart@upi", "Flipkart", 100, "Shopping", True),
        ("myntra@upi", "Myntra Designs", 98, "Fashion", True),
        ("ajio@upi", "Ajio", 98, "Fashion", True),
        ("nykaa@upi", "Nykaa E-Retail", 98, "Beauty", True),
        ("croma@upi", "Croma Retail", 98, "Electronics", True),
        ("reliance@upi", "Reliance Digital", 98, "Electronics", True),
        ("ikea@upi", "Ikea India", 99, "Furniture", True),
        ("decathlon@upi", "Decathlon Sports", 98, "Sports", True),
        ("titan@upi", "Titan Company", 98, "Retail", True),
        
        # Food & Delivery
        ("swiggy@upi", "Swiggy", 99, "Food", True),
        ("zomato@upi", "Zomato", 99, "Food", True),
        ("dominos@upi", "Dominos Pizza", 98, "Food", True),
        ("mcdonalds@upi", "McDonalds India", 98, "Food", True),
        ("kfc@upi", "KFC India", 98, "Food", True),
        ("starbucks@bank", "Starbucks Coffee", 100, "Food", True),
        ("blinkit@upi", "Blinkit", 95, "Grocery", True),
        ("zepto@upi", "Zepto", 95, "Grocery", True),
        ("bigbasket@upi", "BigBasket", 98, "Grocery", True),
        
        # Travel & Transport
        ("uber@axis", "Uber India", 100, "Travel", True),
        ("ola@upi", "Ola Cabs", 98, "Travel", True),
        ("irctc@upi", "IRCTC", 100, "Travel", True),
        ("makemytrip@upi", "MakeMyTrip", 98, "Travel", True),
        ("indigo@upi", "Indigo Airlines", 98, "Travel", True),
        ("airindia@upi", "Air India", 98, "Travel", True),
        
        # Services & subscriptions
        ("netflix@ybl", "Netflix", 100, "Entertainment", True),
        ("spotify@upi", "Spotify", 98, "Entertainment", True),
        ("hotstar@upi", "Disney+ Hotstar", 98, "Entertainment", True),
        ("jio@upi", "Jio Infocomm", 100, "Telecom", True),
        ("airtel@upi", "Airtel Payments", 100, "Telecom", True),
        ("bescom@upi", "BESCOM Utilities", 100, "Utilities", True),
        
        # Tech & Payments
        ("googleplay@upi", "Google Play", 100, "Tech", True),
        ("apple@upi", "Apple Services", 100, "Tech", True),
        ("razorpay@upi", "Razorpay", 98, "Payment Gateway", True),
        ("payu@upi", "PayU", 98, "Payment Gateway", True),
        
        # Demo/Common
        ("shop@merchant", "Local Shop", 90, "Retail", True),
        ("pharmacy@upi", "City Pharmacy", 92, "Health", True),
        ("petrol@upi", "Indian Oil", 98, "Fuel", True),
        ("shell@upi", "Shell Petrol", 98, "Fuel", True),
        ("hospital@upi", "Apollo Hospitals", 99, "Health", True),
    ]

    # 2. Famous Scams / Risky (20+)
    scams = [
        ("laxmi_chit_fund@ybl", "Laxmi Chit Fund", 0, "Ponzi Scheme", False),
        ("double_money@upi", "21 Din Paisa Double", 0, "Scam", False),
        ("free_iphone@paytm", "Free iPhone 15", 0, "Phishing", False),
        ("lottery_winner@upi", "Lottery Winner", 0, "Scam", False),
        ("kbc_winner@upi", "KBC Prize Money", 0, "Scam", False),
        ("pm_care_fund_fake@upi", "PM Care Fake", 0, "Impersonation", False),
        ("crypto_doubler@eth", "BTC Doubler", 0, "Crypto Scam", False),
        ("job_offer_fee@upi", "Job Processing Fee", 0, "Job Scam", False),
        ("customs_duty@upi", "Customs Clearance", 0, "Courier Scam", False),
        ("kyc_update@sbi_fake", "SBI KYC Update", 0, "Phishing", False),
        ("netflix_renew@fake", "Netflix Renew Scam", 0, "Phishing", False),
        ("electricity_bill@scam", "Bill Overdue Warning", 0, "Utility Scam", False),
        ("friend_emergency@upi", "Friend in Hospital", 10, "Social Eng", False),
        ("nigerian_prince@email", "Royal Fund Transfer", 0, "Classic Scam", False),
        ("stock_tip_guaranteed@upi", "Guaranteed 100% Return", 0, "Investment Scam", False),
        ("loan_approval_fee@upi", "Instant Loan Fee", 0, "Loan Scam", False),
        ("dating_app_verify@upi", "Dating Verification", 0, "Romance Scam", False),
        ("tech_support@microsoft_fake", "Windows Defender Expired", 0, "Tech Support Scam", False),
        ("refund_otp@scammer", "Refund Verification", 0, "OTP Fraud", False),
        ("winner@paytm", "Paytm Cashback Winner", 0, "Scam", False)
    ]

    total_added = 0
    for upi, name, score, cat, verified in trusted_brands:
        if add_merchant(upi, name, score, cat, verified):
            total_added += 1
            
    for upi, name, score, cat, verified in scams:
        if add_merchant(upi, name, score, cat, verified):
            total_added += 1

    print(f"✅ Setup Complete. Added {total_added} Real-World Entities to `smartshield.db`.")
    conn.close()

if __name__ == "__main__":
    seed_data()
