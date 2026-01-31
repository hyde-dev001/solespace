# Finance Module Analysis & ERP Workflow Implementation Plan

## Current State Overview

### Backend Structure
**Models:**
- `Account.php` - Chart of accounts with parent-child hierarchy, balance tracking
- `JournalEntry.php` - Journal entries (draft/posted/void status)
- `JournalLine.php` - Individual debit/credit lines within entries

**Controllers:**
- `AccountController` - CRUD for accounts, ledger retrieval with running balance
- `JournalEntryController` - Create, update, post, void journal entries

**Tables:**
- `finance_accounts` - Code, name, type (Asset/Liability/Equity/Revenue/Expense), balance, hierarchy
- `finance_journal_entries` - Reference, date, status (draft/posted/void), timestamps
- `finance_journal_lines` - Account mapping with debit/credit amounts, memo, tax field (unused)

### Frontend Components
1. **JournalEntries.tsx** (1820 lines)
   - Journal entry list, form, and posting workflow
   - Account selection with tree view
   - Debit/credit line management
   - Status filtering (draft/posted/void)

2. **ChartoOfAccounts.tsx** (1035 lines)
   - Account hierarchy visualization
   - Account ledger view
   - Tree-based account structure

3. **Other Pages** (partially designed, static data)
   - Invoice.tsx, Expense.tsx, createInvoice.tsx
   - FinancialReporting.tsx, BudgetAnalysis.tsx

---

## Current Functionality Assessment

### ✅ What's Working
1. **Journal Entry Workflow**
   - Create draft entries with multiple lines
   - Line balance validation (debits = credits)
   - Post to ledger (status change to "posted")
   - Void posted entries with reason tracking

2. **Account Management**
   - Create accounts with unique codes
   - Account hierarchy (parent-child relationships)
   - Ledger view with running balance calculation
   - Filter by type, status, search by code/name

3. **Debit/Credit System**
   - Proper accounting equation enforcement
   - Running balance calculations
   - Account balance updates on posting

4. **Audit Trail**
   - AuditLog integration for account/entry creation
   - Shop isolation (shop_owner_id tracking)

### ⚠️ What's Missing / Incomplete

| Feature | Status | Impact |
|---------|--------|--------|
| **Invoice Module** | UI designed, no backend | Can't create invoices → accounts |
| **Expense Module** | UI designed, no backend | Can't track expenses → accounts |
| **Financial Reports** | UI designed, no calculation logic | Can't generate P&L, Balance Sheet |
| **Budget Module** | UI designed, no implementation | Can't set/track budgets |
| **Multi-currency** | Not implemented | Limited for international operations |
| **Tax Calculation** | Tax field exists but unused | Can't auto-calculate GST/VAT |
| **Approval Workflow** | Approval notes in schema, not enforced | No multi-step authorization |
| **Cost Center Allocation** | Not implemented | Can't allocate expenses by department |
| **Link to Invoices/Expenses** | Schema field exists (linked_invoice_id), not used | Manual entry only |
| **Recurring Transactions** | Not implemented | Manual data entry for repeating items |
| **Entry Templates** | Not implemented | No speed-up for common entries |

---

## Recommended ERP Workflow Implementation

### Phase 1: Core Automation (Invoices & Expenses)
**Goal:** Auto-generate journal entries from business documents

```
Invoices:
  Sales Invoice → Auto-create JE: Debit AR (asset), Credit Revenue
  Purchase Invoice → Auto-create JE: Debit Expense/Asset, Credit AP (liability)

Expenses:
  Expense Report → Auto-create JE: Debit Expense, Credit Bank/CC Payable
```

**Key Entities to Add:**
- `Invoice` model with line items (product/qty/price/tax)
- `Expense` model with categories and tax tracking
- `JournalEntry` auto-generation methods
- Approval workflow states

---

### Phase 2: Financial Reporting (Real-Time Views)
**Reports to Add:**
1. **Balance Sheet** - Assets = Liabilities + Equity
2. **P&L Statement** - Revenues - Expenses = Net Income
3. **Trial Balance** - Verify debits = credits
4. **Accounts Receivable Aging** - By invoice age
5. **Accounts Payable Aging** - By due date

---

