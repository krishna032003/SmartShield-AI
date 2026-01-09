import sqlite3
import os

DB_NAME = "smartshield.db"

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create merchants table with strict banking schema
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS merchants (
            upi_id TEXT PRIMARY KEY,
            legal_name TEXT NOT NULL,
            trust_score INTEGER NOT NULL,
            category TEXT NOT NULL,
            is_verified BOOLEAN NOT NULL CHECK (is_verified IN (0, 1))
        )
    ''')
    
    conn.commit()
    conn.close()
    print(f"✅ Database '{DB_NAME}' initialized with Banking Schema.")

def get_merchant(upi_id):
    conn = get_db_connection()
    merchant = conn.execute('SELECT * FROM merchants WHERE upi_id = ?', (upi_id,)).fetchone()
    conn.close()
    return merchant

def add_merchant(upi_id, legal_name, trust_score, category, is_verified):
    conn = get_db_connection()
    try:
        conn.execute('''
            INSERT INTO merchants (upi_id, legal_name, trust_score, category, is_verified)
            VALUES (?, ?, ?, ?, ?)
        ''', (upi_id, legal_name, trust_score, category, 1 if is_verified else 0))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def get_all_merchants():
    conn = get_db_connection()
    merchants = conn.execute('SELECT * FROM merchants ORDER BY rowid DESC LIMIT 50').fetchall()
    conn.close()
    return [dict(m) for m in merchants]
