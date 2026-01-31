# Account Creation & Employee Onboarding Guide

## Overview

When a **Shop Owner** creates an **Employee** through the User Access Control panel, the system automatically generates:
1. An **Employee Record** in the HR module
2. A **User Account** that can login to the platform's user-side
3. A **Temporary Password** that the Shop Owner receives one-time

---

## Step 1: Create Employee Account (Shop Owner)

### Where to Find It
1. Login as **Shop Owner**
2. Navigate to **User Access Control** page
3. Click on the **"Employees"** tab
4. Click the **"Add Employee"** button

### Fill in the Form

**Required Fields:**
- **Full Name** - Employee's full name
- **Email Address** - Unique email for login (will be the login username)
- **Position/Job Title** - Dropdown (Manager, Accountant, HR Specialist, Finance Officer, etc.)
- **Department** - Dropdown (HR, Finance, Sales, Operations, etc.)
- **ERP Module Role** - Dropdown (HR, FINANCE, MANAGER, STAFF)

**Optional Fields:**
- **Phone Number** - Employee contact
- **Functional Role** - Clarifies specific job duty (HR Handler, Finance Handler, etc.)
- **Salary** - Base salary amount
- **Hire Date** - Date of employment
- **Status** - Active/Inactive/On Leave

### Submit the Form

Click **"Add Employee"** button to submit.

---

## Step 2: Receive Temporary Credentials

### Success Modal

After successful creation, you'll see a **popup modal** with:

```
✅ EMPLOYEE CREATED

Login Email: [employee@example.com]
Temporary Password: [ABC123XyZ9]

⚠️ Share these credentials securely. 
   The employee should change their password on first login.
```

### What to Do

1. **Copy the temporary password** from the modal
2. **Share it securely** with the employee (email, message, or in-person)
3. **Inform the employee** they must:
   - Use the email address as their login username
   - Use the temporary password to login
   - Change their password immediately after first login

---

## Step 3: Employee Login (User-Side)

### Where to Login

**URL:** `http://localhost:8000/user/login` (or your deployment URL)

### Login Steps

1. Navigate to the **User Login** page
2. Enter **Email Address** (the email you provided when creating the employee)
3. Enter **Temporary Password** (from the credentials modal above)
4. Click **"Login"** button

### After First Login

✅ Employee is now logged into the **User Dashboard**
- Can view personal profile
- Can access assigned ERP module pages (HR, Finance, etc.) based on their role
- Should **change password immediately** in their profile settings

---

## Step 4: Access ERP Modules

### Based on Assigned Role

**HR Role:**
- Access: `/hr` → HR Dashboard & Employee Management
- Can: View employees, manage attendance, payroll

**FINANCE Role:**
- Access: `/finance` → Finance Dashboard
- Can: Create invoices, manage expenses, view reports

**MANAGER Role:**
- Access: General Manager Dashboard
- Can: View overview, manage orders

**STAFF Role:**
- Access: Dashboard & Personal Profile
- Can: View own information, update profile

---

## System Architecture

### Account Creation Flow

```
Shop Owner
    ↓
[User Access Control Form]
    ↓
POST /api/hr/employees
    ↓
EmployeeController (Backend)
    ├─ Create Employee Record
    ├─ Create User Account with temp password
    └─ Log to Audit Trail
    ↓
Response with Temporary Password
    ↓
[Temporary Credentials Modal]
    ↓
Shop Owner shares credentials
    ↓
Employee uses credentials to login
```

### Database Structure

**employees Table:**
- id, name, email, phone, position, department
- functional_role, salary, hire_date, status
- shop_owner_id, created_at, updated_at

**users Table:**
- id, name, email, password (hashed)
- role (HR, FINANCE, MANAGER, STAFF)
- shop_owner_id, status, last_login_at, last_login_ip
- created_at, updated_at

**audit_logs Table:**
- id, actor_user_id, action, target_type, target_id
- metadata (JSON: assigned_role, employee_email, functional_role, branch)
- shop_owner_id, created_at

---

## Technical Details

### Temporary Password Generation

**Length:** 10 characters  
**Characters:** Mix of uppercase, lowercase, numbers  
**Format:** Random alphanumeric (e.g., `Ax7Kp2Mq9W`)  
**Returned:** One-time in API response after creation  
**Stored:** Never re-displayed; hashed in database

### Security Features

✅ Passwords are **hashed** before storage (bcrypt)  
✅ Temporary passwords are **not recoverable**  
✅ Employees **must change** password after first login  
✅ Shop isolation ensures **no cross-shop access**  
✅ Role-based access **prevents unauthorized module access**  

---

## Troubleshooting

### "Employee Created But Can't Login"

**Possible Causes:**
1. Email typo - verify email in modal matches what was entered
2. Password case-sensitive - ensure caps lock is OFF or ON correctly
3. Account inactive - check employee status in Employee list

**Solution:**
1. Go to **Employees** tab
2. Find the employee in the list
3. Check their **Status** (should be "active")
4. If inactive, edit and change to "active"

### "I Didn't Copy the Temporary Password"

**Important:** The password is **only shown once** after creation in the modal.

**Solutions:**
1. Ask the employee to use **"Forgot Password"** on login page to reset
2. Or, as Shop Owner, **edit the employee** and regenerate credentials (feature coming soon)

### "Employee Received Wrong Password"

The system automatically generates a secure random password. If employee says it's wrong:
1. Ask them to try again carefully (case-sensitive)
2. Check if they have the correct email address
3. Use password reset function if all else fails

---

## Best Practices

### For Shop Owners

✅ **Create accounts with accurate information**
- Email should be the employee's personal/work email
- Position & Department must match actual role
- ERP Role must be assigned based on job responsibilities

✅ **Secure credential sharing**
- Share password via secure channel (not public)
- Don't store in unsecured notes
- Use encrypted messaging or in-person delivery

✅ **Verify employee activation**
- Check Employees list to confirm account is "active"
- Request employee to confirm successful login
- Monitor audit logs for security

### For Employees

✅ **After First Login**
1. Change temporary password immediately
2. Update profile information
3. Set up account recovery options (if available)
4. Never share password with anyone

✅ **Access ERP Modules**
1. Only use features in your assigned role
2. Don't attempt to access unauthorized modules
3. Report any access issues to Shop Owner

---

## API Reference

### Endpoint: Create Employee

**URL:** `POST /api/hr/employees`

**Authentication:** Bearer token (employee's auth token)  
**Middleware:** `auth:super_admin`, `shop.isolation`, `role:HR`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "09123456789",
  "position": "Manager",
  "department": "Finance",
  "functional_role": "Finance Handler",
  "salary": 50000,
  "hire_date": "2026-01-24",
  "role": "FINANCE",
  "status": "active"
}
```

**Success Response (201):**
```json
{
  "message": "Employee and account created successfully",
  "data": {
    "employee": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "position": "Manager",
      "department": "Finance",
      "role": "FINANCE",
      "status": "active",
      "shop_owner_id": 5,
      "created_at": "2026-01-24T10:30:00Z"
    },
    "user_id": 42,
    "temporary_password": "Ax7Kp2Mq9W"
  }
}
```

**Error Response (422):**
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["This email is already registered"]
  }
}
```

---

## Video Tutorial (Coming Soon)

We'll add a video walkthrough showing:
1. How to create an employee account
2. How to copy and share temporary password
3. How to login as employee
4. How to change password on first login
5. How to access ERP modules

---

## Support

**Questions?** Contact your system administrator or check the main documentation index.

**Report Issues?** Include:
- Your shop owner ID
- Employee email address
- Exact error message
- Steps you followed
