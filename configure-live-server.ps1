# Live Server Configuration Script (PowerShell)
# This script helps configure Laravel for a live server environment on Windows

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Live Server CSRF Configuration Helper" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Get current domain/IP
$domain = Read-Host "Enter your live server domain or IP (e.g., example.com or 192.168.1.1)"

# Ask about HTTPS
$useHttps = Read-Host "Are you using HTTPS? (y/n)"

if ($useHttps -eq "y" -or $useHttps -eq "Y") {
    $secureCookie = "true"
    $protocol = "https"
} else {
    $secureCookie = "false"
    $protocol = "http"
}

# Ask about frontend dev port
$frontendPort = Read-Host "What port is your frontend running on? (default: 3000 or 5173)"
if ([string]::IsNullOrEmpty($frontendPort)) {
    $frontendPort = "3000,5173"
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Updating .env configuration..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Read current .env
$envPath = ".\.env"
$envContent = Get-Content $envPath

# Update SESSION_DOMAIN
$envContent = $envContent -replace "^SESSION_DOMAIN=.*", "SESSION_DOMAIN=$domain"

# Update SESSION_SECURE_COOKIE
$envContent = $envContent -replace "^SESSION_SECURE_COOKIE=.*", "SESSION_SECURE_COOKIE=$secureCookie"

# Update SANCTUM_STATEFUL_DOMAINS
$statefulDomains = "$domain:$frontendPort,localhost:5173,127.0.0.1:5173"
$envContent = $envContent -replace "^SANCTUM_STATEFUL_DOMAINS=.*", "SANCTUM_STATEFUL_DOMAINS=$statefulDomains"

# Write back
$envContent | Set-Content $envPath

Write-Host "✓ SESSION_DOMAIN=$domain" -ForegroundColor Green
Write-Host "✓ SESSION_SECURE_COOKIE=$secureCookie" -ForegroundColor Green
Write-Host "✓ SANCTUM_STATEFUL_DOMAINS=$statefulDomains" -ForegroundColor Green
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Running Laravel configuration..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Run migrations
Write-Host "Running migrations..." -ForegroundColor Yellow
php artisan migrate --force
Write-Host "✓ Migrations complete" -ForegroundColor Green

# Clear config cache
Write-Host "Clearing config cache..." -ForegroundColor Yellow
php artisan config:cache
Write-Host "✓ Config cache cleared" -ForegroundColor Green

# Clear other caches
Write-Host "Clearing other caches..." -ForegroundColor Yellow
php artisan cache:clear
Write-Host "✓ Caches cleared" -ForegroundColor Green

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Configuration Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary of changes:" -ForegroundColor Yellow
Write-Host "  - SESSION_DOMAIN: $domain"
Write-Host "  - SESSION_SECURE_COOKIE: $secureCookie"
Write-Host "  - SANCTUM_STATEFUL_DOMAINS: $statefulDomains"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Visit http${protocol}://$domain/user/login"
Write-Host "2. Try logging in with your credentials"
Write-Host "3. You should no longer see 419 errors"
Write-Host ""
Write-Host "If you still see 419 errors:" -ForegroundColor Yellow
Write-Host "  - Run: php artisan session:clear"
Write-Host "  - Check browser cookies are enabled"
Write-Host "  - Check browser DevTools for CSRF token in response"
Write-Host ""
