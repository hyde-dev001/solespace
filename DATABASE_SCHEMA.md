# Database Schema - ERP Shop Isolation System

## Table: users
Enhanced User table with shop isolation

```sql
CREATE TABLE users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  age INT,
  address VARCHAR(255),
  valid_id_path VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  status VARCHAR(255),
  last_login_at TIMESTAMP NULL,
  last_login_ip VARCHAR(45),
  
  -- NEW: Shop Isolation Fields
  shop_owner_id BIGINT UNSIGNED,
  role ENUM('HR', 'FINANCE', 'MANAGER', 'STAFF', 'SUPER_ADMIN'),
  
  remember_token VARCHAR(100),
  email_verified_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  
  KEY idx_shop_owner_id (shop_owner_id),
  KEY idx_role (role),
  CONSTRAINT fk_users_shop_owner FOREIGN KEY (shop_owner_id) 
    REFERENCES shop_owners(id) ON DELETE CASCADE
);
```

### User Roles:
- **HR**: Access to HR module (employees, payroll, attendance)
- **FINANCE**: Access to Finance module (invoices, expenses, accounts)
- **MANAGER**: Access to manager dashboard and limited operations
- **STAFF**: Basic access to personal profile and attendance
- **SUPER_ADMIN**: Full system access, no shop isolation

---

## Table: roles
Role definitions with permissions per shop

```sql
CREATE TABLE roles (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  shop_owner_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  permissions JSON,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  
  KEY idx_shop_owner_id (shop_owner_id),
  UNIQUE KEY unique_shop_role (shop_owner_id, name),
  CONSTRAINT fk_roles_shop_owner FOREIGN KEY (shop_owner_id) 
    REFERENCES shop_owners(id) ON DELETE CASCADE
);
```

### Default Roles per Shop:
1. **HR** - Human Resources
2. **FINANCE** - Finance & Accounting
3. **MANAGER** - General Manager
4. **STAFF** - Regular Staff

### Permissions Structure (JSON):
```json
{
  "HR": [
    "view_hr_dashboard",
    "manage_employees",
    "view_employees",
    "manage_payroll",
    "view_payroll",
    "manage_attendance",
    "view_attendance",
    "manage_leave_requests"
  ],
  "FINANCE": [
    "view_finance_dashboard",
    "manage_invoices",
    "view_invoices",
    "manage_expenses",
    "view_expenses",
    "manage_accounts",
    "view_accounts",
    "generate_financial_reports"
  ],
  "MANAGER": [
    "view_dashboard",
    "view_employees",
    "view_payroll",
    "view_expenses",
    "view_orders",
    "manage_orders"
  ],
  "STAFF": [
    "view_dashboard",
    "view_profile",
    "view_attendance"
  ]
}
```

---

## Table: employees
Employee records linked to shops

```sql
CREATE TABLE employees (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  shop_owner_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  position VARCHAR(255),
  department VARCHAR(255),
  salary DECIMAL(12, 2),
  hire_date DATE,
  status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  
  KEY idx_shop_owner_id (shop_owner_id),
  KEY idx_email (email),
  KEY idx_status (status),
  CONSTRAINT fk_employees_shop_owner FOREIGN KEY (shop_owner_id) 
    REFERENCES shop_owners(id) ON DELETE CASCADE
);
```

### Fields:
- **shop_owner_id**: Foreign key to shop_owners (enforces shop isolation)
- **name**: Employee full name
- **email**: Unique email address
- **phone**: Contact phone number
- **position**: Job position/title
- **department**: Department name (HR, Sales, etc.)
- **salary**: Monthly or annual salary
- **hire_date**: Date employee was hired
- **status**: active, inactive, or on_leave

---

## Table: shop_owners
Parent table for all shops

```sql
CREATE TABLE shop_owners (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  business_address VARCHAR(500),
  business_type VARCHAR(255),
  registration_type VARCHAR(255),
  operating_hours JSON,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  rejection_reason TEXT,
  suspension_reason TEXT,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);
```

### Key Points:
- Each shop has its own unique ID
- All users, employees, and data must reference this shop_id
- Status controls access level

---

## Relationships Diagram

