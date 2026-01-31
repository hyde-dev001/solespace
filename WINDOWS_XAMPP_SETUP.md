# Windows XAMPP Setup Guide - SoleSpace

This guide is specifically for setting up SoleSpace on Windows with XAMPP.

## Prerequisites Check

### 1. XAMPP Installation
- Download from: https://www.apachefriends.org/
- Recommended version: 8.2.0 or higher
- Install in default location: `C:\xampp`

### 2. Verify Services
```bash
# Start XAMPP Control Panel
# Enable: Apache, MySQL

# Or start from command line
cd C:\xampp
apache_start.bat
mysql_start.bat
```

### 3. Verify Ports
```bash
# Apache should run on port 80 and 443
# MySQL should run on port 3306
```

## Installation Steps for Windows

### Step 1: Clone Repository

```bash
# Using Git Bash or Command Prompt
cd C:\xampp\htdocs

git clone https://github.com/hyde-dev001/solespace.git
cd solespace
```

### Step 2: Verify PHP and Composer

```bash
# Check PHP version (should be 8.2+)
php --version

# Check Composer is installed
composer --version

# If composer not found, add to PATH:
# C:\ProgramData\ComposerSetup\bin
```

### Step 3: Install PHP Dependencies

```bash
# In solespace directory
composer install --prefer-dist --no-interaction

# If you get memory errors:
composer install --no-interaction -d memory_limit=-1
```

### Step 4: Verify Node.js

```bash
# Check Node version (should be 18+)
node --version

# Check npm version
npm --version

# If npm gives peer dependency warnings, use:
npm install --legacy-peer-deps
```

### Step 5: Create Environment File

```bash
# Copy the example file
copy .env.example .env

# Or create .env manually with:
notepad .env
```

**Paste this in .env:**
```env
APP_NAME=SoleSpace
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=solespace
DB_USERNAME=root
DB_PASSWORD=

VITE_APP_NAME="${APP_NAME}"
```

### Step 6: Generate App Key

```bash
php artisan key:generate
```

### Step 7: Create MySQL Database

**Option A: Using Command Prompt**
```bash
# Open Command Prompt and navigate to MySQL
cd C:\xampp\mysql\bin

# Connect to MySQL
mysql -u root

# In MySQL prompt:
CREATE DATABASE solespace;
EXIT;
```

**Option B: Using PhpMyAdmin**
1. Open http://localhost/phpmyadmin in browser
2. Click "New" on left side
3. Enter database name: `solespace`
4. Click "Create"

### Step 8: Run Migrations

```bash
# In solespace directory
php artisan migrate:fresh --seed
```

Expected output:
```
Migration table created successfully.
Migrated: 0001_01_01_000000_create_users_table
Migrated: 0001_01_01_000001_create_cache_table
...
Seeded: Database seeded successfully.
```

### Step 9: Create Storage Symlink

```bash
php artisan storage:link
```

If you get a symbolic link error on Windows (common issue), use:
```bash
# Run Command Prompt as Administrator
mklink /D "public\storage" "storage\app\public"
```

### Step 10: Start Development Servers

**Terminal 1: Start Laravel Server**
```bash
# In PowerShell or Command Prompt
cd C:\xampp\htdocs\solespace
php artisan serve --host=127.0.0.1 --port=8000
```

You should see:
```
INFO  Server running on [http://127.0.0.1:8000].

Press Ctrl+C to stop the server
```

**Terminal 2: Start Vite (in NEW terminal)**
```bash
# Open another Command Prompt/PowerShell
cd C:\xampp\htdocs\solespace
npm run dev
```

You should see:
```
VITE v7.3.1 ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://172.30.16.1:5173/
```

## ✅ Verify Installation

1. Open http://127.0.0.1:8000 in browser
2. You should see the SoleSpace homepage
3. Click on login dropdown (top right)
4. Try logging in with test credentials

### Test Credentials
- **Admin**: admin@solespace.com / password123
- **Shop Owner**: shopowner@test.com / password123
- **User**: user@solespace.com / password123

## Common Windows Issues & Solutions

### Issue: "PHP is not recognized"

**Solution:**
```bash
# Add PHP to PATH
# 1. Right-click This PC > Properties
# 2. Advanced system settings
# 3. Environment Variables
# 4. Add C:\xampp\php to PATH
# 5. Restart Command Prompt
```

### Issue: "Composer is not recognized"

**Solution:**
```bash
# Download and run Composer installer from:
# https://getcomposer.org/download/

# Or add to PATH:
# C:\Users\YourUsername\AppData\Roaming\Composer\vendor\bin
```

### Issue: "npm ERR! peer dep missing"

**Solution:**
```bash
npm install --legacy-peer-deps --force
```

### Issue: "Cannot create symbolic link" (storage)

**Solution:**
```bash
# Run Command Prompt as Administrator
# Then run:
mklink /D "C:\xampp\htdocs\solespace\public\storage" "C:\xampp\htdocs\solespace\storage\app\public"
```

### Issue: "Port 8000 is already in use"

**Solution:**
```bash
# Use different port
php artisan serve --host=127.0.0.1 --port=8001

# Or find and kill process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Issue: Database connection error

**Solution:**
```bash
# Check MySQL is running in XAMPP Control Panel
# Verify .env has correct credentials:
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=solespace
DB_USERNAME=root
DB_PASSWORD=
```

### Issue: "SQLSTATE[HY000] [2002] No such file or directory"

**Solution:**
```bash
# Use socket connection instead
# In .env, change:
DB_HOST=/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock

# Or simply ensure MySQL is running
```

## File Permissions (If Needed)

```bash
# Make storage and bootstrap directories writable
icacls "storage" /grant:r "%username%":F /t
icacls "bootstrap\cache" /grant:r "%username%":F /t
```

## Database Management

### Backup Database
```bash
# In Command Prompt
cd C:\xampp\mysql\bin
mysqldump -u root solespace > C:\backups\solespace_backup.sql
```

### Restore Database
```bash
mysql -u root solespace < C:\backups\solespace_backup.sql
```

### Reset Database
```bash
# In solespace directory
php artisan migrate:fresh --seed
```

## Useful Commands for Development

```bash
# Clear all caches
php artisan optimize:clear

# View logs (last 20 lines)
Get-Content storage\logs\laravel.log -Tail 20

# Access database via Tinker
php artisan tinker

# Check routes
php artisan route:list

# View migrations status
php artisan migrate:status
```

## Stopping Services

```bash
# Stop Laravel (Ctrl+C in the Laravel terminal)
# Stop Vite (Ctrl+C in the Vite terminal)
# Stop XAMPP services from control panel or:
apache_stop.bat
mysql_stop.bat
```

## Next Steps

1. Read the full [README_DETAILED.md](./README_DETAILED.md) for comprehensive documentation
2. Explore the project structure in `resources/js/Pages`
3. Check out authentication system in `app/Http/Controllers`
4. Review database schema in `database/migrations`

## Need Help?

1. Check Windows Firewall - make sure it allows Apache/MySQL
2. Verify all prerequisites are installed and in PATH
3. Check `storage/logs/laravel.log` for error messages
4. Run `php artisan optimize:clear` to clear caches
5. Restart XAMPP services completely

---

**Happy coding! 🚀**
