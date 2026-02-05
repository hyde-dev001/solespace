<?php
/**
 * Quick Manager Permission Verification
 * Run this after manager logs in to verify permissions are working
 */

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$manager = App\Models\User::where('role', 'MANAGER')->first();

echo "\nQuick Status Check:\n";
echo "==================\n";
echo "Manager: {$manager->email}\n";
echo "Has Manager Role: " . ($manager->hasRole('Manager') ? '✓ YES' : '✗ NO') . "\n";
echo "Can Access Finance: " . ($manager->can('view-expenses') ? '✓ YES' : '✗ NO') . "\n";
echo "Can Access Manager Dashboard: " . ($manager->can('view-all-audit-logs') ? '✓ YES' : '✗ NO') . "\n\n";

if ($manager->hasRole('Manager') && $manager->can('view-expenses')) {
    echo "✅ ALL SET! Manager should be able to access all modules.\n";
    echo "If not, please LOGOUT and LOGIN again.\n\n";
} else {
    echo "⚠ Permissions not active yet.\n";
    echo "Action: Manager must LOGOUT and LOGIN again.\n\n";
}
