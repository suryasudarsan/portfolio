@echo off
title Cybersecurity Portfolio API Test Suite
cd /d "%~dp0"
echo [TEST] Executing Automated Security and API Endpoints Test...
node tests/api.test.js
pause
