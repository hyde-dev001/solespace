# Enhanced Leave Management System - Implementation Complete

## Overview
Enhanced Leave Management with policy-based validation, approval hierarchy, balance checking, and automated notifications.

**Implementation Date:** February 1, 2026  
**Status:** ✅ Complete and Migrated

---

## 🎯 Features Implemented

### 1. Leave Policy Engine
**Model:** `App\Models\HR\LeavePolicy`  
**Table:** `hr_leave_policies`

#### Key Capabilities:
- ✅ Multiple leave types with custom policies per shop
- ✅ Accrual calculations (monthly, quarterly, annually, on_joining)
- ✅ Maximum balance and carry-forward limits
- ✅ Carry-forward expiry tracking
- ✅ Minimum service days eligibility
- ✅ Notice period requirements
- ✅ Duration restrictions (min/max days, half-day support)
- ✅ Document requirements based on duration
- ✅ Negative balance allowance with limits
- ✅ Gender and department restrictions
- ✅ Leave encashment configuration

#### Leave Policy Fields (36 fields):
```php
- id, shop_owner_id
- leave_type (unique per shop)
- display_name, description
- accrual_rate, accrual_frequency
- max_balance, max_carry_forward
- carry_forward_expires, carry_forward_expiry_months
- min_service_days
- is_paid, requires_approval
- min_notice_days
- min_days, max_days, allow_half_day
- requires_document, document_required_after_days
- allow_negative_balance, negative_balance_limit
- applicable_gender, applicable_departments (JSON)
- is_encashable, encashable_after_days, encashment_percentage
- is_active, priority
- created_at, updated_at
```

#### Helper Methods:
```php
// Find policy by type
LeavePolicy::findByType($shopOwnerId, 'annual');

// Check employee eligibility
$policy->isEligibleEmployee($employee);

// Validate duration
$policy->validateDuration($days, $isHalfDay);

// Validate notice period
$policy->validateNotice($startDate);

// Check if document required
$policy->requiresDocument($days);

// Calculate accrued days
$policy->calculateAccruedDays($employee);
```

---

### 2. Approval Hierarchy System
**Model:** `App\Models\HR\LeaveApprovalHierarchy`  
**Table:** `hr_leave_approval_hierarchy`

#### Key Capabilities:
- ✅ Multi-level approval workflow (manager → HR → department head)
- ✅ Approval delegation support (temporary reassignment)
- ✅ Conditional approvals (by leave type or duration)
- ✅ Effective date ranges for hierarchy entries
- ✅ Automatic approver routing

#### Hierarchy Fields (16 fields):
```php
- id, shop_owner_id
- employee_id, approver_id
- approval_level (1, 2, 3, ...)
- approver_type (manager, hr, department_head, custom)
- applies_for_days_greater_than (conditional)
- applies_for_leave_types (JSON, conditional)
- delegated_to, delegation_start_date, delegation_end_date, delegation_reason
- is_active
- effective_from, effective_to
- created_at, updated_at
```

#### Helper Methods:
```php
// Get next approver
$approverInfo = LeaveApprovalHierarchy::getNextApprover(
    $employeeId,
    $leaveType,      // optional filter
    $leaveDays,      // optional filter
    $currentLevel    // 0 for first approver
);

// Returns:
[
    'approver_id' => 5,
    'approver' => User object,
    'approval_level' => 1,
    'is_delegated' => false,
    'original_approver_id' => null  // only if delegated
]

// Get full approval chain
$chain = LeaveApprovalHierarchy::getApprovalChain($employeeId, $leaveType, $days);

// Check if hierarchy exists
$hasHierarchy = LeaveApprovalHierarchy::hasHierarchy($employeeId);

// Set delegation
$hierarchy->setDelegation($delegateUserId, $startDate, $endDate, $reason);

// Clear delegation
$hierarchy->clearDelegation();
```

---

### 3. Enhanced Leave Controller
**Controller:** `App\Http\Controllers\Erp\HR\LeaveController`

#### Updated `store()` Method Workflow:

**Step 1: Policy Validation**
```php
$policy = LeavePolicy::findByType($shopOwnerId, $leaveType);

// Validates:
- Policy exists and active
- Employee eligibility (gender, department, service days)
- Duration against policy rules
- Notice period requirements
- Document requirements
```

**Step 2: Balance Checking**
```php
$leaveBalance = LeaveBalance::forEmployee($employeeId)
    ->ofType($leaveType)
    ->forYear($year)
    ->first();

// Validates:
- Sufficient balance available
- Negative balance limits if applicable
- Auto-creates balance if not exists using accrued days
```

