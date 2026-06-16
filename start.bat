@echo off
echo ===================================================
echo Starting Simple Invoice Application...
echo ===================================================

echo Starting Backend API Server...
start "Invoice API" cmd /k "cd /d %~dp0api && node index.js"

echo Starting Frontend Server...
start "Invoice Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo Servers are starting! 
echo A new window will open for the API, and another for the Frontend.
echo You can access the app at: http://localhost:5173
echo ===================================================
pause
