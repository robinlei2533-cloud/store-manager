# UWELL CRM Market Growth OS
# ==========================
# 生产环境启动脚本
# Build + Serve in one command

param(
    [string]$Action = "all",
    [int]$Port = 3456
)

$Root = "C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm\frontend"
Set-Location $Root

function Show-Header {
    Clear-Host
    Write-Host "╔══════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║   UWELL CRM · Market Growth OS      ║" -ForegroundColor Yellow
    Write-Host "║   中东非粉丝门店管理系统              ║" -ForegroundColor Yellow
    Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Yellow
    Write-Host ""
}

function Build-App {
    Write-Host "→ 构建中..." -ForegroundColor Cyan
    $result = npx vite build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 构建成功" -ForegroundColor Green
    } else {
        Write-Host "✗ 构建失败" -ForegroundColor Red
        exit 1
    }
}

function Serve-App {
    $env:PORT = $Port
    Write-Host "→ 启动生产服务器 :$Port ..." -ForegroundColor Cyan
    node serve-prod.mjs
}

function Show-Urls {
    Write-Host ""
    Write-Host "══════════════════════════════════════" -ForegroundColor Yellow
    Write-Host "  访问链接:" -ForegroundColor White
    Write-Host "  http://localhost:$Port/fan-app.html#/fan-entry" -ForegroundColor Green
    Write-Host "  http://localhost:$Port/fan-app.html#/fan-center" -ForegroundColor Green
    Write-Host "  http://localhost:$Port/store-app.html#/store-owner" -ForegroundColor Green
    Write-Host "  http://localhost:$Port/index.html#/admin" -ForegroundColor Green
    Write-Host "  http://localhost:$Port/index.html#/app/dashboard" -ForegroundColor Green
    Write-Host "══════════════════════════════════════" -ForegroundColor Yellow
    Write-Host ""
}

switch ($Action.ToLower()) {
    "build" { Show-Header; Build-App }
    "serve" { Show-Header; Serve-App }
    "all" {
        Show-Header
        Build-App
        Show-Urls
        Serve-App
    }
    default {
        Write-Host "用法: .\start.ps1 [build|serve|all]" -ForegroundColor Yellow
    }
}
