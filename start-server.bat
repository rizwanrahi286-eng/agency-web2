@echo off
title Agency Web Local Server
echo ====================================================
echo Starting Agency Web Local Server on port 3000...
echo Opening http://localhost:3000 in your browser...
echo Keep this window open while testing.
echo ====================================================
start http://localhost:3000
python -m http.server 3000
pause
