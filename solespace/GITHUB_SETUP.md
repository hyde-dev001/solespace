# GitHub Setup & Deployment Guide

## Overview

This guide helps you push the Solespace project to GitHub and manage deployments.

---

## Initial GitHub Setup

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Enter repository name: `solespace` (or similar)
3. Add description: "Multi-role authentication platform (User, Shop Owner, Super Admin)"
4. Choose visibility: **Public** (for portfolio) or **Private** (for security)
5. Do NOT initialize with README (we have one)
6. Click **"Create repository"**

### Step 2: Local Git Configuration

If not already done:

```bash
# Configure git with your GitHub account
git config --global user.name "Your Name"
git config --global user.email "your.email@github.com"

# Verify configuration
git config --global --list
```

### Step 3: Initialize Local Repository

In your project directory:

```bash
cd c:\xampp\htdocs\thesis\ -\ admin\solespace

# Initialize git (if not already initialized)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Multi-role authentication system with Laravel 12 and React 18"
```

### Step 4: Connect to GitHub

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/solespace.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

---

## Creating .gitignore

Create a file named `.gitignore` in the project root:

```bash
# Laravel specific
/vendor/
/node_modules/
/.env
/.env.*.php
/.env.*.local
/.env.local
/public/storage
/storage/
/bootstrap/cache/
*.log
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.project
.settings
.metadata

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
desktop.ini

# NPM
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.npm
.eslintcache

# IDE Extensions
.phpstorm.meta.php
_ide_helper.php

# Vite
.vite/
dist/
```

---

## File Structure for GitHub

Ensure these documentation files are in root:

```
solespace/
├── README.md                    # Main documentation
├── README_DETAILED.md           # Comprehensive guide (alternative)
├── QUICK_START.md               # 5-minute setup
├── WINDOWS_XAMPP_SETUP.md       # Windows-specific guide
├── DEPENDENCIES.md              # Full dependency list
├── API_DOCUMENTATION.md         # API endpoints & routes
├── TROUBLESHOOTING.md           # Common issues & solutions
├── .gitignore                   # Git ignore rules
├── .env.example                 # Example environment file
├── composer.json
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── backend/                     # Laravel application
├── frontend/                    # React TypeScript application
└── public/                      # Public assets
```

### Create .env.example

Create `.env.example` showing required variables:

```bash
# Copy .env to .env.example
cp .env .env.example

# Then edit .env.example to remove sensitive data:
# Replace actual values with placeholders

# .env.example should look like:
APP_NAME=Solespace
APP_KEY=base64:GENERATE_NEW_KEY
APP_DEBUG=false
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=solespace
DB_USERNAME=root
DB_PASSWORD=

VITE_APP_URL=http://localhost:5173

# Keep sensitive values as placeholders
```

---

## GitHub Repository Management

### Updating the Repository

Make changes locally, then:

```bash
# Check status
git status

# Stage changes
git add .

# Commit with meaningful message
git commit -m "Add feature: Shop owner dashboard enhancements"

# Push to GitHub
git push origin main
```

### Good Commit Messages

Format:
```
Type: Short description (50 chars max)

Optional detailed explanation of what and why.
```

Types:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Formatting/code style
- `refactor:` Code restructuring
- `test:` Adding/updating tests
- `chore:` Build/dependency changes

Examples:
```bash
git commit -m "feat: Add shop owner product management page"
git commit -m "fix: Resolve UserDropdown multi-guard authentication issue"
git commit -m "docs: Add comprehensive API documentation"
git commit -m "chore: Update Laravel to 12.26.4"
```

### Branching Strategy

For larger projects, use feature branches:

```bash
# Create feature branch
git checkout -b feature/shop-owner-products

# Make changes and commit
git add .
git commit -m "feat: Implement product management for shop owners"

# Push feature branch
git push origin feature/shop-owner-products

# On GitHub: Create Pull Request, review, then merge
```

---

## GitHub README Best Practices

### Structure Your Main README

```markdown
# Project Name
Brief description

## Features
- Feature 1
- Feature 2

## Tech Stack
- Backend: Laravel 12
- Frontend: React 18

## Quick Start
Installation steps

## Documentation
Links to detailed guides

## Installation
Full setup instructions

## Usage
How to use the application

## Configuration
Settings and configuration

## Troubleshooting
Common issues

## Contributing
How to contribute

## License
License information

## Support
Contact information
```

---

## GitHub Pages (Optional)

Host documentation on GitHub Pages:

### Enable GitHub Pages

1. Go to repository Settings
2. Scroll to "GitHub Pages"
3. Select source: **main branch** or **docs folder**
4. Documentation will be available at: `https://YOUR_USERNAME.github.io/solespace`

---

## GitHub Issues & Projects

### Using Issues for Bug Tracking

1. Go to **Issues** tab
2. Click **New Issue**
3. Provide:
   - Clear title
   - Detailed description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Environment info (OS, PHP version, etc.)

### Using Projects for Planning

1. Go to **Projects** tab
2. Create new project (Kanban board)
3. Add issues as cards
4. Organize by: **Todo**, **In Progress**, **Done**

---

## GitHub Actions CI/CD (Advanced)

### Create Workflow File

Create `.github/workflows/tests.yml`:

```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_DATABASE: solespace_test
          MYSQL_ROOT_PASSWORD: root
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
        ports:
          - 3306:3306

    steps:
      - uses: actions/checkout@v2
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: json, pdo_mysql, curl, xml
      
      - name: Install Composer Dependencies
        run: composer install
      
      - name: Create .env file
        run: cp .env.example .env && php artisan key:generate
      
      - name: Run Migrations
        run: php artisan migrate --env=testing
      
      - name: Run Tests
        run: php artisan test
```

