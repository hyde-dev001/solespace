# ERP Roles & Shop Isolation Implementation - Complete Setup Guide

## ✅ What Has Been Implemented

### 1. **Database Structure**
- ✅ Updated `users` table with `shop_owner_id` and `role` fields
- ✅ Created `roles` table with shop isolation (one role per shop)
- ✅ Updated `employees` table with HR module fields
- ✅ Added indexes and foreign key constraints

### 2. **Models**
- ✅ **User Model** - Added `shop_owner_id`, `role`, and relationship methods
- ✅ **Role Model** - Complete role management with permissions
- ✅ **Employee Model** - HR module employee management

### 3. **Middleware**
- ✅ **ShopIsolationMiddleware** - Enforces shop data isolation
- ✅ **RoleMiddleware** - Enforces role-based access control
- ✅ Both registered in `bootstrap/app.php`

### 4. **Controllers**
- ✅ **EmployeeController** - Full HR module implementation with CRUD operations

### 5. **Routes**
- ✅ HR module API routes with role and shop isolation protection
- ✅ Ready for expansion with Finance and other modules

### 6. **Seeders**
- ✅ **RoleSeeder** - Creates HR, FINANCE, MANAGER, STAFF roles for all shops
- ✅ Runs automatically with `php artisan db:seed --class=RoleSeeder`

### 7. **Documentation**
- ✅ **ERP_SHOP_ISOLATION_GUIDE.md** - Complete implementation guide

---

## 🚀 Quick Start

### Step 1: Database Setup (Already Done)
```bash
# Run migrations (already completed)
php artisan migrate

# Seed roles for existing shops
php artisan db:seed --class=RoleSeeder
```

### Step 2: Assign Users to Shops with Roles

Using Tinker or in a controller:
```bash
php artisan tinker
```

```php
use App\Models\User;

// Find a user
$user = User::find(1);

// Assign to a shop with HR role
$user->update([
    'shop_owner_id' => 1,  // Assign to shop ID 1
    'role' => 'HR'         // Set as HR user
]);
```

Or create a user with role assignment:
```php
User::create([
    'first_name' => 'John',
    'last_name' => 'Doe',
    'email' => 'hr@example.com',
    'password' => bcrypt('password'),
    'shop_owner_id' => 1,   // Belongs to shop 1
    'role' => 'HR'          // HR module access
]);
```

### Step 3: Test Shop Isolation

```bash
# Access HR employees for your shop
GET /api/hr/employees

# This will be blocked if:
# - User doesn't have HR role
# - User doesn't belong to the requested shop
# - User is not authenticated
```

---

## 📋 Available Roles

### 1. **HR** (Human Resources)
- Manage employees (CRUD)
- Manage payroll
- Track attendance
- Handle leave requests
- View HR dashboard
- Employee statistics

**Permissions:**
- `view_hr_dashboard`
- `manage_employees`
- `view_employees`
- `manage_payroll`
- `view_payroll`
- `manage_attendance`
- `view_attendance`
- `manage_leave_requests`

### 2. **FINANCE** (Finance & Accounting)
- Manage invoices
- Manage expenses
- Manage accounts
- Generate financial reports
- View finance dashboard

**Permissions:**
- `view_finance_dashboard`
- `manage_invoices`
- `view_invoices`
- `manage_expenses`
- `view_expenses`
- `manage_accounts`
- `view_accounts`
- `generate_financial_reports`

### 3. **MANAGER** (General Manager)
- View dashboard
- View employees
- View payroll
- View expenses
- Manage orders
- Limited administrative access

**Permissions:**
- `view_dashboard`
- `view_employees`
- `view_payroll`
- `view_expenses`
- `view_orders`
- `manage_orders`

### 4. **STAFF** (Regular Staff)
- View dashboard
- View profile
- View attendance
- Basic access only

**Permissions:**
- `view_dashboard`
- `view_profile`
- `view_attendance`

### 5. **SUPER_ADMIN** (Super Administrator)
- Full system access
- Bypasses all shop isolation
- Can access any shop's data
- Can assign roles

---

## 🛠️ How to Use

### Using in Routes

```php
// HR Module - Only HR users can access
Route::middleware(['auth:sanctum', 'role:HR', 'shop.isolation'])
    ->prefix('hr')
    ->group(function () {
        Route::apiResource('employees', EmployeeController::class);
    });

// Finance Module - Only Finance users can access
Route::middleware(['auth:sanctum', 'role:FINANCE', 'shop.isolation'])
    ->prefix('finance')
    ->group(function () {
        Route::apiResource('invoices', InvoiceController::class);
    });

// Multiple roles allowed
Route::middleware(['auth:sanctum', 'role:HR,MANAGER', 'shop.isolation'])
    ->get('/dashboard', [DashboardController::class, 'index']);
```

### In Controllers

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        // $request->user_shop_id is automatically set by ShopIsolationMiddleware
        $shopId = $request->user_shop_id;
        
        // All data is scoped to this shop automatically
        $employees = Employee::where('shop_owner_id', $shopId)->get();
        
        return response()->json($employees);
    }

    public function store(Request $request)
    {
        // Always assign to user's shop
        $employee = Employee::create([
            'shop_owner_id' => $request->user_shop_id,
            'name' => $request->name,
            'email' => $request->email,
        ]);

        return response()->json($employee, 201);
    }
}
```

### In Models

```php
use App\Models\User;

