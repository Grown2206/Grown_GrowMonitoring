@echo off
echo ========================================
echo  Grow Monitoring System - Installation
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

echo [INFO] Node.js Version:
node --version
echo.
echo [INFO] NPM Version:
npm --version
echo.

REM Install Backend Dependencies
echo ========================================
echo [1/2] Installiere Backend Dependencies...
echo ========================================
cd backend
if not exist "package.json" (
    echo [ERROR] package.json nicht gefunden!
    cd ..
    pause
    exit /b 1
)
call npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend Installation fehlgeschlagen!
    echo Versuche alternative Methode...
    call npm install --force
    if %ERRORLEVEL% NEQ 0 (
        cd ..
        pause
        exit /b 1
    )
)
cd ..
echo [OK] Backend Dependencies installiert!
echo.

REM Install Frontend Dependencies
echo ========================================
echo [2/2] Installiere Frontend Dependencies...
echo ========================================
cd frontend
if not exist "package.json" (
    echo [ERROR] package.json nicht gefunden!
    cd ..
    pause
    exit /b 1
)
call npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend Installation fehlgeschlagen!
    echo Versuche alternative Methode...
    call npm install --force
    if %ERRORLEVEL% NEQ 0 (
        cd ..
        pause
        exit /b 1
    )
)
cd ..
echo [OK] Frontend Dependencies installiert!
echo.

echo ========================================
echo  Installation erfolgreich abgeschlossen!
echo ========================================
echo.
echo Starte die Anwendung mit: start.bat
echo.
pause
