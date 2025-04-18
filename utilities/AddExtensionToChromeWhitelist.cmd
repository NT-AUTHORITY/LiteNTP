@echo off
REM Check if running with administrator privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Alert: Administrator privileges required. Attempting to obtain them...
    powershell -Command "Start-Process cmd -ArgumentList '/c %~fs0' -Verb runAs"
    exit /b
)

REM Set registry path
set "RegPath=HKLM\Software\Policies\Google\Chrome\ExtensionInstallAllowlist"

REM Add extension ID to registry
reg add "%RegPath%" /v 1 /t REG_SZ /d idbagngjaglgcemiijnbjbhhpdlbhbjd /f

REM Notify completion
echo Batch script successfully executed. Extension ID added to the allowlist.
pause
