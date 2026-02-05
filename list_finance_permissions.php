<?php
/**
 * List all Finance-related permissions
 */

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Spatie\Permission\Models\Permission;
use App\Models\User;

echo "=== All Finance-Related Permissions ===\n\n";

$financePermissions = Permission::where('guard_name', 'user')
    ->where(function($q) {
        $q->where('name', 'like', 'finance%')
          ->orWhere('name', 'like', '%invoice%')
          ->orWhere('name', 'like', '%account%')
          ->orWhere('name', 'like', '%expense%');
    })
    ->orderBy('name')
    ->get();

echo "Found " . $financePermissions->count() . " finance-related permissions:\n\n";

foreach ($financePermissions as $perm) {
    echo "  - {$perm->name}\n";
}

echo "\n=== Manager's Finance Permissions ===\n\n";

$manager = User::where('email', 'dan@gmail.com')->first();

if ($manager) {
    $managerPerms = $manager->getAllPermissions()
        ->filter(function($p) {
            return str_contains(strtolower($p->name), 'finance') || 
                   str_contains(strtolower($p->name), 'invoice') ||
                   str_contains(strtolower($p->name), 'account') ||
                   str_contains(strtolower($p->name), 'expense');
        });
    
    echo "Manager has " . $managerPerms->count() . " finance-related permissions:\n\n";
    
    foreach ($managerPerms as $perm) {
        echo "  ✓ {$perm->name}\n";
    }
}

echo "\n=== All Manager Permissions ===\n\n";
$allPerms = $manager->getAllPermissions();
echo "Total: " . $allPerms->count() . " permissions\n\n";

foreach ($allPerms->sortBy('name') as $perm) {
    echo "  - {$perm->name}\n";
}
