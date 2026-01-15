# SoleSpace - Shoe Store Admin Management System

A comprehensive admin panel for managing shoe store operations, including shop registrations, user management, and system monitoring. Built with Laravel 11, React, Inertia.js, and Tailwind CSS.

![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=flat&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react&logoColor=black)
![Inertia.js](https://img.shields.io/badge/Inertia.js-2.x-9553E9?style=flat&logo=inertia&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Super Admin Features
- **Shop Registration Management** - Review and approve/reject shop owner registrations
- **User Management** - Manage regular user accounts separately from admins
- **Admin Management** - Dedicated interface for managing administrator accounts
- **Shop Management** - Monitor and manage registered shops
- **Dark Mode** - Persistent theme switching with system preference detection
- **Data Reports** - Analytics and system monitoring
- **Flagged Accounts** - Security monitoring for suspicious activities

### User Features
- **User Registration** - Complete registration with age verification and valid ID upload
- **Shop Owner Registration** - Business registration with document verification
- **Responsive Design** - Mobile and desktop friendly interface

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **PHP** >= 8.2
- **Composer** >= 2.0
- **Node.js** >= 18.x and npm >= 9.x
- **MySQL** >= 8.0 or MariaDB >= 10.3
- **XAMPP** (recommended for Windows) or equivalent LAMP/WAMP stack

### Required PHP Extensions
- OpenSSL, PDO, Mbstring, Tokenizer, XML, Ctype, JSON, BCMath, Fileinfo, GD

## 📥 Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd "thesis - admin"
```

### 2. Backend Setup (Laravel)

```bash
# Navigate to backend directory
cd backend

# Install PHP dependencies
composer install

# Copy environment file
copy .env.example .env
# For Linux/Mac: cp .env.example .env

# Generate application key
php artisan key:generate

# Create storage symlink
php artisan storage:link
```

### 3. Install Node Dependencies

```bash
cd backend
npm install --legacy-peer-deps
```

## ⚙️ Configuration

### 1. Database Configuration

Edit the `.env` file in the `backend` directory:

```env
APP_NAME="SoleSpace Admin"
APP_ENV=local
APP_KEY=base64:YourGeneratedKeyHere
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=shoe_store
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=file
SESSION_LIFETIME=120
```

### 2. Create MySQL Database

**Using phpMyAdmin:**
1. Start Apache and MySQL in XAMPP Control Panel
2. Open phpMyAdmin (http://localhost/phpmyadmin)
3. Click "New" to create a database
4. Name it `shoe_store`
5. Set collation to `utf8mb4_unicode_ci`

**Using MySQL Command:**
```sql
CREATE DATABASE shoe_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 🗄️ Database Setup

### Run Migrations

```bash
cd backend
php artisan migrate
```

This creates all necessary tables:
- `users` - Regular user accounts
- `super_admins` - Administrator accounts
- `shop_owners` - Shop owner registrations
- `shop_documents` - Shop business documents

### Create Super Admin Account

```bash
cd backend
php artisan tinker
```

Then execute:

```php
$admin = new App\Models\SuperAdmin();
$admin->first_name = 'Admin';
$admin->last_name = 'User';
$admin->email = 'admin@solespace.com';
$admin->password = bcrypt('password123');
$admin->role = 'super_admin';
$admin->status = 'active';
$admin->save();
exit
```

## 🚀 Running the Application

You need to run TWO servers simultaneously:

### Terminal 1 - Laravel Backend:
```bash
cd backend
php artisan serve
```
This starts Laravel at `http://127.0.0.1:8000`

### Terminal 2 - Vite Development Server:
```bash
cd backend
npm run dev
```
This starts Vite at `http://localhost:5173`

### Alternative: Using Background Processes (Windows PowerShell)

```powershell
# Start Laravel in background
cd backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; php artisan serve"

# Start Vite in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
```

## 💻 Usage

### Access Points

1. **Super Admin Login**: http://127.0.0.1:8000/admin/login
   - Default Email: `admin@solespace.com`
   - Default Password: `password123`

2. **User Registration**: http://127.0.0.1:8000/register

3. **Shop Owner Registration**: http://127.0.0.1:8000/shop/register

### Super Admin Features

#### Dashboard Routes
- `/admin/dashboard` - Main dashboard
- `/admin/user-management` - Manage regular users
- `/admin/admin-management` - Manage admin accounts
- `/admin/shop-registrations` - Review pending shops
- `/admin/registered-shops` - View approved shops
- `/admin/flagged-accounts` - Security monitoring
- `/admin/data-reports` - Analytics
- `/admin/system-monitoring` - System health

#### User Management
- View all regular users (separate from admins)
- Filter by: All, Active, Suspended, Inactive
- Search by name or email
- Actions: Suspend, Activate, Delete, View Details
- View user's uploaded valid ID

#### Admin Management
- Separate interface for admin accounts
- View all admins except yourself
- Actions: Suspend, Activate, Delete
- Cannot delete your own account

## 🔍 Troubleshooting

### Issue: "Class not found" errors
```bash
cd backend
composer dump-autoload
```

### Issue: Vite connection refused
```bash
# Stop all node processes (PowerShell)
Get-Process | Where-Object {$_.ProcessName -match "npm|node"} | Stop-Process -Force

# Clear Vite cache
cd backend
Remove-Item -Path ".vite", "node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue

# Restart Vite
npm run dev
```

### Issue: Storage not found
```bash
cd backend
php artisan storage:link
```

### Issue: Database connection errors
- Verify XAMPP MySQL is running
- Check `.env` database credentials
- Ensure `shoe_store` database exists
- Check MySQL port (default: 3306)

### Issue: Port already in use
```bash
# For Laravel (change port)
php artisan serve --port=8001

# For Vite (edit vite.config.js)
# Update the server.port value
```

### Issue: CSS not loading / White screen
- Ensure Vite is running: `npm run dev`
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console (F12) for errors
- Verify APP_URL in .env matches your Laravel server

### Issue: Permission errors (Linux/Mac)
```bash
cd backend
chmod -R 775 storage bootstrap/cache
chown -R $USER:www-data storage bootstrap/cache
```

## 📁 Project Structure

```
thesis - admin/
├── backend/                    # Laravel Backend
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       ├── SuperAdminController.php      # Main admin logic
│   │   │       ├── SuperAdminAuthController.php  # Admin authentication
│   │   │       └── UserController.php            # User operations
│   │   └── Models/
│   │       ├── User.php                          # User model
│   │       ├── SuperAdmin.php                    # Admin model
│   │       ├── ShopOwner.php                     # Shop owner model
│   │       └── ShopDocument.php                  # Shop documents
│   ├── database/
│   │   └── migrations/                           # Database migrations
│   ├── resources/
│   │   ├── js/
│   │   │   ├── Pages/
│   │   │   │   ├── superAdmin/                   # Admin pages
│   │   │   │   │   ├── SuperAdminUserManagement.jsx
│   │   │   │   │   ├── AdminManagement.jsx
│   │   │   │   │   ├── ShopRegistrations.jsx
│   │   │   │   │   └── RegisteredShops.jsx
│   │   │   │   └── userSide/                     # User pages
│   │   │   │       ├── UserRegistration.jsx
│   │   │   │       └── ShopOwnerRegistration.jsx
│   │   │   └── Layouts/
│   │   │       └── SuperAdminLayout.jsx          # Main layout
│   │   └── css/
│   │       └── app.css                           # Styles
│   ├── routes/
│   │   └── web.php                               # Route definitions
│   ├── storage/
│   │   └── app/
│   │       └── public/
│   │           └── valid_ids/                    # User ID uploads
│   ├── .env                                      # Environment config
│   ├── composer.json                             # PHP dependencies
│   ├── package.json                              # Node dependencies
│   └── vite.config.js                           # Vite configuration
├── .gitignore
└── README.md
```

## 🏗️ Building for Production

```bash
cd backend

# Build assets
npm run build

# Optimize autoloader
composer install --optimize-autoloader --no-dev

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set environment
# Edit .env: APP_ENV=production, APP_DEBUG=false
```

## 🔐 Security Notes

- Change default admin credentials immediately
- Never commit `.env` file
- Set `APP_DEBUG=false` in production
- Use HTTPS in production
- Regularly update dependencies
- Implement rate limiting for login attempts

## 📝 Key Files to Review

- `backend/routes/web.php` - All application routes
- `backend/app/Http/Controllers/SuperAdminController.php` - Main admin logic
- `backend/resources/js/Layouts/SuperAdminLayout.jsx` - Sidebar navigation
- `backend/.env` - Environment configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 📞 Support

For support, open an issue in the repository.

---

**Note**: This is a thesis project for educational purposes.
