@echo off
rem One-click entry for cmd.exe and Explorer double-click. It runs site.ps1 without changing the system execution policy.
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0site.ps1" %*
set "SITE_EXIT=%ERRORLEVEL%"
if "%~1"=="" pause
exit /b %SITE_EXIT%
