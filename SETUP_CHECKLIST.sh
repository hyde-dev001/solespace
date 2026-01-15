#!/bin/bash
# QUICK START CHECKLIST - Shop Owner Registration Setup
# Run this checklist to ensure everything is properly configured

echo "=========================================="
echo "Shop Owner Registration - Setup Checklist"
echo "=========================================="
echo ""

# Backend Checks
echo "🔍 BACKEND CHECKS:"
echo "===================="

echo "✓ Checking database migration..."
if grep -q "create_shop_owners_table" backend/database/migrations/*.php; then
    echo "  ✅ Shop owners table migration exists"
else
    echo "  ❌ Shop owners table migration NOT found"
fi

echo ""
echo "✓ Checking ShopOwner model..."
if grep -q "fillable" backend/app/Models/ShopOwner.php; then
    echo "  ✅ ShopOwner model with fillable attributes exists"
else
    echo "  ❌ ShopOwner model NOT configured"
fi

echo ""
echo "✓ Checking registration controller..."
if grep -q "registerShopOwner\|registerShop" backend/app/Http/Controllers/ShopRegistrationController.php; then
    echo "  ✅ Registration controller exists and is updated"
else
    echo "  ❌ Registration controller NOT found or NOT updated"
fi

echo ""
echo "✓ Checking API route..."
if grep -q "/api/shop/register" backend/routes/web.php; then
    echo "  ✅ API route configured at /api/shop/register"
else
    echo "  ❌ API route NOT configured"
fi

echo ""
echo "✓ Checking CORS middleware..."
if grep -q "statefulApi\|CORS" backend/bootstrap/app.php; then
    echo "  ✅ CORS middleware enabled"
else
    echo "  ❌ CORS middleware NOT enabled"
fi

# Frontend Checks
echo ""
echo "🎨 FRONTEND CHECKS:"
echo "===================="

echo "✓ Checking API service..."
if [ -f "frontend/src/services/shopRegistrationApi.ts" ]; then
    echo "  ✅ shopRegistrationApi.ts service exists"
else
    echo "  ❌ shopRegistrationApi.ts service NOT found"
fi

echo ""
echo "✓ Checking SignUpForm component..."
if grep -q "handleSubmit\|registerShopOwner" frontend/src/components/auth/SignUpForm.tsx; then
    echo "  ✅ SignUpForm component is updated"
else
    echo "  ❌ SignUpForm component NOT updated"
fi

echo ""
echo "✓ Checking environment variables..."
if grep -q "VITE_API_URL" frontend/.env; then
    echo "  ✅ VITE_API_URL configured in .env"
else
    echo "  ❌ VITE_API_URL NOT configured in .env"
fi

# Startup Instructions
echo ""
echo "=========================================="
echo "🚀 STARTUP INSTRUCTIONS:"
echo "=========================================="
echo ""
echo "1. Start MySQL server (if not running)"
echo "   - Open XAMPP Control Panel"
echo "   - Click 'Start' next to MySQL"
echo ""
echo "2. Run backend migrations (if not already done):"
echo "   cd backend"
echo "   php artisan migrate"
echo ""
echo "3. Start Laravel development server:"
echo "   cd backend"
echo "   php artisan serve"
echo "   (Should run on http://127.0.0.1:8000)"
echo ""
echo "4. Start React frontend development server:"
echo "   cd frontend"
echo "   npm install  (if dependencies not installed)"
echo "   npm run dev"
echo "   (Should run on http://localhost:5173 or similar)"
echo ""
echo "5. Navigate to Sign Up page and test registration"
echo ""
echo "=========================================="
echo "✅ Setup Complete! Happy Testing!"
echo "=========================================="
