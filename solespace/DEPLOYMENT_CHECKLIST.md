# Production Deployment Checklist

Use this checklist before deploying to production.

---

## Pre-Deployment (Local Testing)

### Code Quality
- [ ] All tests pass: `php artisan test`
- [ ] No console errors in browser DevTools
- [ ] No PHP errors in `storage/logs/laravel.log`
- [ ] No TypeScript compilation errors
- [ ] Code follows project style guide
- [ ] No debug code left in codebase
- [ ] No commented-out code sections
- [ ] All imports are used
- [ ] No console.log() statements in production code

### Database
- [ ] All migrations created: `php artisan migrate:status`
- [ ] Database seeding works: `php artisan db:seed`
- [ ] Seeders only have test data
- [ ] Database indexes are optimized
- [ ] Foreign keys are set correctly
- [ ] Data types are appropriate (not all string)
- [ ] Encryption is applied to sensitive data
- [ ] NULL constraints are appropriate

### Frontend
- [ ] All pages load correctly
- [ ] All links work (no 404s)
- [ ] Forms submit correctly
- [ ] Validation messages display
- [ ] Responsive design works on mobile
- [ ] All images load properly
- [ ] No missing assets
- [ ] Browser compatibility checked (Chrome, Firefox, Safari, Edge)
- [ ] Accessibility checked (keyboard navigation, screen readers)

### Performance
- [ ] Vite build completes: `npm run build`
- [ ] Minified bundle size is reasonable
- [ ] Database queries optimized (use eager loading)
- [ ] No N+1 query problems
- [ ] Caching strategy implemented
- [ ] Static assets cached appropriately
- [ ] Images optimized (compressed)
- [ ] No unnecessary API calls

### Security
- [ ] CSRF protection enabled
- [ ] SQL injection prevention checked
- [ ] XSS protection verified
- [ ] Authentication guards working correctly
- [ ] Authorization rules enforced
- [ ] Sensitive data not logged
- [ ] API rate limiting configured
- [ ] File upload validation implemented
- [ ] No hardcoded credentials
- [ ] Password requirements set

---

## Environment Configuration

### .env File
- [ ] `.env` not committed to git (only `.env.example`)
- [ ] `APP_DEBUG=false` (never `true` in production)
- [ ] `APP_ENV=production`
- [ ] `APP_KEY` is unique and generated
- [ ] All database credentials are production values
- [ ] `APP_URL` is correct domain
- [ ] Email configuration is correct
- [ ] Session driver is database
- [ ] Cache driver is redis (or appropriate for server)

### PHP Configuration
- [ ] Error reporting set to E_ALL & ~E_DEPRECATED
- [ ] Errors not displayed to users
- [ ] Logs are written to file
- [ ] `display_errors = Off`
- [ ] `log_errors = On`
- [ ] Memory limit is sufficient (512MB+)
- [ ] `upload_max_filesize` set appropriately
- [ ] `max_execution_time` set (30 sec minimum)
- [ ] Timezone is set correctly

### Web Server Configuration
- [ ] Document root points to `/public`
- [ ] HTTPS/SSL certificate installed
- [ ] HTTP redirects to HTTPS
- [ ] Gzip compression enabled
- [ ] Security headers configured:
  - [ ] X-Frame-Options: DENY
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-XSS-Protection: 1; mode=block
  - [ ] Content-Security-Policy header

### Database Configuration
- [ ] MySQL/PostgreSQL running
- [ ] Database backups scheduled
- [ ] Database user has minimal permissions
- [ ] Slow query logging enabled
- [ ] Connection pooling configured (if applicable)
- [ ] Backup strategy documented

---

## Build & Deployment

### Prepare for Deployment
- [ ] Database backup created
- [ ] Code backup/tagged in git
- [ ] Release notes prepared
- [ ] Deployment script tested on staging
- [ ] Rollback plan documented
- [ ] All team members notified

### File Structure
```
production-server/
├── app/                 (Laravel application)
├── public/              (Web root)
├── storage/             (Logs, uploads, cache)
├── bootstrap/cache/     (Auto-generated cache)
└── .env                 (Production configuration)
```

### Deployment Process
- [ ] Clone repository: `git clone https://github.com/...`
- [ ] Checkout correct branch/tag
- [ ] Install dependencies: `composer install --no-dev --optimize-autoloader`
- [ ] Install frontend: `npm install --legacy-peer-deps`
- [ ] Build frontend: `npm run build`
- [ ] Set permissions: `chmod -R 755 storage bootstrap/cache`
- [ ] Create storage symlink: `php artisan storage:link`
- [ ] Copy `.env.example` to `.env`
- [ ] Generate app key: `php artisan key:generate`
- [ ] Run migrations: `php artisan migrate --force`
- [ ] Clear caches: `php artisan optimize`
- [ ] Start services (supervisor, queue workers)

---

## Post-Deployment Verification

