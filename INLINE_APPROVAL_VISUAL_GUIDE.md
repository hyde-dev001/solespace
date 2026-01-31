# 🎨 Inline Approval Visual Guide

## UI Layout - Inline Buttons in Tables

### Expense Tracking Table
```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ Finance → Expense Tracking                                                                   │
├─────────┬──────────────┬───────────────┬─────────────┬────────────┬──────────────┬──────────┤
│ Date    │ Category     │ Description   │ Vendor      │ Amount     │ Status       │ Actions  │
├─────────┼──────────────┼───────────────┼─────────────┼────────────┼──────────────┼──────────┤
│ 1/31/26 │ Office       │ Supplies      │ ABC Corp    │ ₱35,000    │ 🟡 Awaiting  │ ✅ ✗ 👁️  │
│         │ Supplies     │               │             │            │ Approval     │ 🗑️      │
├─────────┼──────────────┼───────────────┼─────────────┼────────────┼──────────────┼──────────┤
│ 1/30/26 │ Travel       │ Flight to     │ Airline     │ ₱15,000    │ ✅ Approved  │ 👁️ 📝   │
│         │              │ Manila        │             │            │              │ 🗑️      │
├─────────┼──────────────┼───────────────┼─────────────┼────────────┼──────────────┼──────────┤
│ 1/29/26 │ Meals        │ Team lunch    │ Restaurant  │ ₱5,000     │ ❌ Rejected  │ 👁️      │
│         │              │               │             │            │              │ 🗑️      │
└─────────┴──────────────┴───────────────┴─────────────┴────────────┴──────────────┴──────────┘

Legend:
✅ = Approve (green)    ✗ = Reject (red)      👁️ = View (blue)
📝 = Post (green)       🗑️ = Delete (red)      🟡 = Awaiting Approval (yellow)
✅ = Approved (green)   ❌ = Rejected (red)
```

---

## Action Button Behavior

### By User Role and Transaction Amount

#### Finance Staff (No Authority)
```
┌──────────────┬──────────────────────────────────────┐
│ Transaction  │ Action Buttons Shown                  │
├──────────────┼──────────────────────────────────────┤
│ ₱10,000      │ 👁️ (view only - no approve/reject)   │
│ ₱50,000      │ 👁️ (view only - no approve/reject)   │
│ ₱100,000     │ 👁️ (view only - no approve/reject)   │
└──────────────┴──────────────────────────────────────┘
```

#### Finance Manager (₱50k Limit)
```
┌──────────────┬──────────────────────────────────────────────────┐
│ Transaction  │ Action Buttons                                    │
├──────────────┼──────────────────────────────────────────────────┤
│ ₱10,000      │ ✅ (enabled)  ✗ (enabled)  👁️  🗑️                 │
│              │                                                   │
│ ₱50,000      │ ✅ (enabled)  ✗ (enabled)  👁️  🗑️                 │
│              │                                                   │
│ ₱75,000      │ ✅ (disabled)    ✗ (enabled)  👁️  🗑️              │
│              │ "Exceeds limit" ↑                                │
│              │                                                   │
│ ₱100,000     │ ✅ (disabled)    ✗ (enabled)  👁️  🗑️              │
│              │ "Exceeds limit" ↑                                │
└──────────────┴──────────────────────────────────────────────────┘
```

#### Finance Director (Unlimited)
```
┌──────────────┬──────────────────────────────────────┐
│ Transaction  │ Action Buttons Shown                  │
├──────────────┼──────────────────────────────────────┤
│ ₱10,000      │ ✅ (enabled)  ✗ (enabled)  👁️  🗑️    │
│ ₱50,000      │ ✅ (enabled)  ✗ (enabled)  👁️  🗑️    │
│ ₱100,000     │ ✅ (enabled)  ✗ (enabled)  👁️  🗑️    │
│ ₱500,000     │ ✅ (enabled)  ✗ (enabled)  👁️  🗑️    │
└──────────────┴──────────────────────────────────────┘
```

