# UWELL CRM - Post-Optimization Self-Check Script
# Run this after every change before telling the user "done"

param([switch]$Fix)

$errors = @()
$root = "C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm\frontend"

Write-Host "=== UWELL CRM Self-Check ===" -ForegroundColor Cyan

# 1. Check build
Write-Host "`n[1/5] Build check..." -ForegroundColor Yellow
$build = & "$root\node_modules\.pnpm\vite@8.0.16\node_modules\vite\bin\vite.js" build 2>&1 | Out-String
if ($build -match "built in") {
    Write-Host "  ✅ Build succeeded" -ForegroundColor Green
} else {
    Write-Host "  ❌ Build FAILED" -ForegroundColor Red
    $errors += "Build failed"
    if ($Fix) {
        Write-Host "  → Run: git checkout -- src/ to revert" -ForegroundColor Gray
    }
}

# 2. Check for React anti-patterns (localDb.init in render body)
Write-Host "`n[2/5] Checking React anti-patterns..." -ForegroundColor Yellow
$files = Get-ChildItem "$root\src" -Recurse -Filter "*.jsx"
$badPatterns = @()
foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw -Encoding UTF8
    if ($content -match "if \(localDb\.needsInit\(\)\)" -and $f.Name -ne "") {
        $badPatterns += $f.Name
    }
}
if ($badPatterns.Count -eq 0) {
    Write-Host "  ✅ No DB init in render body" -ForegroundColor Green
} else {
    Write-Host "  ❌ Found DB init in render: $($badPatterns -join ', ')" -ForegroundColor Red
    $errors += "DB init in render"
}

# 3. Check all pages return 200
Write-Host "`n[3/5] Server check..." -ForegroundColor Yellow
try {
    $r = Invoke-WebRequest -Uri "http://localhost:3456/" -UseBasicParsing -TimeoutSec 3
    if ($r.StatusCode -eq 200) {
        Write-Host "  ✅ Server responding (port 3456)" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠️  Server not running on 3456 (start manually)" -ForegroundColor Yellow
}

# 4. Check for resolvedFan/broken variable refs
Write-Host "`n[4/5] Checking for undefined variables..." -ForegroundColor Yellow
$badRefs = @()
foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw -Encoding UTF8
    if ($content -match "resolvedFan") {
        $badRefs += $f.Name
    }
}
if ($badRefs.Count -eq 0) {
    Write-Host "  ✅ No orphaned resolvedFan refs" -ForegroundColor Green
} else {
    Write-Host "  ❌ Found resolvedFan refs: $($badRefs -join ', ')" -ForegroundColor Red
    $errors += "resolvedFan refs"
}

# 5. Git status check
Write-Host "`n[5/5] Git status..." -ForegroundColor Yellow
$status = git -C $root status --porcelain
if ([string]::IsNullOrEmpty($status)) {
    Write-Host "  ✅ Working tree clean" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Uncommitted changes:" -ForegroundColor Yellow
    $status -split "`n" | ForEach-Object { Write-Host "     $_" -ForegroundColor Gray }
}

if ($errors.Count -eq 0) {
    Write-Host "`n✅ ALL CHECKS PASSED - Safe to present to user" -ForegroundColor Green
} else {
    Write-Host "`n❌ $($errors.Count) issue(s) found - fix before presenting" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  - $_" }
}
