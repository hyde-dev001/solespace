# Activity Log Implementation Guide

## ✅ Installed & Configured

Spatie Laravel Activity Log has been fully implemented in your project!

## 📦 What Was Installed

1. **Package:** spatie/laravel-activitylog v4.11.0
2. **Database:** `activity_log` table created with migrations
3. **Controller:** ActivityLogController with role-based filtering
4. **Models:** Product, Expense, User now log all activities
5. **API Route:** `/api/activity-logs` (role-based access)
6. **Frontend:** Manager AuditLogs component created

## 🔐 Role-Based Access Control

### Who Can See What?

| Role | Access Level | What They See |
|------|-------------|---------------|
| **Shop Owner** | ✅ EVERYTHING | All activities across all departments |
| **Manager** | ✅ EVERYTHING | Complete oversight for compliance |
| **HR** | Employee, Payroll, Leave | User, Payroll, Leave, Training, Attendance, Performance, Employee, Department |
| **Finance Manager/Staff** | Financial Records | Expense, Invoice, Payment, Revenue, BankAccount |
| **CRM** | Customer Data | Customer, Lead, Order, Inquiry, Interaction |
| **Staff** | ❌ No Access | - |

## 🎯 What Gets Logged

### Product Model
- Creates, updates, deletes
- Tracked fields: name, price, stock_quantity, is_active, is_featured, category
- Description: "Product created/updated/deleted"

### Expense Model
- Creates, updates, deletes
- Tracked fields: reference, date, category, vendor, amount, status, approved_by
- Description: "Expense created/updated/deleted"

### User Model (Employees)
- Creates, updates, deletes
- Tracked fields: name, email, role, status, approval_limit
- Description: "Employee created/updated/deleted"

## 📡 API Usage

### Endpoint
```
GET /api/activity-logs
```

### Authentication Required
- Middleware: `web`, `auth:user,shop_owner`
- Role check: Manager, HR, Finance, CRM, Shop Owner only

### Available Filters
```
?date_from=2024-01-01          // Start date
?date_to=2024-12-31            // End date
?event=created                 // Event type: created, updated, deleted
?subject_type=Product          // Model type filter
?causer_id=5                   // Filter by who performed action
?page=1                        // Pagination
?per_page=20                   // Items per page
```

### Response Format
```json
{
  "logs": {
    "data": [
      {
        "id": 1,
        "description": "Product created",
        "subject_type": "App\\Models\\Product",
        "subject_id": 25,
        "causer_type": "App\\Models\\User",
        "causer_id": 3,
        "event": "created",
        "properties": {
          "attributes": {
            "name": "Nike Air Max",
            "price": "5499.00",
            "stock_quantity": 10
          }
        },
        "created_at": "2024-02-04T12:30:45.000000Z"
      }
    ],
    "total": 150,
    "per_page": 20,
    "current_page": 1,
    "last_page": 8
  },
  "stats": {
    "total_logs": 150,
    "logs_last_24h": 12,
    "event_counts": {
      "created": 50,
      "updated": 80,
      "deleted": 20
    },
    "subject_type_counts": {
      "App\\Models\\Product": 60,
      "App\\Models\\Finance\\Expense": 50,
      "App\\Models\\User": 40
    }
  }
}
```

## 🎨 Frontend Components

### Manager Audit Logs
- **Path:** `resources/js/components/ERP/Manager/AuditLogs.tsx`
- **Route:** `/erp/manager/audit-logs`
- **Features:**
  - View all activities across all departments
  - Filter by date range, event type, subject type
  - Pagination
  - Detailed view with before/after values
  - Real-time stats dashboard

### Existing Audit Pages
- HR: `resources/js/components/ERP/HR/AuditLogs.tsx`
- Finance: `resources/js/components/ERP/Finance/AuditLogs.tsx`
- CRM: `resources/js/components/ERP/CRM/AuditLogs.tsx`

**Note:** These existing pages need to be updated to use the new `/api/activity-logs` endpoint for consistency.

## 🔧 Adding Activity Logging to More Models

### Step 1: Add Trait to Model
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Invoice extends Model
{
    use LogsActivity;
    
    // ... existing code
    
    /**
     * Activity Log Configuration
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['invoice_number', 'total_amount', 'status', 'customer_id'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Invoice {$eventName}");
    }
}
```

### Step 2: Update Controller Filter (if needed)
Add the model to the appropriate role filter in `ActivityLogController.php`:

```php
private function getFinanceLogs($user, Request $request)
{
    $query = Activity::query()
        ->whereIn('subject_type', [
            'App\\Models\\Finance\\Expense',
            'App\\Models\\Finance\\Invoice',  // Added
            // ... other models
        ])
        // ... rest of code
}
```

## 📊 Manual Activity Logging

### Log Custom Activities
```php
// Simple log
activity()->log('User viewed dashboard');

// With causer (who did it)
activity()
    ->causedBy($user)
    ->log('Approved expense manually');

// With subject (what was affected)
activity()
    ->performedOn($product)
    ->causedBy($user)
    ->withProperties(['old_price' => 100, 'new_price' => 120])
    ->log('Changed product price');

// With custom properties
activity()
    ->causedBy($user)
    ->withProperties([
        'ip_address' => request()->ip(),
        'user_agent' => request()->userAgent(),
        'action' => 'bulk_delete'
    ])
    ->log('Deleted 5 expired products');
```

## 🚀 Benefits

✅ **Compliance Ready** - Complete audit trail for regulatory requirements  
✅ **Security Monitoring** - Track who changed what and when  
✅ **Role-Based Privacy** - Each role only sees relevant activities  
✅ **Automatic Logging** - No manual activity() calls needed for CRUD  
✅ **Before/After Tracking** - See exactly what changed  
✅ **Performance Optimized** - Only logs dirty attributes (changed fields)  

## 🐛 Troubleshooting

**Issue:** Activities not showing up  
**Solution:** Check if model has `LogsActivity` trait and `getActivitylogOptions()` method

**Issue:** "Unauthorized" when accessing logs  
**Solution:** Check user role - only Manager, HR, Finance, CRM, Shop Owner have access

**Issue:** Too many logs in database  
**Solution:** Use `->logOnlyDirty()` and `->dontSubmitEmptyLogs()` in model config

**Issue:** Can't see activities from other departments  
**Solution:** Only Manager and Shop Owner see cross-department logs (by design)

## 📚 Official Documentation

https://spatie.be/docs/laravel-activitylog/

## 🔄 Next Steps (Optional)

1. **Update HR, Finance, CRM audit pages** to use new API endpoint
2. **Add logging to more models:** Order, Invoice, Customer, Lead
3. **Create Shop Owner audit page** (similar to Manager)
4. **Add email notifications** for critical activities (delete, status changes)
5. **Export logs to CSV/PDF** for reporting

---

**Implementation Date:** February 4, 2026  
**Package Version:** spatie/laravel-activitylog v4.11.0  
**Models with Logging:** Product, Expense, User  
**API Endpoint:** `/api/activity-logs`  
**Status:** ✅ Fully functional (ready to use)
