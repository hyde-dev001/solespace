# User-Side Backend Registration System

## Overview
Complete backend setup for user and shop owner registration, including authentication, validation, and approval workflows.

## System Architecture

### Authentication Guards
- **user** - Regular customers (auto-approved)
- **shop_owner** - Business owners (requires admin approval)
- **super_admin** - System administrators

### User Types & Approval Flow

#### 1. Regular Users (Customers)
- **Status**: `active` (auto-approved on registration)
- **Registration Fields**: 
  - first_name, last_name
  - email (unique), phone, age (18+)
  - address, valid_id (file upload)
  - password (8+ chars, uppercase, lowercase, numbers)
- **Access**: Browse products, make purchases, book repair services
- **No Approval Required**: Users can login immediately after registration

#### 2. Shop Owners
- **Status**: `pending` → `approved`/`rejected` (requires admin approval)
- **Registration Fields**:
  - first_name, last_name
  - email (unique), phone
  - business_name, business_address
  - business_type (retail/repair/both)
  - registration_type (individual/company)
  - operating_hours (7 days JSON)
  - password (8+ chars, uppercase, lowercase, numbers)
  - Documents: DTI Registration, Mayor's Permit, BIR Certificate, Valid ID
- **Access**: Manage products, services, orders after approval
- **Requires Admin Approval**: Cannot login until admin approves

#### 3. Super Admin
- **Status**: `active`
- **Access**: Full system control, approve/reject shop owners, manage all users

## Controllers Created

### 1. UserController.php
**Location**: `app/Http/Controllers/UserController.php`

**Methods**:
- `register()` - Register new user with validation and file upload
- `login()` - Authenticate user (only active status allowed)
- `logout()` - End user session
- `me()` - Get current authenticated user (API)

**Features**:
- Email uniqueness validation
- Age restriction (18+)
- Password complexity validation (regex)
- Valid ID file upload to `storage/valid_ids/`
- Auto-approval (status='active')
- Last login tracking (IP, timestamp)
- Comprehensive error logging

### 2. ShopOwnerAuthController.php
**Location**: `app/Http/Controllers/ShopOwnerAuthController.php`

**Methods**:
- `register()` - Register new shop owner with documents
- `login()` - Authenticate shop owner (only approved status allowed)
- `logout()` - End shop owner session
- `me()` - Get current authenticated shop owner (API)

