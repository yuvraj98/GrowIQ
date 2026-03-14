@echo off
echo Starting GrowIQ Servers...

echo Make sure you have opened http://localhost:3000 in your browser.
echo Press Ctrl+C in this window when you want to stop the servers.
echo ===============================================================

concurrently "npm run dev --prefix growiq-backend" "npm run dev --prefix growiq-frontend"