**Step 3: Approval Routing**
```php
$approverInfo = LeaveApprovalHierarchy::getNextApprover(
    $employeeId,
    $leaveType,
    $days
);

// Determines:
- Next approver in hierarchy
- Approval level
- Delegation status
- Auto-approval if policy doesn't require approval
```

**Step 4: Notification**
```php
Notification::send($approver, new LeaveRequestSubmitted(
    $leaveRequest,
    $employee,
    $approverInfo
));

// Sends:
- Email notification to approver
- Database notification
- Audit log entry
```

#### Enhanced Response:
```json
{
    "message": "Leave request created successfully",
    "data": {
        "id": 123,
        "employee_id": 45,
        "leave_type": "annual",
        "start_date": "2026-03-15",
        "end_date": "2026-03-20",
        "no_of_days": 5,
        "status": "pending",
        "approval_level": 1,
        "approver_id": 10
    },
    "approval_required": true,
    "approver": {
        "name": "John Manager",
        "is_delegated": false,
        "level": 1
    },
    "balance": {
        "available": 15.0,
        "after_approval": 10.0
    }
}
```

---

### 4. Leave Request Notification
**Notification:** `App\Notifications\HR\LeaveRequestSubmitted`

#### Notification Features:
- ✅ Queued for async processing
- ✅ Email with rich HTML formatting
- ✅ Database notification for in-app alerts
- ✅ Delegation information included
- ✅ Direct action link to review request

#### Email Content:
```
Subject: Leave Request Pending Approval - [Employee Name]

Hello [Approver Name],

A new leave request requires your approval.

Employee: John Doe
Leave Type: Annual Leave
Duration: Mar 15, 2026 to Mar 20, 2026 (5 day(s))
Reason: Family vacation

Note: This approval has been delegated to you by Jane Manager.

[Review Leave Request Button]

Please review and take appropriate action on this request.
```

#### Database Notification Data:
```json
{
    "type": "leave_request_submitted",
    "leave_request_id": 123,
    "employee_id": 45,
    "employee_name": "John Doe",
    "leave_type": "annual",
    "start_date": "2026-03-15",
    "end_date": "2026-03-20",
    "days": 5,
    "reason": "Family vacation",
    "approval_level": 1,
    "is_delegated": false,
    "action_url": "/erp/hr/leave-requests/123",
    "created_at": "2026-02-01T10:30:00Z"
}
```

---

## 📊 Database Schema

### hr_leave_policies
```sql
CREATE TABLE hr_leave_policies (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shop_owner_id BIGINT NOT NULL,
    
    -- Leave Type
    leave_type VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Accrual
    accrual_rate DECIMAL(5,2) DEFAULT 0,
    accrual_frequency ENUM('monthly', 'quarterly', 'annually', 'on_joining'),
    max_balance INT NULL,
    max_carry_forward INT DEFAULT 0,
    carry_forward_expires BOOLEAN DEFAULT FALSE,
    carry_forward_expiry_months INT NULL,
    
    -- Eligibility
    min_service_days INT DEFAULT 0,
    is_paid BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT TRUE,
    min_notice_days INT DEFAULT 0,
    min_days INT DEFAULT 1,
    max_days INT DEFAULT 365,
    allow_half_day BOOLEAN DEFAULT FALSE,
    
    -- Requirements
    requires_document BOOLEAN DEFAULT FALSE,
    document_required_after_days INT NULL,
    allow_negative_balance BOOLEAN DEFAULT FALSE,
    negative_balance_limit DECIMAL(5,2) DEFAULT 0,
    
    -- Restrictions
    applicable_gender ENUM('all', 'male', 'female') DEFAULT 'all',
    applicable_departments JSON NULL,
    
    -- Encashment
    is_encashable BOOLEAN DEFAULT FALSE,
    encashable_after_days INT NULL,
    encashment_percentage DECIMAL(5,2) DEFAULT 100.00,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 0,
    
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (shop_owner_id) REFERENCES shop_owners(id) ON DELETE CASCADE,
    INDEX idx_shop_type (shop_owner_id, leave_type),
    INDEX idx_shop_active (shop_owner_id, is_active),
    UNIQUE KEY (shop_owner_id, leave_type)
);
```

