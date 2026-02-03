# HR API Routes - Security Configuration

## Route Middleware Notes

All HR routes under `/api/hr/` have base authentication:
- `auth:user` (session-based authentication)
- `checkShopOwner` (multi-tenant isolation)

**Important**: Most endpoints have `role:HR,shop_owner` middleware at the route level, but **controller-level security provides additional granular validation** for specific operations.

---

## Leave Management Routes

### Basic CRUD Operations
```
GET    /api/hr/leave-requests              [role:HR,shop_owner]
POST   /api/hr/leave-requests              [role:HR,shop_owner]
GET    /api/hr/leave-requests/{id}         [role:HR,shop_owner]
PUT    /api/hr/leave-requests/{id}         [role:HR,shop_owner]
DELETE /api/hr/leave-requests/{id}         [role:HR,shop_owner]
```

### Approval Operations (Enhanced Security)
```
POST   /api/hr/leave-requests/{id}/approve [role:HR,shop_owner] + CONTROLLER CHECKS
POST   /api/hr/leave-requests/{id}/reject  [role:HR,shop_owner] + CONTROLLER CHECKS
```

**Controller-Level Security (approve/reject):**
- ✅ Allowed Roles: HR, shop_owner, Manager
- ✅ Manager Validation: Can only approve direct reports
- ✅ Status Check: Cannot re-approve processed requests
- ✅ Audit Logging: All attempts logged

**Note**: Route middleware says `HR,shop_owner` but controller allows `Manager` role with hierarchy validation.

---

## Payroll Routes

### Basic CRUD Operations
```
GET    /api/hr/payroll                     [role:HR,shop_owner]
POST   /api/hr/payroll                     [role:HR,shop_owner]
GET    /api/hr/payroll/{id}                [role:HR,shop_owner]
PUT    /api/hr/payroll/{id}                [role:HR,shop_owner]
DELETE /api/hr/payroll/{id}                [role:HR,shop_owner]
```

### Payroll Processing (Enhanced Security)
```
POST   /api/hr/payroll/generate            [role:HR,shop_owner] + CONTROLLER CHECKS
POST   /api/hr/payroll/{id}/approve        [NEW ENDPOINT]
GET    /api/hr/payroll/{id}/export         [role:HR,shop_owner] + CONTROLLER CHECKS
```

**Controller-Level Security (generate):**
- ✅ Required Roles: PAYROLL_MANAGER, shop_owner
- ✅ Active Employee Check: Only for active employees
- ✅ Duplicate Prevention: One payroll per period
- ✅ Audit Logging: Tracks generated_by

**Controller-Level Security (approve - NEW):**
- ✅ Required Roles: PAYROLL_APPROVER, shop_owner
- ✅ Self-Approval Prevention: Cannot approve own generation
- ✅ Status Check: Only approves pending payroll
- ✅ Audit Logging: Tracks approved_by

**Controller-Level Security (export):**
- ✅ Required Roles: HR, PAYROLL_MANAGER, PAYROLL_APPROVER, shop_owner
- ✅ Audit Logging: Tracks all exports

---

## Performance Review Routes

### Basic CRUD Operations
```
GET    /api/hr/performance-reviews         [role:HR,shop_owner]
POST   /api/hr/performance-reviews         [role:HR,shop_owner] + CONTROLLER CHECKS
GET    /api/hr/performance-reviews/{id}    [role:HR,shop_owner]
PUT    /api/hr/performance-reviews/{id}    [role:HR,shop_owner]
DELETE /api/hr/performance-reviews/{id}    [role:HR,shop_owner]
```

### Workflow Operations (Enhanced Security)
```
POST   /api/hr/performance-reviews/{id}/submit   [role:HR,shop_owner] + CONTROLLER CHECKS
POST   /api/hr/performance-reviews/{id}/complete [NEW ENDPOINT]
```

**Controller-Level Security (store):**
- ✅ Reviewer Authority: Validates via canReviewEmployee()
- ✅ Authority Rules: Direct manager OR HR dept OR senior management
- ✅ Duplicate Prevention: One review per period
- ✅ Shop Isolation: Both employee and reviewer must belong to shop

**Controller-Level Security (submit):**
- ✅ Submitter Validation: Must be assigned reviewer or HR/shop_owner
- ✅ Rating Validation: All ratings must be 1-5
- ✅ Audit Logging: Tracks submitted_by

**Controller-Level Security (complete - NEW):**
- ✅ Required Roles: HR, shop_owner only
- ✅ Status Check: Must be submitted first
- ✅ Audit Logging: Tracks completed_by

---

## Employee Routes (No Changes)
```
GET    /api/hr/employees                   [role:HR,shop_owner]
POST   /api/hr/employees                   [role:HR,shop_owner]
GET    /api/hr/employees/{id}              [role:HR,shop_owner]
PUT    /api/hr/employees/{id}              [role:HR,shop_owner]
DELETE /api/hr/employees/{id}              [role:HR,shop_owner]
POST   /api/hr/employees/{id}/suspend      [role:HR,shop_owner]
POST   /api/hr/employees/{id}/activate     [role:HR,shop_owner]
GET    /api/hr/employees/statistics        [role:HR,shop_owner]
```

---