---

## Status Badge Colors & Meanings

### Color Coding System

```
🟡 YELLOW - Awaiting Approval
   └─ Action: Manager/Director must review
   └─ Next Step: Click ✅ Approve or ✗ Reject

✅ GREEN - Approved
   └─ Status: Ready to proceed
   └─ Next Step: Can be posted to ledger

❌ RED - Rejected
   └─ Status: Needs revision
   └─ Next Step: Staff creates corrected version

🟦 GRAY - Other Status
   └─ Status: Draft, Posted, etc
   └─ Next Step: Depends on specific status
```

### Visual Examples

```
Row 1:  🟡 Awaiting Approval     ← Interactive (has approve/reject)
        ├─ Created by Finance Staff
        ├─ Waiting for Manager review
        └─ Shows [✅] [✗] action buttons

Row 2:  ✅ Approved              ← Completed
        ├─ Approved by Manager
        ├─ Ready for posting
        └─ Shows [📝 Post] action button

Row 3:  ❌ Rejected              ← Blocked
        ├─ Rejected by Manager
        ├─ Reason: "Missing documentation"
        └─ Staff must create new version

Row 4:  💾 Draft                 ← Not submitted
        ├─ Still being edited
        ├─ Not submitted for approval
        └─ Shows [✏️ Edit] [🗑️ Delete] buttons
```

---

## User Flow Diagrams

### Approval Workflow (Happy Path)

```
┌─────────────────────────────────┐
│ Finance Staff                   │
│ Create Expense (₱35,000)        │
└────────────────┬────────────────┘
                 │
                 ↓
        ┌────────────────┐
        │ Status: 🟡     │
        │ Awaiting       │
        │ Approval       │
        └────────┬───────┘
                 │
                 ↓
    ┌────────────────────────────┐
    │ Finance Manager            │
    │ Sees "Awaiting Approval"   │
    │ Amount ₱35,000 (OK limit)  │
    └────────┬───────────────────┘
             │
             ↓
    ┌────────────────────────────┐
    │ Click ✅ Approve Button    │
    │ Modal: "Add comment"       │
    │ Type: "Approved"           │
    │ Click: Confirm             │
    └────────┬───────────────────┘
             │
             ↓
        ┌────────────────┐
        │ Status: ✅     │
        │ Approved       │
        └────────┬───────┘
                 │
                 ↓
    ┌────────────────────────────┐
    │ Can now be Posted          │
    │ Click [📝 Post] to Ledger  │
    └────────────────────────────┘
```

### Rejection Workflow

```
┌─────────────────────────────────┐
│ Finance Staff                   │
│ Create Invoice (Missing Data)   │
└────────────────┬────────────────┘
                 │
                 ↓
        ┌────────────────┐
        │ Status: 🟡     │
        │ Awaiting       │
        │ Approval       │
        └────────┬───────┘
                 │
                 ↓
    ┌────────────────────────────┐
    │ Finance Manager            │
    │ Reviews Invoice            │
    │ Notices: Missing PO#       │
    └────────┬───────────────────┘
             │
             ↓
    ┌────────────────────────────┐
    │ Click ✗ Reject Button      │
    │ Modal: "Reason (required)" │
    │ Type: "Missing PO number"  │
    │ Click: Confirm             │
    └────────┬───────────────────┘
             │
             ↓
        ┌────────────────┐
        │ Status: ❌     │
        │ Rejected       │
        └────────┬───────┘
                 │
                 ↓
    ┌────────────────────────────┐
    │ Finance Staff              │
    │ Creates new Invoice        │
    │ With PO number             │
    │ Resubmits (starts over)    │
    └────────────────────────────┘
```

### High-Value Transaction (Manager Can't Approve)