### hr_leave_approval_hierarchy
```sql
CREATE TABLE hr_leave_approval_hierarchy (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shop_owner_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    approver_id BIGINT NOT NULL,
    
    -- Hierarchy
    approval_level INT NOT NULL DEFAULT 1,
    approver_type ENUM('manager', 'hr', 'department_head', 'custom') DEFAULT 'manager',
    
    -- Conditional Rules
    applies_for_days_greater_than INT NULL,
    applies_for_leave_types JSON NULL,
    
    -- Delegation
    delegated_to BIGINT NULL,
    delegation_start_date TIMESTAMP NULL,
    delegation_end_date TIMESTAMP NULL,
    delegation_reason TEXT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    effective_from TIMESTAMP NULL,
    effective_to TIMESTAMP NULL,
    
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (shop_owner_id) REFERENCES shop_owners(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (delegated_to) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_shop_emp (shop_owner_id, employee_id),
    INDEX idx_approver (approver_id, is_active),
    INDEX idx_delegate (delegated_to),
    INDEX idx_emp_level (employee_id, approval_level),
    UNIQUE KEY hr_approval_hierarchy_unique (shop_owner_id, employee_id, approval_level)
);
```

### Updated leave_requests
```sql
-- New fields added:
ALTER TABLE leave_requests ADD COLUMN (
    approval_level INT NOT NULL DEFAULT 1,
    approver_id BIGINT NULL,
    supporting_document VARCHAR(255) NULL,
    is_half_day BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL
);
```

---

## 🔧 API Endpoints

### Existing Endpoints (Enhanced)
```http
POST /api/hr/leave-requests
```
**Enhanced Features:**
- Policy validation
- Balance checking with accrual calculation
- Automatic approver routing
- Notification sending
- Half-day support
- Document upload support

**Request:**
```json
{
    "employee_id": 45,
    "leaveType": "annual",
    "startDate": "2026-03-15",
    "endDate": "2026-03-20",
    "reason": "Family vacation",
    "is_half_day": false,
    "supporting_document": "(file upload)"
}
```

**Response:**
```json
{
    "message": "Leave request created successfully",
    "data": { /* leave request object */ },
    "approval_required": true,
    "approver": {
        "name": "John Manager",
        "is_delegated": false,
        "level": 1
    },
    "balance": {
        "available": 15.0,
        "after_approval": 10.0
    }
}
```

### Recommended New Endpoints
```http
# Get leave policies for shop
GET /api/hr/leave-policies

# Get specific leave policy
GET /api/hr/leave-policies/{type}

# Get approval hierarchy for employee
GET /api/hr/employees/{id}/approval-hierarchy

# Set delegation
POST /api/hr/approval-hierarchy/{id}/delegate

# Clear delegation
DELETE /api/hr/approval-hierarchy/{id}/delegate

# Get leave balance with accrual details
GET /api/hr/employees/{id}/leave-balance/{type}
```

---

## 📝 Usage Examples

### Example 1: Configure Leave Policy
```php
use App\Models\HR\LeavePolicy;

$annualLeavePolicy = LeavePolicy::create([
    'shop_owner_id' => 1,
    'leave_type' => 'annual',
    'display_name' => 'Annual Leave',
    'description' => 'Yearly vacation leave',
    
    // Accrual: 1.5 days per month
    'accrual_rate' => 1.5,
    'accrual_frequency' => 'monthly',
    'max_balance' => 30,
    'max_carry_forward' => 5,
    
    // Eligibility: 90 days service required
    'min_service_days' => 90,
    'is_paid' => true,
    'requires_approval' => true,
    'min_notice_days' => 7,
    
    // Duration: 1-15 days
    'min_days' => 1,
    'max_days' => 15,
    'allow_half_day' => true,
    
    // No document required
    'requires_document' => false,
    
    // Allow -2 days negative balance
    'allow_negative_balance' => true,
    'negative_balance_limit' => 2,
    
    'is_active' => true,
]);
```

### Example 2: Setup Approval Hierarchy
```php
use App\Models\HR\LeaveApprovalHierarchy;

// Level 1: Immediate manager
LeaveApprovalHierarchy::create([
    'shop_owner_id' => 1,
    'employee_id' => 45,
    'approver_id' => 10,  // Manager user ID
    'approval_level' => 1,
    'approver_type' => 'manager',
    'is_active' => true,
]);

// Level 2: HR (only for leaves > 5 days)
LeaveApprovalHierarchy::create([
    'shop_owner_id' => 1,
    'employee_id' => 45,
    'approver_id' => 5,   // HR user ID
    'approval_level' => 2,
    'approver_type' => 'hr',
    'applies_for_days_greater_than' => 5,
    'is_active' => true,
]);
```

