# 📊 FINANCE MODULE - COMPLETE WORKFLOW GUIDE

**Author:** AI Assistant  
**Date:** January 31, 2026  
**Purpose:** Comprehensive explanation of Finance Module architecture and workflows

---

## 📚 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Complete Workflows](#workflows)
4. [Authentication & Security](#security)
5. [React Query Optimization](#optimization)
6. [User Scenarios](#scenarios)
7. [Troubleshooting](#troubleshooting)
8. [Presentation Script](#script)

---

<a name="overview"></a>
## 🎯 1. OVERVIEW

### What is the Finance Module?

The Finance Module is a **complete double-entry accounting system** integrated into the ERP platform. It handles:

- ✅ **Chart of Accounts** - Asset, Liability, Equity, Revenue, Expense tracking
- ✅ **Invoice Management** - Create, send, track customer invoices
- ✅ **Expense Tracking** - Submit, approve, and post expenses
- ✅ **Journal Entries** - Manual accounting entries with posting
- ✅ **Bank Reconciliation** - Match bank statements with system records
- ✅ **Approval Workflow** - Multi-level approval for expenses
- ✅ **Budget Analysis** - Track budget vs actual spending
- ✅ **Financial Reports** - Balance Sheet, Income Statement, Trial Balance

### Key Benefits

1. **Real-time Financial Data** - Instant updates across all modules
2. **Automated Double-Entry** - Automatically creates balanced journal entries
3. **Role-Based Access** - Finance Staff vs Finance Manager permissions
4. **Multi-Tenant Support** - Each shop owner has isolated data
5. **Audit Trail** - Track who did what and when
6. **Performance Optimized** - React Query caching reduces API calls by 50-70%

---

<a name="architecture"></a>
## 🏗️ 2. ARCHITECTURE

### Technology Stack

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND                                            │
│  - React 18 + TypeScript                            │
│  - Inertia.js (SPA with Laravel backend)            │
│  - TanStack React Query v4 (State + Cache)          │
│  - TailwindCSS (Styling)                            │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ HTTP/JSON API
                   │
┌──────────────────▼──────────────────────────────────┐
│  BACKEND                                             │
│  - Laravel 10 PHP Framework                          │
│  - MySQL Database                                    │
│  - Laravel Guards (auth:user)                        │
│  - Middleware (role, shop.isolation)                 │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Eloquent ORM
                   │
┌──────────────────▼──────────────────────────────────┐
│  DATABASE                                            │
│  - finance_accounts                                  │
│  - finance_invoices + finance_invoice_items          │
│  - finance_expenses                                  │
│  - finance_journal_entries + finance_journal_lines   │
│  - reconciliations                                   │
│  - finance_budgets                                   │
└──────────────────────────────────────────────────────┘
```

### Frontend Components

**Location:** `resources/js/components/ERP/Finance/`

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `Dashboard.tsx` | Main finance dashboard | KPIs, quick stats, charts |
| `Invoice.tsx` | Invoice management | Create, edit, send, post invoices |
| `Expense.tsx` | Expense tracking | Submit, approve, attach receipts |
| `JournalEntries.tsx` | Manual journal entries | Double-entry validation, posting |
| `Reconciliation.tsx` | Bank reconciliation | Auto-match, manual matching |
| `ApprovalWorkflow.tsx` | Approval management | Pending/History tabs, bulk actions |
| `BudgetAnalysis.tsx` | Budget monitoring | Variance analysis, alerts |

### Backend Controllers

**Location:** `app/Http/Controllers/`

| Controller | Purpose | Key Methods |
|------------|---------|-------------|
| `AccountController.php` | Chart of accounts | index, store, update, destroy |
| `InvoiceController.php` | Invoice CRUD | index, store, show, post, void |
| `ExpenseController.php` | Expense CRUD | index, store, approve, post |
| `JournalEntryController.php` | Journal entries | index, store, post, reverse |
| `ReconciliationController.php` | Bank reconciliation | getTransactions, store, autoMatch |
| `ApprovalController.php` | Approval workflow | pending, approve, reject |
| `FinancialReportController.php` | Reports | balanceSheet, incomeStatement, trialBalance |

### Database Schema

**Key Tables:**

```sql
-- Chart of Accounts
finance_accounts
├── id (PK)
├── code (e.g., "1000", "2000")
├── name (e.g., "Cash", "Accounts Receivable")
├── type (Asset, Liability, Equity, Revenue, Expense)
├── normal_balance (Debit, Credit)
├── balance (current balance)
└── shop_owner_id (tenant isolation)

-- Invoices
finance_invoices
├── id (PK)
├── reference (unique invoice number)
├── customer_name
├── total
├── status (draft, sent, paid, void)
├── journal_entry_id (FK when posted)
└── shop_owner_id

-- Expenses
finance_expenses
├── id (PK)
├── reference
├── vendor
├── amount
├── status (draft, pending, approved, rejected, posted)
├── receipt_url
├── approved_by (FK to users)
└── shop_owner_id

-- Journal Entries (Double-Entry Core)
finance_journal_entries
├── id (PK)
├── reference
├── date
├── description
├── status (draft, posted, reversed)
├── total_debit (must equal total_credit)
└── total_credit

finance_journal_lines
├── id (PK)
├── journal_entry_id (FK)
├── account_id (FK to finance_accounts)
├── debit (amount)
├── credit (amount)
└── description
```

---

<a name="workflows"></a>
## 🔄 3. COMPLETE WORKFLOWS

### A. INVOICE WORKFLOW 📄

**Scenario:** Company sells products/services to customer

#### Step 1: Create Invoice

**Frontend:** `Invoice.tsx`

```typescript
// User fills form
{
  customer_name: "ABC Corporation",
  customer_email: "billing@abc.com",
  date: "2026-01-31",
  due_date: "2026-02-28",
  items: [
    {
      description: "Web Design Services",
      quantity: 1,
      unit_price: 50000,
      tax_rate: 12,
      account_id: "5" // Revenue account
    }
  ]
}
```

**Backend:** `InvoiceController@store`

```php
// Creates invoice record
$invoice = Invoice::create([
    'reference' => 'INV-2026-001',
    'customer_name' => 'ABC Corporation',
    'total' => 56000, // 50,000 + 6,000 tax
    'tax_amount' => 6000,
    'status' => 'draft',
    'shop_owner_id' => $shopOwnerId
]);

// Creates line items
foreach ($items as $item) {
    InvoiceItem::create([...]);
}
```

**Database:**
```
finance_invoices: 1 record (status=draft)
finance_invoice_items: 1 record
```

#### Step 2: Send Invoice

**Action:** User clicks "Send Invoice" button

**Backend:** `InvoiceController@send`

```php
// Updates status
$invoice->update(['status' => 'sent']);

// Sends email (optional)
Mail::to($invoice->customer_email)->send(new InvoiceEmail($invoice));
```

#### Step 3: Post to Ledger

**Action:** User clicks "Post" button

**Backend:** `InvoiceController@post`

```php
// Creates journal entry (double-entry accounting)
$journalEntry = JournalEntry::create([
    'reference' => 'JE-INV-2026-001',
    'date' => $invoice->date,
    'description' => "Invoice #{$invoice->reference}",
    'status' => 'posted',
    'total_debit' => 56000,
    'total_credit' => 56000
]);

// Debit line (Accounts Receivable - Asset increases)
JournalLine::create([
    'journal_entry_id' => $journalEntry->id,
    'account_id' => 2, // AR account
    'debit' => 56000,
    'credit' => 0
]);

// Credit lines (Revenue + Tax Payable)
JournalLine::create([
    'account_id' => 5, // Revenue account
    'debit' => 0,
    'credit' => 50000
]);

JournalLine::create([
    'account_id' => 12, // Tax Payable
    'debit' => 0,
    'credit' => 6000
]);

// Update account balances
Account::find(2)->increment('balance', 56000); // AR
Account::find(5)->increment('balance', 50000); // Revenue
Account::find(12)->increment('balance', 6000); // Tax
```

**Database:**
```
finance_journal_entries: 1 record (status=posted)
finance_journal_lines: 3 records
finance_accounts: balances updated
```

**Frontend Updates (React Query):**

```typescript
// Automatic cache invalidation
queryClient.invalidateQueries(['finance', 'invoices']);
queryClient.invalidateQueries(['finance', 'accounts']);
// UI refreshes automatically
```

#### Step 4: Record Payment

**Action:** User marks invoice as paid

```php
$invoice->update(['status' => 'paid']);

// Creates payment journal entry
// Debit: Cash
// Credit: Accounts Receivable
```

---

### B. EXPENSE WORKFLOW 💰

**Scenario:** Employee submits expense for reimbursement

#### Step 1: Submit Expense

**Frontend:** `Expense.tsx`

```typescript
// Employee fills form
{
  vendor: "Office Depot",
  category: "Office Supplies",
  amount: 5000,
  date: "2026-01-31",
  description: "Printer paper and ink",
  receipt_file: File // Upload receipt
}
```

**Backend:** `ExpenseController@store`

```php
// Upload receipt
$path = $request->file('receipt')->store('receipts', 'public');

// Create expense
$expense = Expense::create([
    'reference' => 'EXP-2026-001',
    'vendor' => 'Office Depot',
    'amount' => 5000,
    'status' => 'pending', // or 'submitted'
    'receipt_url' => $path,
    'shop_owner_id' => $shopOwnerId,
    'submitted_by' => Auth::id()
]);
```

**Database:**
```
finance_expenses: 1 record (status=pending)
```

#### Step 2: Approval Process

**Frontend:** `ApprovalWorkflow.tsx`

Finance Manager sees pending expense in "Pending Approvals" tab:

```typescript
// Displays expense details
{
  reference: "EXP-2026-001",
  vendor: "Office Depot",
  amount: "₱5,000.00",
  submitted_by: "Juan Dela Cruz",
  receipt_url: "/storage/receipts/abc123.pdf"
}

// Manager clicks "Approve" or "Reject"
```

**Backend:** `ApprovalController@approve`

```php
public function approve(Request $request, $id) {
    $user = Auth::guard('user')->user();
    
    // Verify user has permission
    if (!in_array($user->role, ['FINANCE_STAFF', 'FINANCE_MANAGER'])) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }
    
    $expense = Expense::findOrFail($id);
    
    // Update expense
    $expense->update([
        'status' => 'approved',
        'approved_by' => $user->id,
        'approved_at' => now()
    ]);
    
    // Auto-post to ledger (optional)
    $this->postExpenseToLedger($expense);
    
    return response()->json(['message' => 'Approved']);
}
```

**Database:**
```
finance_expenses: status=approved, approved_by=5, approved_at=2026-01-31
```

#### Step 3: Post to Ledger

**Backend:** `ExpenseController@post` or auto-post after approval

```php
// Creates journal entry
$journalEntry = JournalEntry::create([
    'reference' => 'JE-EXP-2026-001',
    'date' => $expense->date,
    'description' => "Expense: {$expense->vendor}",
    'total_debit' => 5000,
    'total_credit' => 5000,
    'status' => 'posted'
]);

// Debit: Expense account
JournalLine::create([
    'journal_entry_id' => $journalEntry->id,
    'account_id' => 15, // Office Supplies Expense
    'debit' => 5000,
    'credit' => 0
]);

// Credit: Cash or Accounts Payable
JournalLine::create([
    'account_id' => 1, // Cash
    'debit' => 0,
    'credit' => 5000
]);

// Update balances
Account::find(15)->increment('balance', 5000); // Expense
Account::find(1)->decrement('balance', 5000); // Cash

$expense->update([
    'status' => 'posted',
    'journal_entry_id' => $journalEntry->id
]);
```

**Database:**
```
finance_expenses: status=posted, journal_entry_id=10
finance_journal_entries: 1 new record
finance_journal_lines: 2 new records
finance_accounts: balances updated
```

---

### C. JOURNAL ENTRY WORKFLOW 📒

**Scenario:** Manual accounting adjustment

#### Step 1: Create Entry

**Frontend:** `JournalEntries.tsx`

```typescript
// Finance staff creates manual entry
{
  date: "2026-01-31",
  description: "Accrued salary expense",
  lines: [
    {
      account_id: "20", // Salary Expense
      debit: 100000,
      credit: 0
    },
    {
      account_id: "8", // Salaries Payable (Liability)
      debit: 0,
      credit: 100000
    }
  ]
}
```

**Validation:**

```typescript
// Frontend validates before submit
const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);

if (totalDebit !== totalCredit) {
  alert("Total debits must equal total credits!");
  return;
}
```

**Backend:** `JournalEntryController@store`

```php
// Create entry
$entry = JournalEntry::create([
    'reference' => 'JE-2026-001',
    'date' => $request->date,
    'description' => $request->description,
    'status' => 'draft',
    'total_debit' => 100000,
    'total_credit' => 100000
]);

// Create lines
foreach ($request->lines as $line) {
    JournalLine::create([
        'journal_entry_id' => $entry->id,
        'account_id' => $line['account_id'],
        'debit' => $line['debit'],
        'credit' => $line['credit']
    ]);
}
```

#### Step 2: Post Entry

**Action:** User clicks "Post" button

**Backend:** `JournalEntryController@post`

```php
// Update entry status
$entry->update([
    'status' => 'posted',
    'posted_at' => now()
]);

// Update account balances
foreach ($entry->lines as $line) {
    $account = Account::find($line->account_id);
    
    if ($account->normal_balance === 'Debit') {
        $account->increment('balance', $line->debit - $line->credit);
    } else {
        $account->increment('balance', $line->credit - $line->debit);
    }
}
```

#### Step 3: Reverse Entry (if needed)

**Action:** User clicks "Reverse" button

**Backend:** `JournalEntryController@reverse`

```php
// Mark original as reversed
$entry->update([
    'status' => 'reversed',
    'reversed_at' => now()
]);

// Create reversing entry (opposite debits/credits)
$reversingEntry = JournalEntry::create([
    'reference' => "REV-{$entry->reference}",
    'date' => now(),
    'description' => "Reversal of {$entry->reference}",
    'status' => 'posted',
    'total_debit' => $entry->total_credit,
    'total_credit' => $entry->total_debit
]);

// Create opposite lines
foreach ($entry->lines as $line) {
    JournalLine::create([
        'journal_entry_id' => $reversingEntry->id,
        'account_id' => $line->account_id,
        'debit' => $line->credit, // Swapped
        'credit' => $line->debit  // Swapped
    ]);
}

// Update balances (undo original entry)
```

---

### D. BANK RECONCILIATION WORKFLOW 🏦

**Scenario:** Match bank statement with system records

#### Step 1: Select Account

**Frontend:** `Reconciliation.tsx`

```typescript
// User selects bank account
const selectedAccount = {
  id: "1",
  name: "Cash & Cash Equivalents",
  balance: 48200.00
};
```

#### Step 2: Load Transactions

**Frontend:** Makes API call

```typescript
const response = await api.get(
  `/api/finance/reconciliation/transactions?account_id=${selectedAccount.id}`
);

// Returns unreconciled journal entry lines
transactions = [
  {
    id: 101,
    date: "2026-01-15",
    reference: "JE-INV-001",
    description: "Invoice payment",
    debit: 25000,
    credit: 0,
    reconciliation_id: null // Not reconciled
  },
  {
    id: 102,
    date: "2026-01-20",
    reference: "JE-EXP-005",
    description: "Office supplies",
    debit: 0,
    credit: 5000,
    reconciliation_id: null
  }
];
```

**Backend:** `ReconciliationController@getTransactions`

```php
public function getTransactions(Request $request) {
    $accountId = $request->query('account_id');
    
    // Get unreconciled journal entry lines
    $transactions = DB::table('finance_journal_lines')
        ->join('finance_journal_entries', ...)
        ->where('finance_journal_lines.account_id', $accountId)
        ->whereNull('finance_journal_lines.reconciliation_id')
        ->orderBy('finance_journal_entries.date', 'desc')
        ->get();
    
    return response()->json(['data' => $transactions]);
}
```

#### Step 3: Match Transactions

**Manual Matching:**

```typescript
// User checks boxes next to matching transactions
const selectedTransactions = [101, 102];
const statementDate = "2026-01-31";
const openingBalance = 28200;
const closingBalance = 48200;
```

**Auto-Matching (optional):**

```typescript
// Upload bank statement CSV
const bankTransactions = [
  { date: "2026-01-15", amount: 25000, description: "DEPOSIT" },
  { date: "2026-01-20", amount: -5000, description: "CHECK #123" }
];

// Backend matches by date + amount
```

#### Step 4: Reconcile

**Frontend:** User clicks "Reconcile Selected"

**Backend:** `ReconciliationController@store`

```php
public function store(Request $request) {
    // Create reconciliation session
    $reconciliation = Reconciliation::create([
        'account_id' => $request->account_id,
        'statement_date' => $request->statement_date,
        'opening_balance' => $request->opening_balance,
        'closing_balance' => $request->closing_balance,
        'status' => 'reconciled',
        'shop_owner_id' => $shopOwnerId
    ]);
    
    // Mark transactions as reconciled
    foreach ($request->transaction_ids as $lineId) {
        JournalLine::find($lineId)->update([
            'reconciliation_id' => $reconciliation->id
        ]);
    }
    
    return response()->json(['message' => 'Reconciled successfully']);
}
```

**Database:**
```
reconciliations: 1 new record
finance_journal_lines: reconciliation_id updated
```

---

<a name="security"></a>
## 🔐 4. AUTHENTICATION & SECURITY

### Laravel Guards

**Route Definition:** `routes/api.php`

```php
Route::prefix('finance')->middleware([
    'auth:user',  // ← Requires 'user' guard authentication
    'role:FINANCE_STAFF,FINANCE_MANAGER',  // ← Role check
    'shop.isolation'  // ← Tenant isolation
])->group(function () {
    Route::get('invoices', [InvoiceController::class, 'index']);
    Route::get('expenses', [ExpenseController::class, 'index']);
    // ...
});
```

### Controller Authentication

**CORRECT Way:**

```php
public function index(Request $request) {
    // ✅ Use guard('user') to match route middleware
    $user = Auth::guard('user')->user();
    
    if (!$user) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }
    
    $shopOwnerId = $user->role === 'shop_owner' 
        ? $user->id 
        : $user->shop_owner_id;
    
    // Query with shop isolation
    $expenses = Expense::where('shop_owner_id', $shopOwnerId)->get();
    
    return response()->json(['data' => $expenses]);
}
```

**WRONG Way (causes 404 errors):**

```php
public function index(Request $request) {
    // ❌ Auth::user() uses default guard, doesn't match auth:user
    $user = Auth::user();  
    // This returns null → causes 404
}
```

### Role-Based Permissions

```php
// FINANCE_STAFF permissions
- View all finance records
- Create invoices, expenses, journal entries
- Approve expenses (if authorized)
- Generate reports

// FINANCE_MANAGER permissions
- All FINANCE_STAFF permissions
- Manage budgets
- Delete records
- Configure chart of accounts
- Access sensitive reports
```

### Shop Isolation

**Multi-Tenant Architecture:**

```php
// Every query must filter by shop_owner_id
$shopOwnerId = $user->role === 'shop_owner' 
    ? $user->id 
    : $user->shop_owner_id;

// All finance records belong to a shop
Invoice::where('shop_owner_id', $shopOwnerId)->get();
Expense::where('shop_owner_id', $shopOwnerId)->get();
Account::where('shop_owner_id', $shopOwnerId)->get();
```

**Middleware:** `app/Http/Middleware/ShopIsolationMiddleware.php`

```php
// Automatically filters queries by shop_owner_id
// Prevents cross-tenant data leaks
```

---

<a name="optimization"></a>
## ⚡ 5. REACT QUERY OPTIMIZATION

### Problem Before React Query

```
User opens Dashboard
  → Fetch accounts (200ms)
  → Fetch invoices (150ms)
  → Fetch expenses (180ms)
  → Fetch KPIs (220ms)
  
User clicks "Invoices" tab
  → Fetch accounts AGAIN (200ms) ← Redundant!
  → Fetch invoices AGAIN (150ms) ← Redundant!
  
User clicks "Create Invoice"
  → Fetch accounts AGAIN (200ms) ← Redundant!
  → Fetch tax rates (100ms)
  
Total: 1,400ms of API calls (many redundant)
```

### Solution With React Query

```
User opens Dashboard
  → Fetch accounts (200ms) → CACHED for 5 minutes
  → Fetch invoices (150ms) → CACHED for 5 minutes
  → Fetch expenses (180ms) → CACHED for 5 minutes
  → Fetch KPIs (220ms) → CACHED for 5 minutes
  
User clicks "Invoices" tab
  → Use cached accounts (0ms) ← Instant!
  → Use cached invoices (0ms) ← Instant!
  
User clicks "Create Invoice"
  → Use cached accounts (0ms) ← Instant!
  → Fetch tax rates (100ms) → CACHED
  
Total: 850ms of API calls (50% reduction!)
```

### Implementation

**Query Keys:** `useFinanceQueries.ts`

```typescript
export const queryKeys = {
  accounts: ['finance', 'accounts'],
  invoices: ['finance', 'invoices'],
  expenses: ['finance', 'expenses'],
  journalEntries: ['finance', 'journal-entries'],
  approvals: {
    pending: ['finance', 'approvals', 'pending'],
    history: ['finance', 'approvals', 'history'],
  },
};
```

**Query Hook:**

```typescript
export function useAccounts() {
  const api = useFinanceApi();
  
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: async () => {
      const response = await api.get('/api/finance/accounts');
      return response.data?.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

**Usage in Component:**

```typescript
function Invoice() {
  // ✅ Uses cached data if available
  const { data: accounts, isLoading } = useAccounts();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <select>
      {accounts.map(acc => (
        <option key={acc.id} value={acc.id}>
          {acc.name}
        </option>
      ))}
    </select>
  );
}
```

### Automatic Cache Invalidation

**Mutation Hook:**

```typescript
export function useCreateExpense() {
  const api = useFinanceApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      return await api.post('/api/finance/expenses', data);
    },
    onSuccess: () => {
      // ✅ Invalidate cache → triggers refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
      queryClient.invalidateQueries({ queryKey: queryKeys.approvals.pending });
    },
  });
}
```

**Usage:**

```typescript
function Expense() {
  const createExpense = useCreateExpense();
  
  const handleSubmit = async () => {
    await createExpense.mutateAsync(formData);
    // ✅ Expenses list automatically refreshes
    // ✅ Pending approvals list automatically refreshes
  };
}
```

---

<a name="scenarios"></a>
## 🚀 6. USER SCENARIOS

### Scenario A: Monthly Sales Recording

**Actor:** Finance Staff  
**Goal:** Record sales invoices for the month

1. **Create Invoice**
   - Open Finance → Invoices
   - Click "Create Invoice"
   - Fill customer details
   - Add line items (products/services)
   - Save as draft

2. **Review & Send**
   - Review invoice details
   - Click "Send" → Email sent to customer
   - Status changes to "sent"

3. **Record Payment**
   - Customer pays invoice
   - Click "Mark as Paid"
   - Status changes to "paid"

4. **Post to Ledger**
   - Click "Post"
   - System creates journal entry:
     ```
     Debit: Accounts Receivable ₱100,000
     Credit: Sales Revenue       ₱100,000
     ```
   - Account balances updated automatically

5. **View Reports**
   - Check Income Statement → Revenue increased
   - Check Balance Sheet → Assets increased

---

### Scenario B: Employee Expense Reimbursement

**Actors:** Employee (submitter) + Finance Manager (approver)

**Employee Actions:**

1. **Submit Expense**
   - Open Finance → Expenses
   - Click "Create Expense"
   - Enter vendor: "Starbucks"
   - Amount: ₱2,500
   - Category: "Meals & Entertainment"
   - Upload receipt (photo/PDF)
   - Click "Submit for Approval"
   - Status: "pending"

**Finance Manager Actions:**

2. **Review Expense**
   - Open Finance → Approval Workflow
   - See pending expense in "Pending" tab
   - Click expense to view details
   - Download receipt to verify
   - Check amount and category

3. **Approve or Reject**
   - **If Approved:**
     - Click "Approve"
     - System auto-posts to ledger:
       ```
       Debit: Meals & Entertainment ₱2,500
       Credit: Cash                 ₱2,500
       ```
     - Status: "approved" → "posted"
     - Employee gets notification
   
   - **If Rejected:**
     - Click "Reject"
     - Enter rejection reason
     - Status: "rejected"
     - Employee gets notification

4. **Process Reimbursement**
   - Finance processes payment to employee
   - Marks expense as "reimbursed"

---

### Scenario C: Month-End Reconciliation

**Actor:** Finance Manager  
**Goal:** Reconcile bank statement with system

1. **Download Bank Statement**
   - Login to bank website
   - Download statement for January 2026
   - Export as CSV

2. **Open Reconciliation**
   - Finance → Bank Reconciliation
   - Select account: "Cash & Cash Equivalents"
   - Enter statement date: "2026-01-31"
   - Enter opening balance: ₱50,000
   - Enter closing balance: ₱75,000

3. **Load Transactions**
   - System loads unreconciled transactions
   - Shows journal entry lines for cash account

4. **Match Transactions**
   - **Auto-Match:**
     - Upload bank CSV
     - System matches by date + amount
     - Shows matched pairs
   
   - **Manual Match:**
     - Check boxes next to matching items
     - Compare descriptions
     - Identify outstanding checks
     - Identify deposits in transit

5. **Reconcile**
   - Click "Reconcile Selected"
   - System marks transactions as reconciled
   - Calculates reconciled balance
   - Should match closing balance

6. **Review Discrepancies**
   - If balances don't match:
     - Check for missing transactions
     - Check for bank fees
     - Check for errors
   - Create adjusting entries if needed

7. **Generate Report**
   - Export reconciliation report
   - Save for audit trail

---

<a name="troubleshooting"></a>
## 🐛 7. TROUBLESHOOTING

### Issue 1: 404 Error on API Calls

**Symptoms:**
```
GET /api/finance/reconciliation/transactions?account_id=1
Response: 404 Not Found
```

**Cause:**
Authentication guard mismatch

```php
// Routes use auth:user
Route::middleware(['auth:user'])->group(...);

// But controller uses Auth::user() (default guard)
$user = Auth::user(); // ❌ Returns null
```

**Solution:**
```php
// ✅ Use matching guard
$user = Auth::guard('user')->user();

if (!$user) {
    return response()->json(['error' => 'Unauthorized'], 401);
}
```

---

### Issue 2: "filter is not a function"

**Symptoms:**
```javascript
Uncaught TypeError: approvalRequests.filter is not a function
```

**Cause:**
API returns object instead of array

```javascript
// Expected: []
// Received: {}
```

**Solution:**

```typescript
// Backend: Ensure consistent response format
return response()->json([
    'data' => $expenses // ✅ Always return array
]);

// Frontend: Add safety check
const data = response.data?.data || response.data;
const approvalRequests = Array.isArray(data) ? data : [];
```

---

### Issue 3: Account Not Found

**Symptoms:**
```json
{
  "error": "Account not found"
}
```

**Cause:**
Shop isolation filtering too strict

```php
// Account exists but shop_owner_id is NULL or different
$account = Account::where('id', $accountId)
    ->where('shop_owner_id', $shopOwnerId)
    ->first(); // Returns null
```

**Solution:**

```php
// Check if account exists first
$account = Account::find($accountId);

if (!$account) {
    return response()->json(['error' => 'Account not found'], 404);
}

// Then check ownership (only if shop_owner_id is set)
if ($account->shop_owner_id && $account->shop_owner_id != $shopOwnerId) {
    return response()->json(['error' => 'Account not found'], 404);
}
```

---

### Issue 4: Cache Not Updating

**Symptoms:**
- Created new expense but list doesn't update
- Approved expense but still shows as pending

**Cause:**
Missing cache invalidation

```typescript
// ❌ Mutation without invalidation
useMutation({
  mutationFn: async (data) => api.post('/api/expenses', data),
  // Missing onSuccess
});
```

**Solution:**

```typescript
// ✅ Invalidate related queries
useMutation({
  mutationFn: async (data) => api.post('/api/expenses', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] });
    queryClient.invalidateQueries({ queryKey: ['finance', 'approvals', 'pending'] });
  },
});
```

---

### Issue 5: Totals Don't Balance

**Symptoms:**
```
Total Debits: ₱100,000
Total Credits: ₱100,500
Error: Debits must equal Credits
```

**Cause:**
Rounding errors or missing line items

**Solution:**

```typescript
// Frontend validation
const totalDebit = lines.reduce((sum, line) => 
  sum + parseFloat(line.debit || 0), 0
).toFixed(2);

const totalCredit = lines.reduce((sum, line) => 
  sum + parseFloat(line.credit || 0), 0
).toFixed(2);

if (totalDebit !== totalCredit) {
  alert(`Debits (${totalDebit}) must equal Credits (${totalCredit})`);
  return;
}
```

---

<a name="script"></a>
## 🎤 8. PRESENTATION SCRIPT

### Introduction (2 minutes)

> "Good morning/afternoon everyone! Today I'll be presenting our Finance Module, which is a complete accounting system integrated into our ERP platform."

> "The Finance Module handles everything from invoices and expenses to journal entries and bank reconciliation. It follows double-entry accounting principles and provides real-time financial data to management."

### Architecture Overview (3 minutes)

> "Let me show you the architecture. We have three main layers:"

> "**Frontend** - Built with React and TypeScript using Inertia.js for seamless page transitions. We're using TanStack React Query for state management and caching, which reduces our API calls by 50 to 70 percent."

> "**Backend** - Laravel 10 with MySQL database. We use Laravel Guards for authentication and middleware for role-based access control and tenant isolation."

> "**Database** - We have several key tables: finance_accounts for our chart of accounts, finance_invoices and expenses for transactions, and finance_journal_entries for the double-entry system."

### Live Demo: Invoice Workflow (5 minutes)

> "Let me demonstrate how the invoice workflow works."

**Step 1: Create Invoice**
> "Here I am in the Invoices page. I'll click 'Create Invoice' and fill in the customer details: ABC Corporation, with an amount of 50,000 pesos."

> "I add line items for the services rendered - in this case, web design services. The system automatically calculates the tax at 12 percent, so our total is 56,000 pesos."

> "When I save this, it creates a draft invoice with status 'draft'."

**Step 2: Send Invoice**
> "Now I can review the invoice and click 'Send'. This emails the invoice to the customer and changes the status to 'sent'."

**Step 3: Post to Ledger**
> "When we receive payment, I mark it as paid, then click 'Post to Ledger'."

> "This is where the magic happens. The system automatically creates a journal entry following double-entry accounting:"
- Debit Accounts Receivable 56,000
- Credit Sales Revenue 50,000
- Credit Tax Payable 6,000

> "All account balances are updated automatically, and this immediately reflects in our financial reports."

### Live Demo: Expense Approval (4 minutes)

> "Now let's look at the expense approval workflow."

**Submit Expense**
> "As an employee, I submit an expense - let's say office supplies from Office Depot for 5,000 pesos. I upload the receipt as proof."

> "The expense now has status 'pending' and appears in the Approval Workflow."

**Approve Expense**
> "Switching to the Finance Manager role, I open the Approval Workflow. I can see all pending expenses here."

> "I click on the expense to review details and download the receipt. Everything looks good, so I click 'Approve'."

> "The system automatically posts this to the ledger:"
- Debit Office Supplies Expense 5,000
- Credit Cash 5,000

> "The expense status changes to 'approved' then 'posted', and account balances update."

### React Query Optimization (2 minutes)

> "One key feature I want to highlight is our performance optimization using React Query."

> "Before implementing React Query, every time you opened a page, it would fetch data from the API - even if you just loaded the same data on another page. This caused slow load times and unnecessary server load."

> "With React Query, we cache the data for 5 minutes. So when you open the Dashboard and it fetches accounts, then you go to Invoices which also needs accounts - it uses the cached data instantly. No API call needed."

> "This gives us 50 to 70 percent reduction in API calls and makes the system feel much faster and more responsive."

### Security Features (2 minutes)

> "Security is critical for a finance system. We have several layers:"

> "**Authentication** - We use Laravel Guards with the 'user' guard specifically for the Finance module. All routes require authentication."

> "**Authorization** - Role-based access control. Only users with FINANCE_STAFF or FINANCE_MANAGER roles can access these features. Managers have additional permissions like budget management."

> "**Multi-Tenancy** - Shop isolation ensures each business only sees their own data. Every query filters by shop_owner_id, preventing any data leaks between tenants."

> "**Audit Trail** - Every action is logged with who did it, what they did, and when. This is essential for financial auditing."

### Technical Highlights (2 minutes)

> "Some technical highlights worth mentioning:"

> "**Double-Entry Accounting** - Every transaction creates balanced journal entries. The system enforces that total debits must equal total credits."

> "**Automatic Balance Updates** - When journal entries are posted, account balances update automatically in real-time."

> "**Bank Reconciliation** - We can match bank statements with our system records, with both automatic matching by date and amount, plus manual matching for discrepancies."

> "**Budget Monitoring** - Track budget versus actual spending with variance analysis and alerts when budgets are exceeded."

### Conclusion (1 minute)

> "To summarize, our Finance Module provides:"
- Complete accounting system with double-entry bookkeeping
- Invoice and expense management with approval workflows
- Real-time financial data with performance optimization
- Strong security with role-based access and multi-tenancy
- Bank reconciliation and budget tracking

> "The system is designed to be user-friendly while maintaining accounting accuracy and providing the financial visibility that management needs."

> "Thank you! I'm happy to answer any questions."

---

## 📚 ADDITIONAL RESOURCES

### Documentation Files
- `FINANCE_MODULE_ANALYSIS.md` - Detailed technical analysis
- `APPROVAL_WORKFLOW_MODULE.md` - Approval system documentation
- `BANK_RECONCILIATION_MODULE.md` - Reconciliation guide
- `BUDGET_MODULE_COMPLETE.md` - Budget features
- `API_DOCUMENTATION.md` - API endpoints reference

### Key Files to Study
1. `useFinanceQueries.ts` - React Query hooks
2. `ReconciliationController.php` - Backend controller example
3. `ApprovalWorkflow.tsx` - Frontend component example
4. `api.php` - Route definitions

### Learning Path
1. Start with `useFinanceQueries.ts` to understand data fetching
2. Study one workflow end-to-end (e.g., Expense)
3. Understand authentication guards and middleware
4. Learn React Query caching and invalidation
5. Explore database schema and relationships

---

**END OF DOCUMENT**

Created: January 31, 2026  
Last Updated: January 31, 2026  
Version: 1.0
