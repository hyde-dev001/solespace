# Bank Reconciliation - Quick Reference

## 🔗 API Endpoints

### Auto-Match (NEW ⭐)
```http
POST /api/finance/reconciliation/auto-match

Body: {
  "account_id": "1",
  "tolerance_amount": 0.01,
  "tolerance_days": 3,
  "bank_transactions": [...]
}

Returns: {
  "matches": [...],
  "matched_count": 15,
  "unmatched_count": 3
}
```

### Batch Reconcile (NEW ⭐)
```http
POST /api/finance/reconciliation/batch-reconcile

Body: {
  "account_id": "1",
  "statement_date": "2026-01-31",
  "opening_balance": 100000,
  "closing_balance": 125000,
  "matches": [
    {
      "bank_transaction_id": "bank-001",
      "journal_entry_line_id": "123"
    }
  ]
}
```

### Get Transactions
```http
GET /api/finance/reconciliation/transactions?account_id=1
```

### Get History
```http
GET /api/finance/reconciliation/history?account_id=1
```

### Unmatch
```http
DELETE /api/finance/reconciliation/{id}/unmatch
```

## 🎯 Matching Algorithm

### Scoring Breakdown (0-100):
- **Amount**: 40 points (exact match)
- **Date**: 30 points (same day)
- **Reference**: 15 points (similar_text)
- **Description**: 15 points (Levenshtein)

### Match Types:
- **exact**: 90-100 points
- **high_confidence**: 70-89 points
- **medium_confidence**: 50-69 points
- **Threshold**: Minimum 50 points to match

### Default Tolerances:
- Amount: ±0.01 (1 cent)
- Date: ±3 days

## 💡 Usage Pattern

```javascript
// 1. Auto-match
const matches = await autoMatch(bankTransactions);

// 2. Review confidence scores
matches.forEach(m => {
  if (m.confidence < 70) {
    // Flag for manual review
  }
});

// 3. Batch reconcile
await batchReconcile(confirmedMatches);

// 4. Handle unmatched
processUnmatchedTransactions(unmatchedBank);
```

## 📊 Confidence Guide

| Score | Type | Action |
|-------|------|--------|
| 90-100 | Exact | Auto-approve |
| 70-89 | High | Quick review |
| 50-69 | Medium | Manual review |
| < 50 | None | Manual match |

## 🔧 Configuration

```json
{
  "tolerance_amount": 0.01,    // Increase for currency rounding
  "tolerance_days": 3          // Increase for processing delays
}
```

## ⚠️ Common Issues

### No Matches Found
→ Increase tolerances or check data quality

### Low Confidence Matches
→ Improve descriptions/references in journal entries

### Already Reconciled Error
→ Filter out previously reconciled transactions

## 📁 Files

```
Backend:
└── app/Http/Controllers/ReconciliationController.php

Routes:
├── routes/api.php
└── routes/finance-api.php

Frontend:
└── resources/js/components/ERP/Finance/Reconciliation.tsx

Docs:
├── BANK_RECONCILIATION_BACKEND_COMPLETE.md
├── BANK_RECONCILIATION_MODULE.md
└── BANK_RECONCILIATION_QUICK_REF.md (this file)
```

## ✅ Status

**Production Ready** - Intelligent matching algorithm implemented with multi-criteria scoring, batch operations, and comprehensive error handling.
