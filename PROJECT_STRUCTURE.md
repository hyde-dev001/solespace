# Project Structure & File Guide

Complete guide to the Solespace project structure.

---

## 📁 Root Directory Structure

```
solespace/
├── backend/                          # Laravel application (PHP/API)
├── frontend/                         # React TypeScript application (UI)
├── public/                           # Web-accessible files
├── storage/                          # Application files (logs, uploads)
├── vendor/                           # PHP packages (composer)
├── node_modules/                     # JavaScript packages (npm)
├── .env                              # Environment variables (secret - not in git)
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore rules
├── composer.json                     # PHP dependencies
├── composer.lock                     # Locked PHP versions
├── package.json                      # JavaScript dependencies
├── package-lock.json                 # Locked JavaScript versions
├── vite.config.ts                    # Vite build configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
├── eslint.config.js                  # ESLint configuration
│
├── DOCUMENTATION FILES (2,860+ lines)
├── README.md                         # Main GitHub README
├── README_DETAILED.md                # Comprehensive guide
├── QUICK_START.md                    # 5-minute setup
├── WINDOWS_XAMPP_SETUP.md            # Windows-specific setup
├── DEPENDENCIES.md                   # All dependencies with versions
├── API_DOCUMENTATION.md              # API endpoints & routes
├── TROUBLESHOOTING.md                # Common issues & solutions
├── GITHUB_SETUP.md                   # GitHub & deployment guide
├── GITHUB_PUSH_GUIDE.md              # Simple GitHub push steps
├── DOCUMENTATION_INDEX.md            # Documentation navigation
├── DEPLOYMENT_CHECKLIST.md           # Pre-production checklist
├── DOCUMENTATION_SUMMARY.md          # This summary
└── PROJECT_STRUCTURE.md              # This file
```

---

## 📦 Backend (Laravel/PHP) Directory

```
backend/
├── app/                              # Application code
│   ├── Http/
│   │   ├── Controllers/              # API request handlers
│   │   ├── Middleware/               # Request middleware
│   │   └── Requests/                 # Form validation rules (optional)
│   ├── Models/
│   │   ├── User.php                  # User model
│   │   ├── ShopOwner.php             # Shop owner model
│   │   ├── ShopDocument.php          # Document model
│   │   └── SuperAdmin.php            # Admin model
│   ├── Providers/
│   │   └── AppServiceProvider.php    # Service provider
│   └── Events/                       # Application events (optional)
│
├── bootstrap/
│   ├── app.php                       # Bootstrap file
│   ├── providers.php                 # Service providers
│   └── cache/                        # Bootstrap cache
│
├── config/                           # Configuration files
│   ├── app.php                       # App configuration
│   ├── auth.php                      # Authentication guards
│   ├── database.php                  # Database configuration
│   ├── cache.php                     # Cache configuration
│   ├── session.php                   # Session configuration
│   ├── filesystems.php               # Storage configuration
│   ├── mail.php                      # Mail configuration
│   ├── cors.php                      # CORS configuration
│   └── ... (other configs)
│
├── database/
│   ├── migrations/                   # Database migrations
│   │   ├── 2026_01_14_205002_create_shop_owners_table.php
│   │   ├── 2026_01_14_205010_create_shop_documents_table.php
│   │   ├── 2026_01_14_220854_create_sessions_table.php
│   │   └── ... (other migrations)
│   ├── factories/                    # Fake data factories
│   │   └── UserFactory.php
│   └── seeders/                      # Database seeders
│       └── DatabaseSeeder.php
│
├── public/                           # Web root (served to users)
│   ├── index.php                     # Entry point
│   ├── robots.txt                    # SEO robots file
│   └── storage/                      # Symlink to storage/app/public
│
├── resources/
│   ├── views/                        # Blade templates (if used)
│   ├── css/                          # Global CSS
│   └── js/                           # JavaScript/TypeScript
│       ├── app.jsx                   # React entry point
│       ├── Pages/                    # React page components
│       │   ├── Auth/
│       │   │   ├── Login.tsx
│       │   │   └── Register.tsx
│       │   ├── Dashboard.tsx
│       │   ├── UserSide/             # User-specific pages
│       │   ├── ShopOwner/            # Shop owner pages
│       │   │   ├── Dashboard.tsx
│       │   │   └── Profile.tsx
│       │   └── Admin/                # Admin pages
│       │       ├── Dashboard.tsx
│       │       └── UserManagement.tsx
│       ├── components/               # Reusable components
│       │   ├── header/               # Header components
│       │   │   ├── UserDropdown.tsx
│       │   │   └── ThemeToggleButton.tsx
│       │   ├── sidebar/              # Sidebar components
│       │   ├── forms/                # Form components
│       │   └── common/               # Common components
│       ├── layout/                   # Layout components
│       │   ├── AppLayout.tsx         # Admin layout
│       │   ├── AppLayout_shopOwner.tsx  # Shop owner layout
│       │   ├── AppHeader.tsx         # Admin header
│       │   ├── AppHeader_shopOwner.tsx  # Shop owner header
│       │   ├── AppSidebar.tsx        # Admin sidebar
│       │   └── AppSidebar_shopOwner.tsx # Shop owner sidebar
│       ├── hooks/                    # Custom React hooks
│       ├── context/                  # Context providers
│       │   ├── ThemeProvider.tsx     # Dark/light mode
│       │   └── SidebarProvider.tsx   # Sidebar state
│       ├── services/                 # API services
│       │   └── api.ts               # API client
│       └── icons/                    # SVG icons
│
├── routes/
│   ├── web.php                       # Web routes
│   └── console.php                   # Console commands
│
├── storage/                          # Application storage
│   ├── app/
│   │   └── public/                   # User uploads
│   ├── framework/
│   │   ├── cache/
│   │   ├── sessions/
│   │   └── views/
│   └── logs/                         # Application logs
│
├── tests/                            # Test files
│   ├── TestCase.php
│   ├── Feature/                      # Feature tests
│   └── Unit/                         # Unit tests
│
├── .env                              # Environment variables (secret)
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore rules
├── artisan                           # Laravel CLI tool
├── composer.json                     # PHP dependencies
├── composer.lock                     # Locked PHP versions
├── phpunit.xml                       # Testing configuration
└── README.md                         # Backend README
```

