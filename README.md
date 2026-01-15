# SoleSpace - Integrated Shoe Store Management System

A comprehensive full-stack application for managing shoe retail and repair services. Built with Laravel 12, React 19, Inertia.js, and Tailwind CSS 4, featuring separate admin dashboards for super admins and shop owners.

![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat&logo=react&logoColor=black)
![Inertia.js](https://img.shields.io/badge/Inertia.js-2.x-9553E9?style=flat&logo=inertia&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?style=flat&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql&logoColor=white)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Default Credentials](#default-credentials)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Super Admin Dashboard
- **Shop Registration Management** - Review, approve/reject shop owner applications with document verification
- **User Management** - Complete CRUD operations for customer accounts with status management
- **Admin Management** - Dedicated interface for managing administrator accounts
- **Flagged Accounts** - Security monitoring and management for suspicious activities
- **Analytics Dashboard** - Real-time statistics and system monitoring
- **Dark Mode** - Persistent theme switching with smooth transitions
- **Responsive Design** - Fully optimized for desktop, tablet, and mobile devices

### Shop Owner Dashboard
- **Ecommerce Dashboard** - 
  - Customer and order metrics with trend indicators
  - Interactive charts (Monthly Sales Bar Chart, Monthly Target Line Chart)
  - Recent orders table with status tracking
- **Calendar Management** - 
  - FullCalendar integration with event CRUD operations
  - Multiple view modes (Day, Week, Month)
  - Color-coded event categories
- **User Access Control** - 
  - Employee management with role assignment
  - Role & permissions system with custom permissions
  - User account activation/suspension with reason tracking
  - Advanced filtering and search capabilities

### Authentication & Security
- **Multi-Guard Authentication** - Separate auth systems for super admin and shop owners
- **Session Management** - Secure session handling with token regeneration
- **CSRF Protection** - Built-in Laravel CSRF token validation
- **Remember Me** - Optional persistent login functionality
- **SweetAlert2 Integration** - Professional confirmation dialogs and notifications

### User-Facing Features
- **Landing Page** - Modern, professional design with hero section and feature showcase
- **User Registration** - Complete registration with age verification and valid ID upload
- **Shop Owner Registration** - Business registration with comprehensive document verification

## 🛠️ Tech Stack

### Backend
- **Laravel 12.47.0** - PHP framework
- **MySQL 8.0** - Database
- **Inertia.js 2.3.8** - Modern monolith approach
- **Multi-guard Authentication** - Separate guards for admins and shop owners

### Frontend
- **React 19.2.3** - UI library with JSX
- **Vite 7.3.1** - Fast build tool and dev server
- **Tailwind CSS 4.0.0** - Utility-first CSS framework
- **SweetAlert2 11.26.17** - Beautiful alert/confirmation dialogs
- **FullCalendar 6.1.20** - Event calendar with interaction
- **Recharts** - Data visualization and charting library

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
git clone https://github.com/YOUR_USERNAME/thesis-admin.git
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
npm install
```

## ⚙️ Configuration

### 1. Database Configuration

Edit the `.env` file in the `backend` directory:

```env
APP_NAME="SoleSpace"
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
SESSION_DOMAIN=127.0.0.1
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
- `users` - Regular user accounts with shop owner association
- `super_admins` - Administrator accounts
- `shop_owners` - Shop owner registrations with authentication
- `shop_documents` - Shop business documents
- `employees` - Shop employee management
- `roles` - Permission roles
- `calendar_events` - Shop calendar events
- `orders` - Order tracking
- `sessions` - Session management

### Create Test Accounts

#### Super Admin Account
```bash
cd backend
php artisan tinker
```

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

#### Shop Owner Account
```bash
php artisan tinker
```

```php
$shopOwner = new App\Models\ShopOwner();
$shopOwner->first_name = 'Test';
$shopOwner->last_name = 'Shop';
$shopOwner->email = 'shopowner@test.com';
$shopOwner->password = bcrypt('password123');
$shopOwner->phone = '09123456789';
$shopOwner->business_name = 'Test Shop';
$shopOwner->business_address = '123 Test Street';
$shopOwner->business_type = 'Retail';
$shopOwner->registration_type = 'DTI';
$shopOwner->status = 'approved';
$shopOwner->save();
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

1. **Landing Page**: http://127.0.0.1:8000/
2. **Super Admin Login**: http://127.0.0.1:8000/admin/login
3. **Shop Owner Login**: http://127.0.0.1:8000/shop-owner/login
4. **User Registration**: http://127.0.0.1:8000/register
5. **Shop Owner Registration**: http://127.0.0.1:8000/shop/register

## 🔑 Default Credentials

### Super Admin
- **Email**: admin@solespace.com
- **Password**: password123
- **Access**: Full system administration

### Shop Owner (Test Account)
- **Email**: shopowner@test.com
- **Password**: password123
- **Access**: Shop dashboard, calendar, user access control

## 📁 Project Structure

```
thesis - admin/
├── backend/                          # Laravel application
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── ShopOwner/       # Shop owner controllers
│   │   │   │   │   ├── AuthController.php
│   │   │   │   │   └── DashboardController.php
│   │   │   │   └── SuperAdminController.php
│   │   │   └── Middleware/
│   │   │       └── HandleInertiaRequests.php
│   │   └── Models/
│   │       ├── ShopOwner.php
│   │       ├── SuperAdmin.php
│   │       └── User.php
│   ├── config/
│   │   └── auth.php                 # Multi-guard configuration
│   ├── database/
│   │   └── migrations/              # Database schema
│   ├── resources/
│   │   ├── css/
│   │   ├── js/
│   │   │   ├── Components/          # Reusable React components
│   │   │   ├── Layouts/
│   │   │   │   ├── SuperAdminLayout.jsx
│   │   │   │   └── ShopOwnerLayout.jsx
│   │   │   └── Pages/
│   │   │       ├── superAdmin/      # Super admin pages
│   │   │       ├── shopOwner/       # Shop owner pages
│   │   │       │   ├── EcommerceDashboard.jsx
│   │   │       │   ├── Calendar.jsx
│   │   │       │   └── UserAccessControl.jsx
│   │   │       └── userSide/        # Public pages
│   │   └── views/
│   │       └── app.blade.php
│   ├── routes/
│   │   └── web.php                  # Application routes
│   ├── .env                         # Environment configuration
│   ├── composer.json
│   ├── package.json
│   └── vite.config.js
├── frontend/                         # (Empty - consolidated in backend)
└── README.md
```

## 🎨 Key Features Details

### Super Admin Dashboard
- **Shop Registration Management**: Review pending applications, approve/reject with reasons, view documents
- **User Management**: Full CRUD operations, status management (active/suspended/inactive), search and filter
- **Admin Management**: Separate admin account management with role assignment
- **Flagged Accounts**: Monitor and manage accounts flagged for suspicious activity
- **Dark Mode**: Persistent theme with localStorage and smooth transitions

### Shop Owner Dashboard
- **Ecommerce Dashboard**:
  - Real-time metrics cards with trend indicators
  - Interactive Recharts visualizations (Bar chart for monthly sales, Line chart for target vs actual)
  - Recent orders table with pagination
  
- **Calendar**:
  - FullCalendar integration with day/week/month views
  - Event CRUD operations with modal forms
  - Color-coded event categories (Danger, Success, Primary, Warning)
  - Click-to-create and drag-to-select event creation
  
- **User Access Control**:
  - Three-tab interface (Employees, Roles, Users)
  - Employee management with role assignment
  - Custom roles with granular permissions
  - User account activation/suspension with reason tracking
  - Advanced search and filtering

## 🔍 Troubleshooting

### Issue: "Class not found" errors
```bash
cd backend
composer dump-autoload
php artisan clear-compiled
php artisan config:clear
```

### Issue: Vite connection refused
```bash
# Stop all node processes (PowerShell)
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force

# Restart Vite
cd backend
npm run dev
```

### Issue: 419 CSRF Token Mismatch
- Clear browser cache and cookies
- Ensure Vite dev server is running
- Check `resources/views/app.blade.php` has CSRF meta tag
- Verify axios configuration in `resources/js/bootstrap.js`

### Issue: Storage not found
```bash
cd backend
php artisan storage:link
```

### Issue: Database connection errors
- Verify XAMPP MySQL is running
- Check `.env` database credentials
- Ensure `shoe_store` database exists
- Test connection: `php artisan migrate:status`

### Issue: Charts not displaying
- Ensure recharts is installed: `npm list recharts`
- Clear Vite cache and restart: `npm run dev`
- Check browser console for errors

### Issue: Logout not working
- Clear application cache: `php artisan cache:clear`
- Clear config cache: `php artisan config:clear`
- Ensure session driver is properly configured in `.env`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is part of a thesis and is for educational purposes.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- Laravel Framework
- React & Inertia.js communities
- Tailwind CSS team
- FullCalendar
- Recharts
- SweetAlert2

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