**Features**:
- Business information validation
- Operating hours JSON storage (7 days)
- Multiple document uploads (DTI, Mayor's Permit, BIR, Valid ID)
- Document storage in `storage/shop_documents/`
- Creates ShopDocument records linked to shop owner
- Pending status by default (requires admin approval)
- Rejection reason support
- Transaction-based registration (rollback on error)

## Routes Configured

### User Routes
```php
POST /user/register          - Register new user
POST /user/login             - Login user
POST /user/logout            - Logout user
GET  /api/user/me           - Get authenticated user (middleware: auth:user)
```

### Shop Owner Routes
```php
POST /shop-owner/register    - Register new shop owner
POST /shop-owner/login       - Login shop owner
POST /shop-owner/logout      - Logout shop owner
GET  /api/shop-owner/me     - Get authenticated shop owner (middleware: auth:shop_owner)
GET  /shop-owner/dashboard  - Shop owner dashboard (middleware: auth:shop_owner)
```

### Super Admin Routes (existing)
```php
GET  /admin/login            - Show login form
POST /admin/login            - Login super admin
POST /admin/logout           - Logout super admin

# Protected routes (middleware: super_admin.auth)
GET  /admin/shop-registrations                  - View pending shop registrations
POST /admin/shop-registrations/{id}/approve     - Approve shop owner
POST /admin/shop-registrations/{id}/reject      - Reject shop owner
GET  /admin/user-management                     - View all users
POST /admin/users/{id}/suspend                  - Suspend user
POST /admin/users/{id}/activate                 - Activate user
DELETE /admin/users/{id}                        - Delete user (super_admin.role)
```

## Database Structure

### Users Table (18 columns)
- id, shop_owner_id, first_name, last_name
- email (unique), phone, password, address
- age, valid_id_path, status (active/suspended/inactive)
- suspension_reason, email_verified_at
- last_login_at, last_login_ip
- remember_token, created_at, updated_at

### Shop Owners Table (17 columns)
- id, first_name, last_name, email (unique)
- phone, password, business_name, business_address
- business_type (retail/repair/both)
- registration_type (individual/company)
- operating_hours (JSON - 7 days)
- status (pending/approved/rejected)
- rejection_reason, monthly_target
- last_login_at, last_login_ip
- created_at, updated_at

### Shop Documents Table
- id, shop_owner_id
- document_type (DTI Registration, Mayor's Permit, BIR Certificate, Valid ID)
- file_path (storage path)
- status (pending/approved/rejected)
- created_at, updated_at

### Super Admins Table (13 columns)
- id, first_name, last_name, email (unique)
- phone, password
- role (admin/super_admin)
- status (active/suspended)
- last_login_at, last_login_ip
- remember_token, created_at, updated_at

## Validation Rules

### User Registration
```php
'first_name' => 'required|string|max:255|min:2'
'last_name' => 'required|string|max:255|min:2'
'email' => 'required|string|email|max:255|unique:users,email'
'phone' => 'required|string|max:15|min:10'
'age' => 'required|integer|min:18|max:120'
'password' => [
    'required',
    'string',
    'min:8',
    'confirmed',
    'regex:/[a-z]/',      // lowercase
    'regex:/[A-Z]/',      // uppercase
    'regex:/[0-9]/',      // numbers
]
'address' => 'required|string|max:500'
'valid_id' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120' // 5MB
```

### Shop Owner Registration
```php
'business_name' => 'required|string|max:255'
'business_address' => 'required|string|max:500'
'business_type' => 'required|in:retail,repair,both'
'registration_type' => 'required|in:individual,company'
'operating_hours' => 'required|array|min:7'
'operating_hours.*.day' => 'required|string'
'operating_hours.*.open' => 'required|date_format:H:i'
'operating_hours.*.close' => 'required|date_format:H:i'
'operating_hours.*.is_closed' => 'required|boolean'

// Document uploads
'dti_registration' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120'
'mayors_permit' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120'
'bir_certificate' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120'
'valid_id' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120'
```

## File Storage

### Storage Paths
- User Valid IDs: `storage/valid_ids/`
- Shop Documents: `storage/shop_documents/`

### File Naming Convention
```php
$fileName = time() . '_' . uniqid() . '.' . $extension;
// Example: 1642345678_5f8a9b3c2d1e.jpg
```

### Storage Configuration
Files stored using Laravel's `public` disk:
```php
$filePath = $file->storeAs('valid_ids', $fileName, 'public');
```

## Security Features

### Password Security
- Hashed using `Hash::make()`
- Verification using `Hash::check()`
- Minimum 8 characters
- Must contain uppercase, lowercase, and numbers

### Session Security
- CSRF token protection
- Session regeneration on login
- Session invalidation on logout
- Guard separation (user/shop_owner/super_admin)

### Status Checks
- Users: Only `active` status can login
- Shop Owners: Only `approved` status can login
  - `pending` → Error: "Application pending approval"
  - `rejected` → Error: "Application rejected" (with reason)
  - Other → Error: "Account inactive"

### Last Login Tracking
```php
'last_login_at' => now()
'last_login_ip' => $request->ip()
```

## Error Handling

### Validation Errors
```php
catch (ValidationException $e) {
    return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors(),
    ], 422);
}
```

### Database Errors
```php
catch (\Exception $e) {
    DB::rollBack(); // For shop owner registration
    \Log::error('Error message', ['error' => $e->getMessage()]);
    return response()->json([
        'success' => false,
        'message' => 'Operation failed. Please try again.',
    ], 500);
}
```

## Response Formats

### Success (Registration)
```json
{
    "success": true,
    "message": "Registration successful!",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "status": "active"
    }
}
```

### Success (Login)
```json
{
    "success": true,
    "message": "Login successful!",
    "user": {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com"
    }
}
```

### Error (Validation)
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "email": ["The email has already been taken."],
        "password": ["Password must contain uppercase, lowercase, and numbers"]
    }
}
```

### Error (Authentication)
```json
{
    "success": false,
    "message": "Login failed",
    "errors": {
        "email": ["Your application is still pending admin approval. Please wait for confirmation."]
    }
}
```

## Testing

### Test Files Created
1. `test_user_registration.php` - Test user CRUD and password verification
2. `test_shop_owner_registration.php` - Test shop owner registration and approval workflow
3. `test_authentication_system.php` - Comprehensive test of all guards and authentication

### All Tests Passed ✓
- User registration (auto-approved)
- Shop owner registration (pending → approved)
- Authentication guards (user, shop_owner, super_admin)
- Password hashing and verification
- Database structure validation

## Frontend Integration

### User Registration Form
```javascript
// POST /user/register
const formData = new FormData();
formData.append('first_name', 'John');
formData.append('last_name', 'Doe');
formData.append('email', 'john@example.com');
formData.append('phone', '09171234567');
formData.append('age', '25');
formData.append('address', '123 Main St, Manila');
formData.append('password', 'Password123');
formData.append('password_confirmation', 'Password123');
formData.append('valid_id', fileInput.files[0]); // File object

