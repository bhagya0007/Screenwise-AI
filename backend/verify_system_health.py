import urllib.request
import json

tests = [
    ("Backend Direct Health", "http://127.0.0.1:8000/api/health"),
    ("Frontend HTML Served", "http://localhost:5173/"),
    ("Vite Reverse Proxy", "http://localhost:5173/api/health"),
    ("Patients API", "http://localhost:5173/api/patients?limit=5"),
    ("Assessment Engine API", "http://localhost:5173/api/assessment/1"),
    ("Recommendations API", "http://localhost:5173/api/recommendations?limit=5"),
    ("Follow-ups API", "http://localhost:5173/api/followups?limit=5"),
    ("Population Analytics API", "http://localhost:5173/api/analytics/population"),
]

print("=" * 65)
print("SCREENWISE AI - COMPREHENSIVE LIVE SYSTEM HEALTH CHECK")
print("=" * 65)

all_passed = True
for name, url in tests:
    try:
        req = urllib.request.urlopen(url, timeout=5)
        status = req.status
        content_type = req.headers.get("Content-Type", "")
        body = req.read()
        if "application/json" in content_type:
            data = json.loads(body.decode())
            summary = f"JSON valid ({len(data) if isinstance(data, (dict, list)) else 'ok'})"
        else:
            summary = f"HTML / Assets valid ({len(body)} bytes)"
        print(f"[PASS] {name:<26} -> HTTP {status} | {summary}")
    except Exception as e:
        print(f"[FAIL] {name:<26} -> Error: {e}")
        all_passed = False

# Test POST demo role switch
try:
    req2 = urllib.request.Request("http://localhost:5173/api/auth/demo-switch?role=clinician", method="POST")
    res2 = urllib.request.urlopen(req2, timeout=5)
    data2 = json.loads(res2.read().decode())
    user_name = data2.get("user", {}).get("full_name", "Unknown")
    user_role = data2.get("user", {}).get("role", "Unknown")
    print(f"[PASS] {'Auth Role-Switch API':<26} -> HTTP {res2.status} | Switched to {user_name} ({user_role})")
except Exception as e:
    print(f"[FAIL] {'Auth Role-Switch API':<26} -> Error: {e}")
    all_passed = False

print("=" * 65)
if all_passed:
    print("RESULT: ALL 9 CRITICAL SUBSYSTEMS ARE 100% OPERATIONAL AND CONNECTED")
else:
    print("RESULT: DEGRADED STATUS - ONE OR MORE SUBSYSTEMS REPORTED ERRORS")
print("=" * 65)
