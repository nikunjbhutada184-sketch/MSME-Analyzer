@echo off
echo =======================================
echo     Starting MSME Analyzer Project
echo =======================================
echo.

echo Starting the Backend Server (FastAPI)...
start "MSME Analyzer Backend" cmd /k "cd backend && call venv\Scripts\activate.bat && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo Starting the Frontend Server (React/Vite)...
start "MSME Analyzer Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers have been launched in separate windows!
echo - Frontend URL: http://localhost:5173
echo - Backend URL: http://localhost:8000
echo.
echo You can close this window now. The servers will keep running in their respective windows.
pause
