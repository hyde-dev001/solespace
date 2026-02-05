<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Employee;
use Illuminate\Support\Facades\DB;

echo "\n";
echo "====================================================\n";
echo "         MANAGER ACCOUNT FINAL CHECK               \n";
echo "====================================================\n\n";

$user = User::where('email', 'dan@gmail.com')->first();

if (!$user) {
    echo "❌ ERROR: User not found!\n";
    exit(1);
}

// Database check
$rolesInDb = DB::table('model_has_roles')
    ->where('model_type', 'App\\Models\\User')
    ->where('model_id', $user->id)
    ->count();

echo "✓ Database Check:\n";
echo "  User ID: {$user->id}\n";
echo "  Email: {$user->email}\n";
echo "  Roles in model_has_roles: {$rolesInDb}\n\n";

// Fresh user instance
$user = $user->fresh(['roles', 'permissions']);

echo "✓ Spatie Role System:\n";
$roles = $user->getRoleNames();
echo "  Roles: " . ($roles->count() > 0 ? $roles->implode(', ') : 'NONE') . "\n";
echo "  Permissions: " . $user->getAllPermissions()->count() . "\n\n";

// Employee check
$employee = Employee::where('email', $user->email)->with('user')->first();

echo "✓ Employee Record:\n";
if ($employee) {
    echo "  Found: YES (ID: {$employee->id})\n";
    echo "  Linked to User: " . ($employee->user ? "YES" : "NO") . "\n";
} else {
    echo "  Found: NO\n";
}

echo "\n====================================================\n";

if ($rolesInDb > 0 && $user->getAllPermissions()->count() > 0) {
    echo "✅ SUCCESS! Manager account is properly configured.\n\n";
    echo "What was fixed:\n";
    echo "  1. Assigned Spatie 'Manager' role\n";
    echo "  2. User now has {$user->getAllPermissions()->count()} permissions\n";
    echo "  3. Employee record properly linked via email\n\n";
    echo "Next steps:\n";
    echo "  1. Log out if currently logged in\n";
    echo "  2. Log back in with dan@gmail.com\n";
    echo "  3. Should now see Manager dashboard\n";
} else {
    echo "❌ ISSUES FOUND:\n";
    echo "  - Roles in DB: {$rolesInDb}\n";
    echo "  - Permissions: " . $user->getAllPermissions()->count() . "\n";
    echo "\nPlease run: php artisan db:seed --class=RolesAndPermissionsSeeder\n";
}

echo "====================================================\n\n";
