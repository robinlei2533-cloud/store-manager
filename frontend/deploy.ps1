# UWELL CRM - 部署脚本
# 使用方法: .\deploy.ps1 [build|serve|all]

param(
    [string]$Action = "all"
)

# 设置路径
$ProjectRoot = "C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm\frontend"
Set-Location $ProjectRoot

function Build-Project {
    Write-Host "=== 开始构建 ===" -ForegroundColor Cyan
    npx vite build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "=== 构建成功 ===" -ForegroundColor Green
    } else {
        Write-Host "=== 构建失败 ===" -ForegroundColor Red
        exit 1
    }
}

function Serve-Production {
    Write-Host "=== 启动生产服务器 ===" -ForegroundColor Cyan
    node serve-prod.mjs
}

function Serve-Dev {
    Write-Host "=== 启动开发服务器 ===" -ForegroundColor Cyan
    npx vite --host 0.0.0.0
}

switch ($Action) {
    "build" { Build-Project }
    "serve" { Serve-Production }
    "dev" { Serve-Dev }
    "all" {
        Build-Project
        Write-Host "=== 构建完成 ===" -ForegroundColor Green
        Write-Host "运行 node serve-prod.mjs 启动生产服务器" -ForegroundColor Yellow
        Write-Host "访问 http://localhost:3456" -ForegroundColor White
    }
    default {
        Write-Host "未知命令: $Action" -ForegroundColor Red
        Write-Host "可用命令: build, serve, dev, all" -ForegroundColor Yellow
    }
}
