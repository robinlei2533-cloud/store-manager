@echo off
cd /d "C:\Users\????\Documents\Uwell CRM??\uwell-crm\frontend\dist"
echo Server starting at http://localhost:5173
start /B "" npx.cmd http-server -p 5173 --cors
timeout /t 3 /nobreak >nul
echo Server running on http://localhost:5173
echo.
echo Fan login: http://localhost:5173/fan-entry.html
echo Admin:     http://localhost:5173/#/admin
