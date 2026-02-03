# Migration Consolidation Summary

## Overview
This document outlines the migration consolidation completed to eliminate duplicate and scattered "add_*" migrations. The new structure organizes database schema more efficiently.

## Consolidated Migrations Created

### 1. Users Table (0001_01_01_000000_create_users_consolidated_table.php)
**Consolidates the following migrations:**
- `0001_01_01_000000` - Original create_users_table
- `2026_01_15_100000` - add_role_to_users_table
- `2026_01_16_100000` - add_user_registration_fields_to_users_table
- `2026_01_24_210000` - add_force_password_change_to_users_table
- `2026_01_26_174600` - add_crm_to_user_roles (modified enum)

**New fields included:**
- first_name, last_name, phone, age, address
- valid_id_path, role (enum), force_password_change
- status, last_login_at, last_login_ip

---

### 2. Shop Owners Table (2026_01_14_205002_create_shop_owners_consolidated_table.php)
**Consolidates the following migrations:**
- `2026_01_14_205002` - Original create_shop_owners_table
- `2026_01_15_100004` - add_monthly_target_to_shop_owners_table
- `2026_01_16_120500` - add_rejection_reason_to_shop_owners_table
- `2026_01_18_051834` - add_suspension_reason_to_shop_owners_table

**New fields included:**
- monthly_target, rejection_reason, suspension_reason

---

### 3. Employees Table (2026_01_15_150001_create_employees_consolidated_table.php)
**Consolidates the following migrations:**
- `2026_01_15_150001` - Original create_employees_table
- `2026_01_24_200000` - add_branch_and_functional_role_to_employees
- `2026_01_27_091200` - add_phone_to_employees_table
- `2026_01_27_100000` - add_hr_fields_to_employees
- `2026_01_27_104000` - add_password_to_employees

**New fields included:**
- password, branch, functional_role, phone, position, department
- salary, hire_date

---

### 4. Finance Accounts Table (2026_01_28_000000_create_finance_accounts_consolidated_table.php)
**Consolidates the following migrations:**
- `2026_01_28_000000` - Original create_finance_accounts_table (v1)
- `2026_01_28_000001` - Duplicate create_finance_accounts_table (v2)
- `2026_01_28_000010` - add_balance_to_finance_accounts
- `2026_01_30_000000` - add_shop_owner_id_to_finance_accounts

**Note:** This also resolves the duplicate finance_accounts table that was created in two different versions.

**Consolidated fields:**
- shop_owner_id, shop_id, balance columns
- All indexes for performance

---

### 5. Audit Logs Table (2026_01_24_200100_create_audit_logs_consolidated_table.php)
**Consolidates the following migrations:**
- `2026_01_24_200100` - Detailed audit_logs version
- `2026_01_28_000004` - Simplified audit_logs version (DUPLICATE - REMOVED)

**Consolidated fields:**
- user_id, shop_owner_id, actor_user_id (flexible references)
- action, object_type, target_type, metadata, data
- Performance indexes

---

## Migration Files to DELETE

These files have been consolidated and should be removed:

### Add-to-Users Migrations (Delete)
- [ ] `2026_01_15_100000_add_role_to_users_table.php`
- [ ] `2026_01_16_100000_add_user_registration_fields_to_users_table.php`
- [ ] `2026_01_24_210000_add_force_password_change_to_users_table.php`
- [ ] `2026_01_26_174600_add_crm_to_user_roles.php`

### Add-to-Shop-Owners Migrations (Delete)
- [ ] `2026_01_15_100004_add_monthly_target_to_shop_owners_table.php`
- [ ] `2026_01_16_120500_add_rejection_reason_to_shop_owners_table.php`
- [ ] `2026_01_18_051834_add_suspension_reason_to_shop_owners_table.php`

### Add-to-Employees Migrations (Delete)
- [ ] `2026_01_24_200000_add_branch_and_functional_role_to_employees.php`
- [ ] `2026_01_27_091200_add_phone_to_employees_table.php`
- [ ] `2026_01_27_100000_add_hr_fields_to_employees.php`
- [ ] `2026_01_27_104000_add_password_to_employees.php`

### Finance-Related Duplicate/Add Migrations (Delete)
- [ ] `2026_01_28_000001_create_finance_accounts_table.php` (DUPLICATE - Different schema)
- [ ] `2026_01_28_000010_add_balance_to_finance_accounts.php`
- [ ] `2026_01_30_000000_add_shop_owner_id_to_finance_accounts.php`

### Audit Logs Duplicate (Delete)
- [ ] `2026_01_28_000004_create_audit_logs_table.php` (DUPLICATE - Simpler schema)

### Additional Data Seeding Migrations (Optional - Delete if not used)
- [ ] `2026_01_26_172734_add_crm_role_support.php` (Data seeding, not schema)

---

## Benefits of This Consolidation

1. **Cleaner Migration History**: Fewer migration files = easier to understand schema
2. **No More Duplicate Tables**: Resolves the finance_accounts duplicate issue
3. **Logical Organization**: Related columns grouped in one place
4. **Easier Maintenance**: Adding features doesn't scatter migrations across multiple files
5. **Better Performance**: All indexes are properly defined from creation

## Implementation Notes

- ✅ All consolidated migrations follow Laravel best practices
- ✅ All foreign key constraints included
- ✅ Performance indexes added where needed
- ✅ Null safety handled appropriately
- ✅ Soft deletes preserved where applicable

## Next Steps

1. Review these consolidated migrations in the migration directory
2. Delete the old individual "add_*" migration files listed above
3. Run `php artisan migrate:fresh` on a test environment to verify
4. If migrations have already been run in production, create additional migrations for the changes

---

**Status**: Ready to implement | **Date**: January 31, 2026
