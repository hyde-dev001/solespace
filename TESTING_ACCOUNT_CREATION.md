# Employee Account Creation & Login - Testing Guide

## Overview

This guide walks through testing the complete employee creation flow:
1. Shop Owner creates employee
2. System generates temporary credentials
3. Employee receives credentials
4. Employee logs in to user-side
5. Employee accesses ERP modules based on role

---

## Prerequisites

✅ Laravel dev server running (`php artisan serve`)  
✅ Shop Owner account created and logged in  
✅ Database migrations complete  
✅ User Access Control page accessible  

---

## Test Flow

### Phase 1: Create Employee Account

**1. Login as Shop Owner**
- URL: `http://localhost:8000/shop-owner/login`
- Use your shop owner credentials

**2. Navigate to User Access Control**
- Click → Dashboard → User Access Control
- Click → "Employees" tab
- Click → "Add Employee" button

**3. Fill Employee Form**

Use this test data:
```
Full Name:          Test Employee HR
Email:              test.hr@example.com
Phone:              09123456789
Position:           HR Specialist
Department:         HR
ERP Module Role:    HR
Functional Role:    HR Handler
Salary:             30000
Hire Date:          2026-01-24
Status:             Active
```

**4. Submit Form**
- Click "Add Employee"
- Confirm the popup dialog

**5. View Credentials Modal**
- Modal should show:
  - ✅ Title: "✅ Employee Account Created Successfully"
  - ✅ Login Email: `test.hr@example.com`
  - ✅ Temporary Password: (random 10-character code)
  - ✅ Important instructions
  - ✅ Employee Role: HR

**6. Copy Credentials**
- Password is automatically copied to clipboard
- Or manually copy from the modal

---

### Phase 2: Employee Logs In (User-Side)

**1. Open Login Page**
- URL: `http://localhost:8000/user/login`
- This is the PUBLIC user login, not shop owner

**2. Enter Credentials**
- Email: `test.hr@example.com`
- Password: (paste from credentials modal)
- Click "Login"

**Expected Result:** ✅ Login successful, redirected to user dashboard

**If Login Fails:**
- Error: "Invalid email or password"
  - ✓ Check email spelling
  - ✓ Check password case sensitivity
  - ✓ Ensure Status is "Active" in employee list
  - ✓ Try again

---

### Phase 3: Employee Changes Password

**1. After Login**
- You should be at user dashboard
- Look for "Profile" or "Settings"

**2. Change Password**
- Go to Account Settings / Change Password
- Enter temporary password again
- Enter NEW password (must meet requirements):
  - At least 8 characters
  - Include uppercase letter (A-Z)
  - Include lowercase letter (a-z)
  - Include number (0-9)
- Confirm new password
- Click "Save"

**Expected Result:** ✅ Password changed successfully

**New Password Example:** `SecurePass123`

---

### Phase 4: Access ERP Modules

**1. With HR Role**
- Navigate to: `http://localhost:8000/hr`
- Expected: ✅ HR Dashboard loads (not 403 error)
- Can see: Employee management interface
- Try: `/finance` → Should get 403 (not authorized for Finance)

**2. Create Second Employee with FINANCE Role**

Repeat Phase 1 with:
```
Full Name:          Test Employee Finance
Email:              test.finance@example.com
Position:           Finance Officer
Department:         Finance
ERP Module Role:    FINANCE
```

**3. Login as Finance Employee**
- Use credentials from Phase 2
- Try: `/finance` → Should work
- Try: `/hr` → Should get 403 (not authorized for HR)

---

## Expected Behavior

### Creating Employee
```
✅ Form validation passes
✅ Employee record created in database
✅ User account created for employee
✅ Temporary password generated (10 chars)
✅ Modal displays with credentials
✅ Success message shown
✅ Employee list updates
✅ Audit log entry created
```

### Employee Login
```
✅ User navigates to /user/login
✅ Enters email and temporary password
✅ Password verified (hashed comparison)
✅ Session created
✅ Redirected to dashboard
✅ User profile loads
✅ Role stored in session
```

### ERP Module Access
```
✅ Employee with HR role accesses /hr → Page loads
✅ Employee with FINANCE role accesses /finance → Page loads
✅ Employee with HR role accesses /finance → 403 Forbidden
✅ Employee with FINANCE role accesses /hr → 403 Forbidden
✅ Unauthenticated user accesses /hr → Redirect to login
```

---

## Database Verification

### Check Employee Created

```sql
SELECT * FROM employees 
WHERE email = 'test.hr@example.com';
```

