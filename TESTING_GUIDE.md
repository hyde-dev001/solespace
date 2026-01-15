# 🧪 Testing Guide - Shop Owner Registration

## Quick Test Steps

### 1️⃣ Start the Application

**Backend:**
```bash
cd backend
php artisan serve
```
Should run on: `http://127.0.0.1:8000`

**Frontend:**
```bash
cd frontend
npm run dev
```
Should run on: `http://localhost:5173`

---

### 2️⃣ Navigate to Registration Page

1. Open frontend in browser: `http://localhost:5173`
2. Look for "Shop Owner Registration" link
3. Click on it - should show registration form with:
   - Personal Information section
   - Business Information section
   - Document Upload section
   - Operating Hours section

---

### 3️⃣ Test SweetAlert for Business Permits

1. Fill in all form fields:
   - **First Name:** John
   - **Last Name:** Doe
   - **Email:** john@example.com
   - **Phone:** 09123456789
   - **Business Name:** John's Shoe Shop
   - **Business Address:** 123 Main St, Manila
   - **Business Type:** Retail
   - **Registration Type:** Individual (default)
   - **Operating Hours:** Already filled with defaults

2. Click "Submit Registration" button

3. **Expected Result:**
   - First SweetAlert appears with title: "Business Permits & Valid ID Required"
   - Shows list of required documents:
     - Business Registration (DTI/SEC)
     - Mayor's Permit / Business Permit
     - BIR Certificate of Registration (COR)
     - Valid ID of Business Owner
   - Shows security warning about fraudulent documents
   - Shows photo guidelines
   - Two buttons: "I Have All Required Documents" and "Cancel"

---

### 4️⃣ Test Validation

**Try invalid email:**
- Email: `invalidemail` (no @)
- Result: Alert "Invalid Form Data"

**Try invalid phone:**
- Phone: `123` (less than 7 digits)
- Result: Alert "Invalid Form Data"

**Leave required field empty:**
- Leave any field blank
- Result: Alert "Invalid Form Data"

---

### 5️⃣ Test Successful Registration

1. Fill form with valid data (as in Step 3)
2. Click "Submit Registration"
3. Click "I Have All Required Documents" on first alert
4. **Second alert appears:** "Confirm Registration Submission"
   - Shows review of entered information
   - Warning about 3-7 business day review
   - Two buttons: "Yes, Submit Registration" and "Review Information"

5. Click "Yes, Submit Registration"
6. **Loading alert appears** with spinning loader

7. **Success alert should appear:**
   - Title: "✅ Registration Successful!"
   - Shows Reference ID
   - Status: Pending Review
   - Next steps information
   - Button: "OK"

---

### 6️⃣ Verify Database Entry

After successful registration, check if data was saved:

**Option A: Using PHP artisan tinker**
```bash
cd backend
php artisan tinker
```

Then run:
```php
DB::table('shop_owners')->latest()->first();
```

Should show:
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
operating_hours: {"Monday":{"open":"09:00","close":"17:00"},...}
status: pending
created_at: 2026-01-15 10:30:00
updated_at: 2026-01-15 10:30:00
```

**Option B: Using MySQL GUI**
1. Open phpMyAdmin
2. Database: `shoe_store`
3. Table: `shop_owners`
4. Should see new row with your registration data

**Option C: Check logs**
```bash
cd backend
tail -f storage/logs/laravel.log
```

Should see entry like:
```
[2026-01-15 10:30:00] local.INFO: Shop owner registered: 1 - john@example.com
```

---

### 7️⃣ Test Email Uniqueness

1. Try to register again with same email
2. **Expected Result:**
   - Loading appears then disappears
   - Error alert: "Registration Failed - The email has already been taken."
   - Form data remains (user can edit)

---

### 8️⃣ Test Operating Hours Storage

1. Change some operating hours before registering:
   - Monday: 08:00 to 20:00
   - Wednesday: Closed (could set same time)

2. After registration, check database:
   - The `operating_hours` field should contain JSON:
   ```json
   {
     "Monday": {"open": "08:00", "close": "20:00"},
     "Tuesday": {"open": "09:00", "close": "17:00"},
     "Wednesday": {"open": "09:00", "close": "17:00"},
     ...
   }
   ```

---

## ✅ Checklist

- [ ] SweetAlert for business permits appears
- [ ] Can confirm having required documents
- [ ] Confirmation alert shows before submission
- [ ] Data appears in `shop_owners` table after successful registration
- [ ] Status is set to `pending`
- [ ] Operating hours stored as JSON
- [ ] Email uniqueness validation works (no duplicates)
- [ ] Phone format validation works
- [ ] Error messages display properly
- [ ] Can see registration entry in logs

---

## 🐛 Troubleshooting

### Alert doesn't appear
- Check browser console (F12) for JavaScript errors
- Verify SweetAlert2 is installed: `npm list sweetalert2`

### Data not saving to database
- Check Laravel logs: `storage/logs/laravel.log`
- Verify database connection in `.env`
- Run migrations: `php artisan migrate`

### CORS errors
- Check CORS middleware in `bootstrap/app.php`
- Verify frontend URL is allowed

### Email uniqueness not working
- Check that email field is `unique:shop_owners,email` in validation
- Run: `php artisan migrate:refresh`

### Time format validation fails
- Operating hours must be in HH:MM format (24-hour)
- Example: 09:00, 17:30, 23:59

---

## 📊 Expected Database Schema

```sql
CREATE TABLE shop_owners (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  business_address VARCHAR(255) NOT NULL,
  business_type VARCHAR(100) NOT NULL,
  registration_type VARCHAR(100) NOT NULL,
  operating_hours JSON,
  status VARCHAR(100) DEFAULT 'pending',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🎯 Test Results

| Test Case | Expected | Status |
|-----------|----------|--------|
| Show business permits alert | ✅ Alert appears | ⏳ Test |
| Proceed with permits confirmed | ✅ Next alert shows | ⏳ Test |
| Save to database | ✅ Data saved | ⏳ Test |
| Email uniqueness | ✅ Error on duplicate | ⏳ Test |
| Phone validation | ✅ Error on invalid | ⏳ Test |
| Operating hours JSON | ✅ Proper JSON format | ⏳ Test |
| Status pending | ✅ All new = pending | ⏳ Test |
| Error logging | ✅ Logged to logs | ⏳ Test |

---

After testing, update this checklist and report any issues! 🚀