router.post('/user/register', formData);
```

### Shop Owner Registration Form
```javascript
// POST /shop-owner/register
const formData = new FormData();
formData.append('first_name', 'Maria');
formData.append('last_name', 'Santos');
formData.append('email', 'maria@example.com');
formData.append('phone', '09181234567');
formData.append('password', 'Password123');
formData.append('password_confirmation', 'Password123');
formData.append('business_name', 'Santos Shoe Repair');
formData.append('business_address', '456 Business St, QC');
formData.append('business_type', 'repair');
formData.append('registration_type', 'individual');

// Operating hours
const operatingHours = [
    {day: 'Monday', open: '09:00', close: '18:00', is_closed: false},
    {day: 'Tuesday', open: '09:00', close: '18:00', is_closed: false},
    // ... 7 days total
];
formData.append('operating_hours', JSON.stringify(operatingHours));

// Documents
formData.append('dti_registration', dtiFile);
formData.append('mayors_permit', mayorsPermitFile);
formData.append('bir_certificate', birCertificateFile);
formData.append('valid_id', validIdFile);

router.post('/shop-owner/register', formData);
```

### Login Forms
```javascript
// User Login
router.post('/user/login', {
    email: 'john@example.com',
    password: 'Password123',
    remember: true // Optional
});

// Shop Owner Login
router.post('/shop-owner/login', {
    email: 'maria@example.com',
    password: 'Password123',
    remember: true
});
```

## Admin Approval Workflow

### Shop Owner Registration Process
1. Shop owner submits registration form with documents
2. System creates ShopOwner record with `status='pending'`
3. System creates 4 ShopDocument records (one for each document)
4. Super admin views pending registrations at `/admin/shop-registrations`
5. Super admin reviews documents and business information
6. Super admin approves or rejects:
   - **Approve**: `POST /admin/shop-registrations/{id}/approve`
     - Status changes to `approved`
     - Shop owner can now login
   - **Reject**: `POST /admin/shop-registrations/{id}/reject`
     - Status changes to `rejected`
     - Rejection reason stored
     - Shop owner cannot login (error message shows reason)

### User Management
- Users are auto-approved (status='active')
- Admin can suspend/activate users at `/admin/user-management`
- Super admin can delete users (role-protected)

## Next Steps

### Frontend Development Needed
1. Create user registration page (form with file upload)
2. Create shop owner registration page (multi-step form)
3. Create user login/logout pages
4. Create shop owner login/logout pages
5. Implement file upload UI components
6. Add operating hours selector component

### Backend Enhancements
1. Email verification system
2. Password reset functionality
3. User profile update endpoints
4. Shop owner profile update endpoints
5. Document re-upload functionality
6. Admin notification system (new registrations)

### Testing Recommendations
1. Test file upload limits and validation
2. Test unique email constraint across all tables
3. Test password complexity validation in frontend
4. Test operating hours JSON parsing
5. Test approval/rejection email notifications
6. Test session management across guards

## Important Notes

⚠️ **File Storage**: Make sure to run `php artisan storage:link` to create symlink for public storage access

⚠️ **Guard Separation**: Each guard (user, shop_owner, super_admin) has separate sessions. Users cannot access shop owner routes and vice versa.

⚠️ **Status Enforcement**: Login controllers check status before authentication:
- Users: Must be 'active'
- Shop Owners: Must be 'approved'
- Super Admins: Must be 'active'

⚠️ **Document Requirements**: All 4 documents (DTI, Mayor's Permit, BIR, Valid ID) are required for shop owner registration. Frontend should validate before submission.

⚠️ **Age Restriction**: Users must be 18+ years old. Frontend should validate age before allowing registration.

⚠️ **Password Security**: Frontend should implement password strength indicator showing uppercase, lowercase, and number requirements.
