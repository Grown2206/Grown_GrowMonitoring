@echo off
echo ========================================
echo  Grow Monitoring System - Starter
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js ist nicht installiert!
    echo Bitte installiere Node.js von https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js gefunden:
node --version
echo.

REM Start Backend
echo [1/2] Starte Backend Server...
cd backend
start "Grow Monitor - Backend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
cd ..

REM Start Frontend
echo [2/2] Starte Frontend...
cd frontend
start "Grow Monitor - Frontend" cmd /k "npm start"
cd ..

echo.
echo ========================================
echo  Server gestartet!
echo ========================================
echo  Backend:  http://localhost:3001
echo  Frontend: http://localhost:3000
echo.
echo  Login-Daten:
echo  Username: admin
echo  Password: admin123
echo ========================================
echo.
echo Fenster können minimiert werden.
echo Zum Beenden: Fenster schliessen oder STRG+C
echo.
pause
