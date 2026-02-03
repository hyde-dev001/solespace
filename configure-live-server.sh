#!/bin/bash

# Live Server Configuration Script
# This script helps configure Laravel for a live server environment

echo "=========================================="
echo "Live Server CSRF Configuration Helper"
echo "=========================================="
echo ""

# Get current domain/IP
read -p "Enter your live server domain or IP (e.g., example.com or 192.168.1.1): " DOMAIN

# Ask about HTTPS
read -p "Are you using HTTPS? (y/n): " USE_HTTPS

if [ "$USE_HTTPS" == "y" ] || [ "$USE_HTTPS" == "Y" ]; then
    SECURE_COOKIE="true"
    PROTOCOL="https"
else
    SECURE_COOKIE="false"
    PROTOCOL="http"
fi

# Ask about frontend dev port
read -p "What port is your frontend running on? (default: 3000 or 5173): " FRONTEND_PORT
if [ -z "$FRONTEND_PORT" ]; then
    FRONTEND_PORT="3000,5173"
fi

echo ""
echo "=========================================="
echo "Updating .env configuration..."
echo "=========================================="
echo ""

# Update .env file
sed -i "s/^SESSION_DOMAIN=.*/SESSION_DOMAIN=$DOMAIN/" .env
sed -i "s/^SESSION_SECURE_COOKIE=.*/SESSION_SECURE_COOKIE=$SECURE_COOKIE/" .env

# Update SANCTUM_STATEFUL_DOMAINS
STATEFUL_DOMAINS="$DOMAIN:${FRONTEND_PORT},localhost:5173,127.0.0.1:5173"
sed -i "s/^SANCTUM_STATEFUL_DOMAINS=.*/SANCTUM_STATEFUL_DOMAINS=$STATEFUL_DOMAINS/" .env

echo "✓ SESSION_DOMAIN=$DOMAIN"
echo "✓ SESSION_SECURE_COOKIE=$SECURE_COOKIE"
echo "✓ SANCTUM_STATEFUL_DOMAINS=$STATEFUL_DOMAINS"
echo ""

echo "=========================================="
echo "Running Laravel configuration..."
echo "=========================================="
echo ""

# Run migrations
echo "Running migrations..."
php artisan migrate --force
echo "✓ Migrations complete"

# Clear config cache
echo "Clearing config cache..."
php artisan config:cache
echo "✓ Config cache cleared"

# Clear other caches
echo "Clearing other caches..."
php artisan cache:clear
echo "✓ Caches cleared"

echo ""
echo "=========================================="
echo "Configuration Complete!"
echo "=========================================="
echo ""
echo "Summary of changes:"
echo "  - SESSION_DOMAIN: $DOMAIN"
echo "  - SESSION_SECURE_COOKIE: $SECURE_COOKIE"
echo "  - SANCTUM_STATEFUL_DOMAINS: $STATEFUL_DOMAINS"
echo ""
echo "Next steps:"
echo "1. Visit http${PROTOCOL#http}://$DOMAIN/user/login"
echo "2. Try logging in with your credentials"
echo "3. You should no longer see 419 errors"
echo ""
echo "If you still see 419 errors:"
echo "  - Run: php artisan session:clear"
echo "  - Check browser cookies are enabled"
echo "  - Check browser DevTools for CSRF token in response"
echo ""
