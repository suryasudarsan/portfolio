@echo off
title Cybersecurity Portfolio Backend (Node.js)
echo ========================================================
echo [CYBERSECURITY PORTFOLIO] Launching Node.js Backend
echo ========================================================
cd /d "%~dp0"

if not exist node_modules (
    echo [INFO] Installing Node.js production dependencies...
    call "C:\Program Files\nodejs\npm.cmd" install
)

if not exist .env (
    echo [INFO] Copying .env.example to .env...
    copy .env.example .env
)

echo [INFO] Starting Node.js server with hardened security headers on port 5000...
node src/server.js
pause
