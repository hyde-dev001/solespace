# Permission Audit Log - Quick Reference

## ⚡ Quick Start

### 1. Verify Installation
```bash
php verify_permission_audit.php
```
Expected: ✅ 8/8 checks passed

### 2. Test the System
```bash
php test_permission_audit.php
```
Demonstrates all 7 audit log types with sample data

### 3. Generate Compliance Report
```bash
php generate_compliance_report.php --days=30
```

---

## 📝 Usage in Code

```php
use App\Models\PermissionAuditLog;

// When assigning a role
$user->assignRole('Manager');
PermissionAuditLog::logRoleAssigned($user, 'Manager', 'Promoted', 'medium');

// When granting permission
$user->givePermissionTo('approve-expenses');
PermissionAuditLog::logPermissionGranted($user, 'approve-expenses', 'Budget authority');

// When revoking permission (HIGH severity)
$user->revokePermissionTo('delete-users');
PermissionAuditLog::logPermissionRevoked($user, 'delete-users', 'Security review', 'high');

// When applying position template
PermissionAuditLog::logPositionAssigned($user, 'Payroll Specialist', $templateId, $permissions);

// When syncing permissions (bulk)
PermissionAuditLog::logPermissionsSynced($user, $oldPerms, $newPerms, 'Annual review');

// When changing roles
PermissionAuditLog::logRoleChanged($user, 'Staff', 'Manager', 'Promotion');
```

---

## 🔍 Query Examples

```php
// Get all logs for a shop
PermissionAuditLog::forShop(1)->get();

// Get logs for specific user
PermissionAuditLog::forUser($userId)->get();

// Get high-severity changes
PermissionAuditLog::highSeverity()->get();

// Get recent changes (last 7 days)
PermissionAuditLog::recent(7)->get();

// Combined filters
PermissionAuditLog::forShop(1)
    ->recent(30)
    ->highSeverity()
    ->orderBy('created_at', 'desc')
    ->paginate(20);
```

---

## 🌐 API Endpoints

```http
# List logs with filters
GET /api/permission-audit-logs
  ?date_from=2026-01-01
  &date_to=2026-02-05
  &severity=high
  &per_page=20

# Get statistics
GET /api/permission-audit-logs/stats?days=30

# Generate compliance report
POST /api/permission-audit-logs/compliance-report
Body: { "date_from": "2026-01-01", "date_to": "2026-02-05" }

# Get user history
GET /api/permission-audit-logs/user/5/history

# Get changes requiring review
GET /api/permission-audit-logs/requires-review?days=7

# Export to CSV
GET /api/permission-audit-logs/export
  ?date_from=2026-01-01
  &date_to=2026-12-31
```

---

## 📊 Severity Levels

| Level | When to Use | Examples |
|-------|-------------|----------|
| **low** | Routine operations | New Staff user |
| **medium** | Normal changes | Permission grants, role assignments |
| **high** | Sensitive operations | Permission revocations, Manager role |
| **critical** | High-risk changes | Bulk updates, admin privileges |

---

## ✅ Implementation Status

- [x] Database migration created
- [x] PermissionAuditLog model with 6 static methods
- [x] 7 query scopes (forShop, forUser, byAction, etc.)
- [x] API controller with 6 endpoints
- [x] Routes registered and protected
- [x] Integration with UserAccessControlController
- [x] Verification script (8 checks)
- [x] Compliance report generator
- [x] Test demonstration script
- [x] Complete documentation

**Status:** ✅ Production Ready

---

## 🎯 What Gets Logged

1. **role_assigned** - Role assigned to user
2. **role_removed** - Role removed from user
3. **permission_granted** - Permission granted to user
4. **permission_revoked** - Permission revoked from user
5. **position_assigned** - Position template applied
6. **permissions_synced** - Bulk permission update
7. **role_changed** - Role changed from one to another

**Automatic Capture:**
- Actor (who made the change)
- Subject (who was affected)
- Timestamp (when it happened)
- IP Address
- User Agent
- Request Method & URL
- Before/After state (JSON)

---

## 🚀 Next Steps

1. **Test in Production:**
   - Create/edit users via Shop Owner UI
   - Verify logs are created automatically

2. **Generate Reports:**
   - Monthly: `php generate_compliance_report.php --days=30`
   - Quarterly: `php generate_compliance_report.php --from=2026-01-01 --to=2026-03-31`
   - Annual: `php generate_compliance_report.php --from=2026-01-01 --to=2026-12-31`

3. **Export for Audits:**
   - `curl "http://localhost/api/permission-audit-logs/export?date_from=2026-01-01" > audit_2026.csv`

4. **Frontend Dashboard (Optional):**
   - Create React/Inertia page at `/erp/manager/permission-audit-logs`
   - Use API endpoints for data
   - Add filters, search, and export button

---

## 📖 Full Documentation

See [PERMISSION_AUDIT_LOG_COMPLETE.md](./PERMISSION_AUDIT_LOG_COMPLETE.md) for:
- Complete API documentation
- Code examples
- Compliance guidelines
- Best practices
- Troubleshooting

---

**Last Updated:** February 5, 2026  
**Implementation:** Complete ✅  
**Compliance Level:** Enterprise-grade
