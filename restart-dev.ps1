# PowerShell script to restart development servers
Write-Host "Restarting Development Servers..." -ForegroundColor Cyan

# Kill any existing processes on ports 8000 and 5173
Write-Host ""
Write-Host "1. Stopping existing servers..." -ForegroundColor Yellow
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($port8000) {
    Stop-Process -Id $port8000 -Force -ErrorAction SilentlyContinue
    Write-Host "   Stopped Laravel server (port 8000)" -ForegroundColor Green
}

if ($port5173) {
    Stop-Process -Id $port5173 -Force -ErrorAction SilentlyContinue
    Write-Host "   Stopped Vite server (port 5173)" -ForegroundColor Green
}

# Clear Laravel caches
Write-Host ""
Write-Host "2. Clearing Laravel caches..." -ForegroundColor Yellow
php artisan config:clear
php artisan cache:clear
php artisan view:clear
Write-Host "   Caches cleared" -ForegroundColor Green

# Remove hot file if exists
if (Test-Path "public\hot") {
    Remove-Item "public\hot" -Force
    Write-Host "   Removed hot file" -ForegroundColor Green
}

Write-Host ""
Write-Host "Ready to start servers!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "   Terminal 1: php artisan serve" -ForegroundColor White
Write-Host "   Terminal 2: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "   Then visit: http://localhost:8000" -ForegroundColor White
