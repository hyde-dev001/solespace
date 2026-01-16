# Quick Start Guide - SoleSpace

## ⚡ 5-Minute Setup

### Prerequisites
- PHP 8.2+ installed
- Node.js 18+ installed
- MySQL running
- Composer installed

### Step-by-Step

#### 1. Clone & Install (2 minutes)
```bash
git clone https://github.com/hyde-dev001/solespace.git
cd solespace
composer install --prefer-dist
npm install --legacy-peer-deps
```

#### 2. Setup Environment (1 minute)
```bash
cp .env.example .env
php artisan key:generate
```

#### 3. Database (1 minute)
```bash
# Create database in MySQL
mysql -u root -e "CREATE DATABASE solespace;"

# Run migrations
php artisan migrate:fresh --seed
```

#### 4. Run Application (1 minute)

**Terminal 1:**
```bash
php artisan serve --host=127.0.0.1 --port=8000
```

**Terminal 2:**
```bash
npm run dev
```

### ✅ Done!

- **Main App**: http://127.0.0.1:8000
- **Admin Login**: http://127.0.0.1:8000/admin/login
- **Shop Owner**: http://127.0.0.1:8000/shop-owner/login

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@solespace.com | password123 |
| Shop Owner | shopowner@test.com | password123 |
| User | user@solespace.com | password123 |

---

**For detailed setup, see `README_DETAILED.md`**
