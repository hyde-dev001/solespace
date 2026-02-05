# Phase 6: Shop Owner Permission Management UI - COMPLETE

**Date:** February 4, 2026  
**Phase:** 6 of 7  
**Status:** ✅ Backend Complete, Frontend UI Integration Pending

---

## Overview

Phase 6 implements the permission management system for **Shop Owners** to assign granular permissions to their employees. This corrects the original plan which incorrectly stated "Super Admin" - Super Admin's role is only platform administration (handling shop registrations), not employee permission management.

**Key Correction:** This is NOT for Super Admin. Shop Owners manage their employees' permissions.

---

## What Was Completed

### 1. API Routes Added (routes/web.php)
```php
Route::middleware('auth:shop_owner')->prefix('shop-owner')->name('shop-owner.')->group(function () {
    // ... existing routes ...
    
    // Permission Management Routes (Phase 6)
    Route::get('/permissions/available', [UserAccessControlController::class, 'getAvailablePermissions'])
        ->name('permissions.available');
    Route::get('/employees/{userId}/permissions', [UserAccessControlController::class, 'getEmployeePermissions'])
        ->name('employees.permissions.get');
    Route::post('/employees/{userId}/permissions', [UserAccessControlController::class, 'updateEmployeePermissions'])
        ->name('employees.permissions.update');
    Route::post('/employees/{userId}/permissions/sync', [UserAccessControlController::class, 'syncEmployeePermissions'])
        ->name('employees.permissions.sync');
});
```

**Routes Summary:**
- **GET** `/shop-owner/permissions/available` - Get all 69 permissions grouped by module
- **GET** `/shop-owner/employees/{userId}/permissions` - Get specific employee's permissions
- **POST** `/shop-owner/employees/{userId}/permissions` - Add/remove individual permission
- **POST** `/shop-owner/employees/{userId}/permissions/sync` - Replace all direct permissions

---

### 2. Controller Methods Added (UserAccessControlController.php)

#### Import Statements
```php
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
```

#### Updated index() Method
**Enhanced employee data with permission information:**
```php
$employees = Employee::where('shop_owner_id', $shopOwner->id)
    ->with('user:id,email,role,phone,address')
    ->orderBy('created_at', 'desc')
    ->get()
    ->map(function($employee) {
        $user = $employee->user;
        return [
            'id' => $employee->id,
            'name' => $employee->name,
            'email' => $employee->email,
            // ... other fields ...
            
            // NEW: Spatie permission data
            'userId' => $user?->id,
            'roleName' => $user?->getRoleNames()->first() ?? null,
            'permissions' => $user?->getAllPermissions()->pluck('name')->toArray() ?? [],
            'rolePermissions' => $user?->getPermissionsViaRoles()->pluck('name')->toArray() ?? [],
            'directPermissions' => $user?->getDirectPermissions()->pluck('name')->toArray() ?? [],
        ];
    });
```

**What this provides:**
- `permissions` - All permissions (role + direct)
- `rolePermissions` - Permissions from their base role (Finance Staff, HR, etc.)
- `directPermissions` - Permissions directly assigned by shop owner

#### New Method: getAvailablePermissions()
**Purpose:** Get all 69 permissions organized by module

**Returns:**
```json
{
    "all": ["view-expenses", "create-expenses", ...],
    "grouped": {
        "finance": ["view-expenses", "create-expenses", "approve-expenses", ...],
        "hr": ["view-employees", "create-employees", ...],
        "crm": ["view-customers", "create-leads", ...],
        "manager": ["view-all-users", "assign-roles", ...],
        "staff": ["view-job-orders", "create-job-orders", ...]
    },
    "roles": [
        {
            "name": "Finance Staff",
            "permissions": ["view-expenses", "create-expenses", ...]
        },
        {
            "name": "Finance Manager",
            "permissions": ["view-expenses", "approve-expenses", ...]
        },
        ...
    ]
}
```

**Use Case:** Frontend can display permissions grouped by module with checkboxes

