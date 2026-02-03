# How to Access Shop Owner Functionality

## Quick Test - Login Immediately

A test shop owner has been created and is ready to use:

**Email:** `shopowner@test.com`  
**Password:** `password123`  
**Business:** Test Shop  
**Status:** Approved ✅

### Login Now:

```bash
curl -X POST http://127.0.0.1:8000/shop-owner/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "shopowner@test.com",
    "password": "password123"
  }'
```

---

## Step-by-Step Guide

### Step 1: Register a Shop Owner Account

First, you need to create a shop owner account through the registration form:

**Frontend URL:** http://localhost:5173/#/shop/register

Or use the API directly:

```bash
curl -X POST http://127.0.0.1:8000/shop/register-full \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "newshop@example.com",
    "phone": "09123456789",
    "business_name": "My New Shop",
    "business_address": "123 Main St, Manila",
    "business_type": "Retail",
    "registration_type": "Business"
  }'
```

**Note:** Password will be sent via email after approval (not implemented yet).

### Step 2: Super Admin Approves Your Shop

1. Login as Super Admin: http://127.0.0.1:8000/admin/login
2. Go to Shop Registrations: http://127.0.0.1:8000/admin/shop-registrations
3. Approve your shop owner account

### Step 3: Login as Shop Owner

Once approved, login using the shop owner credentials:

```bash
curl -X POST http://127.0.0.1:8000/shop-owner/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "shopowner@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "shop_owner": {
    "id": 1,
    "name": "My Test Shop",
    "email": "shopowner@example.com"
  }
}
```

### Step 4: Access Shop Owner Features

After login, you can access all shop owner endpoints:

#### Get Your Profile
```bash
curl -X GET http://127.0.0.1:8000/shop-owner/profile \
  -H "Accept: application/json" \
  --cookie-jar cookies.txt
```

#### Calendar Events
```bash
# Get all events
curl -X GET http://127.0.0.1:8000/shop-owner/calendar \
  -H "Accept: application/json" \
  --cookie cookies.txt

# Create event
curl -X POST http://127.0.0.1:8000/shop-owner/calendar \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  --cookie cookies.txt \
  -d '{
    "title": "Team Meeting",
    "start_date": "2026-01-20",
    "end_date": "2026-01-20",
    "calendar": "Primary"
  }'
```

#### Ecommerce Dashboard
```bash
curl -X GET http://127.0.0.1:8000/shop-owner/ecommerce \
  -H "Accept: application/json" \
  --cookie cookies.txt
```

#### Employee Management
```bash
# Get employees
curl -X GET http://127.0.0.1:8000/shop-owner/access-control/employees \
  -H "Accept: application/json" \
  --cookie cookies.txt

# Create employee
curl -X POST http://127.0.0.1:8000/shop-owner/access-control/employees \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  --cookie cookies.txt \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "role_id": 1,
    "password": "password123"
  }'
```

## Quick Test Using Existing Shop Owner

If you already have an approved shop owner in the database, you can login directly:

### Check Database for Existing Shop Owners

```bash
# Run in backend directory
cd "c:\xampp\htdocs\thesis - admin\backend"
php artisan tinker
```

Then in Tinker:
```php
// List all approved shop owners
\App\Models\ShopOwner::where('status', 'approved')->get(['id', 'shop_name', 'email']);

// Or create a test shop owner
$shop = \App\Models\ShopOwner::create([
    'shop_name' => 'Test Shop',
    'email' => 'test@shop.com',
    'password' => bcrypt('password123'),
    'phone' => '1234567890',
    'address' => '123 Test St',
    'status' => 'approved'
]);
```

## Frontend Integration

To integrate with your React frontend, create a login page and use axios:

```typescript
// src/services/shopOwnerAuthApi.ts
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export const loginShopOwner = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/shop-owner/login`, {
    email,
    password
  }, {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  return response.data;
};

export const logoutShopOwner = async () => {
  const response = await axios.post(`${API_URL}/shop-owner/logout`, {}, {
    withCredentials: true
  });
  return response.data;
};

export const getProfile = async () => {
  const response = await axios.get(`${API_URL}/shop-owner/profile`, {
    withCredentials: true
  });
  return response.data;
};
```

## API Endpoints Summary

### Authentication
- `POST /shop-owner/login` - Login
- `POST /shop-owner/logout` - Logout
- `GET /shop-owner/profile` - Get profile (requires auth)
- `PUT /shop-owner/profile` - Update profile (requires auth)
- `POST /shop-owner/change-password` - Change password (requires auth)

### Calendar (all require auth)
- `GET /shop-owner/calendar` - List events
- `POST /shop-owner/calendar` - Create event
- `GET /shop-owner/calendar/{id}` - Get event
- `PUT /shop-owner/calendar/{id}` - Update event
- `DELETE /shop-owner/calendar/{id}` - Delete event

### Ecommerce (all require auth)
- `GET /shop-owner/ecommerce` - Dashboard metrics
- `POST /shop-owner/ecommerce/target` - Update monthly target

### Access Control (all require auth)
- `GET /shop-owner/access-control` - Dashboard stats
- `GET /shop-owner/access-control/employees` - List employees
- `POST /shop-owner/access-control/employees` - Create employee
- `PUT /shop-owner/access-control/employees/{id}` - Update employee
- `DELETE /shop-owner/access-control/employees/{id}` - Delete employee
- `GET /shop-owner/access-control/roles` - List roles
- `POST /shop-owner/access-control/roles` - Create role
- `PUT /shop-owner/access-control/roles/{id}` - Update role
- `DELETE /shop-owner/access-control/roles/{id}` - Delete role
- `GET /shop-owner/access-control/users` - List users
- `POST /shop-owner/access-control/users/{id}/status` - Update user status

## Important Notes

✅ **Authentication Guard Configured:** `auth:shop_owner` middleware is set up
✅ **Session-Based Auth:** Uses Laravel session authentication
✅ **Status Check:** Shop owners must have `status = 'approved'` to login
🔒 **CSRF Protection:** Include CSRF token for state-changing requests from frontend

## Troubleshooting

### "Invalid credentials"
- Check email and password are correct
- Verify shop owner exists in database

### "Account pending approval"
- Shop owner status must be 'approved'
- Ask super admin to approve your account

### "Unauthorized" (401)
- You need to login first
- Session may have expired - login again

### "Forbidden" (403)
- Your account is not approved or is rejected
- Contact super admin
