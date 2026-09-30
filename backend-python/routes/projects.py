import json
import os
# pyrefly: ignore [missing-import]
from flask import Blueprint, jsonify, request

projects_bp = Blueprint("projects", __name__, url_prefix="/api/projects")

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "projects.json")

def load_projects():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

@projects_bp.route("", methods=["GET"])
def get_projects():
    """
    Returns cybersecurity projects with optional tag or category filters.
    """
    projects = load_projects()
    tag = request.args.get("tag")
    category = request.args.get("category")

    if tag:
        tag_clean = tag.strip().lower()
        projects = [p for p in projects if any(t.lower() == tag_clean for t in p.get("tags", []))]

    if category:
        cat_clean = category.strip().lower()
        projects = [p for p in projects if cat_clean in p.get("category", "").lower()]

    return jsonify({
        "success": True,
        "count": len(projects),
        "data": projects
    }), 200

@projects_bp.route("/<int:project_id>", methods=["GET"])
def get_project_by_id(project_id):
    """
    Retrieve single project write-up by ID.
    """
    projects = load_projects()
    project = next((p for p in projects if p.get("id") == project_id), None)
    if not project:
        return jsonify({"success": False, "error": f"Project with ID {project_id} not found."}), 404

    return jsonify({"success": True, "data": project}), 200