#### New Method: getEmployeePermissions($userId)
**Purpose:** Get specific employee's current permissions

**Returns:**
```json
{
    "userId": 125,
    "name": "Sarah Johnson",
    "email": "sarah@example.com",
    "roleName": "Finance Staff",
    "allPermissions": ["view-expenses", "create-expenses", "manage-inventory"],
    "rolePermissions": ["view-expenses", "create-expenses"],
    "directPermissions": ["manage-inventory"]
}
```

**Key Insight:**
- `rolePermissions` = Base permissions from "Finance Staff" role
- `directPermissions` = Extra permissions shop owner added specifically
- `allPermissions` = rolePermissions + directPermissions

**Example:** Sarah is Finance Staff but shop owner also gave her inventory management permission

#### New Method: updateEmployeePermissions($userId)
**Purpose:** Add or remove ONE permission from employee

**Request:**
```json
{
    "action": "give",  // or "revoke"
    "permission": "manage-inventory"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Permission 'manage-inventory' granted to Sarah Johnson",
    "allPermissions": [...],
    "directPermissions": ["manage-inventory"]
}
```

**Security:** Validates shop owner owns this employee

**Audit Log:** Records who granted/revoked what permission

#### New Method: syncEmployeePermissions($userId)
**Purpose:** Replace ALL direct permissions at once (for bulk updates)

**Request:**
```json
{
    "permissions": [
        "manage-inventory",
        "view-products",
        "create-products"
    ]
}
```

**Response:**
```json
{
    "success": true,
    "message": "Permissions updated for Sarah Johnson",
    "allPermissions": [...],
    "rolePermissions": [...],
    "directPermissions": ["manage-inventory", "view-products", "create-products"]
}
```

**Important:** This preserves role permissions, only syncs direct permissions

**Use Case:** Shop owner checks/unchecks multiple checkboxes then clicks "Save"

---

## Permission System Architecture

### Three Types of Permissions

1. **Role Permissions** (Base permissions from job role)
   - Finance Staff: view-expenses, create-expenses, view-invoices, etc.
   - Finance Manager: All Finance Staff permissions + approve-expenses, approve-budgets
   - HR: view-employees, create-employees, view-payroll, etc.
   - Assigned when employee is created with a role

2. **Direct Permissions** (Extra permissions shop owner adds)
   - Shop owner can give Sarah (Cashier/Finance Staff) extra permission: manage-inventory
   - Shop owner can give John (Assistant Manager/Manager) specific permission: approve-budgets
   - These are ON TOP OF role permissions

3. **All Permissions** (Role + Direct)
   - What the employee actually has
   - Used for authorization checks in controllers

### Example Scenarios

#### Scenario 1: Sarah (Cashier)
**Base Role:** Finance Staff
**Role Permissions:** 
- view-expenses
- create-expenses
- view-invoices
- create-invoices
- view-finance-reports

**Shop Owner Adds:**
- manage-inventory (for when she also handles stockroom)
- view-products
- view-sales-reports

**Total Permissions:** Role + Direct = 8 permissions

#### Scenario 2: John (Assistant Manager)
**Base Role:** Manager
**Role Permissions:** ALL 69 permissions (Manager has full access)

**Shop Owner Adds:** Nothing (already has everything)

**Total Permissions:** 69 permissions

#### Scenario 3: Maria (Bookkeeper)
**Base Role:** Finance Manager
**Role Permissions:**
- All finance permissions including approve-expenses
- approve-budgets

