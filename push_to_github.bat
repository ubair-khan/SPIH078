@echo off
echo =========================================================
echo Pushing RiskPulse code to https://github.com/ubair-khan/SPIH078.git
echo =========================================================
.tmp\mingit\cmd\git.exe push -u origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo If prompted for password, use a GitHub Personal Access Token (PAT).
    echo Or run: .tmp\mingit\cmd\git.exe push https://<TOKEN>@github.com/ubair-khan/SPIH078.git main
)
pause
