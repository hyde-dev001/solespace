# HR Audit Logging - Quick Reference

## 🚀 Quick Start

### In Controllers
```php
use App\Traits\HR\LogsHRActivity;
use App\Models\HR\AuditLog;

class YourController extends Controller
{
    use LogsHRActivity;
    
    // After creating
    $this->auditCreated(AuditLog::MODULE_EMPLOYEE, $employee);
    
    // After updating (capture old values first!)
    $old = $employee->getOriginal();
    $employee->update($data);
    $this->auditUpdated(AuditLog::MODULE_EMPLOYEE, $employee, $old);
    
    // After deleting
    $this->auditDeleted(AuditLog::MODULE_EMPLOYEE, $employee);
    
    // After approval
    $this->auditApproved(AuditLog::MODULE_LEAVE, $leaveRequest);
    
    // After rejection
    $this->auditRejected(AuditLog::MODULE_LEAVE, $leaveRequest, $reason);
    
    // Viewing sensitive data
    $this->auditSensitiveAccess(
        AuditLog::MODULE_PAYROLL,
        Payroll::class,
        $payroll->id,
        "Payroll viewed for {$employee->name}"
    );
    
    // Custom action
    $this->auditCustom(
        AuditLog::MODULE_EMPLOYEE,
        AuditLog::ACTION_SUSPENDED,
        "Employee suspended: {$employee->name}",
        [
            'severity' => AuditLog::SEVERITY_CRITICAL,
            'tags' => ['disciplinary', 'critical'],
            'employee_id' => $employee->id,
        ]
    );
}
```

---

## 📋 API Endpoints

```bash
# List audit logs (with filters)
GET /api/hr/audit-logs?module=employee&recent_days=30&severity=critical

# Get statistics
GET /api/hr/audit-logs/statistics?days=30

# Entity history
GET /api/hr/audit-logs/entity/history?entity_type=App\Models\Employee&entity_id=123

# User activity
GET /api/hr/audit-logs/user/5/activity?days=30

# Employee activity
GET /api/hr/audit-logs/employee/10/activity?days=30

# Critical logs (shop_owner only)
GET /api/hr/audit-logs/critical?days=7

# Export to CSV
GET /api/hr/audit-logs/export?module=payroll&start_date=2026-01-01

# Filter options (for dropdowns)
GET /api/hr/audit-logs/filters/options

# Single log
GET /api/hr/audit-logs/123
```

---

## 🔍 Common Filters

**Available filters for GET /api/hr/audit-logs:**
- `user_id` - Filter by user
- `employee_id` - Filter by employee
- `module` - employee|leave|payroll|attendance|performance|department|document
- `action` - created|updated|deleted|approved|rejected|suspended|etc.
- `severity` - info|warning|critical
- `start_date` & `end_date` - Date range (YYYY-MM-DD)
- `recent_days` - Last N days (default: 30)
- `tag` - Filter by tag (e.g., 'financial', 'critical')
- `ip_address` - Filter by IP
- `search` - Search in description
- `entity_type` & `entity_id` - Filter by specific entity
- `critical_only` - true/false
- `per_page` - Results per page (default: 50)
- `sort_by` - Column to sort (default: created_at)
- `sort_order` - asc|desc (default: desc)

---

## 📊 Module Constants

```php
AuditLog::MODULE_EMPLOYEE      // 'employee'
AuditLog::MODULE_LEAVE         // 'leave'
AuditLog::MODULE_PAYROLL       // 'payroll'
AuditLog::MODULE_ATTENDANCE    // 'attendance'
AuditLog::MODULE_PERFORMANCE   // 'performance'
AuditLog::MODULE_DEPARTMENT    // 'department'
AuditLog::MODULE_DOCUMENT      // 'document'
```

---

## 🎯 Action Constants

```php
AuditLog::ACTION_CREATED       // 'created'
AuditLog::ACTION_UPDATED       // 'updated'
AuditLog::ACTION_DELETED       // 'deleted'
AuditLog::ACTION_VIEWED        // 'viewed'
AuditLog::ACTION_APPROVED      // 'approved'
AuditLog::ACTION_REJECTED      // 'rejected'
AuditLog::ACTION_SUSPENDED     // 'suspended'
AuditLog::ACTION_ACTIVATED     // 'activated'
AuditLog::ACTION_GENERATED     // 'generated'
AuditLog::ACTION_EXPORTED      // 'exported'
AuditLog::ACTION_DOWNLOADED    // 'downloaded'
AuditLog::ACTION_VERIFIED      // 'verified'
AuditLog::ACTION_CHECKED_IN    // 'checked_in'
AuditLog::ACTION_CHECKED_OUT   // 'checked_out'
```

