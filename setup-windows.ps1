# BioVerse Windows Setup Script
# Run this in PowerShell as Administrator

Write-Host "=== BioVerse Windows Setup ===" -ForegroundColor Cyan

# Check if PostgreSQL is running
Write-Host "`nChecking PostgreSQL..." -ForegroundColor Yellow
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) {
    Write-Host "✓ PostgreSQL service found: $($pgService.Name)" -ForegroundColor Green
    if ($pgService.Status -ne "Running") {
        Write-Host "Starting PostgreSQL..." -ForegroundColor Yellow
        Start-Service $pgService.Name
    }
} else {
    Write-Host "✗ PostgreSQL service not found. Please install PostgreSQL." -ForegroundColor Red
    exit 1
}

# Check if MongoDB is running
Write-Host "`nChecking MongoDB..." -ForegroundColor Yellow
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService) {
    Write-Host "✓ MongoDB service found" -ForegroundColor Green
    if ($mongoService.Status -ne "Running") {
        Write-Host "Starting MongoDB..." -ForegroundColor Yellow
      