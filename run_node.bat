@echo off
title Cybersecurity Portfolio - Node.js Backend (:5000)
echo ========================================================
echo [LAUNCH] Node.js / Express Hardened Backend on Port 5000
echo ========================================================
cd /d "%~dp0backend-node"

if not exist node_modules (
    echo [INFO] First time run: Installing dependencies...
    if exist "C:\Program Files\nodejs\npm.cmd" (
        call "C:\Program Files\nodejs\npm.cmd" install
    ) else (
        call npm install
    )
)

echo [INFO] Starting Node.js server...
echo Serving portfolio frontend & APIs at: http://localhost:5000
echo Opening web browser...
start http://localhost:5000
node src/server.js
pause
