@echo off
REM Migration Cleanup Script - Remove Consolidated Migrations
REM This script deletes the individual "add_*" migrations that have been consolidated

echo Migration Consolidation Cleanup
echo ================================
echo.
echo Backing up old migrations to a backup folder...

REM Create backup folder
if not exist "database\migrations\backup" mkdir database\migrations\backup

REM Files to delete (consolidated into main create table migrations)
set FILES_TO_DELETE=^
    2026_01_15_100000_add_role_to_users_table.php^
    2026_01_16_100000_add_user_registration_fields_to_users_table.php^
    2026_01_24_210000_add_force_password_change_to_users_table.php^
    2026_01_26_174600_add_crm_to_user_roles.php^
    2026_01_15_100004_add_monthly_target_to_shop_owners_table.php^
    2026_01_16_120500_add_rejection_reason_to_shop_owners_table.php^
    2026_01_18_051834_add_suspension_reason_to_shop_owners_table.php^
    2026_01_24_200000_add_branch_and_functional_role_to_employees.php^
    2026_01_27_091200_add_phone_to_employees_table.php^
    2026_01_27_100000_add_hr_fields_to_employees.php^
    2026_01_27_104000_add_password_to_employees.php^
    2026_01_28_000001_create_finance_accounts_table.php^
    2026_01_28_000010_add_balance_to_finance_accounts.php^
    2026_01_30_000000_add_shop_owner_id_to_finance_accounts.php^
    2026_01_28_000004_create_audit_logs_table.php^
    2026_01_26_172734_add_crm_role_support.php

REM Move files to backup
echo.
echo Moving old migrations to backup...
for %%f in (%FILES_TO_DELETE%) do (
    if exist "database\migrations\%%f" (
        move "database\migrations\%%f" "database\migrations\backup\%%f"
        echo ✓ Moved %%f
    ) else (
        echo ⚠ Not found: %%f
    )
)

echo.
echo ================================
echo Backup completed!
echo Old migrations saved to: database\migrations\backup\
echo.
echo NOTE: Keep these backups until you verify the new consolidated migrations work correctly.
echo.
echo Next steps:
echo 1. Review the new consolidated migrations in database\migrations\
echo 2. Test with: php artisan migrate:fresh --seed
echo 3. If successful, you can safely delete the backup folder
echo.
pause
