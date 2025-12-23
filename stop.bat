@echo off
echo ========================================
echo  Grow Monitoring System - Stopper
echo ========================================
echo.

echo Beende alle Node.js Prozesse...
taskkill /F /IM node.exe /T >nul 2>nul

if %ERRORLEVEL% EQU 0 (
    echo [OK] Alle Server wurden beendet!
) else (
    echo [INFO] Keine laufenden Server gefunden.
)

echo.
pause