---

## ⚠️ Severity Levels

```php
AuditLog::SEVERITY_INFO        // 'info' - Read operations
AuditLog::SEVERITY_WARNING     // 'warning' - Write operations
AuditLog::SEVERITY_CRITICAL    // 'critical' - Sensitive actions
```

---

## 🏷️ Common Tags

```php
['onboarding']              // New employee setup
['workflow', 'approval']    // Approval processes
['financial', 'sensitive']  // Financial operations
['critical', 'disciplinary'] // Critical HR actions
['compliance', 'document']   // Compliance tracking
['deletion', 'critical']     // Deletions
```

---

## 🔎 Query Scopes

```php
// Basic filtering
AuditLog::forShopOwner($shopId)
AuditLog::byUser($userId)
AuditLog::forEmployee($employeeId)
AuditLog::inModule('employee')
AuditLog::withAction('created')
AuditLog::bySeverity('critical')

// Time filtering
AuditLog::recent(7)                    // Last 7 days
AuditLog::dateRange($start, $end)      // Custom range

// Advanced filtering
AuditLog::critical()                   // Critical only
AuditLog::forEntity($type, $id)        // Entity-specific
AuditLog::search('suspended')          // Search description
AuditLog::withTag('financial')         // By tag
AuditLog::fromIp('192.168.1.1')       // By IP

// Chaining
AuditLog::forShopOwner($shopId)
    ->inModule('payroll')
    ->critical()
    ->recent(30)
    ->with(['user', 'employee'])
    ->paginate(50);
```

---

## 📈 Statistics & Reporting

```php
// Get statistics
$stats = AuditLog::getStatistics($shopOwnerId, 30);
// Returns: total_logs, critical_logs, by_module, by_action, by_user, recent_critical

// Entity history
$history = AuditLog::getEntityHistory(Employee::class, $employeeId);
// Returns: All changes to this employee

// Check for specific action
$suspended = AuditLog::forEmployee($empId)
    ->withAction(AuditLog::ACTION_SUSPENDED)
    ->exists();
```

---

## 💾 Migration Command

```bash
php artisan migrate
```

Creates `hr_audit_logs` table with 17 columns and 6 indexes.

---

## ✅ Testing Checklist

1. **Create log:** `AuditLog::createLog([...])`
2. **Check shop isolation:** Logs filtered by shop_owner_id
3. **Test API:** `GET /api/hr/audit-logs`
4. **Test filters:** Add query parameters
5. **Export CSV:** `GET /api/hr/audit-logs/export`
6. **Critical logs:** Requires shop_owner role
7. **Performance:** Check pagination and indexes

---

## 🎨 Frontend Integration Example

```typescript
interface AuditLog {
  id: number;
  module: string;
  action: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  created_at: string;
  user: { id: number; name: string };
  employee?: { id: number; first_name: string; last_name: string };
  tags: string[];
}

// Fetch logs
const logs = await fetch('/api/hr/audit-logs?recent_days=30&severity=critical')
  .then(r => r.json());

// Display with severity colors
const getSeverityColor = (severity: string) => {
  switch(severity) {
    case 'critical': return 'red';
    case 'warning': return 'yellow';
    case 'info': return 'blue';
    default: return 'gray';
  }
};
```

---

## 🔐 Security Notes

- **Authorization:** HR and shop_owner roles only
- **Multi-tenant:** Auto-filtered by shop_owner_id
- **Sensitive access:** Always log salary/document views
- **Critical actions:** Use CRITICAL severity for deletions, suspensions
- **IP tracking:** Automatic, helps detect unauthorized access
- **Immutable:** Audit logs should never be deleted (soft delete not enabled)

---

## 📞 Support

**Implementation Guide:** `HR_AUDIT_LOGGING_IMPLEMENTATION.md`
**Migration File:** `database/migrations/2026_02_01_100008_create_hr_audit_logs_table.php`
**Model:** `app/Models/HR/AuditLog.php`
**Controller:** `app/Http/Controllers/Erp/HR/AuditLogController.php`
**Trait:** `app/Traits/HR/LogsHRActivity.php`
