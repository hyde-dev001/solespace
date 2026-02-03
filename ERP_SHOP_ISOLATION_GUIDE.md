# ERP Shop Isolation & Role Management System

## Overview

This system ensures that users with ERP module roles (HR, FINANCE, MANAGER, STAFF) can only access data from their own shop. Each user is linked to a specific `ShopOwner` via the `shop_owner_id` field.

## Database Structure

### Users Table Changes
- `shop_owner_id` (foreign key): Links user to a specific shop
- `role` (enum): User's role within their shop
  - **HR**: Access to HR module (employees, payroll, attendance)
  - **FINANCE**: Access to Finance module (invoices, expenses, accounts)
  - **MANAGER**: Access to dashboard and orders
  - **STAFF**: Basic access to dashboard and profile
  - **SUPER_ADMIN**: Full system access (no shop isolation)

### Roles Table Structure
```
roles
- id
- shop_owner_id (FK to shop_owners)
- name (HR, FINANCE, MANAGER, STAFF)
- description
- permissions (JSON array of allowed actions)
- timestamps
```

## Key Features

### 1. Shop Isolation
**Middleware**: `ShopIsolationMiddleware`

Automatically ensures:
- Users can only access their assigned shop's data
- Super admins bypass shop isolation
- Request contains `user_shop_id` for use in controllers

**Usage in Routes**:
```php
Route::middleware('auth:sanctum', 'shop.isolation')->group(function () {
    // All routes here will have shop isolation enforced
});
```

### 2. Role-Based Access Control
**Middleware**: `RoleMiddleware`

Restricts access by user role:
- HR users can only access HR endpoints
- Finance users can only access Finance endpoints
- Managers have limited access
- Staff have basic access

**Usage in Routes**:
```php
Route::post('/hr/employees', [EmployeeController::class, 'store'])
    ->middleware('auth:sanctum', 'role:HR');

Route::post('/finance/invoices', [InvoiceController::class, 'store'])
    ->middleware('auth:sanctum', 'role:FINANCE');
```

## User Model Methods

### Check User Role
```php
$user = Auth::user();

// Check specific role
$user->hasRole('HR'); // true/false

// Check multiple roles
$user->hasAnyRole(['HR', 'MANAGER']); // true/false

// Get available module roles
$user->getAvailableModuleRoles(); // ['HR', 'FINANCE', 'STAFF', 'MANAGER']

// Get shop owner
$user->shopOwner(); // Relation to ShopOwner
```

## Role Model Methods

### Check Role Permissions
```php
$role = Role::find(1);

// Check if role has permission
$role->hasPermission('manage_employees'); // true/false

// Get available modules
$role->getModules(); // ['HR']

// Verify shop ownership
$role->belongsToShop($shopOwnerId); // true/false

// Get default permissions for a role
Role::getDefaultPermissions('HR');
```

## Controller Implementation Example

### HR Module Controller with Shop Isolation
```php
<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    /**
     * Get employees for the user's shop only
     */
    public function index(Request $request)
    {
        // $request->user_shop_id is automatically added by ShopIsolationMiddleware
        $employees = Employee::where('shop_owner_id', $request->user_shop_id)->get();
        
        return response()->json($employees);
    }

    /**
     * Create employee in user's shop
     */
    public function store(Request $request)
    {
        // Ensure employee belongs to user's shop
        $employee = Employee::create([
            'shop_owner_id' => $request->user_shop_id,
            'name' => $request->name,
            'email' => $request->email,
            // ... other fields
        ]);

        return response()->json($employee, 201);
    }

    /**
     * Update employee (only if belongs to user's shop)
     */
    public function update(Request $request, Employee $employee)
    {
        // Verify employee belongs to user's shop
        if ($employee->shop_owner_id !== $request->user_shop_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $employee->update($request->all());
        
        return response()->json($employee);
    }
}
```

## Route Configuration Example

```php
<?php

use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\InvoiceController;
use Illuminate\Support\Facades\Route;

// HR Module Routes - Protected by HR role and shop isolation
Route::middleware(['auth:sanctum', 'role:HR', 'shop.isolation'])
    ->prefix('hr')
    ->name('hr.')
    ->group(function () {
        Route::apiResource('employees', EmployeeController::class);
        Route::get('payroll', [PayrollController::class, 'index'])->name('payroll.index');
        Route::post('payroll', [PayrollController::class, 'store'])->name('payroll.store');
        Route::get('attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    });

// Finance Module Routes - Protected by FINANCE role and shop isolation
Route::middleware(['auth:sanctum', 'role:FINANCE', 'shop.isolation'])
    ->prefix('finance')
    ->name('finance.')
    ->group(function () {
        Route::apiResource('invoices', InvoiceController::class);
        Route::apiResource('expenses', ExpenseController::class);
        Route::get('reports', [FinanceController::class, 'reports'])->name('reports.index');
    });

// Manager Routes
Route::middleware(['auth:sanctum', 'role:MANAGER', 'shop.isolation'])
    ->prefix('manager')
    ->name('manager.')
    ->group(function () {
        Route::get('dashboard', [DashboardController::class, 'manager'])->name('dashboard');
        Route::get('orders', [OrderController::class, 'index'])->name('orders');
    });
```

## Migration Guide

### Step 1: Run Migrations
```bash
php artisan migrate
```

This will:
- Add `shop_owner_id` and `role` columns to users table
- Create roles table
- Add indexes and constraints

### Step 2: Seed Default Roles
```bash
php artisan db:seed --class=RoleSeeder
```

This will create default HR, FINANCE, MANAGER, and STAFF roles for all approved shop owners.

### Step 3: Assign Users to Shops
```php
// Example: Assign a user to a shop with HR role
$user = User::find(1);
$user->update([
    'shop_owner_id' => 1, // Assign to shop
    'role' => 'HR'        // Set as HR user
]);
```

## Security Considerations

1. **Shop Isolation**: Always verify `shop_owner_id` in queries
2. **Role Validation**: Check role before processing sensitive operations
3. **Permission Verification**: Use permission system for granular control
4. **Super Admin Bypass**: Super admins bypass shop isolation (use carefully!)
5. **Query Filtering**: Always filter by `shop_owner_id` in controllers

## Testing

### Test Shop Isolation
```php
public function test_user_cannot_access_other_shop_data()
{
    $user1 = User::factory()->create(['shop_owner_id' => 1, 'role' => 'HR']);
    $user2 = User::factory()->create(['shop_owner_id' => 2, 'role' => 'HR']);
    
    $this->actingAs($user1);
    $response = $this->get('/api/employees?shop_id=2');
    
    $response->assertStatus(403);
}
```

### Test Role Access
```php
public function test_finance_user_cannot_access_hr_module()
{
    $user = User::factory()->create(['role' => 'FINANCE']);
    
    $this->actingAs($user);
    $response = $this->post('/api/hr/employees', ['name' => 'John']);
    
    $response->assertStatus(403);
}
```

## Troubleshooting

### User getting "Forbidden" error
- Check if `shop_owner_id` is assigned
- Verify user's role matches route requirements
- Check if super admin access is needed

### Shop isolation not working
- Ensure middleware is registered in `bootstrap/app.php`
- Check route middleware configuration
- Verify `shop_owner_id` is passed in request

### Permissions not applied
- Check Role model permissions JSON
- Verify RoleSeeder was executed
- Check policy/authorization logic in controllers
