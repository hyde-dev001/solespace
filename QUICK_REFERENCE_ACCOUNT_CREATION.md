# Employee Account Creation - Quick Reference

## For Shop Owners

### How to Create an Employee Account

**Step 1: Open User Access Control**
- Login → Dashboard → User Access Control → Employees Tab

**Step 2: Click "Add Employee" Button**

**Step 3: Fill Required Fields**
```
✓ Full Name          (e.g., "John Doe")
✓ Email Address      (e.g., "john@example.com")
✓ Position           (e.g., "Manager")
✓ Department         (e.g., "Finance")
✓ ERP Module Role    (e.g., "FINANCE")
```

**Step 4: Click "Add Employee"**

**Step 5: Confirm Creation**
- Confirm the popup dialog

### Receive Temporary Credentials

**A modal will appear with:**
- 📧 **Login Email** - Employee's username for login
- 🔐 **Temporary Password** - One-time password (will NOT be shown again)

**⚠️ Important:**
- **Copy and save the password immediately**
- This is the only time you'll see it
- Share securely with the employee

---

## For Employees

### How to Login

**URL:** `http://localhost:8000/user/login`

**Enter:**
1. Email Address (from credentials modal)
2. Temporary Password (from credentials modal)
3. Click Login

### After First Login

✅ **You must change your password immediately**
1. Go to Profile Settings
2. Change Password
3. Use new password for future logins

### Access ERP Modules

Based on your **Role**, you can access:

| Role | Access | Features |
|------|--------|----------|
| **HR** | `/hr` | Employee management, payroll, attendance |
| **FINANCE** | `/finance` | Invoices, expenses, financial reports |
| **MANAGER** | Dashboard | Overview, order management |
| **STAFF** | Dashboard | Personal profile, basic access |

---

## Troubleshooting

### "Password doesn't work"
- ✓ Check if Caps Lock is ON
- ✓ Verify you copied the password correctly
- ✓ Email typo? Check the modal again

### "Can't find the login page"
- ✓ Go to: `http://localhost:8000/user/login`
- ✓ Different from Shop Owner login

### "Lost the temporary password"
- ⚠️ It's only shown once
- Contact your Shop Owner for a new account or password reset

### "Account shows as inactive"
- ✓ Shop Owner needs to edit employee and set Status to "Active"
- ⚠️ Inactive accounts cannot login

---

## System Features

✅ Temporary passwords generated automatically  
✅ Passwords are one-time only (not recoverable)  
✅ Shop isolation prevents cross-shop access  
✅ Role-based access to ERP modules  
✅ Audit logging tracks all account creation  
✅ Employee can only access their shop's data  

---

## API Integration (For Developers)

**Endpoint:** `POST /api/hr/employees`

**Response includes:**
```json
{
  "temporary_password": "Ax7Kp2Mq9W",
  "employee": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "FINANCE"
  }
}
```

**Important:** Password is returned only in creation response, not retrievable later.

