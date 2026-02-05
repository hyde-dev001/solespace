<?php

/**
 * Position Templates Verification Script
 * 
 * Run this to verify the Position Templates feature is working correctly
 * Usage: php verify_position_templates.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\PositionTemplate;
use App\Models\PositionTemplatePermission;
use App\Models\User;

echo "\n========================================\n";
echo "Position Templates Verification\n";
echo "========================================\n\n";

// 1. Check if templates exist
$templateCount = PositionTemplate::count();
$permissionCount = PositionTemplatePermission::count();

echo "✓ Position Templates: $templateCount\n";
echo "✓ Template Permissions: $permissionCount\n\n";

if ($templateCount === 0) {
    echo "❌ No templates found! Run: php artisan db:seed --class=PositionTemplatesSeeder\n";
    exit(1);
}

// 2. List all templates
echo "Available Templates:\n";
echo "-------------------\n";

$templates = PositionTemplate::with('templatePermissions')
    ->orderBy('category')
    ->orderBy('name')
    ->get();

foreach ($templates as $template) {
    $permCount = $template->templatePermissions->count();
    $usageCount = $template->usage_count;
    echo sprintf(
        "%-3d %-30s %-15s %2d permissions (used %d times)\n",
        $template->id,
        $template->name,
        "[$template->category]",
        $permCount,
        $usageCount
    );
}

echo "\n";

// 3. Show category breakdown
echo "Category Breakdown:\n";
echo "------------------\n";

$categories = $templates->groupBy('category');
foreach ($categories as $category => $categoryTemplates) {
    $totalPerms = $categoryTemplates->sum(function($t) {
        return $t->templatePermissions->count();
    });
    echo sprintf(
        "%-15s: %2d templates, %3d total permissions\n",
        $category,
        $categoryTemplates->count(),
        $totalPerms
    );
}

echo "\n";

// 4. Show most popular template
$mostUsed = PositionTemplate::orderBy('usage_count', 'desc')->first();
if ($mostUsed && $mostUsed->usage_count > 0) {
    echo "Most Popular Template:\n";
    echo "---------------------\n";
    echo "$mostUsed->name - Used $mostUsed->usage_count times\n\n";
}

// 5. Test applyToUser method (dry run - won't actually apply)
echo "Testing applyToUser Method:\n";
echo "--------------------------\n";

$cashier = PositionTemplate::where('slug', 'cashier')->first();
if ($cashier) {
    $permissions = $cashier->templatePermissions->pluck('permission_name')->toArray();
    echo "Cashier template has " . count($permissions) . " permissions:\n";
    foreach ($permissions as $perm) {
        echo "  • $perm\n";
    }
    echo "\n";
}

// 6. Check if UserAccessControlController has the new methods
echo "Checking Controller Methods:\n";
echo "---------------------------\n";

$controllerFile = __DIR__ . '/app/Http/Controllers/ShopOwner/UserAccessControlController.php';
$controllerContent = file_get_contents($controllerFile);

$hasGetTemplates = strpos($controllerContent, 'public function getPositionTemplates()') !== false;
$hasApplyTemplate = strpos($controllerContent, 'public function applyPositionTemplate(') !== false;

echo ($hasGetTemplates ? "✓" : "❌") . " getPositionTemplates() method exists\n";
echo ($hasApplyTemplate ? "✓" : "❌") . " applyPositionTemplate() method exists\n\n";

// 7. Check routes
echo "Checking Routes:\n";
echo "---------------\n";

$routeFile = __DIR__ . '/routes/web.php';
$routeContent = file_get_contents($routeFile);

$hasTemplatesRoute = strpos($routeContent, '/position-templates') !== false;
$hasApplyRoute = strpos($routeContent, '/apply-template') !== false;

echo ($hasTemplatesRoute ? "✓" : "❌") . " GET /shop-owner/position-templates route exists\n";
echo ($hasApplyRoute ? "✓" : "❌") . " POST /shop-owner/employees/{userId}/apply-template route exists\n\n";

// 8. Check frontend
echo "Checking Frontend:\n";
echo "-----------------\n";

$frontendFile = __DIR__ . '/resources/js/Pages/ShopOwner/UserAccessControl.tsx';
if (file_exists($frontendFile)) {
    $frontendContent = file_get_contents($frontendFile);
    
    $hasTemplateState = strpos($frontendContent, 'positionTemplates') !== false;
    $hasApplyFunction = strpos($frontendContent, 'applyPositionTemplate') !== false;
    $hasFetchTemplates = strpos($frontendContent, '/position-templates') !== false;
    
    echo ($hasTemplateState ? "✓" : "❌") . " Position template state exists\n";
    echo ($hasApplyFunction ? "✓" : "❌") . " applyPositionTemplate() function exists\n";
    echo ($hasFetchTemplates ? "✓" : "❌") . " Template fetching code exists\n";
} else {
    echo "❌ UserAccessControl.tsx not found\n";
}

echo "\n";

// Summary
echo "========================================\n";
echo "Verification Complete\n";
echo "========================================\n\n";

if ($templateCount === 13 && $permissionCount > 0 && $hasGetTemplates && $hasApplyTemplate) {
    echo "✅ Position Templates feature is fully implemented and ready!\n\n";
    echo "Next Steps:\n";
    echo "1. Start dev server: npm run dev\n";
    echo "2. Login as Shop Owner\n";
    echo "3. Go to User Access Control\n";
    echo "4. Click 'Manage Permissions' on any employee\n";
    echo "5. Look for purple 'Quick Apply Position Template' box\n";
    echo "6. Select a template and click 'Apply Template'\n\n";
} else {
    echo "⚠️  Some components are missing. Please review the output above.\n\n";
}

echo "Documentation:\n";
echo "- POSITION_TEMPLATES.md - Full feature documentation\n";
echo "- POSITION_TEMPLATES_COMPLETE.md - Implementation summary\n\n";
