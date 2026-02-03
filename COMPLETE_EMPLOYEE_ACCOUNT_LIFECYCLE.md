# Complete Employee Account Lifecycle

## System Overview

The SoleSpace ERP system provides a complete employee account management system where:

1. **Shop Owner** creates employee accounts through User Access Control
2. **System** automatically generates user credentials
3. **Temporary password** is shown one-time to shop owner
4. **Employee** uses credentials to login to user-side
5. **Access** to ERP modules determined by assigned role

---

## Component Architecture

### Frontend (React/TypeScript)

**File:** `resources/js/Pages/ShopOwner/UserAccessControl.tsx`

**Features:**
- Employee form with 10 fields
- Real-time validation
- Predefined role selection (HR, FINANCE, MANAGER, STAFF)
- Functional role dropdown (HR Handler, Finance Handler, etc.)
- Position and Department dropdowns
- Automatic temporary password display in modal
- SweetAlert with enhanced credentials presentation

**Key Functions:**
```typescript
handleAddEmployee()          // Creates employee and user account
handleEditEmployee()         // Updates employee data
handleDeleteEmployee()       // Removes employee
// ... other CRUD operations
```

### Backend API

**Controller:** `app/Http/Controllers/EmployeeController.php`

**Endpoint:** `POST /api/hr/employees`

**Middleware:**
- `auth:super_admin` - Shop owner authentication
- `shop.isolation` - Ensures data belongs to user's shop
- `role:HR` - Only HR-role users can create employees

**Process:**
1. Validate request data
2. Create Employee record
3. Create User account with temp password
4. Hash password before storage
5. Create AuditLog entry
6. Return temporary password in response

### Database Schema

**employees Table:**
```sql
id, name, email, phone, position, department,
branch, functional_role, salary, hire_date,
status, shop_owner_id, created_at, updated_at
```

**users Table:**
```sql
id, name, email, password (hashed), role,
shop_owner_id, status, last_login_at,
last_login_ip, created_at, updated_at
```

**audit_logs Table:**
```sql
id, actor_user_id, action, target_type,
target_id, metadata (JSON), shop_owner_id,
created_at, updated_at
```

---

## Complete User Flow

### Step 1: Shop Owner Creates Employee

```
Shop Owner Dashboard
    ↓
User Access Control → Employees Tab
    ↓
Click "Add Employee"
    ↓
Fill Form (Name, Email, Role, Position, Department, etc.)
    ↓
Click "Add Employee" Button
    ↓
Confirm in Popup Dialog
    ↓
API Call: POST /api/hr/employees
```

### Step 2: Backend Processing

```
EmployeeController::store()
    ↓
Validate Input Data
    ├─ Name, Email (unique), Role, etc.
    ↓
Create Employee Record
    ├─ name, email, position, department
    ├─ role, shop_owner_id, status
    ↓
Generate Temporary Password
    ├─ 10 random alphanumeric characters
    ├─ Example: Ax7Kp2Mq9W
    ↓
Create User Account
    ├─ Hash temporary password (bcrypt)
    ├─ Set role = employee.role
    ├─ Set shop_owner_id
    ├─ Set status = 'active'
    ↓
Create AuditLog Entry
    ├─ actor_user_id (shop owner)
    ├─ action = 'employee_created'
    ├─ metadata = {role, email, functional_role}
    ↓
Return Response with Temporary Password
```

### Step 3: Shop Owner Receives Credentials

```
SweetAlert Modal Displays
    ├─ Title: ✅ Employee Account Created Successfully
    ├─ Green box with:
    │  ├─ 📧 LOGIN EMAIL: test.hr@example.com
    │  ├─ 🔐 TEMPORARY PASSWORD: Ax7Kp2Mq9W
    │
    ├─ Yellow warning box with:
    │  ├─ ⚠️ Password will NOT be shown again
    │  ├─ ✓ Share securely with employee
    │  ├─ ✓ Employee must change on first login
    │  ├─ ✓ Login URL: http://localhost:8000/user/login
    │
    └─ Button: "✓ I have saved the credentials"

Shop Owner MUST:
    ✓ Copy the password immediately
    ✓ Share via secure channel (email, message)
    ✓ Inform employee about first login password change requirement
```

