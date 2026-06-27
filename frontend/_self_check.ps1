#!/usr/bin/env pwsh
<#
.SYNOPSIS
UWELL CRM — Post-Optimization Self-Check
Run this after EVERY code change before claiming completion.
#>

Continue = 'Stop'
 = 0
 = 0
 = 5173
 = 'C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm\frontend'

function Check(, ) {
    Write-Host -NoNewline "  [ ]  ... "
    try {
        & 
        Write-Host "PASS" -ForegroundColor Green
        ++
    } catch {
        Write-Host "FAIL" -ForegroundColor Red
        Write-Host "       " -ForegroundColor DarkRed
        ++
    }
}

Write-Host "
==========================================" -ForegroundColor Cyan
Write-Host "  UWELL CRM · 优化后自检" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. BUILD CHECK
Check "Build (vite build exit 0)" {
     = & npx vite build 2>&1
    if ( -ne 0) { throw "Build failed with exit code " }
}

# 2. BOM CHECK — no BOM bytes in any JSX/JS files
Check "No BOM bytes in .jsx/.js files" {
     = Get-ChildItem -Recurse -Include "*.jsx","*.js" -File | Where-Object { .FullName -notmatch 'node_modules|dist|\.pnpm' }
     = @()
    foreach ( in ) {
         = [System.IO.File]::ReadAllBytes(.FullName)
        if (.Length -gt 3 -and [0] -eq 0xEF -and [1] -eq 0xBB -and [2] -eq 0xBF) {
             += .FullName
        }
    }
    if (.Count -gt 0) { throw "BOM found in: " }
}

# 3. DIST CHECK — verify dist folder was rebuilt
Check "Dist folder has fresh build" {
    if (-not (Test-Path "\dist\index.html")) { throw "dist/index.html missing" }
    if (-not (Test-Path "\dist\fan-app.html")) { throw "dist/fan-app.html missing" }
    if (-not (Test-Path "\dist\store-app.html")) { throw "dist/store-app.html missing" }
}

# 4. SERVER CHECK — ensure server is running on correct port
Check "Server running on port " {
     = False
    try {
         = Invoke-WebRequest -Uri "http://localhost:/" -UseBasicParsing -TimeoutSec 3
        if (.StatusCode -eq 200) {  = True }
    } catch {}
    if (-not ) { throw "Server not responding on port " }
}

# 5. PAGE CHECK — all 6 pages return 200
Check "All 6 pages return 200" {
     = @("/", "/fan-app.html", "/store-app.html", "/fan-entry", "/fan-center", "/store-owner")
     = @()
    foreach ( in ) {
        try {
             = Invoke-WebRequest -Uri "http://localhost:" -UseBasicParsing -TimeoutSec 3
            if (.StatusCode -ne 200) {  += " -> " }
        } catch {  += " -> Exception" }
    }
    if (.Count -gt 0) { throw "Failed pages: " }
}

# 6. CACHE HEADER CHECK
Check "Cache-Control: no-cache headers" {
     = Invoke-WebRequest -Uri "http://localhost:/assets/style-DfDhQfIY.css" -UseBasicParsing -TimeoutSec 3
     = .Headers['Cache-Control']
    if (-not ( -match 'no-cache|no-store')) { throw "Missing no-cache header: " }
}

# SUMMARY
Write-Host "==========================================" -ForegroundColor Cyan
 =  + 
if ( -eq 0) {
    Write-Host "  RESULT: / ALL PASSED ✅" -ForegroundColor Green
    exit 0
} else {
    Write-Host "  RESULT: / PASSED,  FAILED ❌" -ForegroundColor Red
    exit 1
}