```
shop_owners (1)
    ↓
    ├─→ users (many) [shop_owner_id]
    │   └─→ Login with specific role (HR, FINANCE, MANAGER, STAFF)
    │       └─→ Can only access shop_owner_id's data
    │
    ├─→ employees (many) [shop_owner_id]
    │   └─→ HR module manages these
    │
    ├─→ roles (many) [shop_owner_id]
    │   └─→ Define permissions for users
    │
    └─→ other modules (future)
        └─→ invoices, expenses, calendar_events, etc.
```

---

## Query Examples

### Get All Employees for a Shop
```sql
SELECT * FROM employees 
WHERE shop_owner_id = 1;
```

### Get Users with HR Role for a Shop
```sql
SELECT * FROM users 
WHERE shop_owner_id = 1 
AND role = 'HR';
```

### Get Role Permissions for HR in Shop 1
```sql
SELECT permissions FROM roles 
WHERE shop_owner_id = 1 
AND name = 'HR';
```

### Prevent Cross-Shop Access (Enforced by App)
```php
// This will ALWAYS be filtered by shop_owner_id in the application
$employees = Employee::where('shop_owner_id', $user->shop_owner_id)->get();

// Even if someone tries to access another shop, middleware blocks it:
// GET /api/employees?shop_id=2  ❌ BLOCKED if user->shop_owner_id != 2
```

---

## Indexing Strategy

### Indexes Added:
1. **shop_owner_id** - Every table has this for filtering
2. **role** - Users table (for role-based queries)
3. **status** - Employees table (for status filtering)
4. **email** - Employees table (for unique constraint)
5. **Unique (shop_owner_id, name)** - Roles table (one role per shop)

### Query Performance:
- Shop filtering: O(log n) with index
- Role filtering: O(log n) with index
- Status filtering: O(log n) with index
- Foreign key lookups: O(1) with index

---

## Data Integrity Constraints

### Foreign Keys:
- **users.shop_owner_id** → shop_owners.id (CASCADE DELETE)
- **employees.shop_owner_id** → shop_owners.id (CASCADE DELETE)
- **roles.shop_owner_id** → shop_owners.id (CASCADE DELETE)

### Unique Constraints:
- **users.email** - Cannot have duplicate emails
- **employees.email** - Cannot have duplicate employee emails
- **shop_owners.email** - Cannot have duplicate shop emails
- **roles (shop_owner_id, name)** - One HR role per shop, one FINANCE role per shop, etc.

### When Shop is Deleted:
```
shop_owners (deleted)
    ↓
shop_owners cascade delete → users (cascade delete)
                          ↓ (user sessions invalidated)
shop_owners cascade delete → employees (cascade delete)
shop_owners cascade delete → roles (cascade delete)
```

---

## Migration Timeline

1. **create_users_table** - Base users table
2. **create_shop_owners_table** - Shop owner management
3. **add_role_to_users_table** - Added shop_owner_id and role to users
4. **create_roles_table** - Role definitions
5. **create_employees_table** - Employee records
6. **add_description_to_roles_table** - Role descriptions for UI

---

## Statistics

### Typical Shop Setup:
- 1 Shop Owner
- 4 Default Roles (HR, FINANCE, MANAGER, STAFF)
- 50-200 Employees per shop
- 5-20 Users per shop

### Database Growth:
- Small Shop: ~1KB per employee
- Medium Shop (100 employees): ~100KB
- Large Shop (1000 employees): ~1MB
- System with 1000 shops: ~500MB

---

## Best Practices

✅ **Always** filter by shop_owner_id in queries  
✅ **Always** use middleware for route protection  
✅ **Always** verify shop_owner_id in controllers  
✅ **Never** allow direct user input for shop_owner_id  
✅ **Never** bypass role middleware  
✅ **Always** use transactions for multi-step operations  
✅ **Always** log security-related actions

---

## Troubleshooting Queries

### Find Users Not Assigned to Shop
```sql
SELECT id, email, role FROM users 
WHERE shop_owner_id IS NULL;
```

### Find Duplicate Emails
```sql
SELECT email, COUNT(*) FROM employees 
GROUP BY email 
HAVING COUNT(*) > 1;
```

### Find Roles Missing Permissions
```sql
SELECT * FROM roles 
WHERE permissions IS NULL 
OR JSON_LENGTH(permissions) = 0;
```

### Check Foreign Key Integrity
```sql
SELECT * FROM employees 
WHERE shop_owner_id NOT IN (SELECT id FROM shop_owners);
```

---

**Last Updated**: January 24, 2026  
**Schema Version**: 1.0  
**Status**: Production Ready
