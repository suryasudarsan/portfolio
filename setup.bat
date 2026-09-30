@echo off
title Cybersecurity Portfolio Infrastructure Setup
echo =========================================================================
echo [SETUP] Hardened Cybersecurity Engineer Portfolio Backend Suite
echo =========================================================================
echo.

echo [1/3] Setting up Node.js / Express Backend...
cd /d "%~dp0backend-node"
if not exist .env (
    echo   - Copying .env.example to .env...
    copy .env.example .env >nul
)
if exist "C:\Program Files\nodejs\npm.cmd" (
    echo   - Installing Node.js security dependencies (express, cors, helmet, etc.)...
    call "C:\Program Files\nodejs\npm.cmd" install
) else (
    echo   - Running npm install via system path...
    call npm install
)

echo.
echo [2/3] Setting up Python / Flask Backend...
cd /d "%~dp0backend-python"
if not exist .env (
    echo   - Copying .env.example to .env...
    copy .env.example .env >nul
)
where python >nul 2>nul
if %errorlevel% equ 0 (
    echo   - Python detected. Creating virtualenv (.venv)...
    python -m venv .venv
    call .venv\Scripts\activate.bat
    echo   - Installing requirements (Flask, flask-cors, flask-limiter, python-dotenv)...
    pip install -r requirements.txt
) else (
    echo   - [NOTE] Python executable was not found on PATH.
    echo     Install Python 3.10+ from https://www.python.org/downloads/ to run the Flask backend.
    echo     Node.js backend is fully installed and ready to run immediately.
)

echo.
echo [3/3] Setup complete!
echo =========================================================================
echo Available Launch Commands:
echo   • run_node.bat    - Starts Node.js backend on http://localhost:5000
echo   • run_python.bat  - Starts Python Flask backend on http://localhost:5001
echo   • test_all.bat    - Executes security test suites against running APIs
echo =========================================================================
pause
