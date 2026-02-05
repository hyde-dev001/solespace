<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Simulate what the middleware receives
$manager = App\Models\User::where('email', 'dan@gmail.com')->first();

echo "\n\nMIDDLEWARE SIMULATION\n";
echo "=====================================\n\n";

// Simulate API request
echo "When request comes to /api/manager/dashboard/stats:\n";
echo "  Route middleware: old_role:Manager|Finance Manager|Super Admin\n";
echo "  Roles array passed to middleware: ['Manager', 'Finance Manager', 'Super Admin']\n\n";

echo "User Object:\n";
echo "  Email: {$manager->email}\n";
echo "  role column: {$manager->role}\n";
echo "  Spatie roles: " . $manager->getRoleNames()->implode(', ') . "\n\n";

echo "Middleware Checks (in order):\n";
$roles = ['Manager', 'Finance Manager', 'Super Admin'];
$hasAccess = false;

foreach ($roles as $role) {
    // Check 1: Direct role column match
    if (strcasecmp($manager->role, $role) === 0) {
        echo "  ✓ MATCH! strcasecmp('{$manager->role}', '{$role}') == 0\n";
        $hasAccess = true;
        break;
    }
    
    // Check 2: Role variations
    $roleVariations = [
        $role,
        strtoupper($role),
        strtoupper(str_replace(' ', '_', $role)),
        str_replace('_', ' ', $role),
    ];
    
    foreach ($roleVariations as $variation) {
        if (strcasecmp($manager->role, $variation) === 0) {
            echo "  ✓ MATCH! (variation) strcasecmp('{$manager->role}', '{$variation}') == 0\n";
            $hasAccess = true;
            break 2;
        }
    }
    
    // Check 3: Spatie role
    try {
        if ($manager->hasRole($role)) {
            echo "  ✓ MATCH! hasRole('{$role}') = true\n";
            $hasAccess = true;
            break;
        }
    } catch (Exception $e) {
        echo "  Error checking hasRole('{$role}'): {$e->getMessage()}\n";
    }
}

echo "\n";
if ($hasAccess) {
    echo "✅ MIDDLEWARE WOULD GRANT ACCESS\n";
} else {
    echo "❌ MIDDLEWARE WOULD DENY ACCESS\n";
}

echo "\n=====================================\n\n";
