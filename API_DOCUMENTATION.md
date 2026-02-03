# API & Routes Documentation

## Overview

This document provides complete API and route documentation for the Solespace application.

## Base URLs

- **Local Development:** `http://localhost:8000`
- **Frontend:** `http://localhost:5173`

## Authentication

The application uses Laravel session-based authentication with three separate guards:

### Authentication Guards

```
1. user       - Regular users (auth:user)
2. shop_owner - Shop owners (auth:shop_owner)
3. super_admin - Administrative users (auth:super_admin)
```

### Login Methods

#### User Login
```
POST /login
Content-Type: application/x-www-form-urlencoded

email=user@solespace.com
password=password123
```

#### Shop Owner Login
```
POST /shopowner/login
Content-Type: application/x-www-form-urlencoded

email=shopowner@test.com
password=password123
```

#### Super Admin Login
```
POST /admin/login
Content-Type: application/x-www-form-urlencoded

email=admin@solespace.com
password=password123
```

### Session-Based Auth

All authentication uses Laravel's session system:
- Session token stored in `XSRF-TOKEN` cookie
- User data stored in session
- Middleware checks: `auth:user`, `auth:shop_owner`, `auth:super_admin`

## Routes Structure

### Backend Routes (Laravel)

**File:** `routes/web.php`

#### Public Routes
```
GET  /                         - Landing page
GET  /login                    - User login page
GET  /register                 - User registration
POST /register                 - Create user account
```

#### User Routes (Protected by `auth:user`)
```
GET  /dashboard                - User dashboard
GET  /profile                  - User profile page
POST /logout                   - User logout
```

#### Shop Owner Routes (Protected by `auth:shop_owner`)
```
GET  /shopowner                - Shop owner login page
POST /shopowner/login          - Process shop owner login
POST /shopowner/logout         - Shop owner logout
GET  /shopowner/dashboard      - Shop owner dashboard
GET  /shopowner/profile        - Shop owner profile
POST /shopowner/update-profile - Update shop owner info
```

#### Super Admin Routes (Protected by `auth:super_admin`)
```
GET  /admin                    - Admin login page
POST /admin/login              - Process admin login
POST /admin/logout             - Admin logout
GET  /admin/dashboard          - Admin dashboard
GET  /admin/users              - List all users
GET  /admin/shop-owners        - List all shop owners
GET  /admin/settings           - Application settings
```

## Inertia Routes

The application uses Inertia.js for server-side rendered React pages.

### Page Components

#### User Pages
- **Pages/Auth/Login.tsx** - User login form
- **Pages/Auth/Register.tsx** - User registration form
- **Pages/Dashboard.tsx** - User dashboard
- **Pages/Profile.tsx** - User profile page

#### Shop Owner Pages
- **Pages/ShopOwner/Login.tsx** - Shop owner login
- **Pages/ShopOwner/Dashboard.tsx** - Shop owner dashboard
- **Pages/ShopOwner/Profile.tsx** - Shop owner profile

