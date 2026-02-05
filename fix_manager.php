<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Employee;
use Spatie\Permission\Models\Role;

echo "Fixing Manager Account Issues:\n";
echo str_repeat("=", 50) . "\n\n";

// Find Manager user
$user = User::where('email', 'dan@gmail.com')->first();

if (!$user) {
    echo "ERROR: User not found!\n";
    exit(1);
}

echo "1. Assigning Spatie 'Manager' role...\n";

// Check if Manager role exists
$managerRole = Role::where('name', 'Manager')->where('guard_name', 'user')->first();

if (!$managerRole) {
    echo "ERROR: 'Manager' role not found in Spatie tables!\n";
    echo "Please run: php artisan db:seed --class=RolesAndPermissionsSeeder\n";
    exit(1);
}

// Assign the role
$user->assignRole('Manager');
echo "   ✓ Assigned 'Manager' role to {$user->email}\n";
echo "   Permissions: " . $user->getAllPermissions()->count() . "\n\n";

// Fix Employee record
echo "2. Fixing Employee record user_id...\n";

$employee = Employee::where('email', 'dan@gmail.com')->first();

if ($employee) {
    $employee->user_id = $user->id;
    $employee->save();
    echo "   ✓ Updated Employee #{$employee->id} user_id to {$user->id}\n\n";
} else {
    echo "   ! No Employee record found for this email\n\n";
}

echo "3. Verification:\n";
echo "   User ID: {$user->id}\n";
echo "   Spatie Roles: " . $user->getRoleNames()->implode(', ') . "\n";
echo "   Has Manager Role: " . ($user->hasRole('Manager') ? 'YES' : 'NO') . "\n";
echo "   Permissions Count: " . $user->getAllPermissions()->count() . "\n";

if ($employee) {
    echo "   Employee user_id: {$employee->user_id}\n";
}

echo "\n✅ Fixed! Try logging in again.\n";
