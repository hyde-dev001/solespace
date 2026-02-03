# Approval Workflow Module

## Overview
The Approval Workflow module provides a comprehensive system for managing multi-level approval processes for financial transactions. It enables organizations to enforce authorization controls before financial operations are executed, ensuring proper oversight and compliance.

## Features

### 1. **Multi-Level Approval System**
- Support for sequential approval levels
- Configurable number of approval stages
- Track progress through approval chain
- Visual level indicators (e.g., "Level 2 of 3")

### 2. **Request Management**
- **Pending Requests**: View all transactions awaiting approval
- **Approval History**: Browse previously approved/rejected requests
- **Search & Filter**: Find requests by reference, description, type, or requester
- **Type Filtering**: Filter by expense, journal entry, invoice, or budget

### 3. **Approval Actions**
- **Approve**: Move request to next level or final approval
- **Reject**: Deny request with mandatory reason
- **View Details**: See complete request information and history
- **Comments**: Add notes during approval/rejection

### 4. **Statistics Dashboard**
- Real-time pending approval count
- Daily approved requests
- Daily rejected requests
- Color-coded status indicators

### 5. **Detailed History Tracking**
- Complete audit trail for each request
- Record of all reviewers and actions
- Timestamps for each approval level
- Comments from each reviewer

### 6. **Request Details View**
- Full transaction information
- Current approval status and level
- Requester information
- Amount and description
- Complete approval history with comments
- Quick approve/reject actions

## Database Schema

### `approvals` Table
| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| shop_owner_id | bigint | Foreign key to users table |
| approvable_type | string | Polymorphic type (e.g., 'App\Models\Expense') |
| approvable_id | bigint | Polymorphic ID |
| reference | string | Reference number (e.g., EXP-001) |
| description | text | Request description |
| amount | decimal(15,2) | Transaction amount |
| requested_by | bigint | User who requested approval |
| reviewed_by | bigint | User who approved/rejected |
| reviewed_at | timestamp | Final review timestamp |
| current_level | integer | Current approval level (1-based) |
| total_levels | integer | Total approval levels required |
| status | enum | pending/approved/rejected/cancelled |
| comments | text | Final approval/rejection comments |
| metadata | json | Additional data |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

### `approval_history` Table
| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| approval_id | bigint | Foreign key to approvals table |
| level | integer | Approval level when action taken |
| reviewer_id | bigint | User who performed action |
| action | enum | approved/rejected |
| comments | text | Reviewer comments |
| created_at | timestamp | Action timestamp |
| updated_at | timestamp | Last update timestamp |

## API Endpoints

### Base Path
- Authenticated: `/api/finance/session/approvals`

### Endpoints

#### 1. Get Pending Approvals
```http
GET /api/finance/session/approvals/pending
```

**Response:**
```json
{
  "approvals": [
    {
      "id": "1",
      "type": "Expense",
      "reference": "EXP-001",
      "description": "Office supplies purchase",
      "amount": 5000.00,
      "requested_by": "John Doe",
      "requested_at": "2026-01-31T10:00:00Z",
      "status": "pending",
      "current_level": 1,
      "total_levels": 2,
      "metadata": {...}
    }
  ]
}
```

#### 2. Get Approval History
```http
GET /api/finance/session/approvals/history
```

**Response:**
```json
{
  "approvals": [
    {
      "id": "2",
      "type": "JournalEntry",
      "reference": "JE-123",
      "description": "Monthly depreciation",
      "amount": 10000.00,
      "requested_by": "Jane Smith",
      "requested_at": "2026-01-30T14:00:00Z",
      "status": "approved",
      "current_level": 2,
      "total_levels": 2,
      "reviewed_by": "Manager Name",
      "reviewed_at": "2026-01-30T16:30:00Z",
      "comments": "Approved as per policy"
    }
  ]
}
```

#### 3. Get Specific Approval History
```http
GET /api/finance/session/approvals/{id}/history
```