---

## Releases & Versioning

### Semantic Versioning

Use format: `MAJOR.MINOR.PATCH`

Examples:
- `1.0.0` - Initial release
- `1.1.0` - New features added
- `1.1.1` - Bug fix

### Create GitHub Release

```bash
# Create tag locally
git tag -a v1.0.0 -m "Release version 1.0.0 - Initial release"

# Push tags to GitHub
git push origin --tags
```

On GitHub:
1. Go to **Releases**
2. Click **Draft a new release**
3. Select tag: `v1.0.0`
4. Add release notes:
   - What's new
   - Bug fixes
   - Breaking changes
5. Click **Publish release**

---

## Security Best Practices

### Protect Sensitive Data

Never commit:
- ❌ `.env` file (database passwords, API keys)
- ❌ Private keys or certificates
- ❌ Personal information
- ❌ Hard-coded credentials

Always:
- ✅ Use `.env.example`
- ✅ Use `.gitignore` for sensitive files
- ✅ Use GitHub Secrets for CI/CD

### GitHub Secrets for CI/CD

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add secrets for:
   - Database password
   - API keys
   - Deploy tokens

Use in workflows:
```yaml
- name: Deploy to Server
  env:
    DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
  run: ./deploy.sh
```

---

## Deployment (Production)

### Option 1: Deploy to Shared Hosting

```bash
# On your server (via SSH)
cd /home/user/public_html

# Clone repository
git clone https://github.com/YOUR_USERNAME/solespace.git .

# Install dependencies
composer install --no-dev --prefer-dist --optimize-autoloader
npm install --legacy-peer-deps

# Build frontend
npm run build

# Setup environment
cp .env.example .env
php artisan key:generate
php artisan migrate --force
php artisan cache:clear
```

### Option 2: Deploy to Cloud (e.g., Heroku)

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add MySQL addon
heroku addons:create cleardb:ignite

# Deploy from GitHub
# Go to Heroku Dashboard → Deploy → Connect to GitHub
# Select repository and enable automatic deploys
```

### Option 3: Deploy to VPS (DigitalOcean, Linode, etc.)

```bash
# On VPS, setup:
# - PHP 8.2+
# - MySQL
# - Nginx/Apache
# - Node.js for build

# Clone and deploy
cd /var/www
git clone https://github.com/YOUR_USERNAME/solespace.git
cd solespace

# Install and build
composer install --no-dev
npm install --legacy-peer-deps
npm run build

# Setup .env and database
cp .env.example .env
php artisan key:generate
php artisan migrate

# Setup web server (Nginx example)
# Configure server block pointing to /public directory
```

---

## Monitoring & Maintenance

### Regular Tasks

```bash
# Weekly: Pull latest changes
git pull origin main

# Monthly: Update dependencies
composer update
npm update

# Monitor performance
php artisan logs
```

### Backup Strategy

```bash
# Backup database
mysqldump -u root -p solespace > backup-$(date +%Y%m%d).sql

# Backup uploaded files
zip -r backup-files-$(date +%Y%m%d).zip storage/app/public
```

---

## Collaborating with Others

### Invite Collaborators

1. Go to repository **Settings**
2. Click **Collaborators**
3. Enter GitHub username
4. Send invitation

### Code Review Process

1. Collaborator creates feature branch
2. Pushes to GitHub
3. Creates Pull Request (PR)
4. You review code
5. Request changes if needed
6. Approve and merge

---

## License

### Choose a License

Open source licenses:
- **MIT** - Permissive, widely used (recommended for most projects)
- **Apache 2.0** - Permissive with patent clause
- **GPL 3.0** - Copyleft, code must remain open

### Add License File

Create `LICENSE` file:

```
MIT License

Copyright (c) 2024 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT...
```

---

## Contributing Guidelines (Optional)

Create `CONTRIBUTING.md`:

```markdown
# Contributing to Solespace

## How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and commit: `git commit -m "feat: Add amazing feature"`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Code Style

- Follow PSR-12 for PHP code
- Use TypeScript strict mode
- Add comments for complex logic

## Testing

All code must have tests:
```bash
php artisan test
npm test
```

## Reporting Bugs

Create an issue with:
- Clear title
- Detailed description
- Steps to reproduce
- Expected vs actual behavior
```

---

## GitHub Statistics

Monitor your project:
1. **Insights** tab - Shows contributions
2. **Analytics** - Traffic and referrers
3. **Community** - Code of conduct, contributing guide status

---

## Useful GitHub Links

- **Git Documentation:** https://git-scm.com/doc
- **GitHub Docs:** https://docs.github.com
- **GitHub CLI:** https://cli.github.com
- **GitHub Actions:** https://github.com/actions
- **GitHub Copilot:** https://github.com/features/copilot

---

## Quick Command Reference

```bash
# Clone repository
git clone https://github.com/USERNAME/solespace.git

# Check status
git status

# Stage all changes
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# Create new branch
git checkout -b feature/name

# Switch branch
git checkout main

# View commit history
git log --oneline

# Undo last commit (local only)
git reset --soft HEAD~1

# View differences
git diff

# Tag a release
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin --tags
```

---

## Your GitHub URL

Once pushed, your repository will be available at:

```
https://github.com/YOUR_USERNAME/solespace
```

Share this URL to showcase your project!

---

## Next Steps

1. ✅ Create GitHub account (if not done)
2. ✅ Create new repository
3. ✅ Push local code to GitHub
4. ✅ Setup GitHub Pages (optional)
5. ✅ Add collaborators (if team project)
6. ✅ Monitor issues and PRs
7. ✅ Deploy to production

---

**Your project is ready for the world! 🚀**
