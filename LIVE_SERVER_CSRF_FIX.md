# Live Server CSRF 419 Error Fix

## Problem
Frontend devs are getting **419 errors** on login attempts for User, Shop Owner, and Finance accounts on the live server.

Error: `POST http://localhost:8000/user/login 419 (unknown status)`

This is a **CSRF Token Mismatch** error.

---

## Root Causes

### 1. ❌ SESSION_DOMAIN is set to 127.0.0.1
On a live server or shared domain, the SESSION_DOMAIN must match the actual domain/IP being used.

**Current .env:**
```
SESSION_DOMAIN=127.0.0.1
```

**Should be:** (for live server)
```
SESSION_DOMAIN=your.live.domain.com
```

Or leave it empty to use current domain automatically:
```
SESSION_DOMAIN=
```

### 2. ❌ SESSION_SECURE_COOKIE might be wrong
If using HTTPS on live server, must be `true`. If HTTP, must be `false`.

**Current .env:**
```
SESSION_SECURE_COOKIE=false
```

### 3. ❌ SANCTUM_STATEFUL_DOMAINS not updated
Must include the live server domain.

**Current .env:**
```
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173,127.0.0.1:8000,localhost:8000
```

**Should include:** (for live server)
```
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173,127.0.0.1:8000,localhost:8000,your.live.domain.com,your.live.domain.com:3000
```

### 4. ✅ Duplicate routes in web.php (Fixed)
Lines 183-199 in `routes/web.php` have duplicate authentication route definitions. This has been noted but needs manual cleanup.

**Action:** Remove duplicate routes to avoid conflicts.

---

## Quick Fix for Live Server

### Step 1: Update .env for live server

```bash
# Change SESSION_DOMAIN to match your live server domain/IP
SESSION_DOMAIN=your.actual.live.domain.or.ip

# Ensure SESSION_SECURE_COOKIE matches your protocol
# For HTTPS: true
# For HTTP: false
SESSION_SECURE_COOKIE=true

# Update SANCTUM_STATEFUL_DOMAINS with your live domain
SANCTUM_STATEFUL_DOMAINS=your.actual.live.domain.or.ip,your.live.domain.com:3000

# Ensure database sessions are enabled
SESSION_DRIVER=database

# Session path (usually root)
SESSION_PATH=/

# SameSite setting - 'lax' is secure for same-site requests
SESSION_SAME_SITE=lax
```

### Step 2: Clear config cache on live server

```bash
php artisan config:cache
php artisan cache:clear
```

### Step 3: Ensure sessions table exists

```bash
php artisan migrate
```

### Step 4: Test login

1. Go to `/user/login`
2. Enter credentials
3. Submit form
4. Should now work without 419 error

---

## For Development/Testing

If testing on `http://localhost:8000`:

```env
SESSION_DOMAIN=localhost
SESSION_SECURE_COOKIE=false
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:8000,127.0.0.1:8000,127.0.0.1:5173
```

If testing with IP `http://127.0.0.1:8000`:

```env
SESSION_DOMAIN=127.0.0.1
SESSION_SECURE_COOKIE=false
SANCTUM_STATEFUL_DOMAINS=127.0.0.1:5173,127.0.0.1:8000
```

**Don't mix localhost and 127.0.0.1 in the same request** - pick one and use it consistently.

---

## What Was Fixed

### ✅ UserLogin.tsx Updated
The UserLogin component now:
- Imports `usePage` to access props
- Gets `csrf_token` from Inertia props
- Ensures CSRF token is set in meta tag on component mount
- Uses `router.post()` which automatically includes CSRF token

### ✅ Session Configuration
- Already set to use `database` driver (reliable on live servers)
- CSRF token is shared via Inertia middleware

---

## Troubleshooting

### Still getting 419 errors?

1. **Check session table exists:**
   ```bash
   php artisan migrate --force
   ```

2. **Check session table has data:**
   ```bash
   php artisan tinker
   > DB::table('sessions')->count()
   ```

3. **Clear all sessions:**
   ```bash
   php artisan session:clear
   ```

4. **Check APP_KEY is set:**
   ```bash
   php artisan key:generate
   ```

5. **Verify CSRF token in response:**
   - Open browser DevTools → Network tab
   - Go to /user/login
   - Check Response → Find `csrf_token` in props
   - It should be present

6. **Check cookie is being set:**
   - Open browser DevTools → Application → Cookies
   - Should see `XSRF-TOKEN` cookie
   - Should see `laravel_session` cookie

### Browser console shows warnings?

Look for messages like:
- "Images loaded lazily and replaced with placeholders" (OK)
- "Failed to load resource: the server responded with a status of 419" (FIX THIS)

---

## Multiple Login Routes Issue

### ⚠️ Known Issue: Duplicate routes in web.php

**Lines 56-62 (GOOD):**
```php
Route::post('/user/login', [UserController::class, 'login'])->name('user.login');
Route::post('/shop-owner/login', [UserController::class, 'login'])->name('shop-owner.login');
```

**Lines 190-199 (DUPLICATES - should be removed):**
Same routes defined again, causing conflicts.

**Action Required:** Remove duplicate route definitions at lines 183-199 in `routes/web.php`.

---

## Login Endpoints Summary

All these should now work without 419 errors:

- ✅ **User/Shop Owner Login:** POST `/user/login` (both use same endpoint)
- ✅ **Finance Employee Login:** POST `/user/login` (redirects based on role)
- ✅ **Super Admin Login:** POST `/admin/login`

All routes are protected with CSRF middleware.

---

## Environment Checklist for Live Server

- [ ] SESSION_DOMAIN is set to your live domain (not 127.0.0.1)
- [ ] SESSION_SECURE_COOKIE matches your protocol (true for HTTPS, false for HTTP)
- [ ] SANCTUM_STATEFUL_DOMAINS includes your live domain
- [ ] Database migrations ran (`php artisan migrate`)
- [ ] Config cache cleared (`php artisan config:cache`)
- [ ] Sessions table has storage (`php artisan storage:link`)
- [ ] Browser cookies are enabled
- [ ] No browser extensions blocking cookies
- [ ] HTTPS certificate valid (if using HTTPS)

---

## Testing Commands

```bash
# Test CSRF token endpoint
curl http://localhost:8000/api/csrf-token

# Test login endpoint (will fail with wrong credentials, but should not be 419)
curl -X POST http://localhost:8000/user/login \
  -H "Content-Type: application/json" \
  -H "X-CSRF-TOKEN: YOUR_CSRF_TOKEN" \
  -d '{"email":"test@example.com","password":"test"}'

# Check session driver
php artisan tinker
> config('session.driver')

# Check current domain
php artisan tinker
> config('session.domain')
```

---

## Still Need Help?

1. Check browser DevTools Console for specific error messages
2. Check Laravel logs: `storage/logs/laravel.log`
3. Verify the `.env` file matches your server setup
4. Run migrations to ensure sessions table exists
5. Clear cache and restart Laravel

The CSRF fix in `UserLogin.tsx` ensures the token is available. The main issue is the `.env` configuration not matching your live server domain.