### Functionality Tests
- [ ] Website loads on production URL
- [ ] User registration works
- [ ] User login works
- [ ] Shop owner login works
- [ ] Admin login works
- [ ] Session persistence works
- [ ] Logout works correctly
- [ ] Password reset works
- [ ] All key features work
- [ ] Database queries execute successfully

### Performance Checks
- [ ] Page load times acceptable (< 3 seconds)
- [ ] Database queries fast (< 100ms)
- [ ] No memory leaks
- [ ] CPU usage normal
- [ ] Disk space adequate
- [ ] Backups running successfully

### Error Monitoring
- [ ] No errors in logs
- [ ] No console JavaScript errors
- [ ] No database errors
- [ ] Error reporting configured (Sentry, etc.)
- [ ] Log rotation configured
- [ ] Old logs archived

### Security Verification
- [ ] HTTPS working correctly
- [ ] Security headers present
- [ ] CSRF tokens working
- [ ] Authentication guards enforced
- [ ] Authorization rules working
- [ ] File permissions correct
- [ ] Database backed up

---

## Monitoring & Maintenance

### Setup Monitoring
- [ ] Application monitoring (New Relic, DataDog, etc.)
- [ ] Uptime monitoring (Pingdom, StatusCake)
- [ ] Error tracking (Sentry, Bugsnag)
- [ ] Log aggregation (ELK Stack, Loggly)
- [ ] Performance monitoring (GTmetrix, PageSpeed)
- [ ] Security scanning (nessus, vulnerability scanners)

### Configure Alerts
- [ ] High CPU usage alert
- [ ] High memory usage alert
- [ ] Disk space alert
- [ ] Database down alert
- [ ] Application error alert
- [ ] Response time alert
- [ ] SSL certificate expiry alert

### Schedule Tasks
- [ ] Database backups (daily)
- [ ] Log rotation (daily)
- [ ] Cache clearing (as needed)
- [ ] Security updates (weekly)
- [ ] Performance review (weekly)
- [ ] User report review (monthly)

### Maintenance Window
- [ ] Document deployment time
- [ ] Notify users (if applicable)
- [ ] Test rollback procedure
- [ ] Have team on standby
- [ ] Monitor first hour closely
- [ ] Document any issues encountered

---

## Post-Launch

### Documentation
- [ ] Update README with production URL
- [ ] Document server specifications
- [ ] Document backup procedures
- [ ] Document recovery procedures
- [ ] Document update procedures
- [ ] Create runbook for common issues
- [ ] Document deployment process

### Team Training
- [ ] Team trained on new features
- [ ] Support staff trained
- [ ] Deployment process documented
- [ ] Troubleshooting guide created
- [ ] Emergency contacts listed

### User Communication
- [ ] Announcement posted
- [ ] Documentation updated
- [ ] Help/support page updated
- [ ] FAQ updated
- [ ] Tutorial videos created (if applicable)

---

## Common Deployment Issues

### Database Errors
```
Issue: Migrations fail in production
Solution: Check database permissions, ensure all migrations are tracked in git
```

```
Issue: Connection refused
Solution: Check database host, port, credentials in .env
```

### Permission Errors
```
Issue: "Permission denied" on storage/logs
Solution: chmod -R 755 storage bootstrap/cache
```

### Asset Loading Errors
```
Issue: CSS/JS files 404
Solution: Run "npm run build" and verify public/build directory
```

### Memory Errors
```
Issue: "Allowed memory size exhausted"
Solution: Increase memory_limit in php.ini (512M or more)
```

### Slow Performance
```
Issue: Pages loading slowly
Solution: Check database indexes, use eager loading, enable caching
```

---

## Rollback Procedure

If deployment fails:

```bash
# 1. Stop web server
sudo systemctl stop nginx
# or sudo systemctl stop apache2

# 2. Revert code to previous version
git revert <commit-hash>
# or git checkout <previous-tag>

# 3. Revert database (if needed)
mysqldump -u root -p solespace < backup-$(date +%Y%m%d).sql

# 4. Clear Laravel caches
php artisan optimize:clear

# 5. Start web server
sudo systemctl start nginx
```

---

## Success Criteria

Deployment is successful when:

- ✅ All pages load without errors
- ✅ All authentication systems work
- ✅ Database operations complete successfully
- ✅ No errors in logs
- ✅ Performance is acceptable
- ✅ Security measures are in place
- ✅ Monitoring is active
- ✅ Team is trained
- ✅ Users can access all features
- ✅ Backups are being created

---

## Emergency Contacts

- **DevOps Team:** (contact info)
- **Database Admin:** (contact info)
- **Security Team:** (contact info)
- **Server Provider:** (contact info + ticket ID)

---

## Final Notes

- [ ] Document any custom configurations
- [ ] Update runbook with lessons learned
- [ ] Schedule post-deployment review meeting
- [ ] Plan next iteration
- [ ] Archive this checklist for reference

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Reviewed By:** _______________  
**Any Issues:** _______________

---

**Remember:** Taking time to go through this checklist prevents 80% of production issues!
