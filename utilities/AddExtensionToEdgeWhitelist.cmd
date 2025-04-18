@echo off
REM Check if running with administrator privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Alert: Administrator privileges required. Attempting to obtain them...
    powershell -Command "Start-Process cmd -ArgumentList '/c %~fs0' -Verb runAs"
    exit /b
)

REM Set registry base path for ExtensionSettings in Microsoft Edge
set "RegBasePath=HKLM\Software\Policies\Microsoft\Edge\ExtensionSettings"

REM Configure settings for the specific extension (idbagngjaglgcemiijnbjbhhpdlbhbjd)
reg add "%RegBasePath%\idbagngjaglgcemiijnbjbhhpdlbhbjd" /v installation_mode /t REG_SZ /d normal_installed /f

REM Notify completion
echo Edge ExtensionSettings policies for the specific extension have been successfully configured.
pause
