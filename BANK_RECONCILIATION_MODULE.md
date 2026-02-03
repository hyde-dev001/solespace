# Bank Reconciliation Module

## Overview
The Bank Reconciliation module allows businesses to match their internal accounting records (journal entries) with external bank statements to ensure accuracy and identify discrepancies.

## Features

### 1. Account Selection
- Select bank or cash accounts from the chart of accounts
- Filter to show only Asset-type accounts (Bank, Cash)
- Display current account balance

### 2. Statement Upload
- **CSV Upload**: Import bank statement data in CSV format
- **Required Format**: Date, Description, Reference, Debit, Credit, Balance
- **Validation**: Automatic parsing and validation of uploaded data

### 3. Transaction Matching

#### Manual Matching
- Select transactions from both bank statement and journal entries
- Match multiple transactions at once
- Visual status indicators:
  - **Unmatched** (Gray): Transactions not yet reconciled
  - **Matched** (Yellow): Transactions paired but not finalized
  - **Reconciled** (Green): Finalized matched transactions

#### Auto-Match
- Intelligent matching algorithm that automatically pairs transactions based on:
  - **Amount matching**: Debit/Credit amounts must match (within 0.01 tolerance)
  - **Date proximity**: Transactions within 3 days of each other
- One-click auto-match for efficiency

### 4. Real-Time Statistics
- **Matched (Bank)**: Count of matched bank transactions
- **Unmatched (Bank)**: Count of unmatched bank transactions
- **Matched (Journal)**: Count of matched journal entries
- **Unmatched (Journal)**: Count of unmatched journal entries

### 5. Balance Validation
- Opening balance tracking
- Closing balance verification
- Difference calculation and warning display
- Visual alerts for discrepancies

### 6. Reconciliation Completion
- Complete reconciliation even with unmatched transactions
- Warning prompts for incomplete reconciliation
- Timestamp and user tracking for audit trail

## User Interface

### Setup Section
- Bank account dropdown
- Statement date picker
- Opening/Closing balance inputs
- CSV file upload with drag-and-drop
- Auto-Match button

### Matching Interface
Two-column layout:
- **Left Column**: Bank Transactions
  - Checkboxes for selection
  - Date, Description, Amount columns
  - Status badges
  - Bulk selection support

- **Right Column**: Journal Entries
  - Checkboxes for selection
  - Date, Reference, Amount columns
  - Status badges
  - Bulk selection support

### Action Buttons
- **Match Selected**: Pair selected transactions
- **Complete Reconciliation**: Finalize the reconciliation process

## Database Schema

### Table: `reconciliations`
```sql
- id: Primary key
- account_id: Foreign key to finance_accounts
- journal_entry_line_id: Foreign key to finance_journal_lines
- bank_transaction_reference: Reference from bank statement
- statement_date: Date of the bank statement
- opening_balance: Statement opening balance
- closing_balance: Statement closing balance
- reconciled_by: User who performed reconciliation
- reconciled_at: Timestamp of reconciliation
- status: pending|matched|reconciled|discrepancy
- shop_owner_id: For multi-tenancy
- notes: Optional notes
- created_at, updated_at: Timestamps
```

### Indexes
- account_id (for fast account filtering)
- statement_date (for date range queries)
- status (for filtering by reconciliation status)
- shop_owner_id (for tenant isolation)

## API Endpoints

### GET `/api/finance/reconciliation/transactions`
**Purpose**: Fetch journal entry lines for a specific account

**Parameters**:
- `account_id` (required): The account to reconcile

**Response**:
```json
{
  "success": true,
  "transactions": [
    {
      "id": "123",
      "date": "2026-01-15",
      "reference": "INV-001",
      "description": "Customer payment",
      "debit": 1000.00,
      "credit": 0.00,
      "account_name": "Bank Account",
      "status": "unreconciled"
    }
  ]
}
```

### POST `/api/finance/reconciliation`
**Purpose**: Save reconciliation matches

**Body**:
```json
{
  "account_id": "1",
  "statement_date": "2026-01-31",
  "opening_balance": 5000.00,
  "closing_balance": 6000.00,
  "matches": [
    {
      "bank_transaction_id": "bank-1",
      "journal_entry_line_id": "123"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Reconciliation completed successfully",
  "reconciliations": [...]
}
```

### GET `/api/finance/reconciliation/history`
**Purpose**: View past reconciliation sessions

