<#
.SYNOPSIS
  UWELL CRM Database Backup
#>
param(
  [ValidateSet('full','schema','data')][string]$Mode = 'full',
  [int]$RetentionDays = 30
)

$BackupDir = Join-Path (Split-Path $PSScriptRoot -Parent) "backups"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$DbUrl = "postgresql://postpostgres:rdsrgpnvzcchqlsghsrq@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$SuffixMap = @{full='full';schema='schema';data='data'}
$Filename = "uwell-crm_${Timestamp}_$($SuffixMap[$Mode]).sql"
$FilePath = Join-Path $BackupDir $Filename

Write-Host "=== UWELL CRM Backup ===" -ForegroundColor Cyan
Write-Host "Mode: $Mode"
Write-Host "Output: $FilePath"

try {
  $pgArgs = @()
  if ($Mode -eq 'schema') { $pgArgs += '--schema-only' }
  if ($Mode -eq 'data') { $pgArgs += '--data-only' }
  $pgArgs += '--no-owner', '--no-acl', "--file=$FilePath", $DbUrl

  & pg_dump @pgArgs 2>$null
  if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBackup completed!" -ForegroundColor Green
    $fileInfo = Get-Item $FilePath
    Write-Host "Size: $('{0:N2}' -f ($fileInfo.Length / 1KB)) KB"
  } else {
    Write-Host "Backup failed (exit code: $LASTEXITCODE)" -ForegroundColor Red
  }
} catch {
  Write-Host "Error: $_" -ForegroundColor Red
}

# Cleanup old backups
try {
  $cutoff = (Get-Date).AddDays(-$RetentionDays)
  $oldFiles = Get-ChildItem -Path $BackupDir -Filter "uwell-crm_*.sql*" | Where-Object { $_.LastWriteTime -lt $cutoff }
  if ($oldFiles.Count -gt 0) {
    $oldFiles | Remove-Item -Force
    Write-Host "Cleaned up $($oldFiles.Count) old backup(s)"
  }
} catch {
  Write-Host "Cleanup: $_"
}