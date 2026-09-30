import json
import os
# pyrefly: ignore [missing-import]
from flask import Blueprint, jsonify, Response

security_bp = Blueprint("security", __name__, url_prefix="/api")

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

PGP_PUBLIC_KEY = """-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: OpenPGP.js v5.11.0
Comment: Cybersecurity Engineer Portfolio Public Key

xsFNBGY72h8BEADJ7c+Z+Xw9oQ6t2pU7o6YfK3pM4qR8lP2vK1nL9jX0aB5c
dE8fG1hI2jK3lM4nO5pQ6rS7tU8vW9xY0z1aB2cD3eF4gH5iJ6kL7mN8oP9q
R0sT1uV2wX3yZ4aB5cD6eF7gH8iJ9kL0mN1oP2qR3sT4uV5wX6yZ7aB8cD9e
F0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ0aB1cD2eF3gH4iJ5kL6mN7oP8qR9s
T0uV1wX2yZ3aB4cD5eF6gH7iJ8kL9mN0oP1qR2sT3uV4wX5yZ6aB7cD8eF9g
H0iJ1kL2mN3oP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9u
V0wX1yZ2aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aB6cD7eF8gH9i
=Sec0
-----END PGP PUBLIC KEY BLOCK-----"""

def load_data(filename):
    path = os.path.join(DATA_DIR, filename)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

@security_bp.route("/certifications", methods=["GET"])
def get_certifications():
    certs = load_data("certifications.json")
    return jsonify({
        "success": True,
        "count": len(certs) if isinstance(certs, list) else 0,
        "data": certs
    }), 200

@security_bp.route("/skills", methods=["GET"])
def get_skills():
    skills_data = load_data("skills.json")
    return jsonify({
        "success": True,
        "data": skills_data.get("domains", [])
    }), 200

@security_bp.route("/pgp-key", methods=["GET"])
def get_pgp_key():
    return Response(PGP_PUBLIC_KEY, mimetype="text/plain; charset=utf-8")

@security_bp.route("/stats", methods=["GET"])
def get_stats():
    return jsonify({
        "success": True,
        "data": {
            "threatsNeutralized": 1420,
            "vulnerabilitiesRemediated": 384,
            "systemsHardened": 120,
            "uptimeReliability": "99.99%",
            "securityClearance": "Public Trust / Eligible",
            "primaryFocus": "Cloud Infrastructure Defense & AppSec"
        }
    }), 200