**Parameters**:
- `account_id` (optional): Filter by account

**Response**:
```json
{
  "success": true,
  "sessions": [
    {
      "id": "1",
      "account_name": "Bank Account",
      "statement_date": "2026-01-31",
      "opening_balance": 5000.00,
      "closing_balance": 6000.00,
      "reconciled_at": "2026-01-31 15:30:00",
      "reconciled_by": "John Doe",
      "transaction_count": 15
    }
  ]
}
```

### DELETE `/api/finance/reconciliation/{id}/unmatch`
**Purpose**: Reverse/unmatch a reconciliation

**Response**:
```json
{
  "success": true,
  "message": "Reconciliation unmatched successfully"
}
```

## Security

### Authorization
- Role-based access: Requires `FINANCE` role
- Shop isolation: Users can only reconcile accounts belonging to their shop
- User tracking: All reconciliations record who performed them

### Validation
- Account ownership verification
- Foreign key constraints on database level
- Input sanitization and validation

## Usage Workflow

### Step 1: Select Account
1. Navigate to Finance → Bank Reconciliation
2. Select the bank account to reconcile
3. Enter statement date and balances

### Step 2: Upload Statement
1. Click "Upload Bank Statement (CSV)"
2. Select CSV file with format: Date, Description, Reference, Debit, Credit, Balance
3. System parses and displays transactions

### Step 3: Match Transactions
**Option A - Manual Matching**:
1. Select one or more bank transactions (left column)
2. Select corresponding journal entries (right column)
3. Click "Match Selected"

**Option B - Auto-Match**:
1. Click "Auto-Match" button
2. System automatically pairs matching transactions
3. Review auto-matched results

### Step 4: Review & Complete
1. Check summary statistics at the top
2. Review any unmatched transactions
3. Investigate discrepancies if shown
4. Click "Complete Reconciliation"
5. Confirm action in popup

## Best Practices

### Before Reconciliation
- Ensure all journal entries for the period are entered
- Have bank statement ready in CSV format
- Review account balance for obvious discrepancies

### During Reconciliation
- Use auto-match first for bulk matching
- Manually review auto-matched transactions
- Investigate unmatched transactions before completing
- Add notes for unusual discrepancies

### After Reconciliation
- Export reconciliation report for records
- Follow up on unmatched transactions
- Schedule regular reconciliations (monthly recommended)

## Troubleshooting

### Issue: Auto-match finds no matches
**Cause**: Date or amount differences
**Solution**: 
- Check date format in CSV upload
- Verify amounts match exactly
- Try manual matching for timing differences

### Issue: Transactions missing from journal entries
**Cause**: Entries not yet recorded in system
**Solution**:
- Create missing journal entries first
- Then retry reconciliation

### Issue: Balance difference won't resolve
**Cause**: Missing or duplicate transactions
**Solution**:
- Review unmatched transactions carefully
- Check for bank fees, interest not recorded
- Look for duplicate entries in system

## Future Enhancements

### Planned Features
- [ ] PDF bank statement upload with OCR
- [ ] Reconciliation report generation
- [ ] Scheduled automatic reconciliation
- [ ] Email notifications for discrepancies
- [ ] Multi-currency support
- [ ] Bank API integration for automatic statement import
- [ ] Reconciliation templates for recurring patterns
- [ ] Advanced search and filtering
- [ ] Batch unmatch operations
- [ ] Audit trail viewer

### Performance Optimizations
- [ ] Pagination for large transaction lists
- [ ] Virtual scrolling for performance
- [ ] Caching of frequently accessed accounts
- [ ] Background processing for auto-match

## Technical Notes

### Frontend Components
- **File**: `resources/js/components/ERP/Finance/Reconciliation.tsx`
- **Framework**: React with TypeScript
- **State Management**: useState hooks
- **HTTP**: Fetch API with credentials

### Backend Components
- **Controller**: `app/Http/Controllers/ReconciliationController.php`
- **Model**: `app/Models/Reconciliation.php`
- **Migration**: `database/migrations/2026_01_31_100000_create_reconciliations_table.php`
- **Routes**: `routes/api.php` (under /api/finance/reconciliation)

### Dependencies
- Laravel Framework
- MySQL Database
- Inertia.js
- SweetAlert2 (for popups)
- Tailwind CSS (for styling)

## Support
For issues or questions about the Bank Reconciliation module, contact the finance team or submit a ticket through the system.
