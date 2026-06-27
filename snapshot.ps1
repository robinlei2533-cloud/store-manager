param([string] = "snapshot")
$gitDir = "C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm\.git"
$workTree = "C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm"
$env:GIT_DIR = $gitDir
$env:GIT_WORK_TREE = $workTree

# Create backup in _backup folder
$backupDir = "C:\Users\陈木木的\Documents\Uwell CRM网站\_backup\snapshot_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Copy-Item -Path "$workTree\frontend\src" -Destination "$backupDir\src" -Recurse -Force
Copy-Item -Path "$workTree\frontend\package.json" -Destination "$backupDir\package.json" -Force
Copy-Item -Path "$workTree\frontend\vite.config.js" -Destination "$backupDir\vite.config.js" -Force
Write-Host "Backup: $backupDir"

# Git add + commit + tag
git add -A
$tag = "v$(Get-Date -Format 'yyyyMMdd_HHmmss')"
git commit -m "$tag - $Message"
git tag -a "$tag" -m "$Message"
Write-Host "Committed: $tag"