## Attendance Routes (No Changes)
```
GET    /api/hr/attendance                  [role:HR,shop_owner]
POST   /api/hr/attendance                  [role:HR,shop_owner]
GET    /api/hr/attendance/{id}             [role:HR,shop_owner]
PUT    /api/hr/attendance/{id}             [role:HR,shop_owner]
DELETE /api/hr/attendance/{id}             [role:HR,shop_owner]
POST   /api/hr/attendance/check-in         [role:HR,shop_owner]
POST   /api/hr/attendance/check-out        [role:HR,shop_owner]
GET    /api/hr/attendance/statistics       [role:HR,shop_owner]
```

---

## Department Routes (No Changes)
```
GET    /api/hr/departments                 [role:HR,shop_owner]
POST   /api/hr/departments                 [role:HR,shop_owner]
GET    /api/hr/departments/{id}            [role:HR,shop_owner]
PUT    /api/hr/departments/{id}            [role:HR,shop_owner]
DELETE /api/hr/departments/{id}            [role:HR,shop_owner]
GET    /api/hr/departments/statistics      [role:HR,shop_owner]
```

---

## Security Layers Explanation

### Layer 1: Route Middleware
- **Purpose**: First line of defense, blocks unauthorized requests early
- **Implementation**: `role:HR,shop_owner` on route definitions
- **Limitation**: Cannot handle complex business logic (e.g., manager hierarchy)

### Layer 2: Controller Security
- **Purpose**: Granular business logic validation
- **Implementation**: Role checks, authority validation, workflow state checks
- **Benefits**: 
  - More flexible (can allow Manager role with conditions)
  - Can validate relationships (manager-employee)
  - Can prevent self-approval
  - Provides detailed error messages

### Layer 3: Model Scopes
- **Purpose**: Multi-tenant data isolation
- **Implementation**: `forShopOwner()` scope on all queries
- **Benefits**: Prevents cross-tenant data access at database level

### Layer 4: Audit Logging
- **Purpose**: Compliance and security monitoring
- **Implementation**: `\Log::info()` and `\Log::warning()` in controllers
- **Benefits**: Track all security-relevant actions and violations

---

## Role Hierarchy Quick Reference

```
shop_owner          → Full access to all HR functions
├── HR              → All HR operations except specialized payroll roles
├── PAYROLL_MANAGER → Generate payroll only (cannot approve)
├── PAYROLL_APPROVER→ Approve payroll only (cannot generate)
├── Manager         → Approve leave for direct reports only
└── Employee        → View own records only (not implemented in these endpoints)
```

---

## Testing Commands

### Test Leave Approval Security
```bash
# Should succeed (HR role)
curl -X POST http://localhost/api/hr/leave-requests/1/approve \
  -H "Cookie: session_cookie" \
  -H "Content-Type: application/json"

# Should fail with 403 (Employee role)
curl -X POST http://localhost/api/hr/leave-requests/1/approve \
  -H "Cookie: employee_session" \
  -H "Content-Type: application/json"

# Should succeed if direct report (Manager role)
curl -X POST http://localhost/api/hr/leave-requests/1/approve \
  -H "Cookie: manager_session" \
  -H "Content-Type: application/json"
```

### Test Payroll Generation Security
```bash
# Should fail with 403 (HR role without PAYROLL_MANAGER)
curl -X POST http://localhost/api/hr/payroll/generate \
  -H "Cookie: hr_session" \
  -H "Content-Type: application/json" \
  -d '{"payrollPeriod":"2026-02","employeeIds":[1,2],"paymentMethod":"bank-transfer"}'

# Should succeed (PAYROLL_MANAGER role)
curl -X POST http://localhost/api/hr/payroll/generate \
  -H "Cookie: payroll_manager_session" \
  -H "Content-Type: application/json" \
  -d '{"payrollPeriod":"2026-02","employeeIds":[1,2],"paymentMethod":"bank-transfer"}'
```

### Test Self-Approval Prevention
```bash
# Generate payroll as user ID 5
# Then try to approve as same user - should fail with 403
curl -X POST http://localhost/api/hr/payroll/1/approve \
  -H "Cookie: same_user_session"
```

---

## Frontend Integration Notes

### Handle New Error Responses
```typescript
// Leave approval
approveLeave(id: number) {
  api.post(`/hr/leave-requests/${id}/approve`)
    .then(response => {
      toast.success('Leave approved successfully');
    })
    .catch(error => {
      if (error.response.status === 403) {
        // New: Detailed permission error
        toast.error(error.response.data.error);
      } else if (error.response.status === 422) {
        // Validation error (already approved, insufficient balance, etc.)
        toast.error(error.response.data.error);
      }
    });
}
```

### Role-Based UI Rendering
```typescript
// Only show approve button if user has permission
const canApproveLeave = () => {
  const userRole = auth.user.role;
  
  if (userRole === 'HR' || userRole === 'shop_owner') {
    return true;
  }
  
  if (userRole === 'Manager') {
    // Check if employee is direct report
    return leaveRequest.employee.manager_id === auth.user.employee_id;
  }
  
  return false;
};

// Render
{canApproveLeave() && (
  <button onClick={() => approveLeave(leaveRequest.id)}>
    Approve
  </button>
)}
```

### Display Approval Tracking
```typescript
// Show who generated/approved payroll
<div className="payroll-audit">
  {payroll.generated_by && (
    <p>Generated by: {payroll.generator.name} on {payroll.created_at}</p>
  )}
  {payroll.approved_by && (
    <p>Approved by: {payroll.approver.name} on {payroll.approved_at}</p>
  )}
</div>
```

---

**Document Version**: 1.0  
**Last Updated**: February 1, 2026  
**Status**: ✅ Ready for Implementation
