@echo off
cd /d "%~dp0"
echo.
echo  Fooody.in website
echo  Opening http://localhost:8080
echo  Keep this window open while you view the site.
echo  Close this window to stop.
echo.

start "" "http://localhost:8080/"

where py >nul 2>&1 && py -m http.server 8080 && goto :eof
where python >nul 2>&1 && python -m http.server 8080 && goto :eof
where python3 >nul 2>&1 && python3 -m http.server 8080 && goto :eof

echo Python was not found on this PC.
echo You can still upload this whole folder to Hostinger public_html.
pause
