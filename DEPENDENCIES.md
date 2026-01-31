# Dependencies & Requirements Checklist

## System Dependencies

### Required Software
- [ ] **PHP 8.2+** 
  - Download: https://www.php.net/downloads
  - For Windows: Use XAMPP or Windows PHP installer
  - Verify: `php --version`

- [ ] **MySQL 5.7 or 8.0+**
  - Download: https://www.mysql.com/downloads/
  - Or use XAMPP bundled MySQL
  - Verify: `mysql --version`

- [ ] **Node.js 18.0.0+**
  - Download: https://nodejs.org/
  - Recommended: LTS version (20.x)
  - Verify: `node --version` and `npm --version`

- [ ] **Composer 2.0+**
  - Download: https://getcomposer.org/
  - Verify: `composer --version`

- [ ] **Git**
  - Download: https://git-scm.com/
  - Verify: `git --version`

### Windows Specific
- [ ] **XAMPP 8.2+** (all-in-one Apache + MySQL + PHP)
  - Download: https://www.apachefriends.org/
  - Includes: Apache, MySQL, PHP, Perl

### macOS Specific
- [ ] **Homebrew** (package manager)
  - Install: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
  
- [ ] **Command Line Tools**
  - Install: `xcode-select --install`

### Linux (Ubuntu/Debian)
```bash
# All dependencies can be installed via apt-get
sudo apt-get update
sudo apt-get install php8.2 php8.2-mysql php8.2-curl php8.2-json php8.2-xml mysql-server nodejs npm git
```

## PHP Extensions Required

These should be automatically enabled with standard PHP installations:

- [ ] **PDO** (PHP Data Objects) - Database connection
- [ ] **JSON** - JSON encoding/decoding
- [ ] **XML** - XML parsing
- [ ] **Curl** - HTTP requests
- [ ] **Fileinfo** - File type detection
- [ ] **OpenSSL** - SSL/TLS encryption
- [ ] **Tokenizer** - PHP tokenizing
- [ ] **MBSTRING** - Multi-byte string handling

### Verify PHP Extensions
```bash
php -m  # Lists all loaded extensions
```

## Backend Dependencies (PHP/Composer)

### Core Framework
```bash
✓ laravel/framework:      ^12.26.4  (Web framework)
✓ laravel/tinker:         ^2.9      (REPL for testing)
✓ inertiajs/inertia-laravel: ^2.0.1 (Frontend bridge)
✓ tightenco/ziggy:        ^2.0      (Route helper)
```

### Authentication & Security
```bash
✓ laravel/sanctum:        ^4.0      (API token authentication)
```

### Database & ORM
```bash
✓ doctrine/dbal:          ^3.8      (Database abstraction)
```

### Development Tools
```bash
✓ laravel/pint:           ^1.13     (Code formatter)
✓ phpunit/phpunit:        ^11.0     (Testing framework)
✓ mockery/mockery:        ^1.6      (Mocking library)
✓ fakerphp/faker:         ^1.23     (Fake data generator)
```

### Install with Composer
```bash
composer install
```

## Frontend Dependencies (Node.js/npm)

### Core Packages
```bash
✓ react:                  ^18.3.1   (UI library)
✓ react-dom:              ^18.3.1   (React DOM binding)
✓ @inertiajs/react:       ^2.0.1    (Laravel integration)
```

### Build Tools
```bash
✓ vite:                   ^7.3.1    (Bundler)
✓ @vitejs/plugin-react:   ^4.3.0    (React plugin)
✓ laravel-vite-plugin:    ^1.0.1    (Laravel integration)
✓ typescript:             ^5.6      (Type checking)
```

### Styling
```bash
✓ tailwindcss:            ^3.4.1    (Utility CSS)
✓ postcss:                ^8.4.31   (CSS transformation)
✓ autoprefixer:           ^10.4.16  (CSS vendor prefixes)
```

### UI Components & Libraries
```bash
✓ sweetalert2:            ^11.10.5  (Alert modals)
```

