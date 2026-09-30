import time
from datetime import datetime, timezone
# pyrefly: ignore [missing-import]
from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__, url_prefix="/api/health")

START_TIME = time.time()

@health_bp.route("", methods=["GET"])
def health_check():
    uptime = int(time.time() - START_TIME)
    return jsonify({
        "success": True,
        "status": "OPERATIONAL",
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "engine": "Python Flask",
        "uptimeSeconds": uptime,
        "activeDefenses": [
            "OWASP Compliant Security Headers (CSP, HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff)",
            "Flask-Limiter IP-Based Rate Limiting",
            "Flask-CORS Origin Boundary Control",
            "XSS & CRLF Input Sanitization Engine",
            "Zero Token Exposure via .env Isolation"
        ]
    }), 200