### Example 3: Set Temporary Delegation
```php
use App\Models\HR\LeaveApprovalHierarchy;
use Carbon\Carbon;

$hierarchy = LeaveApprovalHierarchy::where('approver_id', 10)->first();

// Manager going on vacation, delegate to another manager
$hierarchy->setDelegation(
    12,  // Delegate user ID
    Carbon::parse('2026-03-15'),  // Start date
    Carbon::parse('2026-03-30'),  // End date
    'On vacation'
);

// During delegation period, approvals will route to delegate automatically
```

### Example 4: Submit Leave Request (Enhanced)
```php
use Illuminate\Http\Request;

$request = new Request([
    'employee_id' => 45,
    'leaveType' => 'annual',
    'startDate' => '2026-03-15',
    'endDate' => '2026-03-20',
    'reason' => 'Family vacation',
    'is_half_day' => false,
]);

$leaveController = new LeaveController();
$response = $leaveController->store($request);

// Automatically:
// 1. Validates against annual leave policy
// 2. Checks if employee has 5 days balance
// 3. Routes to manager (level 1 approver)
// 4. Sends email notification to manager
// 5. Creates audit log entry
```

---

## ✅ Testing Checklist

### Policy Validation Testing
- [ ] Create leave request with invalid leave type (should fail)
- [ ] Create leave request for ineligible employee (gender/department) (should fail)
- [ ] Create leave request without sufficient service days (should fail)
- [ ] Create leave request without sufficient notice (should fail)
- [ ] Create leave request exceeding max days (should fail)
- [ ] Create half-day leave when not allowed (should fail)
- [ ] Create leave without required document (should fail)

### Balance Checking Testing
- [ ] Create leave with sufficient balance (should succeed)
- [ ] Create leave with insufficient balance (should fail)
- [ ] Create leave with negative balance allowed (should succeed within limit)
- [ ] Create leave exceeding negative balance limit (should fail)
- [ ] Verify accrued days calculation for new employee
- [ ] Verify accrued days with max balance cap

### Approval Hierarchy Testing
- [ ] Create leave routing to level 1 approver (manager)
- [ ] Create leave routing to level 2 approver (HR) for > 5 days
- [ ] Create leave with delegated approver (during delegation period)
- [ ] Create leave with auto-approval (policy doesn't require approval)
- [ ] Verify approval chain retrieval
- [ ] Verify effective date ranges work correctly

### Notification Testing
- [ ] Verify email sent to approver
- [ ] Verify database notification created
- [ ] Verify delegation information included in notification
- [ ] Verify action link works
- [ ] Verify notification failure doesn't block leave creation

---

## 🎓 Key Improvements

### Before Enhancement:
❌ Basic leave types with no policy enforcement  
❌ No balance validation against accrual rules  
❌ Single-level approval (any auth user could approve)  
❌ No notification system  
❌ No delegation support  
❌ No document management  
❌ No half-day support  

### After Enhancement:
✅ **Policy-Based Validation** - Comprehensive rules per leave type  
✅ **Automatic Balance Checking** - Accrual calculation with carry-forward  
✅ **Multi-Level Approval Hierarchy** - Manager → HR → Department Head  
✅ **Approval Delegation** - Temporary reassignment during absence  
✅ **Automated Notifications** - Email + database alerts  
✅ **Document Support** - Upload and track supporting documents  
✅ **Conditional Approvals** - Rules based on duration/type  
✅ **Audit Trail** - Complete logging of all actions  

---

## 📚 Next Steps

### Recommended Enhancements (Phase 3):
1. **Leave Calendar View** - Visual calendar showing team availability
2. **Conflict Detection** - Warn if multiple team members on leave
3. **Leave Encashment** - Process encashment requests
4. **Accrual Job** - Scheduled job to credit leave balances monthly
5. **Carry-Forward Job** - End-of-year carry-forward processing
6. **Leave Reports** - Analytics dashboard for leave patterns
7. **Mobile API** - Endpoints for mobile app leave submission
8. **Bulk Approval** - Approve multiple requests at once
9. **Leave Forecast** - Predict leave usage patterns
10. **Policy Templates** - Pre-built policies for common scenarios

---

**Implementation Status:** ✅ **COMPLETE**  
**Files Created:** 6 (2 migrations, 2 models, 1 controller update, 1 notification)  
**Database Tables:** 2 new tables + 1 updated table  
**Lines of Code:** ~1,200 lines  
**Test Coverage:** Ready for testing (checklist provided)

**Next Phase:** Phase 2, Task 2 - Advanced Payroll System (See HR_MODULE_COMPREHENSIVE_ANALYSIS.md)
