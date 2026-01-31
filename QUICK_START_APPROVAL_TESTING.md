# 🚀 Quick Start Guide: Testing Approval Workflow with Finance Roles

## Test Accounts Ready to Use

### 1. Finance Staff User
```
Email:    finance.staff@test.com
Password: password
Role:     FINANCE_STAFF
Can:      Create expenses, invoices, journal entries
Cannot:   Approve anything (limit: ₱0)
```

### 2. Finance Manager User
```
Email:    finance.manager@test.com
Password: password
Role:     FINANCE_MANAGER
Can:      Create transactions, approve up to ₱50,000
Cannot:   Approve transactions > ₱50,000 (limit: ₱50,000)
```

### 3. Finance Director User
```
Email:    finance.director@test.com
Password: password
Role:     FINANCE_DIRECTOR
Can:      Create and approve ANY transaction amount
Cannot:   Nothing (limit: Unlimited/NULL)
```

---

## Testing Workflow (Step by Step)

### Step 1: Create Finance Staff User (Optional)

If you want to create additional staff via the UI:

1. Login to Shop Owner account
2. Go to **User Access Control** → **Employees** tab
3. Click **Add Employee**
4. Fill in details:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john.doe@company.com`
   - Department: **Finance Staff** ← (NEW OPTION)
5. Click **Add Employee**

New roles now available in dropdown:
- ✅ Finance Staff
- ✅ Finance Manager
- ✅ Finance Director

### Step 2: Create an Expense (As Finance Staff)

1. Login as: **finance.staff@test.com** / **password**
2. Navigate to: **Finance** → **Expense Tracking**
3. Create a new expense:
   - Amount: ₱45,000 (will need approval)
   - Category: Office Supplies
   - Description: Monthly office equipment
4. Submit expense
5. Status should show: 🟡 **Pending Approval**

### Step 3: Approve Expense (As Finance Manager)

1. Login as: **finance.manager@test.com** / **password**
2. Go to: **Finance** → **Approval Workflow**
3. You should see the expense in **Pending Requests** tab
4. Click eye icon to view details
5. Click ✓ **Approve** button
6. Add comment (optional): "Approved for purchase"
7. Confirm approval

Expense should now show: ✅ **Approved**

### Step 4: Approve High-Value Expense (As Finance Director)

1. As **finance.staff@test.com**, create expense for ₱150,000
2. As **finance.manager@test.com**, try to approve:
   - Should see error or warning (exceeds ₱50,000 limit)
3. As **finance.director@test.com**:
   - Go to Approval Workflow
   - Find the ₱150,000 expense
   - Approve it
   - Should succeed (unlimited authority)

### Step 5: Test Rejection

1. As **finance.staff@test.com**, create new expense
2. As **finance.manager@test.com**, go to Approval Workflow
3. Click ✗ **Reject** button
4. Enter required reason: "Budget not approved for this category"
5. Click Reject

Expense should now show: ❌ **Rejected**

---

## Database Verification

### Check Finance Roles Exist
```bash
php artisan tinker
App\Models\User::where('role', 'FINANCE_STAFF')->first()
App\Models\User::where('role', 'FINANCE_MANAGER')->first()
App\Models\User::where('role', 'FINANCE_DIRECTOR')->first()
```

### Check Approval Fields Added
```bash
php artisan tinker
DB::table('finance_expenses')->first()  # Should have: approval_id, requires_approval, created_by
DB::table('finance_invoices')->first()  # Same columns
```

### Check Approval Limit Column
```bash
php artisan tinker
DB::table('users')->where('role', 'FINANCE_STAFF')->first()  # approval_limit = 0
DB::table('users')->where('role', 'FINANCE_MANAGER')->first()  # approval_limit = 50000
DB::table('users')->where('role', 'FINANCE_DIRECTOR')->first()  # approval_limit = NULL
```

---

## Key Points for Implementation

### Approval Thresholds (To be coded in controllers)
```
Transaction Amount | Approval Required | Authority
-------------------+------------------+----------
< ₱10,000         | No                | None
₱10,000 - ₱50,000 | Yes (Level 1)     | Manager
> ₱50,000         | Yes (Level 2)     | Director
```

### Current Features Available
- ✅ Finance role hierarchy created
- ✅ Approval limit enforcement ready
- ✅ User management supports new roles
- ✅ Approval workflow UI functional
- ⏳ Inline approvals in transaction pages (TO DO)
- ⏳ Automatic approval threshold logic (TO DO)
- ⏳ Approval notifications (TO DO)

### Files to Modify for Full Integration

1. **app/Http/Controllers/ExpenseController.php**
   - Add approval creation logic in `store()` method

2. **app/Http/Controllers/InvoiceController.php**
   - Add approval creation logic in `store()` method

3. **resources/js/components/ERP/Finance/Expense.tsx**
   - Add approval status column to table
   - Add inline approve/reject buttons for managers

4. **resources/js/components/ERP/Finance/Invoice.tsx**
   - Same as Expense component

---

## Troubleshooting

### Issue: Can't see Finance Staff/Manager/Director options
**Solution**: 
- Clear browser cache
- Refresh page
- Check UserAccessControl.tsx was updated correctly

### Issue: Approval doesn't appear in list
**Solution**:
- Check ApprovalController routes are registered in web.php
- Verify CSRF token handling in component
- Check browser console for API errors

### Issue: Can't create test accounts
**Solution**:
- Run: `php artisan db:seed --class=FinanceRolesSeeder --force`
- Verify shop_owner_id = 1 exists
- Check users table has approval_limit column

### Issue: Approval status not updating
**Solution**:
- Database migrations may not have run
- Run: `php artisan migrate`
- Check approval_id foreign key exists

---

## Next: Inline Approvals Implementation

To add inline approval buttons in transaction pages:

1. **Check user's approval authority**
   ```tsx
   const canApprove = user.role === 'FINANCE_MANAGER' || user.role === 'FINANCE_DIRECTOR';
   const canApproveAmount = expense.amount <= (user.approval_limit || Infinity);
   ```

2. **Show approval status badge**
   ```tsx
   {expense.requires_approval && (
     <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
       🟡 Awaiting Approval
     </span>
   )}
   ```

3. **Show approve/reject buttons for managers**
   ```tsx
   {canApprove && expense.requires_approval && (
     <>
       <button onClick={() => handleApprove(expense)}>✓ Approve</button>
       <button onClick={() => handleReject(expense)}>✗ Reject</button>
     </>
   )}
   ```

---

**Last Updated**: January 31, 2026
**Status**: Ready for Testing ✅
