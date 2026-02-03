# Integration Testing Guide: Manager ↔ Staff ↔ Finance

**Scope:** End-to-end testing of cross-module workflows between Staff, Finance, and Manager.

---

## 1) Prerequisites
- App is running (Laravel + Vite).
- Database migrated and seeded.
- Test accounts with roles:
  - **STAFF**
  - **FINANCE_STAFF**
  - **FINANCE_MANAGER** or **MANAGER**
- Test data:
  - At least 1 customer
  - At least 1 job order
  - Chart of Accounts configured (revenue + expense accounts)
  - Tax rates (optional)

---

## 2) Login & Role Verification
**Goal:** Ensure role-based access works across modules.

**Steps:**
1. Login as **STAFF** → confirm access to Staff module.
2. Login as **FINANCE_STAFF** → confirm access to Finance module.
3. Login as **MANAGER/FINANCE_MANAGER** → confirm access to Manager + Approvals.

**Expected:**
- No unauthorized errors.
- Each role sees only its allowed modules.

---

## 3) Staff → Finance: Job Completion to Invoice
**Status:** ⚠️ **NOT YET IMPLEMENTED** - Job Orders currently use static data

**Current Limitations:**
- Job Orders component has hardcoded/static data
- No customer-facing interface to create repair orders
- Job completion → Invoice workflow not implemented in UI

**Alternative Test (Manual Invoice Creation):**
1. Login as **FINANCE_STAFF**.
2. Navigate to **Finance → Invoices**.
3. Click **Create Invoice** manually.
4. Fill in customer details and line items.
5. Submit and verify invoice is created.

**Expected (Manual Test):**
- Invoice creation succeeds with 200 OK
- Invoice appears in list with correct status
- No 401 errors on `/api/finance/session/invoices`

**Future Implementation Required:**
- Connect Staff Job Orders to real database
- Implement job completion workflow
- Add "Create Invoice from Job" API endpoint (`POST /api/finance/invoices/from-job`)
- Add UI prompt after job completion

---

## 4) Finance: Verify Auto-Generated Invoice
**Goal:** Finance can view and manage invoice from job.

**Steps:**
1. Login as **FINANCE_STAFF**.
2. Open **Invoices**.
3. Locate the new invoice by reference.
4. Open details and verify:
   - Customer name/email
   - Line items
   - Total amount
   - Job link (if displayed)

**Expected:**
- Invoice appears with correct data.
- No 401/403 errors on invoice APIs.

---

## 5) Finance → Manager: Approval Workflow
**Goal:** Manager can approve finance submissions.

**Steps:**
1. Login as **FINANCE_STAFF**.
2. Create an **Expense** and submit it.
3. (Optional) Submit an **Invoice** for approval if required by policy.
4. Login as **MANAGER/FINANCE_MANAGER**.
5. Open **Approvals** and approve/reject.

**Expected:**
- Pending items appear in approvals list.
- Approve/reject updates status.
- Audit trail is recorded.

---

## 6) Finance Posting: Journal Entry Creation
**Goal:** Approved items generate journal entries when posted.

**Steps:**
1. Login as **FINANCE_STAFF**.
2. Open an **Approved Expense** and click **Post**.
3. Navigate to **Journal Entries**.
4. Locate the corresponding entry.

**Expected:**
- Posting succeeds with 200 OK.
- Journal entry is created and linked to the expense.

---

## 7) Manager Dashboard Metrics
**Goal:** Manager sees real data (not hardcoded).

**Steps:**
1. Login as **MANAGER/FINANCE_MANAGER**.
2. Open **Manager Dashboard**.
3. Verify totals (sales, repairs, pending jobs).
4. Compare with actual data in invoices and jobs.

**Expected:**
- Metrics reflect real data from database.
- No API errors in console.

---

## 8) Permissions & Security
**Goal:** Ensure only allowed roles can perform approvals/posting.

**Checks:**
- **FINANCE_STAFF** cannot approve items.
- **MANAGER/FINANCE_MANAGER** can approve/reject.
- **STAFF** cannot access Finance routes.

**Expected:**
- Unauthorized actions return 403.
- UI hides forbidden actions.

---

## 9) Regression Checks
- Expenses list loads without 401.
- Invoices list loads without 401.
- Journal entries list loads without 401.
- Budget/Tax rate endpoints return 200.

---

## 10) Troubleshooting
- **401 Unauthorized:**
  - Verify session cookies
  - Confirm role on user record
  - Confirm frontend uses `/api/finance/session/*`
- **404 Not Found:**
  - Confirm route exists in `routes/web.php`
  - Clear config cache
- **Approval missing:**
  - Check status is `submitted`
  - Check approval aggregation logic

---

## 11) Sign-off Checklist
- [ ] Staff can complete job and create invoice
- [ ] Finance sees invoice with correct data
- [ ] Finance submits expense for approval
- [ ] Manager approves/rejects successfully
- [ ] Posting creates journal entry
- [ ] Manager dashboard shows real data
- [ ] No 401/403/404 in console