**Response:**
```json
{
  "history": [
    {
      "id": "1",
      "approval_id": "1",
      "level": 1,
      "reviewer": "John Manager",
      "action": "approved",
      "comments": "Looks good, forwarding to director",
      "reviewed_at": "2026-01-31T11:00:00Z"
    },
    {
      "id": "2",
      "approval_id": "1",
      "level": 2,
      "reviewer": "Jane Director",
      "action": "approved",
      "comments": "Final approval granted",
      "reviewed_at": "2026-01-31T14:00:00Z"
    }
  ]
}
```

#### 4. Approve Request
```http
POST /api/finance/session/approvals/{id}/approve
Content-Type: application/json

{
  "comments": "Optional approval comments"
}
```

**Response:**
```json
{
  "message": "Request approved successfully",
  "approval": {...}
}
```

#### 5. Reject Request
```http
POST /api/finance/session/approvals/{id}/reject
Content-Type: application/json

{
  "comments": "Required rejection reason"
}
```

**Response:**
```json
{
  "message": "Request rejected",
  "approval": {...}
}
```

## Usage Workflow

### For Requesters

1. **Submit Transaction**: Create expense, journal entry, or invoice that requires approval
2. **System Creates Approval**: Automatically creates approval request in pending state
3. **Track Status**: Monitor approval progress through the workflow
4. **Receive Notification**: Get notified when approved/rejected

### For Approvers

1. **Access Approval Workflow**: Navigate to Finance > Approval Workflow
2. **Review Pending Requests**: See all requests awaiting your approval
3. **View Details**: Click eye icon to see complete request information
4. **Make Decision**:
   - Click green checkmark to **Approve**
   - Click red X to **Reject**
   - Add comments (required for rejection, optional for approval)
5. **Submit**: Confirm your decision
6. **Track History**: View all past approvals in History tab

## Creating Approval Requests (For Developers)

To create an approval request from another controller:

```php
use App\Http\Controllers\ApprovalController;

// Example: Create approval for an expense
$approval = ApprovalController::createApprovalRequest([
    'shop_owner_id' => $shopOwnerId,
    'approvable_type' => 'App\\Models\\Expense',
    'approvable_id' => $expense->id,
    'reference' => $expense->reference,
    'description' => $expense->description,
    'amount' => $expense->amount,
    'requested_by' => Auth::id(),
    'total_levels' => 2, // Number of approval levels required
    'metadata' => [
        'category' => $expense->category,
        'vendor' => $expense->vendor
    ]
]);
```

## Approval Level Configuration

### Recommended Approval Levels by Amount

| Amount Range | Levels | Approvers |
|--------------|--------|-----------|
| < ₱10,000 | 1 | Department Manager |
| ₱10,000 - ₱50,000 | 2 | Manager → Director |
| ₱50,000 - ₱200,000 | 3 | Manager → Director → CFO |
| > ₱200,000 | 4 | Manager → Director → CFO → CEO |

**Note**: Implement this logic in your transaction creation controllers based on your organization's policies.

## Security Features

### 1. **Authentication Required**
- All endpoints require user authentication
- Session-based authentication via `auth:user` middleware

### 2. **Shop Isolation**
- Users can only see/approve requests for their shop
- Enforced through `shop_owner_id` filtering

### 3. **Authorization Checks**
- Verify user has permission to approve at current level
- Prevent self-approval (implement in controller if needed)

### 4. **Audit Trail**
- Complete history of all actions
- Timestamps and user tracking
- Comments preserved

### 5. **Concurrent Request Protection**
- Database-level locking prevents race conditions
- Transaction-safe approval processing

## Customization

### Adding Approval Logic to Controllers

To integrate approval workflow with your existing controllers:

1. **Before Posting/Processing**: Check if approval is required
2. **Create Approval Request**: Use `ApprovalController::createApprovalRequest()`
3. **Hold Transaction**: Don't process until approved
4. **Execute on Approval**: Implement in `ApprovalController::executeApprovalAction()`

Example in ExpenseController:

```php
public function store(Request $request)
{
    // Validate and create expense
    $expense = Expense::create($validated);
    
    // Check if approval is required (e.g., based on amount)
    if ($expense->amount > 10000) {
        // Create approval request instead of processing
        ApprovalController::createApprovalRequest([
            'shop_owner_id' => $shopOwnerId,
            'approvable_type' => 'App\\Models\\Expense',
            'approvable_id' => $expense->id,
            'reference' => $expense->reference,
            'description' => $expense->description,
            'amount' => $expense->amount,
            'requested_by' => Auth::id(),
            'total_levels' => $this->getApprovalLevels($expense->amount)
        ]);
        
        // Set expense status to pending approval
        $expense->update(['status' => 'pending_approval']);
        
        return response()->json([
            'message' => 'Expense submitted for approval'
        ]);
    }
    
    // Process immediately if no approval needed
    $this->processExpense($expense);
}
```

### Implementing Approval Actions

In `ApprovalController::executeApprovalAction()`, add your business logic:

```php
private function executeApprovalAction(Approval $approval)
{
    switch ($approval->approvable_type) {
        case 'App\\Models\\Expense':
            $expense = Expense::find($approval->approvable_id);
            if ($expense) {
                // Create journal entry for the expense
                $this->postExpenseToJournal($expense);
                $expense->update(['status' => 'approved']);
            }
            break;
            
        case 'App\\Models\\JournalEntry':
            $journalEntry = JournalEntry::find($approval->approvable_id);
            if ($journalEntry) {
                $journalEntry->update(['status' => 'posted']);
                // Update account balances
                $this->updateAccountBalances($journalEntry);
            }
            break;
            
        // Add more cases as needed
    }
}
```

## UI Components

### Status Badges
- **Pending**: Yellow background with clock icon
- **Approved**: Green background with checkmark
- **Rejected**: Red background with X icon
- **Cancelled**: Gray background

### Type Badges
- **Expense**: Blue
- **Journal Entry**: Purple
- **Invoice**: Emerald
- **Budget**: Orange

### Action Buttons
- **View Details**: Blue eye icon - Opens detail modal
- **Approve**: Green checkmark - Opens approval dialog
- **Reject**: Red X - Opens rejection dialog with required comments

## Troubleshooting

### Approval Not Showing in List
1. Check `shop_owner_id` matches user's shop
2. Verify status is 'pending' for pending list
3. Check user has permission to view approvals

### Cannot Approve/Reject
1. Verify user is authenticated
2. Check CSRF token is being sent
3. Ensure request hasn't been processed already
4. Verify user has appropriate role/permissions

### Approval Action Not Executing
1. Check `executeApprovalAction()` method implementation
2. Verify `approvable_type` and `approvable_id` are correct
3. Check Laravel logs for errors
4. Ensure related model exists in database

### Missing Approval History
1. Verify `ApprovalHistory` records are being created
2. Check foreign key relationships
3. Ensure approval_id is correct

## Best Practices

1. **Set Appropriate Levels**: Configure approval levels based on amount and risk
2. **Require Comments on Rejection**: Always enforce rejection reasons
3. **Notify Users**: Implement email/notification system for approvals
4. **Prevent Self-Approval**: Add logic to prevent users from approving their own requests
5. **Time Limits**: Consider implementing expiration for pending approvals
6. **Escalation**: Add automatic escalation for overdue approvals
7. **Delegate Authority**: Implement delegation when approvers are unavailable
8. **Audit Compliance**: Preserve complete audit trail for compliance requirements

## Future Enhancements

1. **Email Notifications**: Send emails when approval is required/completed
2. **Mobile Approval**: Quick approve/reject from mobile app
3. **Batch Approval**: Approve multiple requests at once
4. **Approval Templates**: Pre-configured workflows by transaction type
5. **Conditional Routing**: Dynamic approval paths based on criteria
6. **Delegation**: Allow approvers to delegate authority
7. **Expiration**: Auto-cancel/escalate old pending requests
8. **Analytics**: Reports on approval times, bottlenecks, patterns
9. **Integration**: Connect with external approval systems
10. **Parallel Approval**: Support concurrent approval from multiple reviewers

## Related Documentation
- [Finance Module Guide](./FINANCE_MODULE_ANALYSIS.md)
- [Expense Tracking](./EXPENSE_TO_JOURNAL_WORKFLOW.md)
- [Journal Entries](./API_DOCUMENTATION.md)
- [Role Permissions](./ROLE_PERMISSIONS.md)

## Support
For issues or questions about the Approval Workflow module, contact the development team or refer to the main project documentation.
