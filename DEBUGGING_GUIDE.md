# 🐛 Debugging & Troubleshooting Guide

Quick reference for common issues and how to fix them.

---

## Issue: "CORS Error" or "Network Request Failed"

### Symptoms:
- Browser console shows CORS error
- Request is blocked by browser
- `Access-Control-Allow-Origin` missing

### Solutions:

1. **Check Backend is Running:**
   ```bash
   cd backend
   php artisan serve
   ```
   Should show: `Starting Laravel development server: http://127.0.0.1:8000`

2. **Verify API URL in Frontend .env:**
   ```
   VITE_API_URL=http://127.0.0.1:8000
   ```

3. **Check Middleware is Enabled:**
   File: `backend/bootstrap/app.php`
   ```php
   $middleware->statefulApi();
   $middleware->trustProxies(at: '*');
   ```

4. **Clear Frontend Cache:**
   ```bash
   cd frontend
   npm run dev     # Restart dev server
   ```

---

## Issue: "Email Already Exists" or Validation Errors

### Symptoms:
- Registration fails with validation error
- Duplicate email message appears
- Required field error

### Solutions:

1. **Check Backend Validation:**
   - File: `backend/app/Http/Controllers/ShopRegistrationController.php`
   - Email must be unique in database
   - All fields are required

2. **Clear Database (if testing):**
   ```bash
   cd backend
   php artisan migrate:reset
   php artisan migrate
   ```

3. **Check Email Format:**
   - Must be valid email: `user@example.com`
   - No spaces or special characters

---

## Issue: Form Not Submitting

### Symptoms:
- Clicking Sign Up does nothing
- No error message appears
- Button appears disabled

### Solutions:

1. **Check All Fields are Filled:**
   - First Name: ✓
   - Last Name: ✓
   - Email: ✓
   - Phone: ✓
   - Business Name: ✓
   - Business Address: ✓
   - Business Type: ✓
   - Registration Type: ✓
   - Terms & Conditions: ✓ (must be checked)

2. **Check Browser Console for Errors:**
   - Press F12 to open Developer Tools
   - Go to Console tab
   - Look for red error messages
   - Share error message for debugging

3. **Verify Form Attributes:**
   ```typescript
   // All inputs must have:
   - id
   - name
   - value
   - onChange handler
   ```

4. **Check Component Import:**
   ```typescript
   // SignUpForm.tsx must import:
   import { registerShopOwner } from "../../services/shopRegistrationApi";
   ```

---

## Issue: 404 Error on API Endpoint

### Symptoms:
- Error: "POST /api/shop/register 404"
- Backend responds with 404 Not Found
- Route not found

### Solutions:

1. **Check Route is Defined:**
   File: `backend/routes/web.php`
   ```php
   Route::post('/api/shop/register', [ShopRegistrationController::class, 'store']);
   ```

2. **Verify Controller Exists:**
   File: `backend/app/Http/Controllers/ShopRegistrationController.php`
   - Class name: `ShopRegistrationController`
   - Method name: `store`

3. **Clear Route Cache:**
   ```bash
   cd backend
   php artisan route:clear
   php artisan route:cache
   ```

---

## Issue: 500 Internal Server Error

### Symptoms:
- Response status: 500
- Error: "Internal Server Error"
- No details in response

### Solutions:

1. **Check Laravel Logs:**
   ```bash
   cd backend
   tail -f storage/logs/laravel.log
   ```

2. **Enable Debug Mode:**
   File: `backend/.env`
   ```
   APP_DEBUG=true
   ```

3. **Check Database Connection:**
   File: `backend/.env`
   ```
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=shoe_store
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. **Verify Database Exists:**
   ```bash
   # MySQL
   mysql -u root
   SHOW DATABASES;
   ```

5. **Run Migrations:**
   ```bash
   cd backend
   php artisan migrate
   ```

---

## Issue: "Cannot Find Module" in Frontend

### Symptoms:
- Error: `Module not found: shopRegistrationApi`
- Import path is incorrect
- TypeScript compilation error

### Solutions:

1. **Check File Exists:**
   ```
   frontend/src/services/shopRegistrationApi.ts
   ```

2. **Verify Import Path:**
   ```typescript
   // CORRECT:
   import { registerShopOwner } from "../../services/shopRegistrationApi";
   
   // WRONG:
   import { registerShopOwner } from "../services/shopRegistrationApi";
   import { registerShopOwner } from "./shopRegistrationApi";
   ```

3. **Check File Extension:**
   - Must be `.ts` (TypeScript)
   - Component must be `.tsx` (React TypeScript)

4. **Rebuild Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

---

## Issue: Response Shows Success But No Data in Database

### Symptoms:
- Frontend shows "Registration successful"
- Data not saved in database
- No error message

### Solutions:

1. **Check Database Connection:**
   ```bash
   cd backend
   php artisan tinker
   >>> DB::table('shop_owners')->count()
   ```

2. **Verify Model Fillable:**
   File: `backend/app/Models/ShopOwner.php`
   ```php
   protected $fillable = [
       'first_name', 'last_name', 'email', 'phone',
       'business_name', 'business_address', 'business_type',
       'registration_type', 'operating_hours', 'status',
   ];
   ```

3. **Check Table Columns:**
   ```bash
   cd backend
   php artisan tinker
   >>> Schema::getColumnListing('shop_owners')
   ```

4. **Verify Migration Ran:**
   ```bash
   cd backend
   php artisan migrate:status
   ```

---

## Issue: Form Shows Error But No Field Validation Message

### Symptoms:
- Red error appears in popup/alert
- User doesn't know which field is wrong
- No specific field highlighting

### Solutions:

To improve this in the future, you can modify `SignUpForm.tsx`:

```typescript
// Add field-level error state
const [fieldErrors, setFieldErrors] = useState({
  firstName: "",
  lastName: "",
  email: "",
  // ... other fields
});

