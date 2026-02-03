# 📎 Expense Receipt Attachments - Quick Reference

## ✅ Status: COMPLETE

## 🎯 What's New

Expenses can now have receipt attachments (JPG, PNG, PDF) for audit compliance and reimbursement workflows.

## 📁 Files Modified

- ✅ Migration: `database/migrations/2026_01_31_140000_add_receipt_attachment_to_finance_expenses.php`
- ✅ Model: `app/Models/Finance/Expense.php` (added 4 fillable fields)
- ✅ Controller: `app/Http/Controllers/Api/Finance/ExpenseController.php` (added 3 methods)
- ✅ Routes: `routes/api.php` (added 3 routes)
- ✅ Frontend: `resources/js/components/ERP/Finance/Expense.tsx` (enhanced UI)

## 🔌 API Endpoints

### Upload Receipt (New Expense)
```http
POST /api/finance/expenses
Content-Type: multipart/form-data

date=2026-01-31
category=Office Supplies
vendor=Staples
amount=150.00
receipt=@receipt.pdf
```

### Upload Receipt (Existing Expense)
```http
POST /api/finance/expenses/{id}/receipt
Content-Type: multipart/form-data

receipt=@receipt.jpg
```

### Download Receipt
```http
GET /api/finance/expenses/{id}/receipt/download
```

### Delete Receipt
```http
DELETE /api/finance/expenses/{id}/receipt
```

## 🎨 Frontend Features

**Add Expense Modal**:
- File upload input (optional)
- Accepted formats: JPG, PNG, PDF
- Max size: 10MB
- Image preview for JPG/PNG
- Validation messages

**View Expense Modal**:
- Download button for attached receipts
- File name display

## 🔒 Validation Rules

| Rule | Value |
|------|-------|
| File Types | JPG, JPEG, PNG, PDF |
| Max Size | 10MB |
| Required | No (optional) |
| Validation | Client + Server |

## 📦 Storage

**Location**: `storage/app/public/receipts/`  
**Public URL**: `/storage/receipts/{filename}`  
**Naming**: `{timestamp}_{reference}_{original_name}`

## ⚙️ Setup Commands

```bash
# Run migration
php artisan migrate

# Create storage link
php artisan storage:link

# Set permissions (Linux/Mac)
chmod -R 775 storage/app/public/receipts
```

## 🧪 Testing

**Upload Test**:
1. Go to Finance → Expense Tracking
2. Click "Add Expense"
3. Fill required fields
4. Click file input → Select JPG/PNG/PDF (< 10MB)
5. Click "Add Expense"
6. ✅ Receipt uploaded

**Download Test**:
1. Click 👁️ (View) on expense with receipt
2. Click "Download" button
3. ✅ File downloads with original name

**Delete Test**:
```bash
curl -X DELETE http://localhost:8000/api/finance/expenses/1/receipt \
  -H "Accept: application/json"
```

## 🐛 Common Issues

**Upload Fails**:
- Check `php.ini`: `upload_max_filesize = 10M`, `post_max_size = 10M`
- Verify storage link: `php artisan storage:link`

**404 on Download**:
- Check symbolic link exists: `ls public/storage`
- Verify file exists: `ls storage/app/public/receipts/`

**Permission Denied**:
```bash
chmod -R 775 storage/
chown -R www-data:www-data storage/  # Linux
```

## 📊 Database Schema

```sql
ALTER TABLE finance_expenses ADD COLUMN receipt_path VARCHAR(255) NULL;
ALTER TABLE finance_expenses ADD COLUMN receipt_original_name VARCHAR(255) NULL;
ALTER TABLE finance_expenses ADD COLUMN receipt_mime_type VARCHAR(255) NULL;
ALTER TABLE finance_expenses ADD COLUMN receipt_size BIGINT UNSIGNED NULL;
```

## 🔍 Audit Logs

Receipt actions are automatically logged:
- `upload_receipt` - Receipt uploaded
- `delete_receipt` - Receipt deleted

Query:
```sql
SELECT * FROM audit_logs 
WHERE action IN ('upload_receipt', 'delete_receipt') 
ORDER BY created_at DESC;
```

## 💡 Usage Tips

1. **Upload during creation** for fastest workflow
2. **Use PDF** for multi-page receipts
3. **Compress images** before upload if > 5MB
4. **Download receipts** before deleting expenses

## 🚀 Production Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Run migration
php artisan migrate

# 3. Create storage link
php artisan storage:link

# 4. Build frontend
npm run build

# 5. Restart services
php artisan optimize
```

## ✨ Impact

- ✅ Audit compliance enabled
- ✅ Reimbursement workflow streamlined
- ✅ Supporting documentation attached
- ✅ Easy retrieval for auditors
- ✅ Secure storage with shop isolation

---

**Status**: ✅ Production Ready  
**Priority**: P3 (Complete)  
**Date**: January 31, 2026
