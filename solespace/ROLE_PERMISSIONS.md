# Role-Based Access Control System

## Overview
The super admin system has two roles with different permission levels:

## Roles

### 1. **Super Admin** (`role = 'super_admin'`)
**Full system access** - Can perform all operations

#### Permissions:
✅ **Admin Management**
- Create new admin accounts
- Edit admin accounts
- Suspend/activate admin accounts
- Delete admin accounts
- View all admin accounts

✅ **Shop Owner Management**
- Approve/reject shop registrations
- View all registered shops
- Suspend/activate shop accounts
- Delete shop accounts
- Edit shop details

✅ **User Management**
- View all users
- Suspend/activate user accounts
- Delete user accounts
- Flag accounts for review

✅ **System Configuration**
- Access system monitoring
- View data reports and analytics
- Manage notifications
- Configure system settings

✅ **Full Dashboard Access**
- System Monitoring Dashboard
- Data Reports
- All management interfaces

---

### 2. **Admin** (`role = 'admin'`)
**Standard administrative access** - Limited to shop and user management

#### Permissions:
✅ **Shop Owner Management** (Same as Super Admin)
- Approve/reject shop registrations
- View all registered shops
- Suspend/activate shop accounts
- Edit shop details

✅ **User Management** (Same as Super Admin)
- View all users
- Suspend/activate user accounts
- Flag accounts for review

✅ **Limited Dashboard Access**
- Shop Registrations page
- Registered Shops page
- User Management page
- Flagged Accounts page

❌ **Restricted Access** (Super Admin Only):
- ❌ Cannot create admin accounts
- ❌ Cannot edit admin accounts
- ❌ Cannot delete admin accounts
- ❌ Cannot access Admin Management page
- ❌ Cannot delete shop accounts (can only suspend)
- ❌ Cannot delete user accounts (can only suspend)
- ❌ Limited system monitoring access

---

## Implementation Guide

### Step 1: Register the Middleware

Add to `bootstrap/app.php`:

```php
$middleware->alias([
    'super_admin.auth' => \App\Http\Middleware\SuperAdminAuth::class,
    'super_admin.role' => \App\Http\Middleware\CheckSuperAdminRole::class,
]);
```

### Step 2: Apply to Routes

Update `routes/web.php` for restricted pages:

```php
// Super Admin Only - Admin Management
Route::get('/admin/admin-management', [SuperAdminController::class, 'showAdminManagement'])
    ->middleware(['super_admin.auth', 'super_admin.role'])
    ->name('admin.admin-management');

Route::get('/admin/create-admin', function () {
    return Inertia::render('superAdmin/CreateAdmin');
})->middleware(['super_admin.auth', 'super_admin.role'])
    ->name('admin.create-admin');

Route::post('/admin/create-admin', [SuperAdminController::class, 'createAdmin'])
    ->middleware(['super_admin.auth', 'super_admin.role'])
    ->name('admin.create-admin.store');

// Super Admin Only - Delete Operations
Route::delete('/admin/shops/{id}', [SuperAdminController::class, 'deleteShop'])
    ->middleware(['super_admin.auth', 'super_admin.role'])
    ->name('admin.shops.delete');

Route::delete('/admin/users/{id}', [SuperAdminController::class, 'deleteUser'])
    ->middleware(['super_admin.auth', 'super_admin.role'])
    ->name('admin.users.delete');

Route::delete('/admin/admins/{id}', [SuperAdminController::class, 'deleteAdmin'])
    ->middleware(['super_admin.auth', 'super_admin.role'])
    ->name('admin.admins.delete');
```

### Step 3: Hide UI Elements Based on Role

Update frontend components to conditionally show/hide features:

```tsx
import { usePage } from '@inertiajs/react';

function AdminManagementButton() {
  const { auth } = usePage().props as any;
  const isSuperAdmin = auth?.user?.role === 'super_admin';

  if (!isSuperAdmin) return null;

  return (
    <Link href="/admin/admin-management">
      Admin Management
    </Link>
  );
}
```

### Step 4: Controller-Level Checks

Add role checks in controllers for extra security:

```php
public function createAdmin(Request $request)
{
    // Check if user has super_admin role
    if (auth()->guard('super_admin')->user()->role !== 'super_admin') {
        return redirect()->back()->with('error', 'Unauthorized action.');
    }

    // Continue with admin creation...
}
```

---

## Pages and Required Roles

### Super Admin Only Pages:
- `/admin/admin-management` - Manage admins
- `/admin/create-admin` - Create new admin accounts
- `/admin/system-monitoring` - Full system dashboard (if detailed metrics)

### Shared Access (Both Roles):
- `/admin/shop-registrations` - Approve/reject shops
- `/admin/registered-shops` - View and manage shops
- `/admin/user-management` - Manage users
- `/admin/flagged-accounts` - Review flagged accounts
- `/admin/data-reports` - View analytics (read-only for admin)
- `/admin/notifications` - Send notifications

---

## Database Schema

The `super_admins` table includes the `role` field:

```sql
CREATE TABLE super_admins (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'super_admin') DEFAULT 'admin',
    status ENUM('active', 'suspended', 'inactive') DEFAULT 'active',
    last_login_at TIMESTAMP NULL,
    last_login_ip VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Testing Role-Based Access

### Test Case 1: Admin tries to access Admin Management
1. Login as regular admin (role = 'admin')
2. Navigate to `/admin/admin-management`
3. Expected: Redirected to system monitoring with error message

### Test Case 2: Super Admin can access everything
1. Login as super admin (role = 'super_admin')
2. Navigate to `/admin/admin-management`
3. Expected: Page loads successfully

### Test Case 3: UI Elements Hidden
1. Login as regular admin
2. Check sidebar/navigation
3. Expected: "Admin Management" link is hidden

---

## Best Practices

1. **Always check role on both frontend AND backend**
   - Frontend: Hide UI elements
   - Backend: Enforce with middleware + controller checks

2. **Use middleware stacking**
   ```php
   ->middleware(['super_admin.auth', 'super_admin.role'])
   ```

3. **Provide clear error messages**
   - "You do not have permission to access this resource"
   - "Super Admin access required"

4. **Log role violations**
   ```php
   \Log::warning('Unauthorized access attempt', [
       'admin_id' => $admin->id,
       'role' => $admin->role,
       'attempted_action' => 'create_admin',
   ]);
   ```

5. **Regular audits**
   - Review who has super_admin role
   - Check access logs for violations
   - Ensure principle of least privilege

---

## Migration: Existing Admins

If you have existing admin accounts without roles:

```sql
-- Set default role for existing admins
UPDATE super_admins SET role = 'admin' WHERE role IS NULL;

-- Promote specific admins to super_admin
UPDATE super_admins SET role = 'super_admin' WHERE email = 'youremail@example.com';
```

---

## Future Enhancements

Consider implementing:
1. **Granular Permissions** - Instead of just 2 roles, define specific permissions
2. **Permission Groups** - Create permission sets for different admin types
3. **Audit Trail** - Log all admin actions with timestamps
4. **Session Monitoring** - Track active admin sessions
5. **Two-Factor Authentication** - Extra security for super admins
