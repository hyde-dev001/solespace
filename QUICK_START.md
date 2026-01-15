# ⚡ Quick Start - Shop Owner Registration

## 🚀 Run the Application

### Terminal 1 - Backend (Laravel)
```bash
cd c:\xampp\htdocs\thesis\ -\ admin\backend
php artisan serve
```
**URL:** http://127.0.0.1:8000

### Terminal 2 - Frontend (React)
```bash
cd c:\xampp\htdocs\thesis\ -\ admin\frontend
npm run dev
```
**URL:** http://localhost:5173

---

## 🧪 Test the Registration

1. Open frontend: http://localhost:5173
2. Navigate to "Shop Owner Registration" page
3. Fill in the form:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john@example.com`
   - Phone: `09123456789`
   - Business Name: `John's Shoe Shop`
   - Business Address: `123 Main St, Manila`
   - Business Type: `Retail`
   - Registration Type: `Individual`
   - Operating Hours: (Keep defaults)

4. Click "Submit Registration"
5. SweetAlert should appear asking about business permits
6. Click "I Have All Required Documents"
7. Confirmation alert should appear
8. Click "Yes, Submit Registration"
9. Success alert should appear with Reference ID

---

## ✅ Verify Database Entry

### Option 1: Using Laravel Tinker
```bash
cd backend
php artisan tinker
DB::table('shop_owners')->latest()->first();
```

### Option 2: Using MySQL CLI
```bash
mysql -u root -p
USE shoe_store;
SELECT * FROM shop_owners ORDER BY created_at DESC LIMIT 1;
```

### Option 3: Using phpMyAdmin
- URL: http://localhost/phpmyadmin
- Database: `shoe_store`
- Table: `shop_owners`

---

## 📝 What to Look For

After successful registration, the database should contain:
```
id: 1
first_name: John
last_name: Doe
email: john@example.com
phone: 09123456789
business_name: John's Shoe Shop
business_address: 123 Main St, Manila
business_type: retail
registration_type: individual
status: pending  ← Should be PENDING
operating_hours: {"Monday":{"open":"09:00","close":"17:00"},...}
created_at: 2026-01-15 10:30:00
```

---

## 🔍 Check Logs

View registration logs:
```bash
cd backend
tail -f storage/logs/laravel.log
```

You should see:
```
[2026-01-15 10:30:00] local.INFO: Shop owner registered: 1 - john@example.com
```

---

## ❌ Troubleshooting

### Issue: "The email has already been taken"
**Solution:** Use a different email or delete from database and try again

### Issue: SweetAlert doesn't appear
**Solution:** 
- Check browser console (F12)
- Verify SweetAlert2 is installed: `npm list sweetalert2`

### Issue: "All fields are required"
**Solution:** Make sure all form fields are filled

### Issue: Data not in database
**Solution:**
- Check Laravel logs for errors
- Verify MySQL is running
- Run migrations: `php artisan migrate`

### Issue: CORS error
**Solution:** Ensure backend is running on http://127.0.0.1:8000

---

## 🎯 Files to Review

### Frontend:
- `frontend/src/pages/userSide/ShopOwnerRegistration.tsx` - Main registration page
- `frontend/src/services/shopRegistrationApi.ts` - API service

### Backend:
- `backend/app/Http/Controllers/ShopRegistrationController.php` - Business logic
- `backend/routes/web.php` - API routes
- `backend/app/Models/ShopOwner.php` - Database model

### Documentation:
- `SHOP_REGISTRATION_SECURE_FIX.md` - Full technical details
- `TESTING_GUIDE.md` - Step-by-step testing
- `IMPLEMENTATION_SUMMARY.md` - Complete overview

---

## 📊 Expected SweetAlerts

### Alert 1: Business Permits Required
- Title: "Business Permits & Valid ID Required"
- Shows list of required documents
- Shows fraud warning
- Button: "I Have All Required Documents"

### Alert 2: Confirmation
- Title: "Confirm Registration Submission"
- Shows user information review
- Button: "Yes, Submit Registration"

### Alert 3: Success
- Title: "✅ Registration Successful!"
- Shows Reference ID
- Shows review timeline
- Shows next steps

---

## 🔐 Security Features Active

✅ Email uniqueness check  
✅ Phone format validation  
✅ Operating hours time validation  
✅ SweetAlert fraud warning  
✅ Pending status for admin review  
✅ Audit logging  
✅ Error exception handling  

---

## 📞 Quick Reference

| Item | Value |
|------|-------|
| Backend URL | http://127.0.0.1:8000 |
| Frontend URL | http://localhost:5173 |
| Database | shoe_store |
| Table | shop_owners |
| API Endpoint | POST /api/shop/register-full |
| Default Status | pending |
| Review Days | 3-7 business days |

---

**Ready to test? Start with Terminal 1 and Terminal 2 commands above! 🚀**
