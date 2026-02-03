# Multi-Developer Server Access Guide

## 🎯 Current Setup (Jan 30, 2026)

**Server IP:** `192.168.18.21`  
**Access Port:** `8000` (Laravel backend)  
**Dev Port:** `5173` or `5174` (Vite frontend)

---

## ✅ How to Access the Server

### **Option 1: Via Server IP (Recommended for Team)**
```
http://192.168.18.21:8000
```
- Works for everyone on the network
- Make sure your frontend dev accesses the same URL

### **Option 2: Via Localhost**
```
http://127.0.0.1:8000   (or localhost:8000)
```
- Only works for local machine access
- Won't work for other team members

### **Option 3: Via Computer Hostname** (if available)
```
http://COMPUTERNAME:8000
```
- Check your hostname: `hostname` command in terminal

---

## 🔧 Session Configuration

**`.env` settings for multi-developer access:**
```dotenv
# Empty SESSION_DOMAIN accepts cookies from any access URL
SESSION_DOMAIN=

# All possible access combinations
SANCTUM_STATEFUL_DOMAINS=localhost:5174,localhost:5173,localhost:8000,127.0.0.1:5174,127.0.0.1:5173,127.0.0.1:8000,192.168.18.21:5174,192.168.18.21:5173,192.168.18.21:8000
```

---

## 🚀 Recommended Team Workflow

### **Developer A (You)**
- Access via: `http://192.168.18.21:8000`

### **Developer B (Frontend Dev)**
- Access via: `http://192.168.18.21:8000`
- Or: `http://127.0.0.1:8000` (if on same machine)

✅ **Both can login to the same server without issues**

---

## ⚠️ Common Problems & Solutions

### **Problem: "419 PAGE EXPIRED" or Login Fails**
- **Cause:** Accessing via different IP addresses (one uses 127.0.0.1, other uses 192.168.18.21)
- **Solution:** Everyone use the same URL! Choose one:
  - `http://192.168.18.21:8000` ← **Use this for team dev**
  - OR `http://127.0.0.1:8000` ← **Only if both on same machine**

### **Problem: Session Works for One Dev But Not the Other**
- **Cause:** CSRF token/session cookie not being accepted
- **Solution:** Clear browser cache/cookies for the old URL, then use new URL

### **Problem: Can Login But API Calls Fail**
- **Cause:** Frontend Vite server on different port needs to be added to SANCTUM_STATEFUL_DOMAINS
- **Solution:** Make sure `.env` includes all port combinations (already done ✓)

---

## 🔄 When to Update `.env`

If you add a **new developer or new IP**, update:

```dotenv
SANCTUM_STATEFUL_DOMAINS=localhost:5174,localhost:5173,localhost:8000,127.0.0.1:5174,127.0.0.1:5173,127.0.0.1:8000,NEW_IP:5174,NEW_IP:5173,NEW_IP:8000
```

Then run:
```bash
php artisan config:clear
```

---

## 📋 Checklist for New Team Member

- [ ] Access server via: `http://192.168.18.21:8000`
- [ ] Can see login page
- [ ] Can login with credentials
- [ ] Can access Dashboard
- [ ] Can navigate to Finance module
- [ ] API calls work (check browser console for errors)

---

## 🆘 Need Help?

1. **Check `.env` is configured correctly** (Session domain empty, SANCTUM domains include all IPs)
2. **Clear browser cache:** Ctrl+Shift+Delete
3. **Restart Laravel:** `php artisan serve`
4. **Restart Vite:** `npm run dev`
5. **Check browser console:** F12 → Console tab for CORS/CSRF errors

---

## 📝 Server URLs Reference

| Use Case | URL | Works For |
|----------|-----|-----------|
| Team development | `http://192.168.18.21:8000` | All developers on network |
| Local-only dev | `http://127.0.0.1:8000` | Current machine only |
| Localhost | `http://localhost:8000` | Current machine only |

**Current Team: Use `http://192.168.18.21:8000` ✓**
