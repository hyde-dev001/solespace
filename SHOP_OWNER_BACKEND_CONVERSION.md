# Shop Owner Backend Conversion

This document outlines the conversion of shop owner frontend pages to Laravel backend controllers, models, and routes.

## Converted Files

### Frontend to Backend Mapping

| Frontend File | Backend Controller | Backend Models | Migration Files |
|--------------|-------------------|----------------|-----------------|
| `Calendar.tsx` | `ShopOwnerCalendarController.php` | `CalendarEvent.php` | `create_calendar_events_table.php` |
| `Ecommerce.tsx` | `ShopOwnerEcommerceController.php` | `Order.php` | `create_orders_table.php`, `add_monthly_target_to_shop_owners_table.php` |
| `UserAccessControl.tsx` | `ShopOwnerAccessControlController.php` | `Employee.php`, `Role.php` | `create_employees_table.php`, `create_roles_table.php`, `add_shop_owner_id_to_users_table.php` |

## Created Files

### Controllers
- `/backend/app/Http/Controllers/ShopOwnerCalendarController.php`
- `/backend/app/Http/Controllers/ShopOwnerEcommerceController.php`
- `/backend/app/Http/Controllers/ShopOwnerAccessControlController.php`

### Models
- `/backend/app/Models/CalendarEvent.php`
- `/backend/app/Models/Employee.php`
- `/backend/app/Models/Role.php`
- `/backend/app/Models/Order.php`

### Migrations
- `/backend/database/migrations/2026_01_15_150000_create_roles_table.php`
- `/backend/database/migrations/2026_01_15_150001_create_employees_table.php`
- `/backend/database/migrations/2026_01_15_150002_create_calendar_events_table.php`
- `/backend/database/migrations/2026_01_15_150003_create_orders_table.php`
- `/backend/database/migrations/2026_01_15_150004_add_monthly_target_to_shop_owners_table.php`
- `/backend/database/migrations/2026_01_15_150005_add_shop_owner_id_to_users_table.php`

## API Routes

All routes are prefixed with `/shop-owner` and require shop owner authentication (`auth:shop_owner` middleware).

### Calendar Management
```
GET    /shop-owner/calendar          - Get all events
POST   /shop-owner/calendar          - Create new event
GET    /shop-owner/calendar/{id}     - Get specific event
PUT    /shop-owner/calendar/{id}     - Update event
DELETE /shop-owner/calendar/{id}     - Delete event
```

### Ecommerce Dashboard
```
GET    /shop-owner/ecommerce         - Get dashboard metrics
POST   /shop-owner/ecommerce/target  - Update monthly target
```

### Access Control
```
GET    /shop-owner/access-control    - Get dashboard stats

# Employee Management
GET    /shop-owner/access-control/employees       - Get all employees
POST   /shop-owner/access-control/employees       - Create employee
PUT    /shop-owner/access-control/employees/{id}  - Update employee
DELETE /shop-owner/access-control/employees/{id}  - Delete employee

# Role Management
GET    /shop-owner/access-control/roles       - Get all roles
POST   /shop-owner/access-control/roles       - Create role
PUT    /shop-owner/access-control/roles/{id}  - Update role
DELETE /shop-owner/access-control/roles/{id}  - Delete role

# User Management
GET    /shop-owner/access-control/users          - Get all users
POST   /shop-owner/access-control/users/{id}/status - Update user status (activate/suspend)
```

## Database Schema

### calendar_events
- `id` - Primary key
- `shop_owner_id` - Foreign key to shop_owners
- `title` - Event title
- `start_date` - Event start date
- `end_date` - Event end date
- `calendar` - Event type (Danger, Success, Primary, Warning)
- `created_at`, `updated_at`

### employees
- `id` - Primary key
- `shop_owner_id` - Foreign key to shop_owners
- `role_id` - Foreign key to roles
- `name` - Employee name
- `email` - Unique email
- `password` - Hashed password
- `status` - active/inactive
- `created_at`, `updated_at`

### roles
- `id` - Primary key
- `shop_owner_id` - Foreign key to shop_owners
- `name` - Role name
- `permissions` - JSON array of permissions
- `created_at`, `updated_at`

### orders
- `id` - Primary key
- `shop_owner_id` - Foreign key to shop_owners
- `customer_id` - Foreign key to users
- `order_number` - Unique order identifier
- `total_amount` - Order total
- `status` - pending/processing/completed/cancelled
- `created_at`, `updated_at`

## Setup Instructions

1. **Run Migrations**
   ```bash
   cd backend
   php artisan migrate
   ```

2. **Configure Authentication Guard**
   
   Add the shop owner guard to `config/auth.php`:
   ```php
   'guards' => [
       'shop_owner' => [
           'driver' => 'session',
           'provider' => 'shop_owners',
       ],
   ],
   
   'providers' => [
       'shop_owners' => [
           'driver' => 'eloquent',
           'model' => App\Models\ShopOwner::class,
       ],
   ],
   ```

3. **Update Frontend API Calls**
   
   Update the frontend service files to call these new backend endpoints:
   - Create `src/services/shopOwnerCalendarApi.ts`
   - Create `src/services/shopOwnerEcommerceApi.ts`
   - Create `src/services/shopOwnerAccessControlApi.ts`

## Features Implemented

### Calendar Management
- ✅ CRUD operations for calendar events
- ✅ Event filtering by date range and type
- ✅ Support for multi-day events
- ✅ Event categorization (Danger, Success, Primary, Warning)

### Ecommerce Dashboard
- ✅ Revenue metrics with monthly comparisons
- ✅ Order statistics and trends
- ✅ Monthly sales data
- ✅ Target tracking and achievement percentage
- ✅ Recent orders list
- ✅ Customer analytics

### Access Control
- ✅ Employee management (CRUD operations)
- ✅ Role management with permissions
- ✅ User account status management (activate/suspend)
- ✅ Dashboard statistics and metrics
- ✅ Search and filtering capabilities
- ✅ Role assignment to employees

## Testing

Use tools like Postman or Insomnia to test the API endpoints:

1. **Authentication**: Ensure you're authenticated as a shop owner
2. **Headers**: Include `Accept: application/json` and CSRF token
3. **Test each endpoint** with appropriate request bodies

Example request for creating an event:
```json
POST /shop-owner/calendar
{
  "title": "Team Meeting",
  "start_date": "2026-01-20",
  "end_date": "2026-01-20",
  "calendar": "Primary"
}
```

## Next Steps

1. Implement shop owner authentication middleware
2. Create frontend API service files
3. Update frontend components to use backend APIs
4. Add validation rules and error handling
5. Implement role-based permissions
6. Add logging and monitoring
7. Write unit and feature tests
