import requests
import sys

# ANSI Colors
GREEN = '\033[92m'
RED = '\033[91m'
BOLD = '\033[1m'
RESET = '\033[0m'

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(name, payload, expected_status):
    print(f"Testing {name}...", end=" ")
    try:
        response = requests.post(f"{BASE_URL}/scan_qr", json=payload)
        
        if response.status_code != 200:
            print(f"\n{RED}❌ FAIL: HTTP {response.status_code}{RESET}")
            return False

        data = response.json()
        actual_status = data.get("status")
        
        if actual_status == expected_status:
            print(f"\r{GREEN}✅ PASS: {name} {RESET}")
            return True
        else:
            print(f"\n{RED}❌ FAIL: {name}{RESET}")
            print(f"   Expected: {expected_status}")
            print(f"   Got:      {actual_status}")
            return False

    except requests.exceptions.ConnectionError:
        print(f"\n{RED}❌ FAIL: Could not connect to {BASE_URL}. Is the server running?{RESET}")
        return False
    except Exception as e:
        print(f"\n{RED}❌ FAIL: Error {e}{RESET}")
        return False

def main():
    print(f"{BOLD}🔍 Starting SmartShield.AI Logic Verification{RESET}\n")
    
    tests = [
        ("Fraud Logic (Scam UPI)", {"qr_text": "upi://scam@ybl"}, "FRAUD"),
        ("Safe Logic (Starbucks)", {"qr_text": "upi://starbucks@okhdfc"}, "SAFE"),
        ("Safe Logic (Random)",    {"qr_text": "upi://random_person@okicici"}, "SAFE")
    ]
    
    passed = 0
    for name, payload, expected in tests:
        if test_endpoint(name, payload, expected):
            passed += 1
            
    print(f"\n{BOLD}Results: {passed}/{len(tests)} Tests Passed{RESET}")

if __name__ == "__main__":
    main()
