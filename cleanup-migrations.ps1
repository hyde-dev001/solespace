# PowerShell Migration Cleanup Script
# Removes consolidated migrations and backs them up

Write-Host "Migration Consolidation Cleanup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Create backup folder
$backupPath = "database\migrations\backup"
if (-not (Test-Path $backupPath)) {
    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    Write-Host "✓ Created backup directory" -ForegroundColor Green
}

# Files to delete (consolidated into main create table migrations)
$filesToDelete = @(
    # Users table additions
    "2026_01_15_100000_add_role_to_users_table.php",
    "2026_01_16_100000_add_user_registration_fields_to_users_table.php",
    "2026_01_24_210000_add_force_password_change_to_users_table.php",
    "2026_01_26_174600_add_crm_to_user_roles.php",
    
    # Shop Owners table additions
    "2026_01_15_100004_add_monthly_target_to_shop_owners_table.php",
    "2026_01_16_120500_add_rejection_reason_to_shop_owners_table.php",
    "2026_01_18_051834_add_suspension_reason_to_shop_owners_table.php",
    
    # Employees table additions
    "2026_01_24_200000_add_branch_and_functional_role_to_employees.php",
    "2026_01_27_091200_add_phone_to_employees_table.php",
    "2026_01_27_100000_add_hr_fields_to_employees.php",
    "2026_01_27_104000_add_password_to_employees.php",
    
    # Finance duplicates and additions
    "2026_01_28_000001_create_finance_accounts_table.php",
    "2026_01_28_000010_add_balance_to_finance_accounts.php",
    "2026_01_30_000000_add_shop_owner_id_to_finance_accounts.php",
    
    # Audit logs duplicate
    "2026_01_28_000004_create_audit_logs_table.php",
    
    # Data seeding (optional)
    "2026_01_26_172734_add_crm_role_support.php"
)

Write-Host ""
Write-Host "Moving old migrations to backup folder..." -ForegroundColor Yellow
Write-Host ""

$movedCount = 0
$notFoundCount = 0

foreach ($file in $filesToDelete) {
    $sourcePath = Join-Path "database\migrations" $file
    $destPath = Join-Path $backupPath $file
    
    if (Test-Path $sourcePath) {
        Move-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "✓ Moved $file" -ForegroundColor Green
        $movedCount++
    } else {
        Write-Host "⚠ Not found: $file" -ForegroundColor Yellow
        $notFoundCount++
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Backup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Files moved: $movedCount" -ForegroundColor Green
Write-Host "  Files not found: $notFoundCount" -ForegroundColor Yellow
Write-Host "  Backup location: $backupPath" -ForegroundColor Cyan
Write-Host ""

Write-Host "IMPORTANT:" -ForegroundColor Yellow
Write-Host "  - Keep these backups until you verify the new consolidated migrations work"
Write-Host "  - If you haven't run migrations yet, you're ready to go!"
Write-Host "  - If migrations were already run in production, you'll need different handling"
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review the new consolidated migrations in database/migrations/" -ForegroundColor White
Write-Host "  2. Test with: php artisan migrate:fresh --seed" -ForegroundColor White
Write-Host "  3. If successful, delete the backup folder: Remove-Item database/migrations/backup -Recurse" -ForegroundColor White
Write-Host ""
