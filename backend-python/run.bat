@echo off
title Cybersecurity Portfolio Backend (Python / Flask)
echo ========================================================
echo [CYBERSECURITY PORTFOLIO] Launching Python Flask Backend
echo ========================================================
cd /d "%~dp0"

if not exist .venv (
    echo [INFO] Creating Python virtual environment (.venv)...
    python -m venv .venv
)

echo [INFO] Activating virtual environment...
call .venv\Scripts\activate.bat

echo [INFO] Installing required security packages...
pip install -r requirements.txt

if not exist .env (
    echo [INFO] Copying .env.example to .env...
    copy .env.example .env
)

echo [INFO] Starting Flask backend on port 5001...
python app.py
pause
