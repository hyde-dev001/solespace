<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = App\Models\User::where('email', 'dan@gmail.com')->first();

echo "=== DIRECT DATABASE CHECK ===\n";
echo "User ID: {$user->id}\n";
echo "Email: {$user->email}\n";
echo "Old role column: {$user->role}\n";
echo "Guard name property: {$user->guard_name}\n";
echo "Spatie roles: " . $user->getRoleNames()->implode(', ') . "\n";

// Check if the role actually exists in the database
$role = \Spatie\Permission\Models\Role::where('name', 'Manager')->where('guard_name', 'user')->first();
echo "\nManager role in DB:\n";
echo "  Exists: " . ($role ? 'YES' : 'NO') . "\n";
if ($role) {
    echo "  Role ID: {$role->id}\n";
    echo "  Permissions: {$role->permissions()->count()}\n";
}

// Check pivot table
$hasPivot = \DB::table('model_has_roles')
    ->where('model_type', 'App\\Models\\User')
    ->where('model_id', $user->id)
    ->where('role_id', $role?->id)
    ->exists();

echo "\nModel_has_roles pivot:\n";
echo "  Exists: " . ($hasPivot ? 'YES' : 'NO') . "\n";

// Simulate what middleware would check
echo "\n=== MIDDLEWARE CHECK SIMULATION ===\n";
echo "Request requires: ['Manager', 'Finance Manager', 'Super Admin']\n";
echo "User old role: {$user->role}\n";

$hasAccess = false;
foreach (['Manager', 'Finance Manager', 'Super Admin'] as $requiredRole) {
    if (strcasecmp($user->role, $requiredRole) === 0) {
        echo "✓ Old role column matches: strcasecmp('{$user->role}', '{$requiredRole}') = 0\n";
        $hasAccess = true;
        break;
    }
}

if (!$hasAccess && $user->hasRole('Manager')) {
    echo "✓ Spatie hasRole('Manager') = TRUE\n";
    $hasAccess = true;
}

echo "\nResult: " . ($hasAccess ? '✅ SHOULD HAVE ACCESS' : '❌ SHOULD BE DENIED') . "\n";

// Check if there's a caching issue
echo "\n=== CACHE STATUS ===\n";
$cacheKey = 'spatie.permission.cache';
echo "Permission cache exists: " . (\Cache::has($cacheKey) ? 'YES' : 'NO') . "\n";