---

## 🎨 Frontend (React/TypeScript) Directory

```
frontend/
├── src/                              # Source code
│   ├── main.tsx                      # React entry point
│   ├── App.tsx                       # Root component
│   ├── index.css                     # Global styles
│   ├── svg.d.ts                      # SVG type definitions
│   ├── vite-env.d.ts                 # Vite type definitions
│   │
│   ├── components/                   # Reusable components
│   │   ├── header/
│   │   │   ├── AppHeader.tsx         # Admin header
│   │   │   ├── AppHeader_shopOwner.tsx  # Shop owner header
│   │   │   ├── UserDropdown.tsx      # User dropdown menu
│   │   │   ├── ThemeToggleButton.tsx # Dark mode toggle
│   │   │   └── NotificationDropdown.tsx # Notifications
│   │   ├── sidebar/
│   │   │   ├── AppSidebar.tsx        # Admin sidebar
│   │   │   └── AppSidebar_shopOwner.tsx # Shop owner sidebar
│   │   ├── forms/                    # Form components
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   └── common/                   # Common components
│   │       ├── Backdrop.tsx
│   │       └── Loading.tsx
│   │
│   ├── pages/                        # Page components
│   │   ├── Auth/
│   │   │   ├── Login.tsx             # User login
│   │   │   └── Register.tsx          # User registration
│   │   ├── Dashboard.tsx             # User dashboard
│   │   ├── Profile.tsx               # User profile
│   │   ├── UserSide/                 # User-specific pages
│   │   │   └── ... (user pages)
│   │   ├── ShopOwner/                # Shop owner pages
│   │   │   ├── Login.tsx             # Shop owner login
│   │   │   ├── Dashboard.tsx         # Shop owner dashboard
│   │   │   └── Profile.tsx           # Shop owner profile
│   │   └── Admin/                    # Admin pages
│   │       ├── Login.tsx             # Admin login
│   │       ├── Dashboard.tsx         # Admin dashboard
│   │       └── UserManagement.tsx    # User management
│   │
│   ├── layout/                       # Layout components
│   │   ├── AppLayout.tsx             # Admin layout wrapper
│   │   ├── AppLayout_shopOwner.tsx   # Shop owner layout wrapper
│   │   ├── AppHeader.tsx             # Header layout
│   │   ├── AppHeader_shopOwner.tsx   # Shop owner header
│   │   ├── AppSidebar.tsx            # Sidebar layout
│   │   ├── AppSidebar_shopOwner.tsx  # Shop owner sidebar
│   │   └── LayoutContent.tsx         # Layout content area
│   │
│   ├── context/                      # React context providers
│   │   ├── ThemeProvider.tsx         # Dark/light mode context
│   │   ├── SidebarProvider.tsx       # Sidebar state context
│   │   └── AuthContext.tsx           # Auth state (optional)
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useTheme.ts               # Dark mode hook
│   │   ├── useSidebar.ts             # Sidebar state hook
│   │   └── useAuth.ts                # Auth hook
│   │
│   ├── services/                     # API services
│   │   ├── api.ts                    # Axios/fetch API client
│   │   ├── auth.ts                   # Auth API methods
│   │   └── user.ts                   # User API methods
│   │
│   └── icons/                        # SVG icon components
│       ├── HeartIcon.tsx
│       ├── MenuIcon.tsx
│       └── ... (other icons)
│
├── public/                           # Static assets
│   └── images/                       # Images
│       ├── logo.png
│       └── ... (other images)
│
├── index.html                        # HTML entry point
├── vite.config.ts                    # Vite build config
├── tsconfig.json                     # TypeScript config
├── tsconfig.app.json                 # App TypeScript config
├── tsconfig.node.json                # Node TypeScript config
├── tailwind.config.js                # Tailwind CSS config
├── postcss.config.js                 # PostCSS config
├── eslint.config.js                  # ESLint config
├── package.json                      # Dependencies
├── package-lock.json                 # Locked versions
├── LICENSE.md                        # License
├── README.md                         # Frontend README
└── dist/                             # Built output (generated)
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255),
    remember_token VARCHAR(100) NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Shop Owners Table
```sql
CREATE TABLE shop_owners (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    business_name VARCHAR(255),
    business_type VARCHAR(255),
    phone_number VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),
    country VARCHAR(100),
    service_type VARCHAR(255) NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Shop Documents Table