### Routing
```bash
✓ react-router:           ^6.20.1   (Client-side routing)
✓ react-router-dom:       ^6.20.1   (DOM bindings for routing)
```

### Type Definitions
```bash
✓ @types/react:           ^18.3.3   (React types)
✓ @types/react-dom:       ^18.3.0   (React DOM types)
```

### Development Tools
```bash
✓ eslint:                 ^8.55.0   (Code linting)
✓ @typescript-eslint/eslint-plugin: ^6.16.0
✓ @typescript-eslint/parser: ^6.16.0
```

### Install with npm
```bash
npm install --legacy-peer-deps

# If issues persist:
npm install --legacy-peer-deps --force
```

## Installation Verification Checklist

### After Installation
- [ ] All npm packages installed without major errors
  ```bash
  npm list
  ```

- [ ] All composer packages installed
  ```bash
  composer show
  ```

- [ ] PHP can execute Laravel commands
  ```bash
  php artisan --version
  ```

- [ ] Node/npm versions correct
  ```bash
  node --version  # Should be 18+
  npm --version   # Should be 9+
  ```

- [ ] Database connectivity works
  ```bash
  php artisan migrate:status
  ```

- [ ] Vite builds without errors
  ```bash
  npm run build
  ```

### Environment Verification
- [ ] `.env` file exists and properly configured
- [ ] `APP_KEY` is generated (`php artisan key:generate`)
- [ ] Database credentials are correct
- [ ] PHP extensions loaded (`php -m`)

## Troubleshooting Dependencies

### npm Issues

**High memory usage during install:**
```bash
npm install --legacy-peer-deps --max-old-space-size=4096
```

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Peer dependency warnings:**
```bash
npm install --legacy-peer-deps
```

### Composer Issues

**Out of memory:**
```bash
composer install --no-interaction -d memory_limit=-1
```

**Slow download:**
```bash
composer install --prefer-dist --no-interaction
```

**Cached issues:**
```bash
composer clear-cache
composer install
```

### PHP Issues

**Missing extensions:**
- For XAMPP: Edit `php.ini` and uncomment extensions
- For standalone PHP: Install via package manager or recompile

**Version mismatch:**
```bash
# Verify PHP version
php --version

# Update PHP or use version manager (XAMPP for Windows)
```

## Dependency Versions Summary

| Package | Version | Type |
|---------|---------|------|
| PHP | 8.2+ | System |
| Node.js | 18+ | System |
| MySQL | 5.7+ | System |
| Composer | 2.0+ | System |
| Laravel | 12.26.4 | Backend |
| Inertia | 2.0.1 | Integration |
| React | 18.3.1 | Frontend |
| Vite | 7.3.1 | Build Tool |
| TypeScript | 5.6 | Language |
| Tailwind | 3.4.1 | Styling |

## Optional Dependencies for Development

These are not required but helpful:

```bash
# VS Code Extensions
- PHP Intelephense
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint

# Development tools
- Laravel Artisan (VS Code extension)
- Thunder Client (API testing)
- MySQL Workbench (Database management)
- Postman (API testing)
```

## Performance Optimization

For better development experience:

```bash
# Install @vitejs/plugin-react-swc (faster transpilation)
npm install --save-dev @vitejs/plugin-react-swc

# Or use Vite recommended setup
npm install --save-dev vite@latest @vitejs/plugin-react@latest
```

## License Compliance

All dependencies are open-source with compatible licenses:
- MIT, Apache 2.0, BSD licenses are used
- No GPL or restrictive licenses

## Final Checklist

Before starting development:
- [ ] All system dependencies installed
- [ ] All PHP extensions enabled
- [ ] All npm packages installed
- [ ] All composer packages installed
- [ ] Database created
- [ ] Migrations run successfully
- [ ] Vite dev server starts without errors
- [ ] Laravel server starts without errors
- [ ] Test credentials work for login

---

**Once all items are checked, your development environment is ready!**
