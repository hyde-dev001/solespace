# Shop Owner API Quick Access Guide

## Server Status
✅ **Backend Server Running:** http://127.0.0.1:8000
✅ **Database Migrations:** Completed Successfully

## Available API Endpoints

### 📅 Calendar Management
Base URL: `http://127.0.0.1:8000/shop-owner/calendar`

```bash
# Get all events
GET http://127.0.0.1:8000/shop-owner/calendar

# Create new event
POST http://127.0.0.1:8000/shop-owner/calendar
Content-Type: application/json

{
  "title": "Team Meeting",
  "start_date": "2026-01-20",
  "end_date": "2026-01-20",
  "calendar": "Primary"
}

# Get specific event
GET http://127.0.0.1:8000/shop-owner/calendar/{id}

# Update event
PUT http://127.0.0.1:8000/shop-owner/calendar/{id}
Content-Type: application/json

{
  "title": "Updated Meeting",
  "start_date": "2026-01-21",
  "end_date": "2026-01-21",
  "calendar": "Success"
}

# Delete event
DELETE http://127.0.0.1:8000/shop-owner/calendar/{id}
```

### 💰 Ecommerce Dashboard
Base URL: `http://127.0.0.1:8000/shop-owner/ecommerce`

```bash
# Get dashboard metrics (revenue, orders, sales data)
GET http://127.0.0.1:8000/shop-owner/ecommerce

# Update monthly target
POST http://127.0.0.1:8000/shop-owner/ecommerce/target
Content-Type: application/json

{
  "target": 150000
}
```

### 👥 Access Control - Employees
Base URL: `http://127.0.0.1:8000/shop-owner/access-control`

```bash
# Get all employees
GET http://127.0.0.1:8000/shop-owner/access-control/employees?filter=all&search=

# Create employee
POST http://127.0.0.1:8000/shop-owner/access-control/employees
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "role_id": 1,
  "password": "password123"
}

# Update employee
PUT http://127.0.0.1:8000/shop-owner/access-control/employees/{id}
Content-Type: application/json

{
  "name": "John Doe Updated",
  "email": "john@example.com",
  "role_id": 1
}

# Delete employee
DELETE http://127.0.0.1:8000/shop-owner/access-control/employees/{id}
```

### 🔐 Access Control - Roles
```bash
# Get all roles
GET http://127.0.0.1:8000/shop-owner/access-control/roles?search=

# Create role
POST http://127.0.0.1:8000/shop-owner/access-control/roles
Content-Type: application/json

{
  "name": "Manager",
  "permissions": ["Read Users", "Edit Users", "Delete Users"]
}

# Update role
PUT http://127.0.0.1:8000/shop-owner/access-control/roles/{id}
Content-Type: application/json

{
  "name": "Senior Manager",
  "permissions": ["Read Users", "Edit Users", "Delete Users", "Manage Orders"]
}

# Delete role
DELETE http://127.0.0.1:8000/shop-owner/access-control/roles/{id}
```

### 👤 Access Control - Users
```bash
# Get all users
GET http://127.0.0.1:8000/shop-owner/access-control/users?search=

# Update user status (activate/suspend)
POST http://127.0.0.1:8000/shop-owner/access-control/users/{id}/status
Content-Type: application/json

{
  "action": "suspend",
  "reason": "Suspicious activity detected"
}

# Or activate
{
  "action": "activate"
}
```

### 📊 Access Control Stats
```bash
# Get dashboard statistics
GET http://127.0.0.1:8000/shop-owner/access-control
```

## Testing with cURL

### Example: Create a Calendar Event
```bash
curl -X POST http://127.0.0.1:8000/shop-owner/calendar \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "title": "Product Launch",
    "start_date": "2026-01-25",
    "end_date": "2026-01-25",
    "calendar": "Success"
  }'
```

### Example: Get Ecommerce Dashboard
```bash
curl -X GET http://127.0.0.1:8000/shop-owner/ecommerce \
  -H "Accept: application/json"
```

## Testing with Postman

1. **Import Collection**: Create a new collection named "Shop Owner API"
2. **Set Base URL**: Use `http://127.0.0.1:8000`
3. **Add Headers**: 
   - `Content-Type: application/json`
   - `Accept: application/json`
4. **Test each endpoint** as documented above

## Database Tables Created

✅ `roles` - Role definitions with permissions
✅ `employees` - Employee accounts
✅ `calendar_events` - Calendar events
✅ `orders` - Order tracking
✅ `shop_owners` - Updated with monthly_target column
✅ `users` - Updated with shop_owner_id column

## Response Format

All endpoints return JSON responses in this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "errors": {
    "field_name": ["Error message"]
  }
}
```

## Important Notes

⚠️ **Authentication**: These routes require `auth:shop_owner` middleware. You'll need to implement shop owner authentication before accessing these endpoints in production.

🔧 **CSRF Token**: For POST/PUT/DELETE requests from the frontend, include the CSRF token.

📝 **Validation**: All inputs are validated. Check error messages for validation failures.

## Next Steps

1. ✅ Database migrations completed
2. ✅ Backend server running
3. 🔄 Configure shop owner authentication
4. 🔄 Update frontend to use these endpoints
5. 🔄 Test all CRUD operations
6. 🔄 Add authorization and permissions

## Stop Server

To stop the Laravel server, press `Ctrl+C` in the terminal.
