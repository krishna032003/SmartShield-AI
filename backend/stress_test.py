import requests
import concurrent.futures
import time
import json

API_URL = "http://127.0.0.1:8000/scan_qr"

def send_request(payload):
    try:
        start = time.time()
        response = requests.post(API_URL, json=payload, timeout=5)
        latency = (time.time() - start) * 1000
        return response.status_code, latency, response.json() if response.status_code < 500 else response.text
    except Exception as e:
        return 0, 0, str(e)

def run_stress_test():
    print("🚀 STARTING STRESS TEST on http://127.0.0.1:8000/scan_qr\n")

    # 1. HAPPY PATH
    print("--- 1. HAPPY PATH CHECK ---")
    status, lat, data = send_request({"qr_text": "starbucks@okhdfc"})
    print(f"Status: {status}, Latency: {lat:.2f}ms, Response: {data}")
    if status == 200: print("✅ Passed")
    else: print("❌ Failed")
    print()

    # 2. MALFORMED INPUT (Missing Field)
    print("--- 2. MALFORMED INPUT (Missing 'qr_text') ---")
    status, lat, data = send_request({"wrong_field": "test"})
    print(f"Status: {status} (Expected 422)")
    if status == 422: print("✅ Passed (Properly Rejected)")
    else: print(f"❌ Failed (Got {status})")
    print()

    # 3. TYPE MISMATCH
    print("--- 3. TYPE MISMATCH (Int instead of Str) ---")
    status, lat, data = send_request({"qr_text": 12345})
    print(f"Status: {status} (Expected 422 or 200 via auto-cast)")
    # Pydantic might auto-cast int to str, so 200 is also acceptable if it handles it.
    if status in [422, 200]: print("✅ Passed (Handled Gracefully)")
    else: print(f"❌ Failed (Got {status})")
    print()

    # 4. EXTREME VALUE (Large Payload)
    print("--- 4. EXTREME VALUE (1MB String) ---")
    large_payload = {"qr_text": "A" * 1000000}
    status, lat, data = send_request(large_payload)
    print(f"Status: {status}, Latency: {lat:.2f}ms")
    if status == 200: print("✅ Passed (Handled Large Input)")
    else: print(f"❌ Failed (Got {status})")
    print()

    # 5. HIGH VOLUME (Concurrency)
    print("--- 5. HIGH VOLUME (100 concurrent requests) ---")
    payloads = [{"qr_text": f"test_user_{i}@upi"} for i in range(100)]
    start_time = time.time()
    
    success_count = 0
    fail_count = 0
    latencies = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
        results = list(executor.map(send_request, payloads))
    
    total_time = time.time() - start_time
    
    for status, lat, _ in results:
        if status == 200:
            success_count += 1
            latencies.append(lat)
        else:
            fail_count += 1

    avg_lat = sum(latencies) / len(latencies) if latencies else 0
    
    print(f"Total Requests: 100")
    print(f"Total Time: {total_time:.2f}s")
    print(f"Success: {success_count}")
    print(f"Failed: {fail_count}")
    print(f"Avg Latency: {avg_lat:.2f}ms")
    print(f"Requests/Sec: {100/total_time:.2f}")
    
    if fail_count == 0: print("✅ Passed High Volume")
    else: print("⚠️ Passed with some failures")
    print()
    
    # 6. SQL INJECTION / SPECIAL CHARS
    print("--- 6. INJECTION ATTEMPT ---")
    injection_payload = {"qr_text": "'; DROP TABLE merchants; --"}
    status, lat, data = send_request(injection_payload)
    print(f"Payload: {injection_payload['qr_text']}")
    print(f"Response: {data}")
    # Should be treated as a string, no error.
    if status == 200: print("✅ Passed (Sanitized/Treated as String)")
    else: print("❌ Failed")

if __name__ == "__main__":
    run_stress_test()
