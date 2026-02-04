# Spatie Laravel Permission Implementation Plan

**Package:** [spatie/laravel-permission](https://github.com/spatie/laravel-permission)  
**Current Date:** February 4, 2026  
**Project:** SoleSpace ERP System  
**Status:** Planning Phase

---

## Table of Contents
1. [Overview](#overview)
2. [Why Implement This Package](#why-implement-this-package)
3. [Current System Analysis](#current-system-analysis)
4. [Implementation Strategy](#implementation-strategy)
5. [Installation Steps](#installation-steps)
6. [Database Schema Changes](#database-schema-changes)
7. [Code Migration Plan](#code-migration-plan)
8. [Testing Plan](#testing-plan)
9. [Rollback Strategy](#rollback-strategy)
10. [Timeline & Milestones](#timeline--milestones)

---

## Overview

This document outlines the implementation plan for integrating `spatie/laravel-permission` into the SoleSpace ERP system. The package provides a flexible and comprehensive permission management system that will replace our current role-based authentication with a more granular role and permission system.

**Package Features:**
- Role-based access control (RBAC)
- Permission-based access control
- Role hierarchies
- Multiple guards support
- Blade directives for permission checks
- Middleware for route protection
- Database-driven permissions (no code changes needed for permission updates)

---

## Why Implement This Package

### Current Pain Points
1. **Hard-coded role checks** throughout the codebase (`role:FINANCE_STAFF,FINANCE_MANAGER`)
2. **No granular permissions** - users either have full access or none
3. **Difficult to manage** - adding new roles requires code changes and deployment
4. **No permission inheritance** - can't create role hierarchies
5. **Limited flexibility** - can't give specific users additional permissions without changing their role

### Benefits of spatie/laravel-permission
1. **Database-driven** - Add/modify roles and permissions through admin UI
2. **Granular control** - Assign specific permissions like `view-expenses`, `approve-expenses`, `create-products`
3. **Flexible** - Users can have multiple roles, roles can have multiple permissions
4. **Role hierarchies** - Finance Manager can inherit all Finance Staff permissions
5. **Middleware ready** - Built-in middleware for protecting routes
6. **Well-tested** - Industry-standard package with extensive community support
7. **Audit-ready** - Clear permission assignments for compliance

### Use Cases After Implementation
- Finance Staff can view expenses but not approve them
- Finance Manager can both view and approve expenses
- Temporary permissions for special projects
- Role-based dashboard widgets (show/hide based on permissions)
- Granular API access control

---

## Current System Analysis

### Authentication Guards
```php
// config/auth.php
'guards' => [
    'web' => ['driver' => 'session', 'provider' => 'users'],
    'user' => ['driver' => 'session', 'provider' => 'users'],
    'shop_owner' => ['driver' => 'session', 'provider' => 'shop_owners'],
    'super_admin' => ['driver' => 'session', 'provider' => 'super_admins'],
],
```

### Current Roles (String-based)
Located in `app/Models/User.php`:
- `FINANCE_STAFF`
- `FINANCE_MANAGER`
- `HR`
- `CRM`
- `MANAGER`
- `STAFF`

Shop Owner is a separate guard/model, not a role.

### Current Role Checks

**Middleware Usage:**
```php
// routes/web.php
Route::middleware(['auth:user', 'role:FINANCE_STAFF,FINANCE_MANAGER'])
Route::middleware(['auth:user', 'role:HR'])
Route::middleware(['auth:user', 'role:CRM'])
Route::middleware(['auth:user', 'role:MANAGER'])
```

**Controller Usage:**
```php
// app/Http/Controllers/ActivityLogController.php
if ($user->role === 'MANAGER') { /* ... */ }
if (in_array($user->role, ['FINANCE_STAFF', 'FINANCE_MANAGER'])) { /* ... */ }
```

**Files with Role Checks:**
- `routes/web.php` - Route middleware
- `routes/api.php` - API route middleware
- `app/Http/Middleware/CheckRole.php` - Custom role middleware
- `app/Http/Controllers/ActivityLogController.php` - Role-based filtering
- `app/Http/Controllers/Finance/*` - Finance role checks
- `database/seeders/UserSeeder.php` - Default user creation

---

## Implementation Strategy

### Phase 1: Install & Configure (Non-Breaking)
- Install package
- Run migrations (creates new tables)
- Publish config
- Configure guards
- No changes to existing code yet

### Phase 2: Seed Roles & Permissions
- Create roles matching current system
- Define granular permissions for each module
- Assign permissions to roles
- Create seeder for initial setup

### Phase 3: Migrate Existing Users
- Script to migrate existing users to new permission system
- Assign roles based on current `role` column
- Verify all users have correct permissions
- Keep old `role` column temporarily for rollback

### Phase 4: Update Middleware & Routes (Breaking Changes)
- Update route middleware to use `permission` and `role` from package
- Replace custom `role:` middleware with package's middleware
- Test all routes still work

### Phase 5: Update Controllers
- Replace `$user->role === 'X'` checks with `$user->hasRole('X')`
- Replace permission checks with `$user->can('permission-name')`
- Update activity log filtering to use permissions

### Phase 6: Create Admin UI
- Permission management page for Super Admin
- Role assignment interface
- User permission override interface

### Phase 7: Testing & Cleanup
- Full regression testing
- Remove old `role` column migration
- Remove custom CheckRole middleware
- Update documentation

---

## Installation Steps

### 1. Install Package
```bash
composer require spatie/laravel-permission
```

### 2. Publish Configuration & Migrations
```bash
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```

This creates:
- `config/permission.php` - Configuration file
- Migration files for `roles`, `permissions`, `model_has_roles`, `model_has_permissions`, `role_has_permissions` tables

### 3. Configure for Multiple Guards

Edit `config/permission.php`:
```php
return [
    'models' => [
        'permission' => Spatie\Permission\Models\Permission::class,
        'role' => Spatie\Permission\Models\Role::class,
    ],

    'table_names' => [
        'roles' => 'roles',
        'permissions' => 'permissions',
        'model_has_permissions' => 'model_has_permissions',
        'model_has_roles' => 'model_has_roles',
        'role_has_permissions' => 'role_has_permissions',
    ],

    'column_names' => [
        'role_pivot_key' => null,
        'permission_pivot_key' => null,
        'model_morph_key' => 'model_id',
        'team_foreign_key' => 'team_id',
    ],

    // IMPORTANT: Register all guards that will use permissions
    'guards' => [
        'user',
        'shop_owner',
        'super_admin',
    ],

    'cache' => [
        'expiration_time' => \DateInterval::createFromDateString('24 hours'),
        'key' => 'spatie.permission.cache',
        'store' => 'default',
    ],
];
```

### 4. Run Migrations
```bash
php artisan migrate
```

### 5. Update Models

**app/Models/User.php:**
```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Activitylog\Traits\LogsActivity;

class User extends Authenticatable
{
    use HasRoles, LogsActivity;

    protected $guard_name = 'user'; // Important for multi-guard setup

    // ... rest of model
}
```

**app/Models/ShopOwner.php:**
```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Permission\Traits\HasRoles;

class ShopOwner extends Authenticatable
{
    use HasRoles;

    protected $guard_name = 'shop_owner';

    // ... rest of model
}
```

**app/Models/SuperAdmin.php:**
```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Permission\Traits\HasRoles;

class SuperAdmin extends Authenticatable
{
    use HasRoles;

    protected $guard_name = 'super_admin';

    // ... rest of model
}
```

---

## Database Schema Changes

### New Tables Created by Package

#### 1. `roles` Table
```sql
CREATE TABLE roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    guard_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY roles_name_guard_name_unique (name, guard_name)
);
```

#### 2. `permissions` Table
```sql
CREATE TABLE permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    guard_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY permissions_name_guard_name_unique (name, guard_name)
);
```

#### 3. `model_has_roles` (Pivot Table)
```sql
CREATE TABLE model_has_roles (
    role_id BIGINT UNSIGNED NOT NULL,
    model_type VARCHAR(255) NOT NULL,
    model_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (role_id, model_id, model_type),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
```

#### 4. `model_has_permissions` (Pivot Table)
```sql
CREATE TABLE model_has_permissions (
    permission_id BIGINT UNSIGNED NOT NULL,
    model_type VARCHAR(255) NOT NULL,
    model_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (permission_id, model_id, model_type),
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);
```

#### 5. `role_has_permissions` (Pivot Table)
```sql
CREATE TABLE role_has_permissions (
    permission_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (permission_id, role_id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
```

### Keep Existing `role` Column
**DO NOT DROP** the existing `role` column in `users` table during migration. Keep it for:
1. Rollback capability
2. Data verification
3. Gradual migration

Can be removed in Phase 7 after complete testing.

---

## Code Migration Plan

### Roles & Permissions Structure

#### Module: Finance
**Roles:**
- `Finance Staff`
- `Finance Manager`

**Permissions:**
```php
// Expenses
'view-expenses'
'create-expenses'
'edit-expenses'
'delete-expenses'
'approve-expenses'  // Manager only

// Invoices
'view-invoices'
'create-invoices'
'edit-invoices'
'delete-invoices'
'send-invoices'

// Finance Reports
'view-finance-reports'
'export-finance-reports'

// Budget Management
'view-budgets'
'create-budgets'
'edit-budgets'
'approve-budgets'  // Manager only
```

#### Module: HR
**Roles:**
- `HR Staff`
- `HR Manager`

**Permissions:**
```php
// Employees
'view-employees'
'create-employees'
'edit-employees'
'delete-employees'
'approve-employee-changes'  // Manager only

// Attendance
'view-attendance'
'create-attendance'
'edit-attendance'
'approve-timeoff'  // Manager only

// Payroll
'view-payroll'
'process-payroll'  // Manager only
'approve-payroll'  // Manager only

// HR Reports
'view-hr-reports'
'export-hr-reports'
```

#### Module: CRM
**Roles:**
- `CRM Staff`
- `CRM Manager`

**Permissions:**
```php
// Customers
'view-customers'
'create-customers'
'edit-customers'
'delete-customers'

// Leads
'view-leads'
'create-leads'
'edit-leads'
'convert-leads'
'assign-leads'

// Opportunities
'view-opportunities'
'create-opportunities'
'edit-opportunities'
'close-opportunities'

// CRM Reports
'view-crm-reports'
'export-crm-reports'
```

#### Module: Manager (Oversight)
**Roles:**
- `Manager`

**Permissions:**
```php
// User Management
'view-all-users'
'create-users'
'edit-users'
'delete-users'
'assign-roles'

// Products & Inventory
'view-products'
'create-products'
'edit-products'
'delete-products'
'manage-inventory'

// Pricing
'view-pricing'
'edit-pricing'
'manage-service-pricing'

// System Oversight
'view-all-audit-logs'
'view-system-reports'
'manage-shop-settings'
```

#### Module: Staff
**Roles:**
- `Staff`

**Permissions:**
```php
// Job Orders
'view-job-orders'
'create-job-orders'
'edit-job-orders'
'complete-job-orders'

// Basic Access
'view-dashboard'
```

#### Shop Owner Guard
**Roles:**
- `Shop Owner`

**Permissions:**
```php
// Full Access
'*'  // Or use SuperAdmin role from package
```

#### Super Admin Guard
**Roles:**
- `Super Admin`

**Permissions:**
```php
// System Administration
'*'  // Full system access
```

### Seeder Implementation

**database/seeders/RolesAndPermissionsSeeder.php:**
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ===== USER GUARD PERMISSIONS =====
        
        // Finance Permissions
        $financePermissions = [
            'view-expenses', 'create-expenses', 'edit-expenses', 'delete-expenses', 'approve-expenses',
            'view-invoices', 'create-invoices', 'edit-invoices', 'delete-invoices', 'send-invoices',
            'view-finance-reports', 'export-finance-reports',
            'view-budgets', 'create-budgets', 'edit-budgets', 'approve-budgets',
            'view-finance-audit-logs',
        ];

        foreach ($financePermissions as $permission) {
            Permission::create(['name' => $permission, 'guard_name' => 'user']);
        }

        // HR Permissions
        $hrPermissions = [
            'view-employees', 'create-employees', 'edit-employees', 'delete-employees', 'approve-employee-changes',
            'view-attendance', 'create-attendance', 'edit-attendance', 'approve-timeoff',
            'view-payroll', 'process-payroll', 'approve-payroll',
            'view-hr-reports', 'export-hr-reports',
            'view-hr-audit-logs',
        ];

        foreach ($hrPermissions as $permission) {
            Permission::create(['name' => $permission, 'guard_name' => 'user']);
        }

        // CRM Permissions
        $crmPermissions = [
            'view-customers', 'create-customers', 'edit-customers', 'delete-customers',
            'view-leads', 'create-leads', 'edit-leads', 'convert-leads', 'assign-leads',
            'view-opportunities', 'create-opportunities', 'edit-opportunities', 'close-opportunities',
            'view-crm-reports', 'export-crm-reports',
            'view-crm-audit-logs',
        ];

        foreach ($crmPermissions as $permission) {
            Permission::create(['name' => $permission, 'guard_name' => 'user']);
        }

        // Manager Permissions
        $managerPermissions = [
            'view-all-users', 'create-users', 'edit-users', 'delete-users', 'assign-roles',
            'view-products', 'create-products', 'edit-products', 'delete-products', 'manage-inventory',
            'view-pricing', 'edit-pricing', 'manage-service-pricing',
            'view-all-audit-logs', 'view-system-reports', 'manage-shop-settings',
        ];

        foreach ($managerPermissions as $permission) {
            Permission::create(['name' => $permission, 'guard_name' => 'user']);
        }

        // Staff Permissions
        $staffPermissions = [
            'view-job-orders', 'create-job-orders', 'edit-job-orders', 'complete-job-orders',
            'view-dashboard',
        ];

        foreach ($staffPermissions as $permission) {
            Permission::create(['name' => $permission, 'guard_name' => 'user']);
        }

        // ===== CREATE ROLES AND ASSIGN PERMISSIONS =====

        // Finance Staff Role
        $financeStaff = Role::create(['name' => 'Finance Staff', 'guard_name' => 'user']);
        $financeStaff->givePermissionTo([
            'view-expenses', 'create-expenses', 'edit-expenses',
            'view-invoices', 'create-invoices', 'edit-invoices', 'send-invoices',
            'view-finance-reports',
            'view-budgets',
            'view-finance-audit-logs',
        ]);

        // Finance Manager Role (inherits Finance Staff + approval permissions)
        $financeManager = Role::create(['name' => 'Finance Manager', 'guard_name' => 'user']);
        $financeManager->givePermissionTo([
            'view-expenses', 'create-expenses', 'edit-expenses', 'delete-expenses', 'approve-expenses',
            'view-invoices', 'create-invoices', 'edit-invoices', 'delete-invoices', 'send-invoices',
            'view-finance-reports', 'export-finance-reports',
            'view-budgets', 'create-budgets', 'edit-budgets', 'approve-budgets',
            'view-finance-audit-logs',
        ]);

        // HR Role
        $hr = Role::create(['name' => 'HR', 'guard_name' => 'user']);
        $hr->givePermissionTo([
            'view-employees', 'create-employees', 'edit-employees', 'delete-employees', 'approve-employee-changes',
            'view-attendance', 'create-attendance', 'edit-attendance', 'approve-timeoff',
            'view-payroll', 'process-payroll', 'approve-payroll',
            'view-hr-reports', 'export-hr-reports',
            'view-hr-audit-logs',
        ]);

        // CRM Role
        $crm = Role::create(['name' => 'CRM', 'guard_name' => 'user']);
        $crm->givePermissionTo([
            'view-customers', 'create-customers', 'edit-customers', 'delete-customers',
            'view-leads', 'create-leads', 'edit-leads', 'convert-leads', 'assign-leads',
            'view-opportunities', 'create-opportunities', 'edit-opportunities', 'close-opportunities',
            'view-crm-reports', 'export-crm-reports',
            'view-crm-audit-logs',
        ]);

        // Manager Role (full oversight access)
        $manager = Role::create(['name' => 'Manager', 'guard_name' => 'user']);
        $manager->givePermissionTo(Permission::where('guard_name', 'user')->pluck('name'));

        // Staff Role
        $staff = Role::create(['name' => 'Staff', 'guard_name' => 'user']);
        $staff->givePermissionTo([
            'view-job-orders', 'create-job-orders', 'edit-job-orders', 'complete-job-orders',
            'view-dashboard',
        ]);

        // ===== SHOP OWNER GUARD =====
        
        // Shop Owner gets all permissions for their guard
        $shopOwnerRole = Role::create(['name' => 'Shop Owner', 'guard_name' => 'shop_owner']);
        // Shop owners have full access to their shop - permissions checked at controller level

        // ===== SUPER ADMIN GUARD =====
        
        $superAdminRole = Role::create(['name' => 'Super Admin', 'guard_name' => 'super_admin']);
        // Super admins have full system access

        $this->command->info('Roles and permissions created successfully!');
    }
}
```

### Migration Script for Existing Users

**database/seeders/MigrateUsersToRolesSeeder.php:**
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ShopOwner;
use App\Models\SuperAdmin;

class MigrateUsersToRolesSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Migrating existing users to role system...');

        // Map old role strings to new role names
        $roleMapping = [
            'FINANCE_STAFF' => 'Finance Staff',
            'FINANCE_MANAGER' => 'Finance Manager',
            'HR' => 'HR',
            'CRM' => 'CRM',
            'MANAGER' => 'Manager',
            'STAFF' => 'Staff',
        ];

        // Migrate Users (employee guard)
        $users = User::whereNotNull('role')->get();
        foreach ($users as $user) {
            $oldRole = $user->role;
            
            if (isset($roleMapping[$oldRole])) {
                $newRoleName = $roleMapping[$oldRole];
                $user->assignRole($newRoleName);
                $this->command->info("User {$user->email}: {$oldRole} → {$newRoleName}");
            } else {
                $this->command->warn("User {$user->email}: Unknown role '{$oldRole}'");
            }
        }

        // Migrate Shop Owners
        $shopOwners = ShopOwner::all();
        foreach ($shopOwners as $shopOwner) {
            $shopOwner->assignRole('Shop Owner');
            $this->command->info("Shop Owner {$shopOwner->email}: Assigned 'Shop Owner' role");
        }

        // Migrate Super Admins
        $superAdmins = SuperAdmin::all();
        foreach ($superAdmins as $superAdmin) {
            $superAdmin->assignRole('Super Admin');
            $this->command->info("Super Admin {$superAdmin->email}: Assigned 'Super Admin' role");
        }

        $this->command->info('User migration completed!');
    }
}
```

### Route Middleware Updates

**Before (Current):**
```php
// routes/web.php
Route::middleware(['auth:user', 'role:FINANCE_STAFF,FINANCE_MANAGER'])
    ->prefix('erp/finance')
    ->name('erp.finance.')
    ->group(function () {
        // Finance routes
    });

Route::middleware(['auth:user', 'role:HR'])
    ->prefix('erp/hr')
    ->name('erp.hr.')
    ->group(function () {
        // HR routes
    });
```

**After (With Spatie Package):**
```php
// routes/web.php
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\PermissionMiddleware;

Route::middleware(['auth:user', 'role:Finance Staff|Finance Manager'])
    ->prefix('erp/finance')
    ->name('erp.finance.')
    ->group(function () {
        
        // All finance routes
        Route::get('/', ...)->name('dashboard');
        
        // Specific permission for approvals
        Route::post('/expenses/{expense}/approve', [ExpenseController::class, 'approve'])
            ->middleware('permission:approve-expenses')
            ->name('expenses.approve');
    });

// Or check multiple permissions
Route::middleware(['auth:user', 'permission:view-expenses|approve-expenses'])
    ->get('/finance/expenses', [ExpenseController::class, 'index']);
```

### Controller Updates

**Before (Current):**
```php
// app/Http/Controllers/ActivityLogController.php
public function index(Request $request)
{
    $user = Auth::guard('user')->user();
    
    if ($user->role === 'MANAGER') {
        return $this->getManagerLogs($request);
    }
    
    if (in_array($user->role, ['FINANCE_STAFF', 'FINANCE_MANAGER'])) {
        return $this->getFinanceLogs($request);
    }
    
    // ...
}
```

**After (With Spatie Package):**
```php
// app/Http/Controllers/ActivityLogController.php
public function index(Request $request)
{
    $user = Auth::guard('user')->user();
    
    if ($user->hasRole('Manager')) {
        return $this->getManagerLogs($request);
    }
    
    if ($user->hasAnyRole(['Finance Staff', 'Finance Manager'])) {
        return $this->getFinanceLogs($request);
    }
    
    // Or check specific permission
    if ($user->can('view-all-audit-logs')) {
        return $this->getAllLogs($request);
    }
    
    // ...
}
```

### Blade Directives (For Future Blade Views)

```blade
@role('Finance Manager')
    <button>Approve Expense</button>
@endrole

@hasrole('Finance Staff|Finance Manager')
    <a href="{{ route('finance.expenses') }}">View Expenses</a>
@endhasrole

@can('approve-expenses')
    <button>Approve</button>
@endcan

@canany(['edit-expenses', 'delete-expenses'])
    <button>Manage Expense</button>
@endcanany
```

### React/Inertia Components

**Before:**
```tsx
// Check in controller and pass to frontend
const canApprove = user.role === 'FINANCE_MANAGER';
```

**After:**
```tsx
// Pass permissions array from controller
const { auth } = usePage().props;

// In controller:
return Inertia::render('Finance/Expenses', [
    'auth' => [
        'user' => $user,
        'permissions' => $user->getAllPermissions()->pluck('name'),
        'roles' => $user->getRoleNames(),
    ],
]);

// In component:
const canApprove = auth.permissions.includes('approve-expenses');
const isManager = auth.roles.includes('Manager');
```

---

## Testing Plan

### Unit Tests

**tests/Unit/RolesAndPermissionsTest.php:**
```php
<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RolesAndPermissionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_be_assigned_role()
    {
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
        
        $user = User::factory()->create();
        $user->assignRole('Finance Staff');
        
        $this->assertTrue($user->hasRole('Finance Staff'));
    }

    public function test_finance_manager_has_approval_permissions()
    {
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
        
        $user = User::factory()->create();
        $user->assignRole('Finance Manager');
        
        $this->assertTrue($user->can('approve-expenses'));
        $this->assertTrue($user->can('approve-budgets'));
    }

    public function test_finance_staff_cannot_approve()
    {
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
        
        $user = User::factory()->create();
        $user->assignRole('Finance Staff');
        
        $this->assertFalse($user->can('approve-expenses'));
    }

    public function test_manager_has_all_permissions()
    {
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
        
        $user = User::factory()->create();
        $user->assignRole('Manager');
        
        $this->assertTrue($user->can('view-all-audit-logs'));
        $this->assertTrue($user->can('approve-expenses'));
        $this->assertTrue($user->can('edit-users'));
    }

    public function test_guard_separation()
    {
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
        
        $employee = User::factory()->create();
        $employee->assignRole('Finance Staff');
        
        // Should not be able to get shop owner role
        $this->expectException(\Spatie\Permission\Exceptions\GuardDoesNotMatch::class);
        $employee->assignRole('Shop Owner');
    }
}
```

### Feature Tests

**tests/Feature/FinancePermissionsTest.php:**
```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Finance\Expense;
use Illuminate\Foundation\Testing\RefreshDatabase;

class FinancePermissionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_finance_staff_can_view_expenses()
    {
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
        
        $user = User::factory()->create();
        $user->assignRole('Finance Staff');
        
        $response = $this->actingAs($user, 'user')
            ->get('/erp/finance');
        
        $response->assertStatus(200);
    }

    public function test_finance_staff_cannot_approve_expense()
    {
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
        
        $user = User::factory()->create();
        $user->assignRole('Finance Staff');
        
        $expense = Expense::factory()->create(['status' => 'pending']);
        
        $response = $this->actingAs($user, 'user')
            ->post("/api/expenses/{$expense->id}/approve");
        
        $response->assertStatus(403); // Forbidden
    }

    public function test_finance_manager_can_approve_expense()
    {
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
        
        $user = User::factory()->create();
        $user->assignRole('Finance Manager');
        
        $expense = Expense::factory()->create(['status' => 'pending']);
        
        $response = $this->actingAs($user, 'user')
            ->post("/api/expenses/{$expense->id}/approve");
        
        $response->assertStatus(200);
    }

    public function test_hr_cannot_access_finance_routes()
    {
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
        
        $user = User::factory()->create();
        $user->assignRole('HR');
        
        $response = $this->actingAs($user, 'user')
            ->get('/erp/finance');
        
        $response->assertStatus(403);
    }
}
```

### Manual Testing Checklist

- [ ] Install package and run migrations
- [ ] Run role and permission seeders
- [ ] Migrate existing users to new system
- [ ] Verify all users have correct roles
- [ ] Test login for each role
- [ ] Verify Finance Staff can view but not approve
- [ ] Verify Finance Manager can approve
- [ ] Verify HR can access HR routes
- [ ] Verify CRM can access CRM routes
- [ ] Verify Manager can access all modules
- [ ] Verify Staff can only access job orders
- [ ] Test audit log filtering per role
- [ ] Test permission-based UI elements (show/hide buttons)
- [ ] Test API endpoints with permission checks
- [ ] Verify old `role` column still works (for rollback)

---

## Rollback Strategy

### Quick Rollback (If Issues Found Immediately)

1. **Don't run migration script** - Keep old role column active
2. **Revert code changes** using git:
   ```bash
   git revert <commit-hash>
   git push
   ```
3. **Clear cache:**
   ```bash
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   ```

### Full Rollback (After Migration Completed)

1. **Restore old role checks:**
   - Revert middleware changes
   - Revert controller role checks
   - Revert route definitions

2. **Keep permission tables** (for data safety):
   ```php
   // Don't drop tables, just disable package
   // Remove from composer.json and run:
   composer update
   ```

3. **Re-seed users if needed:**
   ```bash
   php artisan db:seed --class=UserSeeder
   ```

### Data Backup Before Migration

```bash
# Backup before running migration seeder
php artisan db:seed --class=RolesAndPermissionsSeeder
mysqldump -u root -p solespace > backup_before_permission_migration.sql

# Restore if needed
mysql -u root -p solespace < backup_before_permission_migration.sql
```

---

## Timeline & Milestones

### Week 1: Setup & Preparation
- [ ] Install spatie/laravel-permission
- [ ] Configure multi-guard setup
- [ ] Run migrations (create permission tables)
- [ ] Create RolesAndPermissionsSeeder
- [ ] Test seeder in local environment
- [ ] Create MigrateUsersToRolesSeeder
- [ ] Review with team

### Week 2: Database Migration
- [ ] Backup production database
- [ ] Run seeders on staging environment
- [ ] Verify all users migrated correctly
- [ ] Test authentication on staging
- [ ] Document any issues found
- [ ] Fix issues and re-test

### Week 3: Code Updates (Part 1)
- [ ] Update User, ShopOwner, SuperAdmin models
- [ ] Update ActivityLogController
- [ ] Update Finance controllers
- [ ] Create unit tests
- [ ] Run tests and fix issues

### Week 4: Code Updates (Part 2)
- [ ] Update route middleware
- [ ] Update remaining controllers (HR, CRM, Manager)
- [ ] Update React components to use permissions
- [ ] Create feature tests
- [ ] Full regression testing

### Week 5: Admin UI & Polish
- [ ] Create permission management page
- [ ] Create role assignment interface
- [ ] Add permission checks to audit logs
- [ ] Update documentation
- [ ] Final testing

### Week 6: Deployment & Monitoring
- [ ] Deploy to staging
- [ ] User acceptance testing
- [ ] Deploy to production
- [ ] Monitor for issues
- [ ] Collect feedback
- [ ] Plan cleanup phase

### Week 7+: Cleanup (After Verification)
- [ ] Remove old `role` column
- [ ] Remove custom CheckRole middleware
- [ ] Update all documentation
- [ ] Train users on new permission system
- [ ] Archive old role-based code

---

## Key Files to Modify

### Models
- ✅ `app/Models/User.php` - Add HasRoles trait, set guard_name
- ✅ `app/Models/ShopOwner.php` - Add HasRoles trait, set guard_name
- ✅ `app/Models/SuperAdmin.php` - Add HasRoles trait, set guard_name

### Controllers
- 🔄 `app/Http/Controllers/ActivityLogController.php` - Replace role checks
- 🔄 `app/Http/Controllers/Finance/*` - Add permission checks
- 🔄 `app/Http/Controllers/HR/*` - Add permission checks
- 🔄 `app/Http/Controllers/CRM/*` - Add permission checks
- 🔄 `app/Http/Controllers/Manager/*` - Add permission checks

### Routes
- 🔄 `routes/web.php` - Update middleware from `role:X` to `role:X|Y`
- 🔄 `routes/api.php` - Add permission middleware to sensitive endpoints

### Middleware
- 🔄 `app/Http/Kernel.php` - Register Spatie middleware aliases
- ❌ `app/Http/Middleware/CheckRole.php` - Keep for now, deprecate later

### Seeders
- ✅ `database/seeders/RolesAndPermissionsSeeder.php` - CREATE NEW
- ✅ `database/seeders/MigrateUsersToRolesSeeder.php` - CREATE NEW
- 🔄 `database/seeders/UserSeeder.php` - Update to assign roles after creation

### Tests
- ✅ `tests/Unit/RolesAndPermissionsTest.php` - CREATE NEW
- ✅ `tests/Feature/FinancePermissionsTest.php` - CREATE NEW
- ✅ `tests/Feature/HRPermissionsTest.php` - CREATE NEW
- ✅ `tests/Feature/CRMPermissionsTest.php` - CREATE NEW

### Configuration
- 🔄 `config/permission.php` - Configure guards
- 🔄 `app/Http/Kernel.php` - Register middleware

### Frontend (Optional - Phase 2)
- 🔄 `resources/js/types/index.d.ts` - Add permission types
- 🔄 `resources/js/Pages/*/` - Update permission checks
- 🔄 `resources/js/components/*/` - Conditional rendering based on permissions

**Legend:**
- ✅ CREATE NEW - New file to be created
- 🔄 MODIFY - Existing file to be updated
- ❌ DEPRECATE - File to be phased out

---

## Additional Resources

### Package Documentation
- Official Docs: https://spatie.be/docs/laravel-permission/v6/introduction
- GitHub: https://github.com/spatie/laravel-permission
- Installation: https://spatie.be/docs/laravel-permission/v6/installation-laravel

### Related Packages
- `spatie/laravel-query-builder` - Already installed ✅
- `spatie/laravel-activitylog` - Already installed ✅

### Community Resources
- Laracasts: https://laracasts.com/series/whats-new-in-laravel-6/episodes/15
- Laravel News: Search for "spatie permission"
- Stack Overflow: Tag `laravel-permission`

### Internal Documentation
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- [ROLE_PERMISSIONS.md](ROLE_PERMISSIONS.md)
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- [USER_REGISTRATION_SYSTEM.md](USER_REGISTRATION_SYSTEM.md)

---

## Notes & Considerations

### Performance
- Package uses caching for permission lookups (24-hour default)
- Clear cache after permission changes: `php artisan permission:cache-reset`
- Consider Redis for production permission caching

### Multi-Guard Gotchas
- Always set `protected $guard_name` in models
- Roles/permissions are guard-specific
- Can't assign cross-guard roles (by design)

### Best Practices
- Use descriptive permission names: `view-expenses` not `expenses.view`
- Group related permissions: `view-`, `create-`, `edit-`, `delete-` prefix
- Document permission requirements in controller docblocks
- Create admin UI for permission management (don't rely on seeders)

### Future Enhancements
- Team-based permissions (if multi-tenant needed)
- Permission categories for better organization
- Audit log for permission changes
- Temporary permission grants (time-limited)
- Permission request workflow

---

## Sign-Off Checklist

Before marking this implementation complete:

- [ ] All migrations run successfully
- [ ] All seeders executed without errors
- [ ] All existing users migrated to new system
- [ ] All tests passing (unit + feature)
- [ ] Manual testing completed for all roles
- [ ] No authentication/authorization regressions
- [ ] Documentation updated
- [ ] Team trained on new permission system
- [ ] Backup strategy in place
- [ ] Rollback procedure tested
- [ ] Performance monitoring set up
- [ ] Production deployment successful
- [ ] Post-deployment verification complete

---

## Questions & Decisions Needed

1. **Should we remove old `role` column immediately?**
   - ❌ Recommendation: Keep for 1-2 months for safety
   
2. **Should Shop Owners have explicit permissions or wildcard?**
   - 🤔 Discussion needed: Explicit permissions for audit trail vs. wildcard for simplicity

3. **Do we need team-based permissions?**
   - 🤔 If multiple shops per database, yes. Current scope: Single shop = No

4. **Should we create an admin UI in Phase 1 or Phase 2?**
   - ✅ Recommendation: Phase 2, after verifying core functionality

5. **How to handle permission changes without deployment?**
   - ✅ Create admin panel to add/modify permissions dynamically

---

**Document Version:** 1.0  
**Last Updated:** February 4, 2026  
**Status:** Planning Phase - Awaiting Approval  
**Next Review:** After team discussion
