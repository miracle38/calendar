@echo off
chcp 65001 > nul
title Calendar Sync (SSO Re-login)
cd /d "%~dp0"

echo ====================================================
echo   Calendar - Groupware SSO Re-login Mode
echo.
echo   A Chrome window will open shortly.
echo   Please log in via SSO as usual and wait until the
echo   groupware main page appears. The script will then
echo   continue automatically. (Max 5 minutes wait)
echo ====================================================
echo.

call npm run sync:debug

echo.
echo ====================================================
echo   Done. Press any key to close window.
echo ====================================================
pause > nul
