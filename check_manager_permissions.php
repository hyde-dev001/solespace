<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Checking Manager Permissions\n";
echo "============================\n\n";

$manager = App\Models\User::where('role', 'Manager')->first();

if ($manager) {
    echo "Manager found: {$manager->email}\n";
    echo "Name: {$manager->first_name} {$manager->last_name}\n";
    echo "Old role column: {$manager->role}\n\n";
    
    echo "Has Manager role (Spatie): " . ($manager->hasRole('Manager') ? 'YES ✓' : 'NO ✗') . "\n";
    
    $roles = $manager->getRoleNames();
    echo "All assigned roles: " . ($roles->isEmpty() ? 'NONE' : $roles->implode(', ')) . "\n\n";
    
    $permissions = $manager->getAllPermissions();
    echo "Total permissions: {$permissions->count()}\n\n";
    
    echo "Finance permissions:\n";
    echo "  - view-expenses: " . ($manager->can('view-expenses') ? 'YES ✓' : 'NO ✗') . "\n";
    echo "  - view-invoices: " . ($manager->can('view-invoices') ? 'YES ✓' : 'NO ✗') . "\n";
    echo "  - create-expenses: " . ($manager->can('create-expenses') ? 'YES ✓' : 'NO ✗') . "\n";
    echo "  - approve-expenses: " . ($manager->can('approve-expenses') ? 'YES ✓' : 'NO ✗') . "\n\n";
    
    echo "Manager permissions:\n";
    echo "  - view-all-users: " . ($manager->can('view-all-users') ? 'YES ✓' : 'NO ✗') . "\n";
    echo "  - view-all-audit-logs: " . ($manager->can('view-all-audit-logs') ? 'YES ✓' : 'NO ✗') . "\n\n";
    
    if ($permissions->isEmpty()) {
        echo "❌ PROBLEM: Manager has NO permissions assigned!\n";
        echo "   The user needs to be assigned the 'Manager' role.\n";
    }
} else {
    echo "❌ No user found with role='Manager'\n";
    echo "   Checking all users with 'Manager' role via Spatie:\n\n";
    
    $managers = App\Models\User::role('Manager')->get();
    if ($managers->isEmpty()) {
        echo "   No users have the 'Manager' role assigned.\n";
    } else {
        foreach ($managers as $mgr) {
            echo "   - {$mgr->email} (old role: {$mgr->role})\n";
        }
    }
}

echo "\n============================\n";
echo "Check complete!\n";
