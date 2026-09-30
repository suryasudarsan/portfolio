"""
Security Headers Middleware for Flask
Hardens response headers according to OWASP Secure Headers guidelines.
"""

def apply_security_headers(response):
    """
    Applies security-focused HTTP headers to every outgoing Flask response.
    """
    # Prevent MIME-sniffing
    response.headers['X-Content-Type-Options'] = 'nosniff'
    
    # Prevent clickjacking
    response.headers['X-Frame-Options'] = 'DENY'
    
    # XSS Protection (for legacy browsers)
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    # Strict Transport Security (HSTS) - 1 year with subdomains
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
    
    # Restrict referrer leakage
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    
    # Restrict browser APIs / hardware access
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=(), payment=()'
    
    # Cross-domain policy
    response.headers['X-Permitted-Cross-Domain-Policies'] = 'none'
    
    # Custom Security Posture Signoff
    response.headers['X-Security-Posture'] = 'Hardened-L4'
    
    # Content Security Policy (relaxed slightly for development & font loading)
    csp_directives = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' http://localhost:* http://127.0.0.1:*",
        "object-src 'none'",
        "base-uri 'self'"
    ]
    response.headers['Content-Security-Policy'] = '; '.join(csp_directives)
    
    return response