#### Admin Pages
- **Pages/Admin/Login.tsx** - Admin login
- **Pages/Admin/Dashboard.tsx** - Admin dashboard
- **Pages/Admin/UserManagement.tsx** - User management
- **Pages/Admin/ShopOwnerManagement.tsx** - Shop owner management

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@solespace.com",
      "role": "user"
    }
  },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "email": ["Email is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

## Database Models & Relationships

### User Model
```
Table: users
Columns:
- id (primary)
- name (string)
- email (unique)
- email_verified_at (nullable)
- password (hashed)
- remember_token
- role (enum: 'user', 'admin') - optional
- created_at
- updated_at

Relationships:
- hasMany('ShopDocument')
```

### ShopOwner Model
```
Table: shop_owners
Columns:
- id (primary)
- first_name (string)
- last_name (string)
- email (unique)
- password (hashed)
- business_name (string)
- business_type (enum)
- phone_number (string)
- address (text)
- city (string)
- province (string)
- postal_code (string)
- country (string)
- service_type (string - nullable)
- status (enum: 'pending', 'approved', 'rejected')
- rejection_reason (nullable)
- created_at
- updated_at

Relationships:
- hasMany('ShopDocument')
```

### ShopDocument Model
```
Table: shop_documents
Columns:
- id (primary)
- shop_owner_id (foreign)
- user_id (foreign - nullable)
- document_type (enum: 'business_license', 'tax_id', 'proof_address', etc.)
- file_path (string)
- file_name (string)
- file_size (integer)
- mime_type (string)
- uploaded_at (timestamp)
- created_at
- updated_at

Relationships:
- belongsTo('ShopOwner')
- belongsTo('User')
```

### SuperAdmin Model
```
Table: super_admins
Columns:
- id (primary)
- name (string)
- email (unique)
- password (hashed)
- role (default: 'super_admin')
- created_at
- updated_at
```

## Authentication Flow Diagrams

### User Registration & Login

```
1. User visits /register
2. Fills registration form
3. POST /register
4. Laravel creates User record
5. User redirected to /login
6. User enters credentials
7. POST /login (auth:user)
8. Session created
9. Redirected to /dashboard
```

### Shop Owner Registration & Approval

```
1. Shop owner visits /shopowner
2. Fills registration form with documents
3. ShopOwner record created with status='pending'
4. ShopDocuments uploaded
5. Super admin reviews in /admin/shop-owners
6. Admin approves (status='approved')
7. Shop owner can login with POST /shopowner/login
8. Redirected to /shopowner/dashboard
```

### Super Admin Login

```
1. Super admin visits /admin
2. Enters credentials
3. POST /admin/login (auth:super_admin)
4. Session created
5. Redirected to /admin/dashboard
6. Access to all management features
```

## Middleware

### Available Middleware

```php
// app/Http/Middleware/
- EnsureUserIsAuthenticated (auth:user)
- EnsureShopOwnerIsAuthenticated (auth:shop_owner)
- EnsureSuperAdminIsAuthenticated (auth:super_admin)
- VerifyShopOwnerApproval (check status='approved')
- LogUserActivity (optional)
```

### Middleware Usage Examples

```php
Route::middleware(['auth:user'])->group(function () {
    Route::get('/dashboard', [UserController::class, 'dashboard']);
});

Route::middleware(['auth:shop_owner', 'shop_owner.approved'])->group(function () {
    Route::get('/shopowner/dashboard', [ShopOwnerController::class, 'dashboard']);
});

Route::middleware(['auth:super_admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
});
```

## Common API Endpoints

### User Endpoints

#### Get Current User
```
GET /api/user
Headers: 
  - X-Requested-With: XMLHttpRequest

Response:
{
  "id": 1,
  "name": "John Doe",
  "email": "user@solespace.com"
}
```

#### Logout
```
POST /logout
Response: Redirect to homepage with 204 No Content
```

### Shop Owner Endpoints

#### Get Shop Owner Profile
```
GET /shopowner/profile
Response:
{
  "id": 1,
  "first_name": "Jane",
  "last_name": "Smith",
  "business_name": "Jane's Boutique",
  "email": "jane@shop.com",
  "status": "approved"
}
```

#### Update Shop Owner Profile
```
POST /shopowner/update-profile
Body:
{
  "first_name": "Jane",
  "last_name": "Smith",
  "business_name": "Jane's Boutique Updated",
  "phone_number": "+1234567890"
}

Response:
{
  "success": true,
  "message": "Profile updated successfully"
}
```

### Admin Endpoints

#### List All Users
```
GET /admin/api/users
Response:
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 150,
  "per_page": 15,
  "current_page": 1
}
```

#### List All Shop Owners
```
GET /admin/api/shop-owners
Response:
{
  "data": [
    {
      "id": 1,
      "first_name": "Jane",
      "last_name": "Smith",
      "business_name": "Jane's Boutique",
      "status": "pending",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 45,
  "per_page": 15,
  "current_page": 1
}
```

#### Update Shop Owner Status
```
POST /admin/api/shop-owners/{id}/status
Body:
{
  "status": "approved"
}

Response:
{
  "success": true,
  "message": "Shop owner approved"
}
```

#### Reject Shop Owner
```
POST /admin/api/shop-owners/{id}/reject
Body:
{
  "rejection_reason": "Missing required documents"
}

Response:
{
  "success": true,
  "message": "Shop owner rejected"
}
```

## File Upload Endpoints

### Upload Shop Documents

```
POST /shopowner/upload-document
Content-Type: multipart/form-data

Parameters:
- document_type: "business_license" | "tax_id" | "proof_address"
- file: (binary file)

Response:
{
  "success": true,
  "file_id": 5,
  "file_name": "business_license.pdf",
  "message": "Document uploaded successfully"
}
```

## Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 204 | No Content | Successful with no content |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limited |
| 500 | Server Error | Internal error |

## Testing Routes

### Test User Credentials
```
Email: user@solespace.com
Password: password123
Role: User
```

### Test Shop Owner Credentials
```
Email: shopowner@test.com
Password: password123
Role: Shop Owner
Status: Approved
```

### Test Admin Credentials
```
Email: admin@solespace.com
Password: password123
Role: Super Admin
```

## Session Management

### Session Configuration
```php
// config/session.php
- Driver: database
- Lifetime: 525600 minutes (1 year)
- Secure: false (development), true (production)
- HTTP Only: true
- Same Site: 'lax'
```

### Session Data Structure
```php
Session contains:
- login_web (user ID for 'user' guard)
- login_web_shop_owner (shop owner ID for 'shop_owner' guard)
- login_web_super_admin (admin ID for 'super_admin' guard)
```

## CORS Configuration

```php
// config/cors.php
- Allowed Origins: http://localhost:5173 (development)
- Allowed Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Allowed Headers: Content-Type, Accept, Authorization
- Credentials: true
```

## Rate Limiting

Default rate limits (if implemented):
```
Login endpoints: 5 requests per minute per IP
API endpoints: 60 requests per minute per user
```

## API Documentation Tools

For interactive API testing:
- **Thunder Client** (VS Code extension)
- **Postman** - Import routes from `routes/web.php`
- **Laravel Tinker** - Test via command line:
  ```bash
  php artisan tinker
  > User::all()
  > ShopOwner::find(1)
  ```

## Best Practices

1. **Authentication**: Always check user role before accessing endpoints
2. **Validation**: Use Form Request Classes for validation
3. **Errors**: Return meaningful error messages
4. **Logging**: Log important actions for security audit
5. **Rate Limiting**: Implement for public endpoints
6. **HTTPS**: Use HTTPS in production
7. **CSRF**: Always include CSRF token in forms

---

**For more details on specific features, see the detailed README and project documentation.**
