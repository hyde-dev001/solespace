<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Direct database check
$user = App\Models\User::find(241); // Manager user

echo "=== DIRECT DATABASE CHECK ===\n";
if (!$user) {
    echo "ERROR: User ID 241 not found!\n";
    exit;
}

echo "User ID: {$user->id}\n";
echo "Email: {$user->email}\n";
echo "Old role column: {$user->role}\n";
echo "Guard name: {$user->guard_name}\n";

// Check old role column
if ($user->role === 'MANAGER') {
    echo "✓ Old role column is 'MANAGER'\n";
} else {
    echo "✗ Old role column is '{$user->role}' (expected 'MANAGER')\n";
}

// Check strcasecmp
$result = strcasecmp($user->role, 'Manager');
echo "strcasecmp('{$user->role}', 'Manager') = $result\n";

// Check Spatie roles
$roles = $user->getRoleNames();
echo "Spatie roles: " . ($roles->count() ? $roles->implode(', ') : 'NONE') . "\n";

if ($roles->count() > 0) {
    echo "✓ User has Spatie roles\n";
} else {
    echo "✗ User has NO Spatie roles - THIS IS THE PROBLEM\n";
}

// Check hasRole
if ($user->hasRole('Manager')) {
    echo "✓ hasRole('Manager') returns true\n";
} else {
    echo "✗ hasRole('Manager') returns false\n";
}

// Check database pivot table
$pivot = DB::table('model_has_roles')
    ->where('model_type', 'App\\Models\\User')
    ->where('model_id', $user->id)
    ->first();

echo "\nPivot table entry:\n";
if ($pivot) {
    echo "  Found: role_id = {$pivot->role_id}\n";
    $role = DB::table('roles')->where('id', $pivot->role_id)->first();
    if ($role) {
        echo "  Role name: {$role->name}\n";
    }
} else {
    echo "  NOT FOUND - User has no Spatie role in database\n";
}

// Check if permission cache exists
echo "\n=== CACHE STATUS ===\n";
$hasCache = Cache::has('spatie.permission.cache');
echo "Permission cache exists: " . ($hasCache ? 'YES' : 'NO') . "\n";

if ($hasCache) {
    echo "Attempting to clear cache...\n";
    Cache::forget('spatie.permission.cache');
    echo "Cache cleared\n";
}

// Now check again
echo "\n=== AFTER CACHE CLEAR ===\n";
$user->refresh();
echo "Spatie roles after refresh: " . $user->getRoleNames()->implode(', ') . "\n";
if ($user->hasRole('Manager')) {
    echo "✓ hasRole('Manager') NOW returns true\n";
} else {
    echo "✗ hasRole('Manager') STILL returns false\n";
}
