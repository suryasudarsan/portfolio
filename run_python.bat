@echo off
title Cybersecurity Portfolio - Python Flask Backend (:5001)
echo ========================================================
echo [LAUNCH] Python / Flask Hardened Backend on Port 5001
echo ========================================================
cd /d "%~dp0backend-python"

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not found on PATH.
    echo Please install Python 3.10+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

if not exist .venv (
    echo [INFO] Initializing Python virtual environment (.venv)...
    python -m venv .venv
)

call .venv\Scripts\activate.bat
echo [INFO] Verifying Python dependencies...
pip install -q -r requirements.txt

echo [INFO] Starting Flask server on port 5001...
echo Serving portfolio frontend & APIs at: http://localhost:5001
python app.py
pause