**Shop Owner Removes:**
- (Can't remove role permissions directly)
- Instead: Change role to Finance Staff, then add back only what she needs

**Solution:** Shop owner should assign Finance Staff role, then add:
- approve-expenses (direct permission)

---

## Frontend UI Requirements (Next Steps)

### 1. Employee List View
**Current:** Shows employee name, email, role
**Add:**
- Badge showing permission count: "12 permissions"
- "Manage Permissions" button for each employee

### 2. Permission Management Modal
**When shop owner clicks "Manage Permissions" button:**

**Modal Title:** Manage Permissions for Sarah Johnson (Finance Staff)

**Section 1: Role Permissions (Read-only)**
```
Base Role: Finance Staff
These permissions come from the Finance Staff role and cannot be changed here.

✓ view-expenses
✓ create-expenses
✓ edit-expenses
✓ view-invoices
✓ create-invoices
✓ edit-invoices
✓ send-invoices
✓ view-finance-reports
✓ view-budgets
✓ view-finance-audit-logs

To change role permissions, change the employee's role.
```

**Section 2: Additional Permissions (Checkboxes)**
```
Grant additional permissions beyond their role:

Finance Module:
□ delete-expenses
□ approve-expenses (Manager only)
□ delete-invoices
□ export-finance-reports
□ create-budgets
□ edit-budgets
□ approve-budgets (Manager only)

HR Module:
☑ view-employees (checked = Sarah has this)
□ create-employees
□ edit-employees
...

Manager Module:
☑ manage-inventory (checked = Sarah has this)
□ view-products
□ create-products
...
```

**Section 3: Permission Summary**
```
Total: 13 permissions
- From Role: 10
- Additional: 3 (view-employees, manage-inventory, view-products)
```

**Buttons:**
- [Cancel] [Save Changes]

### 3. Position Templates (Optional Future Feature)
**Predefined permission sets:**
- Cashier Template
  - Base: Finance Staff role
  - Additional: manage-inventory, view-products, view-sales-reports

- Bookkeeper Template
  - Base: Finance Staff role
  - Additional: approve-expenses, process-payroll

- Assistant Manager Template
  - Base: Manager role
  - Additional: (none needed, already has all)

**Use Case:** Shop owner clicks "Apply Cashier Template" to Sarah → All Cashier permissions automatically assigned

---

## API Usage Examples

### Example 1: Load Available Permissions
```javascript
// On page load
fetch('/shop-owner/permissions/available')
    .then(res => res.json())
    .then(data => {
        console.log('All permissions:', data.all);
        console.log('Grouped by module:', data.grouped);
        console.log('Role templates:', data.roles);
    });
```

### Example 2: Load Employee Permissions
```javascript
// When shop owner clicks "Manage Permissions" for Sarah (userId: 125)
fetch('/shop-owner/employees/125/permissions')
    .then(res => res.json())
    .then(data => {
        console.log('Role permissions:', data.rolePermissions);
        console.log('Direct permissions:', data.directPermissions);
        
        // Display checkboxes:
        // - Role permissions: disabled checkboxes (can't change)
        // - Direct permissions: enabled checkboxes
    });
```

### Example 3: Add Single Permission
```javascript
// When shop owner checks "manage-inventory" checkbox
fetch('/shop-owner/employees/125/permissions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
    },
    body: JSON.stringify({
        action: 'give',
        permission: 'manage-inventory'
    })
})
.then(res => res.json())
.then(data => {
    console.log('Success:', data.message);
    // Update UI to show new permission
});
```

### Example 4: Remove Single Permission
```javascript
// When shop owner unchecks "manage-inventory" checkbox
fetch('/shop-owner/employees/125/permissions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
    },
    body: JSON.stringify({
        action: 'revoke',
        permission: 'manage-inventory'
    })
})
.then(res => res.json())
.then(data => {
    console.log('Success:', data.message);
});
```

### Example 5: Bulk Update (Sync)
```javascript
// When shop owner clicks "Save Changes" after checking/unchecking multiple permissions
const selectedPermissions = [
    'manage-inventory',
    'view-products',
    'create-products',
    'view-employees'
];

fetch('/shop-owner/employees/125/permissions/sync', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
    },
    body: JSON.stringify({
        permissions: selectedPermissions
    })
})
.then(res => res.json())
.then(data => {
    console.log('Updated:', data.message);
    alert('Permissions updated successfully!');
});
```

---

## Testing Commands

### Test 1: Get Available Permissions
```bash
php artisan tinker --execute="
    \$shopOwner = \App\Models\ShopOwner::first();
    \$controller = new \App\Http\Controllers\ShopOwner\UserAccessControlController();
    Auth::guard('shop_owner')->setUser(\$shopOwner);
    \$response = \$controller->getAvailablePermissions();
    echo json_encode(\$response->getData(), JSON_PRETTY_PRINT);
"
```

### Test 2: Get Employee Permissions
```bash
php artisan tinker --execute="
    \$shopOwner = \App\Models\ShopOwner::first();
    \$user = \App\Models\User::find(125);
    Auth::guard('shop_owner')->setUser(\$shopOwner);
    \$controller = new \App\Http\Controllers\ShopOwner\UserAccessControlController();
    \$response = \$controller->getEmployeePermissions(125);
    echo json_encode(\$response->getData(), JSON_PRETTY_PRINT);
"
```

### Test 3: Grant Permission
```bash
# Create request
php artisan tinker --execute="
    \$shopOwner = \App\Models\ShopOwner::first();
    Auth::guard('shop_owner')->setUser(\$shopOwner);
    \$user = \App\Models\User::find(125);
    \$user->givePermissionTo('manage-inventory');
    echo 'Permission granted. User now has: ' . \$user->getAllPermissions()->pluck('name')->implode(', ');
"
```

### Test 4: Revoke Permission
```bash
php artisan tinker --execute="
    \$user = \App\Models\User::find(125);
    \$user->revokePermissionTo('manage-inventory');
    echo 'Permission revoked. User now has: ' . \$user->getAllPermissions()->pluck('name')->implode(', ');
"
```

### Test 5: Check Permission
```bash
php artisan tinker --execute="
    \$user = \App\Models\User::find(125);
    echo 'Has manage-inventory: ' . (\$user->can('manage-inventory') ? 'YES' : 'NO') . PHP_EOL;
    echo 'Has approve-expenses: ' . (\$user->can('approve-expenses') ? 'YES' : 'NO') . PHP_EOL;
    echo 'Direct permissions: ' . \$user->getDirectPermissions()->pluck('name')->implode(', ') . PHP_EOL;
"
```

---

## Security Considerations

### 1. Shop Owner Isolation
**Enforced:** Shop owner can only manage employees they own
```php
$user = User::where('id', $userId)
    ->where('shop_owner_id', $shopOwner->id)
    ->first();
```

**Result:** Shop Owner A cannot modify Shop Owner B's employees' permissions

### 2. Guard Separation
**All permissions created for 'user' guard only**
```php
Permission::where('guard_name', 'user')->get();
```

**Result:** Shop owners manage employee (user guard) permissions, not shop owner or super admin permissions

### 3. Audit Logging
**Every permission change is logged:**
```php
AuditLog::create([
    'shop_owner_id' => $shopOwner->id,
    'action' => 'permission_granted',
    'target_type' => 'user',
    'target_id' => $user->id,
    'metadata' => ['permission' => 'manage-inventory'],
]);
```

**Use Case:** Compliance audits, troubleshooting access issues

### 4. Role Permissions Preserved
**When syncing permissions:**
```php
$rolePermissions = $user->getPermissionsViaRoles()->pluck('name')->toArray();
$user->syncPermissions(array_merge($rolePermissions, $validated['permissions']));
```

**Result:** Can't accidentally remove role permissions, only manage direct permissions

---

## Integration with Existing User Access Control

### Current Features Preserved
- ✅ Employee creation with role assignment
- ✅ Employee list with filtering
- ✅ Employee status management (active/suspend)
- ✅ Temporary password generation
- ✅ Role-based dashboard access

### New Features Added
- ✅ Permission listing grouped by module
- ✅ Individual permission assignment
- ✅ Permission removal
- ✅ Bulk permission sync
- ✅ Permission audit logging
- ⏳ Frontend UI for permission management (Next step)

---

## Next Steps for Full Phase 6 Completion

### 1. Update UserAccessControl.tsx
**Add:**
- "Manage Permissions" button for each employee
- Permission management modal component
- API calls to get/update permissions
- Checkbox interface grouped by module
- Visual distinction between role vs. direct permissions

### 2. Create Reusable Components
```typescript
// PermissionCheckbox.tsx
interface PermissionCheckboxProps {
    permission: string;
    checked: boolean;
    disabled: boolean; // true for role permissions
    onChange: (permission: string, checked: boolean) => void;
}

// PermissionModal.tsx
interface PermissionModalProps {
    employee: Employee;
    onClose: () => void;
    onSave: (permissions: string[]) => void;
}
```

### 3. Position Templates (Optional)
**Create predefined templates:**
- Cashier: Finance Staff + inventory permissions
- Bookkeeper: Finance Staff + approval permissions
- Assistant Manager: Manager role
- Receptionist: Staff + customer permissions

### 4. Testing
- [ ] Shop owner can view all employees with permission counts
- [ ] Shop owner can open permission modal for any employee
- [ ] Role permissions show as disabled checkboxes
- [ ] Direct permissions show as enabled checkboxes
- [ ] Adding permission updates immediately
- [ ] Removing permission updates immediately
- [ ] Bulk save works correctly
- [ ] Audit logs record all changes
- [ ] Shop owner A cannot access Shop Owner B's employees

---

## Files Modified

### Backend
1. **routes/web.php**
   - Added 4 new permission management routes

2. **app/Http/Controllers/ShopOwner/UserAccessControlController.php**
   - Added imports for Spatie Permission models
   - Enhanced `index()` to include permission data
   - Added `getAvailablePermissions()` method
   - Added `getEmployeePermissions($userId)` method
   - Added `updateEmployeePermissions($userId)` method
   - Added `syncEmployeePermissions($userId)` method

3. **solespace/SPATIE_PERMISSION_IMPLEMENTATION.md**
   - Updated Phase 6 description (corrected "Super Admin" to "Shop Owner")

### Frontend (Pending)
4. **resources/js/Pages/ShopOwner/UserAccessControl.tsx**
   - TODO: Add permission management UI
   - TODO: Add permission modal component
   - TODO: Add API integration

---

## Verification Checklist

### Backend (Completed)
- [x] Routes added and registered
- [x] Controller methods implemented
- [x] Shop owner authentication enforced
- [x] Permission validation added
- [x] Audit logging implemented
- [x] Role permissions preserved
- [x] Guard separation enforced
- [x] Error handling added

### Frontend (Pending)
- [ ] UI mockup approved by user
- [ ] Permission modal component created
- [ ] Checkbox interface implemented
- [ ] Module grouping displayed
- [ ] Role vs. direct permissions visually distinct
- [ ] API integration working
- [ ] Loading states added
- [ ] Error messages displayed
- [ ] Success notifications shown

---

## Summary

**Phase 6 Backend:** ✅ 100% Complete  
**Phase 6 Frontend:** ⏳ Pending Implementation

Shop owners can now programmatically manage their employees' permissions through API endpoints. The next step is building the user interface so shop owners can visually assign permissions using checkboxes grouped by module.

**User's Vision:** Shop owner assigns permissions to positions like Cashier, Bookkeeper, Assistant Manager with granular control over what each employee can do in the ERP system.

**Example Use Cases:**
- Sarah (Cashier): Can create expenses, manage inventory, view sales reports
- John (Assistant Manager): Can approve expenses, manage employees, create invoices, view financial reports  
- Maria (Bookkeeper): Can create invoices, approve expenses, but NOT manage employees

This is now technically possible with Phase 6 backend. Frontend UI implementation will make it user-friendly.

---

**Phase 6 Status:** Backend Complete, Frontend UI Next  
**Ready for:** UI/UX Design and React Component Implementation  
**Documentation Complete:** February 4, 2026