$user = Auth::user();

// Check role
if ($user->hasRole('HR')) {
    // HR-specific logic
}

// Check multiple roles
if ($user->hasAnyRole(['HR', 'MANAGER'])) {
    // Can perform action
}

// Get shop owner
$shop = $user->shopOwner();

// Get available modules
$modules = $user->getAvailableModuleRoles();
```

---

## 📊 API Endpoints - HR Module

### Get All Employees
```
GET /api/hr/employees
Authorization: Bearer {token}

Response:
{
    "message": "Employees retrieved successfully",
    "data": {
        "data": [...],
        "current_page": 1,
        "per_page": 15,
        "total": 50
    }
}
```

### Create Employee
```
POST /api/hr/employees
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "position": "Manager",
    "department": "Sales",
    "salary": 50000,
    "hire_date": "2026-01-24",
    "status": "active"
}

Response:
{
    "message": "Employee created successfully",
    "data": { ... }
}
```

### Get Single Employee
```
GET /api/hr/employees/{id}
Authorization: Bearer {token}

Response:
{
    "message": "Employee retrieved successfully",
    "data": { ... }
}
```

### Update Employee
```
PUT /api/hr/employees/{id}
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
    "salary": 55000,
    "status": "on_leave"
}

Response:
{
    "message": "Employee updated successfully",
    "data": { ... }
}
```

### Delete Employee
```
DELETE /api/hr/employees/{id}
Authorization: Bearer {token}

Response:
{
    "message": "Employee deleted successfully"
}
```

### Get Employee Statistics
```
GET /api/hr/statistics
Authorization: Bearer {token}

Response:
{
    "message": "Employee statistics retrieved successfully",
    "data": {
        "total_employees": 50,
        "active_employees": 48,
        "inactive_employees": 1,
        "on_leave": 1,
        "total_payroll": 2500000
    }
}
```

---

## 🔒 Security Features

### 1. **Shop Isolation**
- Users can only access their shop's data
- Middleware automatically enforces this
- Super admins can bypass (for admin purposes)

### 2. **Role-Based Access**
- Each role has specific permissions
- Middleware checks role before processing request
- Multiple roles can be combined if needed

### 3. **Automatic Shop Assignment**
- `$request->user_shop_id` is automatically available in controllers
- No need to manually pass shop_id
- Prevents accidental cross-shop data access

### 4. **Data Integrity**
- Foreign key constraints prevent orphaned data
- Cascade deletes maintain referential integrity
- Indexes optimize query performance

---

## 🧪 Testing

### Test Shop Isolation
```php
// Feature test
public function test_hr_user_cannot_access_other_shop_employees()
{
    $hr1 = User::factory()->create([
        'shop_owner_id' => 1,
        'role' => 'HR'
    ]);
    
    $this->actingAs($hr1);
    $response = $this->get('/api/hr/employees?shop_id=2');
    
    $response->assertStatus(403);
    $response->assertJson(['error' => 'UNAUTHORIZED_SHOP_ACCESS']);
}
```

### Test Role Access
```php
public function test_finance_user_cannot_access_hr_module()
{
    $finance = User::factory()->create(['role' => 'FINANCE']);
    
    $this->actingAs($finance);
    $response = $this->post('/api/hr/employees', ['name' => 'John']);
    
    $response->assertStatus(403);
}
```

---

## 📈 Extending with New Modules

### To Add Finance Module:

**1. Create Finance Controller:**
```php
// app/Http/Controllers/InvoiceController.php
public function index(Request $request) {
    return Invoice::where('shop_owner_id', $request->user_shop_id)->get();
}
```

**2. Add Finance Routes:**
```php
Route::middleware(['auth:sanctum', 'role:FINANCE', 'shop.isolation'])
    ->prefix('finance')
    ->group(function () {
        Route::apiResource('invoices', InvoiceController::class);
        Route::apiResource('expenses', ExpenseController::class);
    });
```

**3. Create Models & Migrations:**
- Create Invoice model with `shop_owner_id`
- Create migration with proper foreign keys
- Add shop_owner_id to all queries

---

## ✨ Key Benefits

✅ **Complete Shop Isolation** - Users can only see their shop's data
✅ **Role-Based Access** - Different features for different roles
✅ **Scalable** - Easy to add new modules and roles
✅ **Secure** - Middleware prevents unauthorized access
✅ **Performance** - Indexes optimize queries
✅ **Maintainable** - Clear code structure and documentation
✅ **Testable** - Easy to write unit and feature tests

---

## 🤝 Next Steps

1. **Create Finance Module** - Similar to HR module
2. **Add More Permissions** - Define granular permissions
3. **Create Permission System** - Check individual permissions
4. **Build Frontend** - React components for each module
5. **Add Audit Logging** - Track user actions
6. **Implement Notifications** - Alert users of actions

---

## 📞 Support

For questions or issues:
1. Check [ERP_SHOP_ISOLATION_GUIDE.md](ERP_SHOP_ISOLATION_GUIDE.md)
2. Review controller examples
3. Check middleware implementation
4. Review test examples

---

**Status**: ✅ Ready for Production  
**Last Updated**: January 24, 2026  
**Version**: 1.0
