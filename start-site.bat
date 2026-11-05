@echo off
cd /d "%~dp0"
echo.
echo  AID Studio is running at http://localhost:8000/design.html
echo  Close this window to stop it.
echo.
start "" "http://localhost:8000/design.html"
python -m http.server 8000
