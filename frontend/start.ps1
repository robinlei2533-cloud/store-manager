# UWELL CRM - Start Production Server
Write-Host "=== UWELL CRM Production Server ===" -ForegroundColor Yellow
 = Split-Path -Parent System.Management.Automation.InvocationInfo.MyCommand.Path
Set-Location 
Write-Host "Building..." -ForegroundColor Cyan
npx vite build
if ( -ne 0) {
    Write-Host "BUILD FAILED" -ForegroundColor Red
    exit 1
}
Write-Host "Build SUCCESS" -ForegroundColor Green
Write-Host ""
Write-Host "Starting production server on http://localhost:3456" -ForegroundColor Cyan
node serve-prod.mjs