<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

echo "Checking Manager Users:\n";
echo str_repeat("=", 50) . "\n\n";

$managers = User::where('role', 'MANAGER')->get();

if ($managers->isEmpty()) {
    echo "No Manager users found in database.\n";
} else {
    foreach ($managers as $user) {
        echo "Manager Found:\n";
        echo "  ID: {$user->id}\n";
        echo "  Name: {$user->name}\n";
        echo "  Email: {$user->email}\n";
        echo "  Old Role Column: {$user->role}\n";
        echo "  Spatie Roles: " . $user->getRoleNames()->implode(', ') . "\n";
        echo "  Has Spatie Role: " . ($user->hasRole('Manager') ? 'YES' : 'NO') . "\n";
        echo "  Permissions Count: " . $user->getAllPermissions()->count() . "\n";
        echo "\n";
    }
}

echo "\nChecking Employee Records:\n";
echo str_repeat("=", 50) . "\n\n";

use App\Models\Employee;

$employees = Employee::whereHas('user', function($q) {
    $q->where('role', 'MANAGER');
})->with('user')->get();

if ($employees->isEmpty()) {
    echo "No Employee records for Manager users.\n";
} else {
    foreach ($employees as $emp) {
        echo "Employee Record:\n";
        echo "  Employee ID: {$emp->id}\n";
        echo "  Name: {$emp->name}\n";
        echo "  User ID: " . ($emp->user_id ?? 'NULL') . "\n";
        echo "  User exists: " . ($emp->user ? 'YES' : 'NO') . "\n";
        echo "\n";
    }
}