```
┌──────────────────────────────────────┐
│ Finance Staff                        │
│ Create Purchase (₱75,000)            │
└────────────────┬─────────────────────┘
                 │
                 ↓
        ┌────────────────────┐
        │ Status: 🟡         │
        │ Awaiting Approval  │
        │ Amount: ₱75,000    │
        └────────┬───────────┘
                 │
                 ↓
    ┌──────────────────────────────────┐
    │ Finance Manager                  │
    │ Sees Transaction                 │
    │ Amount ₱75,000 > Limit ₱50,000   │
    └────────┬────────────────────────┘
             │
             ↓
    ┌──────────────────────────────────┐
    │ ✅ Approve Button: DISABLED      │
    │ Tooltip: "Exceeds approval       │
    │          limit of ₱50,000"       │
    │                                  │
    │ ✗ Reject Button: ENABLED         │
    │                                  │
    │ Action: Forward to Director      │
    └────────┬────────────────────────┘
             │
             ↓
    ┌──────────────────────────────────┐
    │ Finance Director                 │
    │ Sees Transaction                 │
    │ Amount ₱75,000 (Unlimited OK)    │
    └────────┬────────────────────────┘
             │
             ↓
    ┌──────────────────────────────────┐
    │ ✅ Approve Button: ENABLED       │
    │ Click to Approve                 │
    │ Modal: Add comment               │
    │ Confirm                          │
    └────────┬────────────────────────┘
             │
             ↓
        ┌────────────────┐
        │ Status: ✅     │
        │ Approved       │
        └────────────────┘
```

---

## Button State Reference

### Approve Button States

```
STATE 1: VISIBLE & ENABLED ✅
├─ User: Finance Manager or Finance Director
├─ Amount: Within approval limit
├─ Status: Awaiting Approval (🟡)
├─ Appearance: Green checkmark, clickable
└─ Action: Opens approval modal with optional comment

STATE 2: VISIBLE BUT DISABLED 🚫
├─ User: Finance Manager
├─ Amount: Exceeds ₱50,000 limit
├─ Reason: Manager lacks authority for this amount
├─ Appearance: Gray checkmark, faded, disabled cursor
└─ Tooltip: "Exceeds approval limit of ₱50,000"

STATE 3: HIDDEN ❌
├─ User: Finance Staff
├─ Reason: No approval authority
├─ Status: Button element not rendered
└─ Alternative: N/A
```

### Reject Button States

```
STATE 1: VISIBLE & ENABLED ✅
├─ User: Finance Manager or Finance Director
├─ Status: Awaiting Approval (🟡)
├─ Appearance: Red X, clickable
└─ Action: Opens rejection modal with required reason

STATE 2: VISIBLE BUT DISABLED 🚫
├─ Rare, only if system error
├─ Should always be enabled for authorized users
└─ N/A

STATE 3: HIDDEN ❌
├─ User: Finance Staff
├─ Reason: No approval authority
└─ Button element not rendered
```

---

## Transaction Status Timeline

### Complete Lifecycle

```
Timeline:
─────────────────────────────────────────────────────────────────

CREATE
  │
  └─→ 💾 Draft
      │ (Finance Staff editing)
      │
      └─→ Submitted/Ready
          │ (Staff clicks Submit)
          │
          ├─→ 🟡 Awaiting Approval
          │   │ (Needs Manager/Director review)
          │   │
          │   ├─→ ✅ Approved
          │   │   │ (Manager/Director approved)
          │   │   │
          │   │   └─→ 📝 Posted to Ledger
          │   │       │ (Financial records updated)
          │   │       │
          │   │       └─→ ✔️ Complete
          │   │
          │   └─→ ❌ Rejected
          │       │ (Manager/Director rejected with reason)
          │       │
          │       └─→ Need Revision
          │           │ (Staff creates corrected version)
          │           │
          │           └─→ Resubmit (back to 🟡)

Notes:
- 🟡 Awaiting Approval: Interactive stage (has buttons)
- ✅ Approved: Non-interactive stage (no approval buttons)
- ❌ Rejected: Blocked stage (staff must create new)
```