### Step 4: Employee Logs In

```
Employee URL: http://localhost:8000/user/login
    ↓
Enter Email: test.hr@example.com
Enter Password: Ax7Kp2Mq9W
Click Login
    ↓
UserController::login()
    ├─ Find User by email
    ├─ Verify password matches hash
    ├─ Check status = 'active'
    ├─ Update last_login_at, last_login_ip
    ├─ Create session
    ↓
✅ Login Successful
    ↓
Redirect to Dashboard
    ├─ Employee sees user interface
    ├─ Can view profile
    ├─ Can access role-based ERP modules
```

### Step 5: Employee Changes Password

```
Employee Profile → Change Password
    ↓
Enter Current Password: Ax7Kp2Mq9W
Enter New Password: SecurePass123 (must meet requirements)
Confirm New Password: SecurePass123
    ↓
Validate Password Requirements:
    ├─ Min 8 characters
    ├─ Contains uppercase letter (A-Z)
    ├─ Contains lowercase letter (a-z)
    ├─ Contains number (0-9)
    ↓
Hash new password
Update users table
    ↓
✅ Password Changed
    ↓
Employee logs out and logs back in with new password
```

### Step 6: Employee Accesses ERP Modules

```
Based on assigned role:

If Role = 'HR'
    ├─ Can access: /hr
    ├─ Can view: Employee management
    ├─ Cannot access: /finance (403 Forbidden)

If Role = 'FINANCE'
    ├─ Can access: /finance
    ├─ Can view: Invoices, expenses
    ├─ Cannot access: /hr (403 Forbidden)

If Role = 'MANAGER'
    ├─ Can access: /dashboard
    ├─ Can view: Overview
    ├─ Limited access to modules

If Role = 'STAFF'
    ├─ Can access: /dashboard
    ├─ View: Personal profile only
```

---

## Security Features

### Password Security
✅ Temporary passwords are 10 random characters  
✅ Passwords hashed with bcrypt before storage  
✅ Passwords never logged in plain text  
✅ Temporary password returned only once in API  
✅ No password recovery endpoint (use reset)  

### Access Control
✅ Role-based access via middleware  
✅ Shop isolation prevents cross-shop data access  
✅ Unauthenticated users redirected to login  
✅ Inactive accounts cannot login  
✅ Only HR role can create employees  

### Audit Trail
✅ All employee creation logged  
✅ Includes actor (shop owner)  
✅ Includes metadata (role, email, functional role)  
✅ Timestamped entries  
✅ Shop-specific records  

---

## How to Know the Temporary Password

### Method 1: Modal Display (Primary)
**During Employee Creation:**
1. Create employee in User Access Control
2. Immediately after creation, a modal appears
3. Shows login email and temporary password
4. Password is automatically copied to clipboard
5. **This is the only time password is shown**

### Method 2: API Response (For Developers)
**When using API directly:**
```bash
curl -X POST http://localhost:8000/api/hr/employees \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{...employee data...}'
```

**Response includes:**
```json
{
  "data": {
    "temporary_password": "Ax7Kp2Mq9W"
  }
}
```

### Method 3: Database Query (Emergency Only)
**If password is lost:**
```sql
-- Cannot retrieve plain text password (it's hashed)
-- Instead, reset password or create new account
```

### Important Notes:
⚠️ **One-time display** - Temporary password shown only once  
⚠️ **Not recoverable** - Cannot retrieve after modal closes  
⚠️ **Not stored** - Only hashed version stored in DB  
⚠️ **Must be shared** - Shop owner responsible for delivery  

---

## User-Side Login Integration

