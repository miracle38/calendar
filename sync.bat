@echo off
chcp 65001 > nul
title Calendar Sync
cd /d "%~dp0"

echo ====================================================
echo   Calendar - Groupware Annual Leave Sync
echo   (Use sync-debug.bat if SSO session expired)
echo ====================================================
echo.

call npm run sync

echo.
echo ====================================================
echo   Done. Press any key to close window.
echo ====================================================
pause > nul
