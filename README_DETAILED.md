# SoleSpace - Shop Management Platform

A comprehensive Laravel 12 + React TypeScript application for managing multiple shops with dual authentication systems (Shop Owners, Super Admins, and Users).

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [System Requirements](#system-requirements)
- [Dependencies](#dependencies)
- [Installation Guide](#installation-guide)
- [Environment Setup](#environment-setup)
- [Database Configuration](#database-configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Features](#features)
- [Authentication Roles](#authentication-roles)
- [Troubleshooting](#troubleshooting)
- [Testing](#testing)

## 🎯 Project Overview

SoleSpace is a modern web application that enables:
- **Shop Owners** to manage their business, products, and services
- **Super Admins** to manage the platform, users, and shop approvals
- **Users** to browse and interact with shops

### Key Technologies

- **Backend**: Laravel 12.26.4 with Inertia.js v2.0.1
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 7.3.1
- **Database**: MySQL
- **Styling**: Tailwind CSS
- **UI Components**: SweetAlert2, Custom React Components

## 💻 System Requirements

### Minimum Requirements
- PHP 8.2 or higher
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- MySQL 5.7 or higher
- Composer 2.0 or higher

### Recommended
- PHP 8.3+
- Node.js 20+
- MySQL 8.0+
- 2GB RAM minimum
- 500MB free disk space

### Supported Operating Systems
- Windows 10/11 (with XAMPP)
- macOS 11+
- Linux (Ubuntu 20.04+)

## 📦 Dependencies

### Backend Dependencies (PHP)

```bash
# Core Framework
laravel/framework: ^12.26.4
laravel/tinker: ^2.9

# Frontend Integration
inertiajs/inertia-laravel: ^2.0.1
tightenco/ziggy: ^2.0

# Authentication
laravel/sanctum: ^4.0

# Database
doctrine/dbal: ^3.8

# Development
laravel/pint: ^1.13
phpunit/phpunit: ^11.0
mockery/mockery: ^1.6
fakerphp/faker: ^1.23
laravel/factory-boy: ^0.0.1
```

### Frontend Dependencies (Node.js)

```bash
# Core
react: ^18.3.1
react-dom: ^18.3.1
typescript: ^5.6
@inertiajs/react: ^2.0.1
@inertiajs/vue3: ^2.0.1

# Build Tools
vite: ^7.3.1
@vitejs/plugin-react: ^4.3.0
laravel-vite-plugin: ^1.0.1

# UI & Styling
tailwindcss: ^3.4.1
postcss: ^8.4.31
autoprefixer: ^10.4.16
sweetalert2: ^11.10.5

# Routing
react-router: ^6.20.1
react-router-dom: ^6.20.1

# Development
@types/react: ^18.3.3
@types/react-dom: ^18.3.0
eslint: ^8.55.0
@typescript-eslint/eslint-plugin: ^6.16.0
@typescript-eslint/parser: ^6.16.0
```

## 🚀 Installation Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/hyde-dev001/solespace.git
cd solespace
```

### Step 2: Install Backend Dependencies

```bash
# Using Composer
composer install

# If you encounter issues with dependencies, try:
composer install --prefer-dist --no-interaction
```

### Step 3: Install Frontend Dependencies

```bash
# Using npm with legacy peer deps flag
npm install --legacy-peer-deps

# Alternative if the above fails:
npm install --force
```

### Step 4: Create Environment File

```bash
# Copy the example environment file
cp .env.example .env

# Or create manually with required variables (see Environment Setup section)
```

### Step 5: Generate Application Key

```bash
php artisan key:generate
```

### Step 6: Create Symbolic Link for Storage

```bash
php artisan storage:link
```

## 🔧 Environment Setup

### Create `.env` File

Create a `.env` file in the root directory with the following configuration:

```env
APP_NAME=SoleSpace
APP_ENV=local
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=solespace
DB_USERNAME=root
DB_PASSWORD=

# Mail Configuration (Optional)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@solespace.com
MAIL_FROM_NAME="${APP_NAME}"

# Session Configuration
SESSION_DRIVER=database
SESSION_LIFETIME=120

# Cache Configuration
CACHE_DRIVER=file

# Queue Configuration
QUEUE_CONNECTION=sync

# Vite Configuration
VITE_APP_NAME="${APP_NAME}"
```

## 🗄️ Database Configuration

### Step 1: Create MySQL Database

```bash
# Using MySQL command line
mysql -u root -p
CREATE DATABASE solespace;
EXIT;

# Or using PhpMyAdmin (if using XAMPP)
# Navigate to http://127.0.0.1/phpmyadmin
# Create new database named 'solespace'
```

### Step 2: Run Migrations

```bash
# Run all migrations
php artisan migrate

# Run with seed data (includes test accounts)
php artisan migrate:fresh --seed

# Check migration status
php artisan migrate:status
```

### Step 3: Seed Test Data (Optional)

```bash
# Create test accounts
php artisan db:seed
```

### Test Credentials After Seeding

**Super Admin:**
- Email: admin@solespace.com
- Password: password123

**Shop Owner:**
- Email: shopowner@test.com
- Password: password123

**User:**
- Email: user@solespace.com
- Password: password123

## ▶️ Running the Application

### Terminal 1: Start Laravel Server

```bash
# Navigate to project directory
cd c:\xampp\htdocs\thesis\ -\ admin\solespace

# Start the development server
php artisan serve --host=127.0.0.1 --port=8000

# Server will run at: http://127.0.0.1:8000
```

### Terminal 2: Start Vite Dev Server

```bash
# In a new terminal, navigate to project directory
cd c:\xampp\htdocs\thesis\ -\ admin\solespace

# Start Vite development server
npm run dev

# Vite will run at: http://localhost:5173
```

### Access the Application

- **Main URL**: http://127.0.0.1:8000
- **Vite Dev**: http://localhost:5173
- **Admin Login**: http://127.0.0.1:8000/admin/login
- **Shop Owner Login**: http://127.0.0.1:8000/shop-owner/login
- **User Login**: http://127.0.0.1:8000/user/login

## 📁 Project Structure

```
solespace/
├── app/
│   ├── Http/
│   │   ├── Controllers/        # Backend controllers
│   │   │   ├── ShopOwnerAuthController.php
│   │   │   ├── SuperAdminController.php
│   │   │   └── UserAuthController.php
│   │   └── Middleware/         # Custom middleware
│   └── Models/                 # Eloquent models
│       ├── User.php
│       ├── ShopOwner.php
│       ├── SuperAdmin.php
│       └── ShopDocument.php
│
├── config/                     # Configuration files
│   ├── auth.php               # Authentication guards setup
│   ├── database.php           # Database configuration
│   └── session.php            # Session configuration
│
├── database/
│   ├── migrations/            # Database migration files
│   │   ├── 2026_01_14_205002_create_shop_owners_table.php
│   │   ├── 2026_01_14_205010_create_shop_documents_table.php
│   │   ├── 2026_01_15_110000_create_super_admins_table.php
│   │   └── ...
│   ├── factories/             # Model factories for testing
│   └── seeders/               # Database seeders
│
├── resources/
│   ├── css/                   # Tailwind CSS files
│   ├── views/                 # Laravel Blade views (minimal)
│   └── js/
│       ├── Pages/             # React page components
│       │   ├── UserSide/      # User-facing pages
│       │   ├── SuperAdmin/    # Super admin pages
│       │   └── ShopOwner/     # Shop owner pages
│       ├── components/        # Reusable React components
│       │   ├── common/
│       │   ├── header/
│       │   ├── ui/
│       │   └── sidebar/
│       ├── context/           # React context providers
│       │   ├── ThemeContext.tsx
│       │   └── SidebarContext.tsx
│       ├── hooks/             # Custom React hooks
│       ├── icons/             # SVG icon components
│       ├── layout/            # Layout components
│       │   ├── AppLayout.tsx
│       │   ├── AppLayout_shopOwner.tsx
│       │   ├── AppHeader.tsx
│       │   └── AppSidebar.tsx
│       └── app.jsx            # React entry point
│
├── routes/
│   ├── web.php                # Main web routes
│   ├── api.php                # API routes
│   └── console.php            # Console commands
│
├── storage/
│   ├── app/                   # File uploads storage
│   ├── framework/             # Laravel framework files
│   └── logs/                  # Application logs
│
├── tests/                     # Test files
│   ├── Feature/               # Feature tests
│   └── Unit/                  # Unit tests
│
├── vite.config.js            # Vite configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Node.js dependencies
├── composer.json              # PHP dependencies
└── phpunit.xml                # PHPUnit configuration
```

## ✨ Features

### For Shop Owners
- ✅ Business profile management
- ✅ Product/service management
- ✅ Customer inquiries
- ✅ Analytics dashboard
- ✅ Operating hours configuration
- ✅ Shop customization

### For Super Admins
- ✅ Shop owner management
- ✅ Shop approval/rejection system
- ✅ User management
- ✅ Platform analytics
- ✅ System configuration
- ✅ Rejection reason tracking

### For Users
- ✅ Shop browsing
- ✅ Product search
- ✅ Service inquiry
- ✅ User profile management
- ✅ Favorite shops

## 🔐 Authentication Roles

### Three Guard System

The application uses Laravel's multi-guard authentication system:

```php
// config/auth.php
'guards' => [
    'user' => ['driver' => 'session', 'provider' => 'users'],
    'shop_owner' => ['driver' => 'session', 'provider' => 'shop_owners'],
    'super_admin' => ['driver' => 'session', 'provider' => 'super_admins'],
]
```

### Route Protection

```php
// Protecting routes by guard
Route::middleware('auth:super_admin')->group(function () {
    Route::get('/admin/dashboard', [SuperAdminController::class, 'dashboard']);
});

Route::middleware('auth:shop_owner')->group(function () {
    Route::get('/shop-owner/dashboard', [ShopOwnerController::class, 'dashboard']);
});

Route::middleware('auth:user')->group(function () {
    Route::get('/user/dashboard', [UserController::class, 'dashboard']);
});
```

## 🐛 Troubleshooting

### Issue: "Cannot find module" errors

**Solution:**
```bash
npm install --legacy-peer-deps
# or
npm install --force
```

### Issue: Database connection error

**Solution:**
```bash
# Check .env database settings
# Make sure MySQL is running
# Verify database name exists

# Reset database
php artisan migrate:fresh --seed
```

### Issue: Vite not compiling assets

**Solution:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite
rm -rf .vite

# Reinstall dependencies
npm install --legacy-peer-deps

# Restart Vite
npm run dev
```

### Issue: "Class not found" error

**Solution:**
```bash
# Regenerate autoloader
composer dump-autoload

# Clear all caches
php artisan optimize:clear
php artisan cache:clear
```

### Issue: Storage link permission denied

**Solution:**
```bash
# Recreate storage link
php artisan storage:link --force

# Or manually create symlink (Windows)
mklink /D public\storage storage\app\public
```

### Issue: Port already in use

**Solution:**
```bash
# For Laravel (port 8000)
php artisan serve --host=127.0.0.1 --port=8001

# For Vite (port 5173)
npm run dev -- --port 5174
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/AuthenticationTest.php

# Run with coverage
php artisan test --coverage
```

### Test Authentication

```bash
# Using Tinker
php artisan tinker

# Create test shop owner
ShopOwner::create([
    'first_name' => 'Test',
    'last_name' => 'Owner',
    'email' => 'test@solespace.com',
    'password' => bcrypt('password123'),
    'status' => 'approved',
]);
```

## 📝 API Documentation

### Authentication Endpoints

```bash
# Super Admin Login
POST /admin/login
Content-Type: application/x-www-form-urlencoded
email=admin@solespace.com&password=password123

# Shop Owner Login
POST /shop-owner/login
Content-Type: application/x-www-form-urlencoded
email=shopowner@test.com&password=password123

# User Login
POST /user/login
Content-Type: application/x-www-form-urlencoded
email=user@solespace.com&password=password123

# Logout (All guards)
POST /logout
```

## 🔄 Production Deployment

### Build for Production

```bash
# Build frontend assets
npm run build

# Build Laravel for production
composer install --no-dev --optimize-autoloader

# Run migrations on production database
php artisan migrate --force

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Environment Configuration

Update `.env` for production:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Stronger security settings
SESSION_SECURE_COOKIES=true
SESSION_SAME_SITE=strict
```

## 📚 Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Inertia.js Documentation](https://inertiajs.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)

## 📞 Support & Issues

For issues and feature requests, please:
1. Check [Troubleshooting](#troubleshooting) section
2. Review project logs: `storage/logs/laravel.log`
3. Check browser console for frontend errors
4. Open an issue on the repository

## 📄 License

This project is open-source software licensed under the MIT license.

## 👨‍💻 Development Notes

- **Last Updated**: January 16, 2026
- **PHP Version**: 8.2+
- **Node Version**: 18+
- **Database**: MySQL 5.7+

---

**For detailed setup assistance, follow the Installation Guide section above step by step.**
