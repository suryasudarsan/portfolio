@echo off
title Cybersecurity Portfolio - Automated Test Suite
echo ========================================================
echo [TEST HARNESS] Verifying Portfolio APIs and Security
echo ========================================================

echo.
echo [TEST 1/2] Testing Node.js Backend on http://localhost:5000...
node "%~dp0backend-node\tests\api.test.js"

echo.
echo [TEST 2/2] Testing Python Flask Backend on http://localhost:5001...
where python >nul 2>nul
if %errorlevel% equ 0 (
    set TEST_BASE_URL=http://localhost:5001
    python "%~dp0backend-python\test_api.py"
) else (
    echo [SKIP] Python not found on PATH. Skipping Flask python test harness.
)

echo.
echo ========================================================
echo All test runs completed.
echo ========================================================
pause
