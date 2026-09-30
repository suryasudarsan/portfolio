"""
Input Validation and Sanitization Module for Python / Flask
Mitigates Cross-Site Scripting (XSS), Header Injection, and Parameter Pollution.
"""

import html
import re

# RFC 5322 Compliant Email Regex
EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$"
)

def sanitize_text(text: str) -> str:
    """
    Escapes HTML entities to neutralize Cross-Site Scripting (XSS) vectors.
    """
    if not isinstance(text, str):
        return ""
    return html.escape(text.strip())

def validate_contact_payload(data: dict):
    """
    Validates the incoming contact form payload.
    Returns: (is_valid: bool, error_message: str or None, sanitized_data: dict or None)
    """
    if not isinstance(data, dict):
        return False, "Invalid payload format. Expected JSON object.", None

    # Check for suspicious operator injection or keys
    for key in data.keys():
        if key.startswith("$") or key in ("__proto__", "constructor"):
            return False, "Security violation: Suspicious operators detected.", None

    name = data.get("name")
    email = data.get("email")
    message = data.get("message")

    # Presence check
    if not name or not email or not message:
        return False, "All fields are required (name, email, message).", None

    if not isinstance(name, str) or not isinstance(email, str) or not isinstance(message, str):
        return False, "Name, email, and message must be strings.", None

    name = name.strip()
    email = email.strip().lower()
    message = message.strip()

    # Empty string check after strip
    if not name or not email or not message:
        return False, "Name, email, and message cannot be empty.", None

    # Length constraints
    if len(name) < 2 or len(name) > 80:
        return False, "Name must be between 2 and 80 characters.", None

    if len(email) < 5 or len(email) > 120 or not EMAIL_REGEX.match(email):
        return False, "Invalid email address format.", None

    # Protect against CRLF injection in email/headers
    if "\r" in email or "\n" in email or "\r" in name or "\n" in name:
        return False, "Malicious CRLF character sequence detected in input.", None

    if len(message) < 10 or len(message) > 3000:
        return False, "Message must be between 10 and 3,000 characters.", None

    # Bot honeypot check
    if data.get("website_url") or data.get("_gotcha"):
        # Silently accepted to fool automated spam bots
        return True, None, {"honeypot": True}

    sanitized = {
        "name": sanitize_text(name),
        "email": email,
        "message": sanitize_text(message),
        "raw_message": message
    }

    return True, None, sanitized
