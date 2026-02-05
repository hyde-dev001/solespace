<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Employee;

echo "Verification Check:\n";
echo str_repeat("=", 50) . "\n\n";

$user = User::where('email', 'dan@gmail.com')->first();

if (!$user) {
    echo "ERROR: User not found!\n";
    exit(1);
}

echo "User Account:\n";
echo "  ID: {$user->id}\n";
echo "  Name: {$user->name}\n";
echo "  Email: {$user->email}\n";
echo "  Old Role Column: {$user->role}\n";
echo "  Spatie Roles: " . ($user->getRoleNames()->count() > 0 ? $user->getRoleNames()->implode(', ') : 'NONE') . "\n";
echo "  Has Manager Role: " . ($user->hasRole('Manager') ? 'YES ✓' : 'NO ✗') . "\n";
echo "  Total Permissions: " . $user->getAllPermissions()->count() . "\n\n";

$employee = Employee::where('email', 'dan@gmail.com')->first();

if ($employee) {
    echo "Employee Record:\n";
    echo "  ID: {$employee->id}\n";
    echo "  Name: {$employee->name}\n";
    echo "  Email: {$employee->email}\n";
    echo "  Status: {$employee->status}\n";
    echo "  Linked User: " . ($employee->user ? "YES (ID: {$employee->user->id})" : "NO") . "\n\n";
} else {
    echo "Employee Record: NOT FOUND\n\n";
}

if ($user->hasRole('Manager') && $employee && $employee->user) {
    echo "✅ ALL GOOD! Manager account is fixed.\n";
    echo "   - Spatie role assigned: YES\n";
    echo "   - Employee record linked: YES\n";
    echo "   - Try logging in now!\n";
} else {
    echo "❌ Issues found:\n";
    if (!$user->hasRole('Manager')) {
        echo "   - Missing Spatie 'Manager' role\n";
    }
    if (!$employee) {
        echo "   - No Employee record\n";
    } elseif (!$employee->user) {
        echo "   - Employee not linked to User (email mismatch?)\n";
    }
}
