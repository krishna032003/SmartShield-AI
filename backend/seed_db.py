import sqlite3
import random
from database import init_db, DB_NAME

def seed_database():
    # Initialize DB first
    init_db()
    
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    merchants_data = []
    
    print("🚀 Generating 5,000 Verified Merchants...")
    # Generate 5000 Safe Merchants
    banks = ["okhdfc", "ybl", "oksbi", "icici", "axl"]
    names = ["Starbucks", "Uber", "Zomato", "Amazon", "Flipkart", "JioMart", "Shell", "Apollo"]
    
    for i in range(5000):
        bank = random.choice(banks)
        name_base = random.choice(names)
        upi_id = f"{name_base.lower()}_{i}@{bank}"
        name = f"{name_base} Branch {i}"
        trust_score = random.randint(80, 100)
        status = "Verified"
        category = "Safe"
        merchants_data.append((upi_id, name, trust_score, status, category))

    print("⚠️  Generating 500 Known Scammers...")
    # Generate 500 Fraud Merchants
    scam_keywords = ["winner", "lottery", "claim", "money", "free", "cash"]
    
    for i in range(500):
        keyword = random.choice(scam_keywords)
        upi_id = f"{keyword}_{i}@paytm"
        name = f"Fake Scheme {i}"
        trust_score = 0
        status = "Blacklisted"
        category = "Fraud"
        merchants_data.append((upi_id, name, trust_score, status, category))

    # Bulk Insert
    print("💾 Saving to Database...")
    cursor.executemany('''
        INSERT OR IGNORE INTO merchants (upi_id, name, trust_score, status, category)
        VALUES (?, ?, ?, ?, ?)
    ''', merchants_data)
    
    conn.commit()
    
    # Verify count
    count = cursor.execute("SELECT COUNT(*) FROM merchants").fetchone()[0]
    print(f"✅ Success! Database contains {count} records.")
    
    conn.close()

if __name__ == "__main__":
    seed_database()
