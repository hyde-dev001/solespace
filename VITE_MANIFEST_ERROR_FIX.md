# 🔧 ViteManifestNotFoundException - Complete Fix Guide

## 📚 Understanding the Error

### Why This Error Happens

The `ViteManifestNotFoundException` occurs when Laravel tries to load Vite assets but can't find the `manifest.json` file in `public/build/manifest.json`.

**Two Scenarios:**

1. **Development Mode** (What you should be using):
   - Laravel should connect to Vite dev server (running on port 5173)
   - NO manifest.json needed
   - Uses `npm run dev`

2. **Production Mode**:
   - Laravel looks for `public/build/manifest.json`
   - Assets must be built first with `npm run build`
   - Uses pre-compiled assets

### What is manifest.json?

The `manifest.json` file is created when you run `npm run build`. It contains a mapping of:
- Source files → Compiled/bundled files
- Example: `resources/js/app.js` → `build/assets/app-abc123.js`

Laravel uses this to know which compiled files to load in production.

---

## ✅ Step-by-Step Fix

### Step 1: Verify Your Environment

Check your `.env` file:

```env
APP_ENV=local          # Must be 'local' for dev mode
APP_DEBUG=true         # Should be true for development
```

**If `APP_ENV=production`, Laravel will look for manifest.json!**

### Step 2: Ensure Vite Dev Server is Running

**Terminal 1 (Laravel):**
```bash
cd backend
php artisan serve
```

**Terminal 2 (Vite - CRITICAL!):**
```bash
cd backend
npm run dev
```

**Expected Output:**
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 3: Verify Vite Configuration

Your `vite.config.js` should look like this:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        host: 'localhost',
        port: 5173,
        hmr: {
            host: 'localhost',
        },
    },
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
});
```

### Step 4: Verify app.blade.php

Your `resources/views/app.blade.php` should use `@vite` directive:

```blade
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title inertia>{{ config('app.name', 'Laravel') }}</title>
        @routes
        @vite(['resources/css/app.css', 'resources/js/app.js'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
```

**Key Points:**
- ✅ Use `@vite()` directive (not `<script>` tags)
- ✅ Pass array of entry points
- ✅ Must match `vite.config.js` input array

---

## 🎯 Commands Explained

### `npm install`
**When:** First time setup or after adding dependencies
**What it does:** Installs all packages from `package.json`
**Run once:** After cloning or when dependencies change

```bash
cd backend
npm install --legacy-peer-deps
```

### `npm run dev`
**When:** Development (ALWAYS run this while developing!)
**What it does:** 
- Starts Vite dev server on port 5173
- Watches for file changes
- Hot Module Replacement (HMR)
- Serves assets directly (no manifest needed)

**MUST BE RUNNING:** While you're developing!

```bash
cd backend
npm run dev
```

### `npm run build`
**When:** Production deployment only
**What it does:**
- Compiles and minifies assets
- Creates `public/build/` directory
- Generates `manifest.json`
- Optimizes for production

**Only run when deploying to production:**

```bash
cd backend
npm run build
```

---

## 🔍 How Laravel Detects Vite

Laravel's `@vite()` directive works like this:

1. **Checks if Vite dev server is running:**
   - Tries to connect to `http://localhost:5173`
   - If successful → Uses dev server (no manifest needed)

2. **If dev server not found:**
   - Looks for `public/build/manifest.json`
   - If found → Uses compiled assets
   - If not found → Throws `ViteManifestNotFoundException`

---

## 🐛 Common Mistakes Students Make

### Mistake 1: Not Running `npm run dev`
**Symptom:** ViteManifestNotFoundException
**Fix:** Always run `npm run dev` in a separate terminal

### Mistake 2: Running `npm run build` in Development
**Symptom:** Changes don't reflect, need to rebuild constantly
**Fix:** Use `npm run dev` for development, only build for production

### Mistake 3: Wrong APP_ENV
**Symptom:** Laravel looks for manifest even with dev server running
**Fix:** Set `APP_ENV=local` in `.env`

### Mistake 4: Using `<script>` Tags Instead of `@vite`
**Symptom:** Assets load but HMR doesn't work, or wrong paths
**Fix:** Always use `@vite(['resources/css/app.css', 'resources/js/app.js'])`

### Mistake 5: Mismatched Entry Points
**Symptom:** Some assets load, others don't
**Fix:** Ensure `@vite()` array matches `vite.config.js` input array

### Mistake 6: Vite Server on Wrong Port
**Symptom:** Can't connect to Vite dev server
**Fix:** Check `vite.config.js` server.port matches actual port

### Mistake 7: Firewall/Network Blocking Port 5173
**Symptom:** Vite runs but Laravel can't connect
**Fix:** Check firewall, ensure localhost:5173 is accessible

---

## ✅ Verification Checklist

### 1. Check Environment
```bash
# In backend directory
php artisan tinker
>>> config('app.env')
# Should return: "local"
```

### 2. Check Vite Server
```bash
# Visit in browser:
http://localhost:5173/@vite/client
# Should return JavaScript (not 404)
```

### 3. Check Laravel Can See Vite
```bash
# In browser DevTools (F12) → Network tab
# Refresh page
# Look for requests to localhost:5173
# Should see 200 status (green)
```

### 4. Check HTML Output
```bash
# View page source (Ctrl+U)
# Should see:
# <script type="module" src="http://localhost:5173/@vite/client"></script>
# <script type="module" src="http://localhost:5173/resources/js/app.js"></script>
```

---

## 🚀 Quick Fix Commands

If you're getting the error right now:

```bash
# 1. Stop everything (Ctrl+C in both terminals)

# 2. Clear Laravel caches
cd backend
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# 3. Verify .env
# Make sure: APP_ENV=local

# 4. Start Laravel (Terminal 1)
php artisan serve

# 5. Start Vite (Terminal 2 - NEW TERMINAL!)
npm run dev

# 6. Hard refresh browser
# Ctrl + Shift + R
```

---

## 📝 Summary

**For Development:**
- ✅ `APP_ENV=local` in `.env`
- ✅ Run `npm run dev` (keep it running!)
- ✅ Run `php artisan serve` (keep it running!)
- ✅ Use `@vite()` in Blade templates
- ❌ Don't run `npm run build`
- ❌ Don't need `manifest.json`

**For Production:**
- ✅ `APP_ENV=production` in `.env`
- ✅ Run `npm run build` (creates manifest.json)
- ✅ Deploy `public/build/` directory
- ✅ No need for `npm run dev`

---

## 🆘 Still Not Working?

1. **Check both terminals are running**
2. **Check browser console (F12) for errors**
3. **Check Network tab (F12) for failed requests**
4. **Verify port 5173 is accessible**
5. **Try incognito window (bypasses cache)**
6. **Restart both servers**