Expected fields:
- `id` - auto-increment
- `name` - 'Test Employee HR'
- `email` - 'test.hr@example.com'
- `position` - 'HR Specialist'
- `department` - 'HR'
- `role` - 'HR'
- `shop_owner_id` - matches your shop
- `status` - 'active'

### Check User Account Created

```sql
SELECT id, name, email, role, shop_owner_id, status 
FROM users 
WHERE email = 'test.hr@example.com';
```

Expected fields:
- `id` - user ID
- `name` - 'Test Employee HR'
- `email` - 'test.hr@example.com'
- `role` - 'HR' (must match employee role)
- `shop_owner_id` - matches shop owner
- `password` - (hashed, not plain text)
- `status` - 'active'

### Check Audit Log

```sql
SELECT * FROM audit_logs 
WHERE action = 'employee_created' 
AND target_type = 'employee'
ORDER BY created_at DESC LIMIT 1;
```

Expected fields:
- `actor_user_id` - shop owner's user ID
- `action` - 'employee_created'
- `target_type` - 'employee'
- `target_id` - employee ID
- `metadata` - JSON with assigned_role, employee_email, functional_role

---

## API Testing (Using Postman/PowerShell)

### Create Employee via API

**Request:**
```
POST /api/hr/employees
Authorization: Bearer {shop_owner_token}
Content-Type: application/json

{
  "name": "API Test Employee",
  "email": "api.test@example.com",
  "phone": "09987654321",
  "position": "Manager",
  "department": "HR",
  "functional_role": "HR Handler",
  "salary": 35000,
  "hire_date": "2026-01-24",
  "role": "HR",
  "status": "active"
}
```

**Response (201 Created):**
```json
{
  "message": "Employee and account created successfully",
  "data": {
    "employee": {
      "id": 1,
      "name": "API Test Employee",
      "email": "api.test@example.com",
      "position": "Manager",
      "department": "HR",
      "role": "HR",
      "status": "active",
      "shop_owner_id": 5,
      "created_at": "2026-01-24T10:30:00Z"
    },
    "user_id": 42,
    "temporary_password": "Ax7Kp2Mq9W"
  }
}
```

---

## Common Issues & Solutions

### Issue 1: "Email already registered"
```
Error: "This email is already registered"
```

**Cause:** Email exists in employees or users table  
**Solution:**
1. Use different email address
2. Delete employee record and try again
3. Check if user account already exists

### Issue 2: "Invalid email or password" on login
```
Error: "Invalid email or password"
```

**Cause:** Wrong email or password  
**Solution:**
1. Verify email matches exactly (case-sensitive)
2. Verify password matches exactly (case-sensitive)
3. Check if status is "active"
4. Ensure User account was created (check users table)

### Issue 3: "Access Denied" on ERP module
```
Error: 403 Forbidden - Your role does not have access to ERP modules
```

**Cause:** User's role doesn't match required role  
**Solution:**
1. Create employee with correct role
2. Check user.role in database matches employee.role
3. Restart browser to refresh token
4. Ensure middleware is registered

### Issue 4: "Cannot copy temporary password"
```
Modal shows but copy button doesn't work
```

**Cause:** Browser clipboard permission issue  
**Solution:**
1. Allow clipboard access when prompted
2. Manually copy password using Ctrl+C
3. Check browser console for errors
4. Try different browser

---

## Test Cases Summary

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| Create HR Employee | Fill form → Submit | ✅ Modal with credentials | |
| Create FINANCE Employee | Fill form → Submit | ✅ Modal with credentials | |
| HR Employee Login | Email + temp password | ✅ Logged in | |
| Finance Employee Login | Email + temp password | ✅ Logged in | |
| HR Access /hr | Navigate to /hr | ✅ Page loads | |
| HR Access /finance | Navigate to /finance | ✅ 403 Error | |
| Finance Access /finance | Navigate to /finance | ✅ Page loads | |
| Finance Access /hr | Navigate to /hr | ✅ 403 Error | |
| Cross-shop isolation | Check other shop data | ✅ 403 Error | |
| Password change | Set new password | ✅ Password changed | |
| Login with new password | Email + new password | ✅ Logged in | |

---

## Performance Notes

- Employee creation: ~500ms
- User account creation: ~300ms
- Login: ~400ms
- Total flow: ~2 seconds

---

## Security Checklist

✅ Temporary password is hashed before storage  
✅ Temporary password never logged in plain text  
✅ Temporary password returned only once in API response  
✅ Passwords are case-sensitive  
✅ Role-based access enforced at middleware level  
✅ Shop isolation prevents cross-shop access  
✅ Audit logs track all account creation  
✅ Inactive accounts cannot login  
✅ Session management prevents hijacking  

