# Shop Owner Registration - Backend & Frontend Integration

This document describes the integration between the backend (Laravel) and frontend (React) for shop owner registration.

## 📋 Overview

The shop owner registration system has been fully connected, allowing users to register through the frontend and have their data saved in the backend database.

---

## 🔧 Backend Setup

### 1. **Updated Route** - `backend/routes/web.php`
- **Endpoint:** `/api/shop/register` (POST)
- **Comment:** API Route for shop owner registration - connects to React frontend
- **Changes:** Route now accepts JSON API requests from frontend

### 2. **Updated Controller** - `backend/app/Http/Controllers/ShopRegistrationController.php`
- **Method:** `store(Request $request)`
- **Key Changes:**
  - Removed file upload validation (will be handled separately)
  - Changed redirect response to JSON response
  - Added try-catch error handling
  - Returns HTTP 201 for successful registration
  - Returns JSON with success flag and messages

**Validated Fields:**
- `firstName` - Required, string
- `lastName` - Required, string
- `email` - Required, email, unique in shop_owners table
- `phone` - Required, string
- `businessName` - Required, string
- `businessAddress` - Required, string
- `businessType` - Required, string
- `registrationType` - Required, string
- `operatingHours` - Optional, array

**Database Fields Populated:**
- All validated fields are converted to snake_case for database storage
- `status` is automatically set to `'pending'` for Super Admin approval

### 3. **Updated Middleware** - `backend/bootstrap/app.php`
- **Comment:** Enable CORS for frontend API requests
- **Added:** `statefulApi()` and `trustProxies()` middleware configuration

### 4. **Models** - No changes needed
- `ShopOwner` model already configured with proper fillable attributes
- `ShopDocument` model ready for document uploads

### 5. **Migration** - Already Set
- `shop_owners` table already created with all necessary fields
- Status field defaults to 'pending'

---

## 🎨 Frontend Setup

### 1. **Created API Service** - `frontend/src/services/shopRegistrationApi.ts`
- **Function:** `registerShopOwner(registrationData)`
- **Features:**
  - Uses environment variable `VITE_API_URL` from `.env`
  - Makes POST request to backend `/api/shop/register` endpoint
  - Handles success and error responses
  - Returns standardized `ApiResponse` object
  - Comments added to explain each step

**Environment Configuration:**
```
VITE_API_URL=http://127.0.0.1:8000
```

### 2. **Updated Component** - `frontend/src/components/auth/SignUpForm.tsx`
- **Changes:**
  - Added state management with `useState` for form data
  - Created `formData` state object with all shop owner fields
  - Added `handleInputChange` function for form inputs
  - Added `handleSubmit` function that:
    - Validates all required fields
    - Checks terms & conditions checkbox
    - Calls `registerShopOwner` API function
    - Displays success/error messages
    - Resets form on successful registration
    - Shows loading state during submission

**Form Fields with Comments:**
- First Name → `firstName`
- Last Name → `lastName`
- Email → `email`
- Phone Number → `phone`
- Business Name → `businessName`
- Business Address → `businessAddress`
- Business Type → `businessType` (dropdown select)
- Registration Type → `registrationType` (dropdown select)
- Terms & Conditions → `isChecked` validation

**UI Enhancements:**
- Error message display (red background)
- Success message display (green background)
- Disabled submit button during loading
- Loading text changes to "Registering..."

---

## 🔄 Data Flow

```
User Form (Frontend) 
    ↓
handleSubmit() validates
    ↓
registerShopOwner() API call
    ↓
POST /api/shop/register
    ↓
ShopRegistrationController::store()
    ↓
Validation (backend)
    ↓
ShopOwner::create()
    ↓
JSON Response (success/error)
    ↓
Frontend displays message & resets form
```

---

## 🚀 How to Use

### Backend (Laravel):
1. Ensure database migrations are run:
   ```bash
   php artisan migrate
   ```

2. Start the Laravel development server:
   ```bash
   php artisan serve
   ```

### Frontend (React + Vite):
1. Install dependencies:
   ```bash
   npm install
   ```

2. Make sure `.env` has the correct `VITE_API_URL`

3. Start development server:
   ```bash
   npm run dev
   ```

### Testing:
1. Navigate to Sign Up page in frontend
2. Fill in all form fields:
   - Personal Info: First Name, Last Name, Email, Phone
   - Business Info: Business Name, Address, Type, Registration Type
3. Check Terms & Conditions
4. Click "Sign Up"
5. Success/error message will appear
6. On success, form resets automatically

---

## ✅ Validation Rules

### Frontend (React):
- All fields are required
- Email must be valid format
- Terms & Conditions must be checked
- Real-time onChange handling

### Backend (Laravel):
- All fields required
- Email must be unique in shop_owners table
- Email must be valid email format
- String fields properly validated
- Returns 201 on success, 500 on error

---

## 📦 Response Format

### Success Response (201):
```json
{
  "success": true,
  "message": "Shop registration submitted successfully!",
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "business_name": "John's Shop",
    "business_address": "123 Main St",
    "business_type": "retail",
    "registration_type": "sole_proprietor",
    "status": "pending",
    "created_at": "2026-01-15T10:30:00Z",
    "updated_at": "2026-01-15T10:30:00Z"
  }
}
```

### Error Response (500 or validation error):
```json
{
  "success": false,
  "message": "error message description"
}
```

---

## 🐛 Troubleshooting

### CORS Error?
- Check `.env` on backend for correct `APP_URL`
- Ensure middleware is properly configured in `bootstrap/app.php`
- Frontend `.env` has correct `VITE_API_URL`

### Email Already Exists?
- Database validation prevents duplicate emails
- User will see error message from backend

### Form Not Submitting?
- Check browser console for errors
- Verify all required fields are filled
- Check if Terms & Conditions are checked
- Ensure backend is running and accessible

### Database Error?
- Run migrations: `php artisan migrate`
- Check database connection in `.env`

---

## 📝 Files Modified/Created

### Backend:
- ✅ `routes/web.php` - Updated endpoint to `/api/shop/register`
- ✅ `app/Http/Controllers/ShopRegistrationController.php` - JSON response handling
- ✅ `bootstrap/app.php` - CORS middleware enabled

### Frontend:
- ✅ `src/services/shopRegistrationApi.ts` - New API service
- ✅ `src/components/auth/SignUpForm.tsx` - Updated with full form data handling

### Config:
- ✅ `frontend/.env` - Already configured with `VITE_API_URL`

---

## 🎯 Next Steps

1. **Document Upload Feature** - Add file upload for business documents
2. **Email Verification** - Add email verification before approval
3. **Super Admin Dashboard** - View and approve shop registrations
4. **Success Redirect** - Redirect to pending approval page after registration
5. **Form Validation Messages** - Add field-level validation feedback

---

**Last Updated:** January 15, 2026
**Status:** Ready for Testing ✅
