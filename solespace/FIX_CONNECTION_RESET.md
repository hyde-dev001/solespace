# 🔧 Fix: ERR_CONNECTION_RESET on localhost:5173

## ✅ What Was Fixed:

1. **Updated `vite.config.js`**:
   - Changed `host: 'localhost'` → `host: '0.0.0.0'` (accepts all connections)
   - Added `cors: true` (enables CORS)
   - Kept HMR host as `localhost`

2. **Cleared Laravel caches** (config, cache, views)

## 🚀 How to Fix Right Now:

### Step 1: Stop Current Vite Server
In the terminal where `npm run dev` is running:
- Press `Ctrl + C` to stop it

### Step 2: Restart Vite Server
In the same terminal (or a new one):
```bash
cd backend
npm run dev
```

**Expected output:**
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: http://0.0.0.0:5173/
```

### Step 3: Verify Laravel Server is Running
In another terminal:
```bash
cd backend
php artisan serve
```

**Expected output:**
```
INFO  Server running on [http://127.0.0.1:8000]
```

### Step 4: Hard Refresh Browser
- **Windows/Linux:** `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac:** `Cmd + Shift + R`

### Step 5: Visit Your Site
Go to: **http://localhost:8000**

---

## ✅ Success Indicators:

After following these steps, you should see:
- ✅ No console errors about connection reset
- ✅ CSS styles loading correctly
- ✅ React components rendering
- ✅ No errors in browser DevTools (F12)

---

## 🐛 If Still Not Working:

### Check 1: Both Servers Running
Make sure you have TWO terminals running:
- Terminal 1: `php artisan serve` (Laravel)
- Terminal 2: `npm run dev` (Vite)

### Check 2: Port 5173 Accessible
Open in browser: **http://localhost:5173/@vite/client**

Should show JavaScript code (not an error page).

### Check 3: Browser Console
Press `F12` → Console tab
- Look for any red errors
- Check Network tab for failed requests

### Check 4: Try Incognito Mode
Sometimes browser cache causes issues:
- Open incognito/private window
- Visit http://localhost:8000

### Check 5: Firewall/Antivirus
Some security software blocks localhost connections:
- Temporarily disable firewall/antivirus
- Or add exception for ports 8000 and 5173

---

## 📝 Current Configuration:

**`backend/vite.config.js`:**
```js
server: {
    host: '0.0.0.0',      // Accepts all connections
    port: 5173,
    strictPort: false,
    cors: true,           // Enables CORS
    hmr: {
        host: 'localhost',
        protocol: 'ws',
    },
}
```

---

## 🆘 Still Having Issues?

1. **Kill all processes and restart:**
   ```powershell
   # Run this in backend directory
   .\restart-dev.ps1
   ```

2. **Check .env file:**
   Make sure `APP_ENV=local` (not `production`)

3. **Verify node_modules:**
   ```bash
   cd backend
   npm install --legacy-peer-deps
   ```

4. **Check for port conflicts:**
   ```powershell
   netstat -ano | findstr :5173
   netstat -ano | findstr :8000
   ```
