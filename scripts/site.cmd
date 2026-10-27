@echo off
rem One-click entry for cmd.exe and Explorer double-click. It runs site.ps1 without changing the system execution policy.
rem Double-click (no arguments): prepare the pinned toolchain the first time, then open the local preview.
setlocal
set "SITE_PS=powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0site.ps1""
if "%~1"=="" goto oneclick
%SITE_PS% %*
exit /b %ERRORLEVEL%

:oneclick
if exist "%~dp0..\node_modules\" goto preview
echo Preparing QCopilots Website. The first run downloads Node.js and packages.
%SITE_PS% setup
if errorlevel 1 goto failed

:preview
echo Opening the preview at http://127.0.0.1:4321/ . Close this window to stop it.
echo After pulling new changes, run "scripts\site.cmd setup" to refresh packages.
%SITE_PS% dev --open
if errorlevel 1 goto failed
exit /b 0

:failed
set "SITE_EXIT=%ERRORLEVEL%"
echo Setup or preview failed with exit code %SITE_EXIT%. Run "scripts\site.cmd doctor" for details.
pause
exit /b %SITE_EXIT%