```sql
CREATE TABLE shop_documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shop_owner_id BIGINT NOT NULL,
    user_id BIGINT NULL,
    document_type VARCHAR(255),
    file_path VARCHAR(255),
    file_name VARCHAR(255),
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (shop_owner_id) REFERENCES shop_owners(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Super Admins Table
```sql
CREATE TABLE super_admins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(255) DEFAULT 'super_admin',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload LONGTEXT,
    last_activity INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## 🔐 Authentication System

Three separate authentication guards:

### Guard 1: User (`auth:user`)
- **Provider:** users table
- **Model:** App\Models\User
- **Login Route:** /login
- **Dashboard Route:** /dashboard
- **Session Key:** login_web

### Guard 2: Shop Owner (`auth:shop_owner`)
- **Provider:** shop_owners table
- **Model:** App\Models\ShopOwner
- **Login Route:** /shopowner
- **Dashboard Route:** /shopowner/dashboard
- **Session Key:** login_web_shop_owner

### Guard 3: Super Admin (`auth:super_admin`)
- **Provider:** super_admins table
- **Model:** App\Models\SuperAdmin
- **Login Route:** /admin
- **Dashboard Route:** /admin/dashboard
- **Session Key:** login_web_super_admin

---

## 🛣️ Route Structure

### Public Routes
```
GET  /                    - Landing page
GET  /login               - User login
POST /register            - User registration
GET  /shopowner           - Shop owner login page
POST /shopowner/login     - Shop owner login
GET  /admin               - Admin login page
POST /admin/login         - Admin login
```

### Protected Routes (auth:user)
```
GET  /dashboard           - User dashboard
GET  /profile             - User profile
POST /logout              - User logout
```

### Protected Routes (auth:shop_owner)
```
POST /shopowner/logout    - Shop owner logout
GET  /shopowner/dashboard - Shop owner dashboard
GET  /shopowner/profile   - Shop owner profile
POST /shopowner/update-profile - Update profile
```

### Protected Routes (auth:super_admin)
```
POST /admin/logout        - Admin logout
GET  /admin/dashboard     - Admin dashboard
GET  /admin/users         - List users
GET  /admin/shop-owners   - List shop owners
GET  /admin/settings      - Settings
```

---

## 📊 Configuration Files

### .env Variables
```
APP_NAME=Solespace
APP_DEBUG=false
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=solespace
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
SESSION_LIFETIME=525600

VITE_APP_URL=http://localhost:5173
```

### Database Configuration (config/database.php)
- **Driver:** MySQL 5.7+
- **Default Connection:** mysql
- **Host:** 127.0.0.1
- **Port:** 3306
- **Charset:** utf8mb4
- **Collation:** utf8mb4_unicode_ci

### Authentication (config/auth.php)
```php
'guards' => [
    'user' => ['driver' => 'session', 'provider' => 'users'],
    'shop_owner' => ['driver' => 'session', 'provider' => 'shop_owners'],
    'super_admin' => ['driver' => 'session', 'provider' => 'super_admins'],
]

'providers' => [
    'users' => ['driver' => 'eloquent', 'model' => App\Models\User::class],
    'shop_owners' => ['driver' => 'eloquent', 'model' => App\Models\ShopOwner::class],
    'super_admins' => ['driver' => 'eloquent', 'model' => App\Models\SuperAdmin::class],
]
```

---

