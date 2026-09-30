# pyrefly: ignore [missing-import]
from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from middleware.sanitization import validate_contact_payload

contact_bp = Blueprint("contact", __name__, url_prefix="/api/contact")

# A dummy function in case limiter is applied dynamically in app.py
def init_contact_routes(limiter):
    @contact_bp.route("", methods=["POST"])
    @limiter.limit("10 per 15 minutes")
    def handle_contact():
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({
                "success": False,
                "error": "Invalid or missing JSON payload."
            }), 400

        is_valid, error_msg, sanitized = validate_contact_payload(data)
        if not is_valid:
            return jsonify({
                "success": False,
                "error": error_msg
            }), 400

        # Safe simulation / logging
        timestamp = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        print("====================================================")
        print("📨 [PYTHON FLASK DISPATCH - CONTACT FORM SUBMISSION]")
        print(f"From:    {sanitized.get('name')} <{sanitized.get('email')}>")
        print(f"Time:    {timestamp}")
        print(f"Message: {sanitized.get('raw_message')}")
        print("====================================================")

        return jsonify({
            "success": True,
            "message": "Message sent successfully. Thank you for reaching out.",
            "data": {
                "receivedAt": timestamp,
                "delivered": False,
                "simulated": True
            }
        }), 200

    return contact_bp
