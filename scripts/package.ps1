$ErrorActionPreference = 'Stop'
$uttProjectRoot = Split-Path -Parent $PSScriptRoot
$uttVersion = (Get-Content -LiteralPath (Join-Path $uttProjectRoot 'manifest.json') -Raw | ConvertFrom-Json).version
$uttPackageFiles = @('manifest.json','core.js','adapter.js','content.js','bridge.js','background.js','icon.png','HUONG-DAN.html')
$uttFilePaths = $uttPackageFiles | ForEach-Object { Join-Path $uttProjectRoot $_ }
foreach ($uttPath in $uttFilePaths) {
    if (-not (Test-Path -LiteralPath $uttPath -PathType Leaf)) { throw "Thiếu file tiện ích: $uttPath" }
}
$uttDist = Join-Path $uttProjectRoot 'dist'
New-Item -ItemType Directory -Path $uttDist -Force | Out-Null
$uttZip = Join-Path $uttDist "utt-study-queue-v$uttVersion.zip"
Compress-Archive -LiteralPath $uttFilePaths -DestinationPath $uttZip -Force
Write-Output "Đã tạo: $uttZip"
