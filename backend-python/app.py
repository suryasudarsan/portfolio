import os
# pyrefly: ignore [missing-import]
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
# pyrefly: ignore [missing-import]
from flask_limiter import Limiter
# pyrefly: ignore [missing-import]
from flask_limiter.util import get_remote_address
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

from middleware.security_headers import apply_security_headers
from routes.projects import projects_bp
from routes.contact import init_contact_routes
from routes.security import security_bp
from routes.health import health_bp

# Load environment configuration
load_dotenv()

app = Flask(__name__)

# Request payload limit: 50 KB
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv("MAX_CONTENT_LENGTH", 51200))

# 1. CORS Configuration
allowed_origins_env = os.getenv("CLIENT_URL", "http://localhost:3000")
allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

CORS(
    app,
    resources={r"/api/*": {"origins": allowed_origins if "*" not in allowed_origins else "*"}},
    supports_credentials=True,
    max_age=86400
)

# 2. Rate Limiting Configuration
limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=["100 per 15 minutes"],
    storage_uri=os.getenv("RATE_LIMIT_STORAGE_URI", "memory://")
)

# 3. Apply Hardened Security Headers to Every Response
@app.after_request
def security_header_filter(response):
    return apply_security_headers(response)

# 4. Error Handlers
@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        "success": False,
        "error": "Rate limit exceeded. Please wait before retrying.",
        "details": str(e.description)
    }), 429

@app.errorhandler(413)
def request_entity_too_large(e):
    return jsonify({
        "success": False,
        "error": "Payload size limit exceeded. Max 50KB allowed."
    }), 413

@app.errorhandler(404)
def not_found_handler(e):
    return jsonify({
        "success": False,
        "error": f"Endpoint not found: {request.method} {request.path}"
    }), 404

@app.errorhandler(500)
def internal_server_error(e):
    return jsonify({
        "success": False,
        "error": "An internal server error occurred."
    }), 500

# 5. Register Route Blueprints
app.register_blueprint(projects_bp)
app.register_blueprint(init_contact_routes(limiter))
app.register_blueprint(security_bp)
app.register_blueprint(health_bp)

# 6. Static Frontend Delivery
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))

@app.route("/", methods=["GET"])
def index():
    if os.path.exists(os.path.join(FRONTEND_DIR, "index.html")):
        return send_from_directory(FRONTEND_DIR, "index.html")
    return jsonify({
        "success": True,
        "message": "Cybersecurity Engineer Portfolio Backend (Python / Flask) is active.",
        "engine": "Python Flask",
        "endpoints": {
            "projects": "/api/projects",
            "contact": "/api/contact (POST)",
            "certifications": "/api/certifications",
            "skills": "/api/skills",
            "pgp": "/api/pgp-key",
            "stats": "/api/stats",
            "health": "/api/health"
        }
    })

@app.route("/<path:path>", methods=["GET"])
def static_proxy(path):
    if os.path.exists(os.path.join(FRONTEND_DIR, path)):
        return send_from_directory(FRONTEND_DIR, path)
    return jsonify({"success": False, "error": f"Asset not found: {path}"}), 404

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    debug_mode = os.getenv("FLASK_DEBUG", "False").lower() in ("true", "1")
    print(f"""
==========================================================
🛡️  CYBERSECURITY PORTFOLIO BACKEND (PYTHON / FLASK)
==========================================================
 Status:      RUNNING & HARDENED
 Port:        {port}
 Debug Mode:  {debug_mode}
 Base URL:    http://localhost:{port}
 Endpoints:
   • GET  /api/projects
   • POST /api/contact
   • GET  /api/certifications
   • GET  /api/skills
   • GET  /api/stats
   • GET  /api/pgp-key
   • GET  /api/health
==========================================================
    """)
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