### Phase 3: Advanced Features (Operational Intelligence)
- **Recurring Transactions** - Automate monthly rent, salaries, subscriptions
- **Cost Center Allocation** - Track expenses by department/project
- **Budget vs Actual** - Monitor variance reporting
- **Cash Flow Forecast** - Project liquidity
- **Entry Templates** - Speed up data entry for common transactions

---

## Database Schema Enhancements Needed

### New Tables Required

```sql
-- Invoices
CREATE TABLE invoices (
  id BIGINT PRIMARY KEY,
  reference VARCHAR(100) UNIQUE,
  customer_id BIGINT,
  date DATE,
  due_date DATE,
  total DECIMAL(18,2),
  tax_amount DECIMAL(18,2),
  status ENUM('draft','sent','paid','overdue','cancelled'),
  journal_entry_id BIGINT,
  created_at, updated_at, deleted_at
);

-- Invoice Line Items
CREATE TABLE invoice_items (
  id BIGINT PRIMARY KEY,
  invoice_id BIGINT,
  product_id BIGINT,
  description VARCHAR(255),
  quantity DECIMAL(10,2),
  unit_price DECIMAL(18,2),
  tax_rate DECIMAL(5,2),
  amount DECIMAL(18,2),
  account_id BIGINT (for revenue account)
);

-- Expenses
CREATE TABLE expenses (
  id BIGINT PRIMARY KEY,
  reference VARCHAR(100),
  date DATE,
  vendor_id BIGINT,
  category_id BIGINT,
  amount DECIMAL(18,2),
  tax_amount DECIMAL(18,2),
  status ENUM('draft','submitted','approved','posted','rejected'),
  journal_entry_id BIGINT,
  approved_by BIGINT,
  approved_at TIMESTAMP,
  cost_center_id BIGINT
);

-- Recurring Transactions
CREATE TABLE recurring_transactions (
  id BIGINT PRIMARY KEY,
  reference VARCHAR(100),
  frequency ENUM('daily','weekly','monthly','quarterly','yearly'),
  next_due_date DATE,
  journal_template JSON,
  is_active BOOLEAN
);

-- Cost Centers
CREATE TABLE cost_centers (
  id BIGINT PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  name VARCHAR(255),
  manager_id BIGINT,
  budget_amount DECIMAL(18,2)
);

-- Budget Plans
CREATE TABLE budgets (
  id BIGINT PRIMARY KEY,
  period VARCHAR(20), -- "2026-Q1", "2026-FY"
  account_id BIGINT,
  budgeted_amount DECIMAL(18,2)
);
```

---

## API Endpoints to Build

### Invoice Module
```
POST   /api/finance/invoices              - Create invoice
GET    /api/finance/invoices              - List invoices (with filtering)
GET    /api/finance/invoices/{id}         - Get invoice detail
PATCH  /api/finance/invoices/{id}         - Update (draft only)
POST   /api/finance/invoices/{id}/send    - Send to customer
POST   /api/finance/invoices/{id}/post    - Post to journal
DELETE /api/finance/invoices/{id}         - Delete (draft only)
```

### Expense Module
```
POST   /api/finance/expenses              - Create expense
GET    /api/finance/expenses              - List expenses
PATCH  /api/finance/expenses/{id}         - Update (draft only)
POST   /api/finance/expenses/{id}/approve - Approve expense
POST   /api/finance/expenses/{id}/post    - Post to journal
POST   /api/finance/expenses/{id}/reject  - Reject with reason
```

### Reports
```
GET    /api/finance/reports/balance-sheet     - Balance sheet for date range
GET    /api/finance/reports/profit-loss       - P&L statement
GET    /api/finance/reports/trial-balance     - Trial balance
GET    /api/finance/reports/ar-aging          - AR aging report
GET    /api/finance/reports/ap-aging          - AP aging report
```

---

## Frontend Component Improvements

### Current Issues
1. **JournalEntries.tsx is 1820 lines** - Needs refactoring into smaller components
2. **Static mock data** - Fully replaced with API (✓ already done)
3. **No invoice/expense integration** - Will be added when backend ready

