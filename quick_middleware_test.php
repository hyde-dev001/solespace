<?php
/**
 * Quick test to verify the manager role assignment
 */
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use DB;

$email = 'dan@gmail.com';
$user = User::where('email', $email)->first();

if (!$user) {
    die("User not found: $email\n");
}

// Test 1: Old role column
echo "1. Old role column check:\n";
echo "   Value: '{$user->role}'\n";
echo "   strcasecmp('$user->role', 'Manager'): " . strcasecmp($user->role, 'Manager') . "\n";
echo "   Result: " . (strcasecmp($user->role, 'Manager') === 0 ? "✓ MATCH" : "✗ NO MATCH") . "\n\n";

// Test 2: Spatie role  
echo "2. Spatie role check:\n";
$roles = DB::select("
    SELECT r.name, COUNT(p.id) as permission_count
    FROM model_has_roles mhr
    JOIN roles r ON r.id = mhr.role_id
    LEFT JOIN role_has_permissions rhp ON r.id = rhp.role_id
    LEFT JOIN permissions p ON p.id = rhp.permission_id
    WHERE mhr.model_type = ? AND mhr.model_id = ?
    GROUP BY r.id, r.name
", ['App\\Models\\User', $user->id]);

if (count($roles) > 0) {
    foreach ($roles as $role) {
        echo "   Role: {$role->name}, Permissions: {$role->permission_count}\n";
    }
    echo "   Result: ✓ HAS SPATIE ROLE\n";
} else {
    echo "   No Spatie roles found\n";
    echo "   Result: ✗ NO SPATIE ROLE\n";
}

echo "\n3. Middleware simulation:\n";
echo "   Required: Manager|Finance Manager|Super Admin\n";
echo "   User old role: {$user->role}\n";

$hasAccess = false;

// Check old role variations
foreach (['Manager', 'Finance Manager', 'Super Admin'] as $req) {
    if (strcasecmp($user->role, $req) === 0) {
        echo "   ✓ OLD ROLE MATCH: strcasecmp('{$user->role}', '$req') = 0\n";
        $hasAccess = true;
        break;
    }
}

// Check role variations
if (!$hasAccess) {
    foreach (['Manager', 'Finance Manager', 'Super Admin'] as $req) {
        $variations = [$req, strtoupper($req), strtoupper(str_replace(' ', '_', $req)), str_replace('_', ' ', $req)];
        foreach ($variations as $var) {
            if (strcasecmp($user->role, $var) === 0) {
                echo "   ✓ VARIATION MATCH: strcasecmp('{$user->role}', '$var') = 0\n";
                $hasAccess = true;
                break 2;
            }
        }
    }
}

// Check Spatie
if (!$hasAccess && method_exists($user, 'hasRole')) {
    foreach (['Manager', 'Finance Manager', 'Super Admin'] as $req) {
        if ($user->hasRole($req)) {
            echo "   ✓ SPATIE ROLE MATCH: hasRole('$req') = true\n";
            $hasAccess = true;
            break;
        }
    }
}

echo "\n   FINAL: " . ($hasAccess ? "✅ SHOULD HAVE ACCESS" : "❌ SHOULD BE DENIED") . "\n";
