import sqlite3
from database import init_db, add_merchant, get_db_connection, DB_NAME

def seed_production():
    # Reset DB for fresh start with new schema
    if os.path.exists(DB_NAME):
        os.remove(DB_NAME)
    
    init_db()
    
    print("🌱 Seeding Production-Ready Banking Data...")

    # 1. Verified Trusted Giants (Score 100)
    trusted = [
        ("amazon@upi", "Amazon Pay India Pvt Ltd", 100, "Shopping"),
        ("flipkart@ybl", "Flipkart Internet Pvt Ltd", 100, "Shopping"),
        ("zomato@upi", "Zomato Limited", 100, "Food Tech"),
        ("swiggy@upi", "Swiggy Bundl Technologies", 100, "Food Tech"),
        ("dominos@icici", "Jubilant FoodWorks Ltd", 100, "Food"),
        ("uber@axis", "Uber India Systems Pvt Ltd", 100, "Transport"),
        ("ola@upi", "ANI Technologies Pvt Ltd", 98, "Transport"),
        ("irctc@upi", "Indian Railway Catering Corp", 100, "Travel"),
        ("pmcares@sbi", "PM CARES Fund", 100, "Government"),
        ("googleplay@upi", "Google India Digital Services", 100, "Tech"),
        ("netflix@ybl", "Netflix Entertainment", 100, "Entertainment"),
        ("apple@upi", "Apple India Pvt Ltd", 100, "Tech"),
        ("jio@upi", "Reliance Jio Infocomm", 100, "Telecom"),
        ("airtel@upi", "Bharti Airtel Limited", 100, "Telecom"),
        ("tatapower@upi", "Tata Power Company", 100, "Utilities"),
        ("bescom@upi", "Bangalore Electricity Supply", 100, "Utilities"),
        ("lic@upi", "Life Insurance Corp of India", 100, "Insurance"),
        ("starbucks@bank", "Tata Starbucks Pvt Ltd", 100, "Food"),
        ("croma@upi", "Infiniti Retail Ltd", 99, "Electronics"),
        ("nykaa@upi", "FSN E-Commerce Ventures", 99, "Beauty"),
        ("myntra@upi", "Myntra Designs Pvt Ltd", 99, "Fashion"),
        ("bookmyshow@upi", "Bigtree Entertainment", 99, "Entertainment"),
        ("makemytrip@upi", "MakeMyTrip India Pvt Ltd", 99, "Travel"),
        ("indigo@upi", "InterGlobe Aviation Ltd", 99, "Aviation"),
        ("airindia@upi", "Air India Limited", 99, "Aviation"),
        ("zerodha@upi", "Zerodha Broking Ltd", 100, "Finance"),
        ("groww@upi", "Nextbillion Technology", 100, "Finance"),
        ("cred@upi", "Dreamplug Technologies", 99, "Finance"),
        ("lenskart@upi", "Lenskart Solutions", 98, "Eyewear"),
        ("decathlon@upi", "Decathlon Sports India", 99, "Sports"),
        ("ikea@upi", "IKEA India Pvt Ltd", 99, "Furniture"),
        ("urbancompany@upi", "UrbanClap Technologies", 98, "Services"),
        ("bigbasket@upi", "Supermarket Grocery Supplies", 99, "Grocery"),
        ("blinkit@upi", "Grofers India Pvt Ltd", 98, "Grocery"),
        ("zepto@upi", "KiranaKart Technologies", 98, "Grocery"),
        ("apollo247@upi", "Apollo Hospitals Enterprise", 100, "Healthcare"),
        ("netmeds@upi", "Netmeds Marketplace", 99, "Healthcare"),
        ("pharmeasy@upi", "Axelia Solutions", 98, "Healthcare"),
        ("cultfit@upi", "Curefit Healthcare", 98, "Fitness"),
        ("decathlon@upi", "Decathlon Sports", 99, "Retail")
    ]

    # 2. Known Scams List (Score 0)
    scams = [
        ("laxmi_chit_fund@ybl", "Laxmi Chit Fund (Fake)", 0, "Ponzi"),
        ("scheme_25_din@upi", "25 Din Paisa Double", 0, "Scam"),
        ("win_crore@paytm", "KBC Lottery Winner", 0, "Scam"),
        ("kyc_update@sbi", "Fake SBI KYC Support", 0, "Phishing"),
        ("refund_support@upi", "PhonePe Refund Support", 0, "Phishing"),
        ("electricity_cut@sms", "Electricity Disconnection", 0, "Fearware"),
        ("customs_clearance@upi", "Delhi Customs Officer", 0, "Courier Scam"),
        ("job_fee@upi", "Wipro Hiring Fee", 0, "Job Scam"),
        ("data_entry_job@upi", "Home Based Data Entry", 0, "Job Scam"),
        ("friend_emergency@upi", "Friend in ICU", 0, "Social Eng"),
        ("olx_army@upi", "Army Officer OLX", 0, "Marketplace Scam"),
        ("qr_code_receive@upi", "Scan to Receive Money", 0, "QR Scam"),
        ("teamviewer_support@upi", "AnyDesk QuickSupport", 0, "Tech Support Scam"),
        ("loan_instant@upi", "0% Interest Loan Approval", 0, "Loan Scam"),
        ("crypto_doubler@eth", "Elon Musk BTC Giveaway", 0, "Crypto Scam"),
        ("dating_verify@upi", "Tinder ID Verification", 0, "Romance Scam"),
        ("sim_swap@airtel", "4G to 5G Upgrade Fee", 0, "SIM Swap"),
        ("gift_card@amazon", "Amazon Gift Card Generator", 0, "Phishing"),
        ("netflix_free@upi", "Netflix Lifetime Free", 0, "Phishing"),
        ("paytm_kyc@upi", "Paytm KYC Suspended", 0, "Phishing")
    ]

    # Populate Verified
    for upi, name, score, cat in trusted:
        add_merchant(upi, name, score, cat, True)

    # Populate Scams
    for upi, name, score, cat in scams:
        add_merchant(upi, name, score, cat, False)

    # Fill rest with generated local shops for volume
    for i in range(40):
        name = f"Local Kirana Store {i}"
        upi = f"shop_{i}@paytm"
        add_merchant(upi, name, 90, "Retail", True)

    conn = get_db_connection()
    count = conn.execute("SELECT COUNT(*) FROM merchants").fetchone()[0]
    conn.close()
    
    print(f"✅ Production Database Seeded with {count} verified records.")

import os
if __name__ == "__main__":
    seed_production()