### Component Refactoring Plan
```
FINANCE/
├── Shared/
│   ├── AccountSelect.tsx (extracted)
│   ├── DebitCreditInput.tsx (new)
│   ├── TaxCalculator.tsx (new)
│   └── DateRangePicker.tsx (new)
├── JournalEntries/
│   ├── JournalEntries.tsx (parent)
│   ├── JournalEntryList.tsx (table)
│   ├── JournalEntryForm.tsx (create/edit)
│   └── JournalEntryPreview.tsx (review before post)
├── Invoices/
│   ├── Invoices.tsx (list)
│   ├── InvoiceForm.tsx (create/edit)
│   └── InvoicePreview.tsx
├── Expenses/
│   ├── Expenses.tsx (list)
│   ├── ExpenseForm.tsx (create/edit)
│   └── ExpenseApprovalQueue.tsx
└── Reports/
    ├── BalanceSheet.tsx
    ├── ProfitLoss.tsx
    ├── TrialBalance.tsx
    └── AgeingReports.tsx
```

---

## Implementation Roadmap

### Week 1: Invoice Module
- [ ] Create Invoice & InvoiceItem models
- [ ] Migrations for invoices & items tables
- [ ] InvoiceController (CRUD + auto-journal)
- [ ] Frontend: InvoiceForm, InvoiceList components
- [ ] Link journal entries to invoices

### Week 2: Expense Module  
- [ ] Create Expense model
- [ ] Expense approval workflow (draft → submitted → approved → posted)
- [ ] ExpenseController with multi-step actions
- [ ] Frontend: ExpenseForm, ApprovalQueue
- [ ] Auto-journal on approval

### Week 3: Financial Reports
- [x] Trial Balance calculation endpoint
- [x] Balance Sheet report
- [x] P&L Statement report
- [x] AR/AP Aging reports
- [x] Frontend report components with charts

### Week 4: Advanced Features
- [ ] Recurring transactions
- [ ] Cost center allocation
- [ ] Budget vs Actual reports
- [ ] Entry templates
- [ ] Recurring execution scheduler (cron)

---

## Business Logic Rules to Enforce

### Accounting Principles
1. **Double-Entry Bookkeeping**: Every transaction must balance (debits = credits)
2. **Account Types**: 
   - Assets: Debit increases, credit decreases
   - Liabilities: Debit decreases, credit increases
   - Equity: Debit decreases, credit increases
   - Revenue: Debit decreases, credit increases
   - Expenses: Debit increases, credit decreases

3. **Status Workflow**:
   ```
   Draft → Posted → (if needed) → Void
   Draft → (can be deleted/edited)
   Posted → (read-only, can only void)
   Void → (locked, shows reason)
   ```

4. **Post-Posting Immutability**: Posted entries cannot be edited, only voided

### Tax Handling
- Auto-calculate tax on invoices (GST/VAT by jurisdiction)
- Tax tracking on expenses
- Tax summary reports

### Period Closing
- Month-end closure prevents retroactive entries
- Audit trail of closing actions
- Adjustment entries for accruals/depreciation

---

## Testing Strategy

### Unit Tests (Backend)
```php
// Account balance calculations
AccountTest::testAccountBalanceUpdatesOnJournalPost()

// Invoice to Journal conversion
InvoiceTest::testInvoiceGeneratesCorrectJournalEntry()

// Approval workflow
ExpenseTest::testExpenseApprovalWorkflow()

// Report calculations
ReportTest::testBalanceSheetCalculations()
```

### Integration Tests (Frontend)
```javascript
// Full invoice-to-journal workflow
test('Create invoice → Auto-generate journal → Verify accounts updated')

// Approval with notification
test('Submit expense → Approve → Journal posted → Account balance changed')
```

---

## Success Metrics

Once implemented, the finance module should support:
- ✅ 100% of accounting transactions automated (no manual journal entry)
- ✅ Real-time balance visibility across all accounts
- ✅ Multi-step approval workflows for compliance
- ✅ Comprehensive audit trail for every transaction
- ✅ Financial reports accurate to the dollar
- ✅ Month-end close process automatable
- ✅ Tax compliance (GST/VAT calculations)
- ✅ Cost center allocation for operational analysis

---

## Next Action
When ready, I'll implement Phase 1 (Invoice & Expense modules) with full backend APIs and frontend components.