## 🎨 Styling Architecture

### Tailwind CSS
- **Config:** `backend/tailwind.config.js`
- **Global CSS:** `resources/css/index.css`
- **Utilities:** Available in all components via class names

### Dark Mode
- **Provider:** `ThemeProvider` component
- **Hook:** `useTheme()` hook
- **Storage:** localStorage

### Responsive Design
- **Breakpoints:** Tailwind defaults (sm, md, lg, xl, 2xl)
- **Sidebar:** Responsive (mobile, tablet, desktop)
- **Mobile:** Full responsive navigation

---

## 🚀 Build & Development

### Development Servers
```
Frontend: http://localhost:5173 (Vite)
Backend:  http://localhost:8000 (Laravel)
```

### Build Process
```bash
# Frontend build
npm run build              # Creates frontend/dist/

# Backend (no build needed)
# Laravel serves directly
```

### Asset Pipeline
- **Frontend Assets:** Served by Vite in development
- **CSS:** Tailwind CSS compiled by Vite
- **JavaScript:** TypeScript compiled to JavaScript by Vite
- **Images:** Served from public/ directory

---

## 📦 Dependencies

### PHP (Backend)
- **Laravel 12.26.4** - Web framework
- **Inertia 2.0.1** - Frontend bridge
- **Laravel Sanctum** - API authentication
- **Doctrine DBAL** - Database abstraction

### JavaScript (Frontend)
- **React 18.3.1** - UI library
- **Vite 7.3.1** - Build tool
- **TypeScript 5.6** - Type safety
- **Tailwind CSS 3.4.1** - Styling
- **SweetAlert2 11.10.5** - Alert modals
- **React Router 6.20.1** - Client routing

See **DEPENDENCIES.md** for complete list with versions.

---

## 🔒 Security Features

- ✅ CSRF protection on all forms
- ✅ Session-based authentication
- ✅ Password hashing (bcrypt)
- ✅ SQL injection prevention (ORM)
- ✅ XSS protection (React escaping)
- ✅ Authorization middleware
- ✅ Role-based access control
- ✅ CORS configuration
- ✅ Secure headers

---

## 📝 Code Organization

### Component Structure
```
ComponentName/
├── ComponentName.tsx       # Main component
├── ComponentName.module.css # Scoped styles (if needed)
└── types.ts               # TypeScript types (if needed)
```

### File Naming
- **Components:** PascalCase (LoginForm.tsx)
- **Utilities:** camelCase (helper.ts)
- **Types:** PascalCase (User.ts)
- **Styles:** kebab-case (app-header.css)

### Import Organization
```typescript
// 1. External imports
import React from 'react'
import { Link } from 'react-router-dom'

// 2. Internal imports
import Layout from '@/layout/AppLayout'
import Button from '@/components/Button'

// 3. Local imports
import { validateEmail } from './utils'
```

---

## 🧪 Testing Structure

```
tests/
├── TestCase.php           # Base test class
├── Feature/               # Feature tests
│   ├── LoginTest.php
│   └── DashboardTest.php
└── Unit/                  # Unit tests
    ├── UserTest.php
    └── HelperTest.php
```

---

## 📚 Documentation Files

All documentation files are in the root directory:
- See **DOCUMENTATION_INDEX.md** for complete guide
- See **DOCUMENTATION_SUMMARY.md** for overview

---

## 🗑️ Excluded from Git

These directories are in `.gitignore`:
```
/vendor/              # PHP packages
/node_modules/        # JavaScript packages
/.env                 # Environment variables
/storage/logs/        # Application logs
/public/storage       # Uploaded files symlink
/bootstrap/cache/     # Bootstrap cache
/dist/                # Built frontend
```

---

## 📦 Package Files

### composer.json (PHP)
- Lists all PHP package dependencies
- Scripts for Laravel commands
- Author and license information

### package.json (JavaScript)
- Lists all npm package dependencies
- Development dependencies
- Build scripts (dev, build)

---

## 🔄 File Organization Best Practices

When adding new code:
1. Place components in `components/` or `pages/`
2. Place utilities in `services/` or `hooks/`
3. Place types in dedicated files
4. Use TypeScript strict mode
5. Follow naming conventions
6. Import from absolute paths (@/)
7. Keep files focused and single-purpose
8. Write tests alongside code

---

## 📖 Related Documentation

- **Full Details:** README_DETAILED.md
- **Quick Setup:** QUICK_START.md
- **Windows Guide:** WINDOWS_XAMPP_SETUP.md
- **API Reference:** API_DOCUMENTATION.md
- **Troubleshooting:** TROUBLESHOOTING.md

---

**This structure provides clear organization and follows Laravel and React best practices.**