### Login Page
**URL:** `http://localhost:8000/user/login`

**Components:**
- Email input field
- Password input field
- Remember me checkbox
- Login button
- Forgot password link
- Sign up link

### Authentication
**Guard:** `web` (session-based)  
**Model:** `App\Models\User`  
**Middleware:** Verified in routes/web.php  

### Session Management
- Session created after successful login
- Session includes user ID, email, role, shop_owner_id
- Session validated on every request
- Session destroyed on logout

### User Profile
- Accessible via `/profile` or user menu
- Shows name, email, phone, age, address
- Includes change password section
- Shows employment status and role

---

## Data Relationships

```
ShopOwner (1)
    ↓
    ├─→ Employees (*)
    │       ├─ name, email, role
    │       ├─ position, department
    │       └─ shop_owner_id (FK)
    │
    ├─→ Users (*)
    │       ├─ email (unique)
    │       ├─ role (HR, FINANCE, MANAGER, STAFF)
    │       ├─ password (hashed)
    │       └─ shop_owner_id (FK)
    │
    └─→ AuditLogs (*)
            ├─ action (employee_created, etc.)
            ├─ actor_user_id (FK to Users)
            ├─ target_id (FK to Employees)
            └─ shop_owner_id (FK)
```

---

## Configuration

### Environment Variables
```env
APP_NAME=SoleSpace
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=solespace
```

### Middleware Stack
```php
// bootstrap/app.php
'shop.isolation' => ShopIsolationMiddleware::class
'role' => RoleMiddleware::class
'gate.erp.access' => GateErpAccess::class
```

### Routes
```php
// API Routes (app/routes/api.php)
POST /api/hr/employees    // Create employee

// Web Routes (app/routes/web.php)
POST /user/login          // User login
GET  /user/logout         // User logout
GET  /profile             // User profile
POST /user/password       // Change password
```

---

## Documentation Files

📄 **[ACCOUNT_CREATION_GUIDE.md](ACCOUNT_CREATION_GUIDE.md)**
- Detailed step-by-step guide
- Both shop owner and employee perspectives
- Troubleshooting section
- API reference

📄 **[QUICK_REFERENCE_ACCOUNT_CREATION.md](QUICK_REFERENCE_ACCOUNT_CREATION.md)**
- Quick lookup table
- Essential steps only
- Troubleshooting quick tips

📄 **[TESTING_ACCOUNT_CREATION.md](TESTING_ACCOUNT_CREATION.md)**
- Complete testing guide
- Test flow with data
- Expected behavior
- Database queries
- API testing with examples
- Common issues and solutions

📄 **[COMPLETE_EMPLOYEE_ACCOUNT_LIFECYCLE.md](COMPLETE_EMPLOYEE_ACCOUNT_LIFECYCLE.md)** (This file)
- Architecture overview
- System flow
- Technical details
- Security features

---

## Next Steps

✅ **Implemented:**
- Employee account creation via UI
- Automatic temporary password generation
- Credentials display in modal
- User login integration
- Role-based access control
- Shop isolation
- Audit logging

🔄 **Future Enhancements:**
- Email delivery of temporary password
- Password reset endpoint
- Bulk employee import
- SSO integration
- Password strength meter
- Account recovery options
- 2FA/MFA support

---

## Support & Questions

**For Shop Owners:**
- See [ACCOUNT_CREATION_GUIDE.md](ACCOUNT_CREATION_GUIDE.md)
- See [QUICK_REFERENCE_ACCOUNT_CREATION.md](QUICK_REFERENCE_ACCOUNT_CREATION.md)

**For Developers:**
- See [TESTING_ACCOUNT_CREATION.md](TESTING_ACCOUNT_CREATION.md)
- Check EmployeeController.php source
- Review UserController.php login method

**Troubleshooting:**
- Check browser console for errors
- Review Laravel logs in storage/logs/
- Verify database migrations ran
- Ensure middleware is registered