// Update error handling
if (response.error && response.errors) {
  setFieldErrors(response.errors);
}

// Display field errors under each input:
{fieldErrors.email && (
  <span className="text-red-500 text-sm">{fieldErrors.email}</span>
)}
```

---

## Issue: Dropdown Options Not Showing

### Symptoms:
- Business Type or Registration Type dropdown empty
- No options available
- Dropdown not responding

### Solutions:

1. **Check Select Element:**
   File: `frontend/src/components/auth/SignUpForm.tsx`
   ```typescript
   <select
     id="businessType"
     name="businessType"
     value={formData.businessType}
     onChange={handleInputChange}
   >
     <option value="">Select business type</option>
     <option value="retail">Retail</option>
     <option value="wholesale">Wholesale</option>
     // ... more options
   </select>
   ```

2. **Verify formData State:**
   ```typescript
   const [formData, setFormData] = useState({
     businessType: "",    // Must have this
     registrationType: "", // Must have this
     // ... other fields
   });
   ```

3. **Test Manually:**
   - Click on dropdown
   - Use arrow keys to select
   - Click on option

---

## Quick Debug Checklist

Use this checklist to systematically find the issue:

```
[ ] Backend Running?
    cd backend && php artisan serve

[ ] Frontend Running?
    cd frontend && npm run dev

[ ] Database Connected?
    Check .env DB_HOST, DB_PORT, DB_DATABASE

[ ] Migrations Run?
    cd backend && php artisan migrate

[ ] API Route Exists?
    grep "/api/shop/register" backend/routes/web.php

[ ] Controller Exists?
    ls backend/app/Http/Controllers/ShopRegistrationController.php

[ ] Frontend Service Exists?
    ls frontend/src/services/shopRegistrationApi.ts

[ ] Correct Import Path?
    Check in SignUpForm.tsx

[ ] Form Field Names Match?
    Check formData state vs form inputs

[ ] Environment Variables Set?
    cat frontend/.env | grep VITE_API_URL

[ ] Browser Console Clear?
    No red errors in F12 → Console

[ ] Network Tab Shows Request?
    F12 → Network → try submit → see POST request

[ ] Response Status?
    Look at status code: 200, 201, 400, 500, etc.

[ ] Response Body?
    Click on request → see JSON response
```

---

## Getting Help

1. **Check Logs:**
   - Frontend: Browser Console (F12)
   - Backend: `storage/logs/laravel.log`

2. **Network Request Details:**
   - F12 → Network tab
   - Click on POST request
   - Check:
     - Status code
     - Request headers
     - Request body
     - Response body

3. **Database Check:**
   ```bash
   mysql -u root
   USE shoe_store;
   SELECT * FROM shop_owners;
   ```

4. **Common Response Codes:**
   - `200` - Success
   - `201` - Created (new resource)
   - `400` - Bad Request (validation error)
   - `404` - Not Found (route doesn't exist)
   - `500` - Server Error (database or code issue)
   - `CORS Error` - Cross-origin request blocked

---

## Contact Points for Integration

**Frontend:**
- Component: `frontend/src/components/auth/SignUpForm.tsx`
- Service: `frontend/src/services/shopRegistrationApi.ts`
- Environment: `frontend/.env`

**Backend:**
- Route: `backend/routes/web.php`
- Controller: `backend/app/Http/Controllers/ShopRegistrationController.php`
- Middleware: `backend/bootstrap/app.php`
- Model: `backend/app/Models/ShopOwner.php`

---

**Last Updated:** January 15, 2026
**For Questions:** Check COMMENTS_GUIDE.md and INTEGRATION_SUMMARY.md