---

## Color Scheme Reference

### Tailwind Colors Used

```
Status Badge Colors:
├─ 🟡 Awaiting Approval (bg-yellow-100 / text-yellow-800)
├─ ✅ Approved (bg-green-100 / text-green-800)
├─ ❌ Rejected (bg-red-100 / text-red-800)
└─ Other (bg-gray-100 / text-gray-800)

Button Colors:
├─ ✅ Approve (text-green-600 hover:bg-green-50)
├─ ✗ Reject (text-red-600 hover:bg-red-50)
├─ 👁️ View (text-blue-600 hover:bg-blue-50)
├─ 📝 Post (text-green-600 hover:bg-green-50)
└─ 🗑️ Delete (text-red-600 hover:bg-red-50)

Dark Mode:
├─ Badges: dark:bg-[color]-900/30 dark:text-[color]-400
├─ Buttons: dark:text-[color]-400 dark:hover:bg-[color]-900/20
└─ Text: dark:text-white / dark:text-gray-300
```

---

## Accessibility Features

```
✅ Implemented:
├─ aria-label on all buttons (screen reader)
├─ title attributes (hover tooltips)
├─ Keyboard accessible (Tab navigation)
├─ Color + icon (not color alone)
├─ High contrast ratios
├─ Dark mode support
├─ Disabled state indicators
└─ Focus states visible

Example:
┌──────────────────────────────────────────┐
│ <button                                  │
│   aria-label="Approve transaction"       │
│   title="Approve"                        │
│   className="...focus:ring-2 ring-blue"  │
│ >                                        │
│   <CheckIcon className="size-5" />       │
│ </button>                                │
└──────────────────────────────────────────┘
```

---

## Mobile Experience

### Responsive Design

```
Desktop (>1024px):
┌─────────┬──────────┬──────────┬────────┬──────┬─────────┬──────┐
│ Date    │ Category │ Descrip. │ Vendor │ Amt  │ Status  │ Actn │
├─────────┼──────────┼──────────┼────────┼──────┼─────────┼──────┤
│ 1/31/26 │ Office   │ Supplies │ ABC    │ 35K  │ 🟡 Awai │ ✅✗👁│
└─────────┴──────────┴──────────┴────────┴──────┴─────────┴──────┘

Tablet (768px-1024px):
┌──────────────────────────────────────┐
│ Date: 1/31/26  Amount: ₱35,000      │
│ Office Supplies - ABC Corp           │
│ Status: 🟡 Awaiting Approval         │
│ [✅ Approve] [✗ Reject] [👁️] [🗑️]    │
└──────────────────────────────────────┘

Mobile (<768px):
┌────────────────────────────┐
│ 1/31/26 - ₱35,000          │
│ Office / ABC               │
│ 🟡 Awaiting                │
│ ┌────────────────────────┐ │
│ │ ✅ ✗ 👁️ 🗑️             │ │
│ └────────────────────────┘ │
└────────────────────────────┘
```

---

## Keyboard Navigation

```
Tab Order:
1. First ✅ Approve button
2. ✗ Reject button
3. 👁️ View button
4. 📝 Post button (if applicable)
5. 🗑️ Delete button
6. Next row's buttons...

Interactions:
- Tab: Move between buttons
- Space/Enter: Activate button
- Escape: Close modal
- Arrow keys: Navigate modal fields
```

---

## Tooltip Messages

```
✅ Approve:
  "Approve" (default)
  "Exceeds approval limit of ₱50,000" (disabled)

✗ Reject:
  "Reject" (default)

👁️ View:
  "View details" / "View"

📝 Post:
  "Post approved expense to journal" / "Post to Ledger"

🗑️ Delete:
  "Delete" / "Delete expense"
```

---

**Visual Guide Complete** ✅

For implementation details, see: INLINE_APPROVAL_IMPLEMENTATION.md
For quick start, see: INLINE_APPROVAL_QUICK_REFERENCE.md
