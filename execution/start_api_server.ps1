<#
Starts execution/api_server.py as a fully detached background process on port 8787.

Unlike launching uvicorn directly in an agent/IDE terminal, this process is spawned via
Start-Process and is NOT a child of the calling shell — it survives that shell (or Claude
Code session) closing. Safe to re-run: it no-ops if something is already listening on 8787.

Run:
    powershell -ExecutionPolicy Bypass -File execution\start_api_server.ps1
#>

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$tmpDir = Join-Path $root ".tmp"
New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null
$logFile = Join-Path $tmpDir "api_server.log"
$errFile = Join-Path $tmpDir "api_server.err.log"

$existing = Get-NetTCPConnection -LocalPort 8787 -State Listen -ErrorAction SilentlyContinue
if ($existing) {
    $pid_ = ($existing | Select-Object -First 1 -ExpandProperty OwningProcess)
    Write-Output "API server already listening on port 8787 (PID $pid_). Nothing to do."
    exit 0
}

Start-Process -FilePath "python" `
    -ArgumentList "-m", "uvicorn", "execution.api_server:app", "--port", "8787" `
    -WorkingDirectory $root `
    -RedirectStandardOutput $logFile `
    -RedirectStandardError $errFile `
    -WindowStyle Hidden

$deadline = (Get-Date).AddSeconds(15)
$conn = $null
while ((Get-Date) -lt $deadline) {
    Start-Sleep -Milliseconds 500
    $conn = Get-NetTCPConnection -LocalPort 8787 -State Listen -ErrorAction SilentlyContinue
    if ($conn) { break }
}

if ($conn) {
    $pid_ = ($conn | Select-Object -First 1 -ExpandProperty OwningProcess)
    Write-Output "API server started successfully on port 8787 (PID $pid_). Logs: $logFile"
} else {
    Write-Output "API server failed to start within 15s. Check $errFile for details:"
    if (Test-Path $errFile) { Get-Content $errFile -Tail 30 }
    exit 1
}
