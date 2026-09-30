"""
Automated Test Suite for Python Flask Backend
Uses only standard Python library modules (urllib, json, sys).
"""

import urllib.request
import urllib.error
import json
import sys
import os

BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:5001")

def make_request(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, method=method)
    req.add_header("User-Agent", "Cybersecurity-Test-Harness/1.0")
    if data is not None:
        req.add_header("Content-Type", "application/json")
        body_bytes = json.dumps(data).encode("utf-8")
    else:
        body_bytes = None

    try:
        with urllib.request.urlopen(req, data=body_bytes) as resp:
            status = resp.status
            headers = dict(resp.getheaders())
            content = resp.read().decode("utf-8")
            return status, headers, content
    except urllib.error.HTTPError as err:
        status = err.code
        headers = dict(err.headers.items())
        content = err.read().decode("utf-8")
        return status, headers, content

def run_tests():
    print(f"\n======================================================")
    print(f"🛡️  RUNNING PYTHON FLASK SECURITY & REGRESSION TESTS")
    print(f"Target Base URL: {BASE_URL}")
    print(f"======================================================\n")

    passed = 0
    failed = 0

    def test(name, assertion_fn):
        nonlocal passed, failed
        try:
            assertion_fn()
            print(f"  ✅ [PASS] {name}")
            passed += 1
        except Exception as e:
            print(f"  ❌ [FAIL] {name}")
            print(f"     Error: {e}")
            failed += 1

    # 1. Health check
    def test_health():
        status, headers, content = make_request("/api/health")
        assert status == 200, f"Expected 200, got {status}"
        data = json.loads(content)
        assert data.get("status") == "OPERATIONAL"
        assert len(data.get("activeDefenses", [])) >= 3
    test("GET /api/health returns OPERATIONAL status", test_health)

    # 2. Security Headers
    def test_headers():
        status, headers, content = make_request("/api/health")
        lowered_headers = {k.lower(): v for k, v in headers.items()}
        assert lowered_headers.get("x-content-type-options") == "nosniff"
        assert lowered_headers.get("x-frame-options") == "DENY"
        assert lowered_headers.get("x-security-posture") == "Hardened-L4"
    test("Verify HTTP security headers (nosniff, frameguard, posture)", test_headers)

    # 3. Projects list
    def test_projects():
        status, headers, content = make_request("/api/projects")
        assert status == 200
        data = json.loads(content)
        assert data.get("success") is True
        assert isinstance(data.get("data"), list)
        assert len(data.get("data")) > 0
    test("GET /api/projects returns valid project catalog", test_projects)

    # 4. Contact validation - missing fields
    def test_contact_invalid():
        status, headers, content = make_request("/api/contact", method="POST", data={"name": "Alex"})
        assert status == 400, f"Expected 400 for missing fields, got {status}"
        data = json.loads(content)
        assert data.get("success") is False
    test("POST /api/contact rejects incomplete payload with 400", test_contact_invalid)

    # 5. Contact validation - valid submission
    def test_contact_valid():
        payload = {
            "name": "Jane Doe",
            "email": "jane@example.com",
            "message": "Interested in scheduling a penetration testing assessment."
        }
        status, headers, content = make_request("/api/contact", method="POST", data=payload)
        assert status == 200, f"Expected 200 for valid submission, got {status}"
        data = json.loads(content)
        assert data.get("success") is True
    test("POST /api/contact processes valid submission", test_contact_valid)

    # 6. PGP Key
    def test_pgp():
        status, headers, content = make_request("/api/pgp-key")
        assert status == 200
        assert "BEGIN PGP PUBLIC KEY BLOCK" in content
    test("GET /api/pgp-key returns ASCII Armored PGP Block", test_pgp)

    print(f"\n------------------------------------------------------")
    print(f"Summary: {passed} Passed, {failed} Failed")
    print(f"------------------------------------------------------\n")

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
