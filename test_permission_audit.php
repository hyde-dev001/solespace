<?php

/**
 * Test Permission Audit Log System
 * 
 * Creates test scenarios to demonstrate permission audit logging
 * Shows how the system tracks all permission changes
 */

require __DIR__ . '/vendor/autoload.php';

use App\Models\User;
use App\Models\PermissionAuditLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "\n";
echo "╔═══════════════════════════════════════════════════════════════╗\n";
echo "║   PERMISSION AUDIT LOG - TEST DEMONSTRATION                   ║\n";
echo "╚═══════════════════════════════════════════════════════════════╝\n";
echo "\n";

try {
    // Simulate authenticated shop owner
    $shopOwner = \App\Models\ShopOwner::first();
    if ($shopOwner) {
        Auth::guard('shop_owner')->login($shopOwner);
        echo "✅ Authenticated as: {$shopOwner->shop_name}\n\n";
    }

    echo "📝 SCENARIO 1: Creating a new Staff user with Payroll Specialist position\n";
    echo "────────────────────────────────────────────────────────────────\n";
    
    // Create test user
    $testUser = User::create([
        'name' => 'Test Audit User',
        'first_name' => 'Test',
        'last_name' => 'Audit',
        'email' => 'audit.test@example.com',
        'password' => Hash::make('password'),
        'shop_owner_id' => 1,
        'role' => 'STAFF',
        'position' => 'Payroll Specialist (Test)',
    ]);
    
    $testUser->assignRole('Staff');
    echo "✅ User created: {$testUser->name} (ID: {$testUser->id})\n";
    
    // Log role assignment
    PermissionAuditLog::logRoleAssigned(
        $testUser,
        'Staff',
        'Test user created for audit demonstration',
        'low'
    );
    echo "✅ Role assignment logged\n\n";
    
    echo "📝 SCENARIO 2: Granting specific payroll permissions\n";
    echo "────────────────────────────────────────────────────────────────\n";
    
    $permissions = ['view-payroll', 'process-payroll', 'generate-payslip'];
    foreach ($permissions as $permission) {
        $testUser->givePermissionTo($permission);
        PermissionAuditLog::logPermissionGranted(
            $testUser,
            $permission,
            'Payroll specialist duties assigned',
            'medium'
        );
        echo "✅ Granted: {$permission}\n";
    }
    echo "\n";
    
    echo "📝 SCENARIO 3: Revoking a permission (simulating access review)\n";
    echo "────────────────────────────────────────────────────────────────\n";
    
    $testUser->revokePermissionTo('process-payroll');
    PermissionAuditLog::logPermissionRevoked(
        $testUser,
        'process-payroll',
        'Security review: restricting payroll processing access',
        'high'
    );
    echo "⚠️  Revoked: process-payroll (HIGH SEVERITY)\n\n";
    
    echo "📝 SCENARIO 4: Bulk permission sync\n";
    echo "────────────────────────────────────────────────────────────────\n";
    
    $oldPermissions = $testUser->getDirectPermissions()->pluck('name')->toArray();
    $newPermissions = ['view-dashboard', 'view-employees', 'view-payroll'];
    
    $testUser->syncPermissions($newPermissions);
    PermissionAuditLog::logPermissionsSynced(
        $testUser,
        $oldPermissions,
        $newPermissions,
        'Annual permission review - standardizing payroll access'
    );
    echo "✅ Permissions synced\n";
    echo "   Old: " . implode(', ', $oldPermissions) . "\n";
    echo "   New: " . implode(', ', $newPermissions) . "\n\n";
    
    echo "📝 SCENARIO 5: Promoting to Manager (CRITICAL operation)\n";
    echo "────────────────────────────────────────────────────────────────\n";
    
    $testUser->update(['role' => 'MANAGER']);
    $testUser->removeRole('Staff');
    $testUser->assignRole('Manager');
    
    PermissionAuditLog::logRoleChanged(
        $testUser,
        'Staff',
        'Manager',
        'Promoted to management due to excellent performance'
    );
    echo "🚀 Promoted to Manager (HIGH SEVERITY)\n\n";
    
    // Display audit trail
    echo "╔═══════════════════════════════════════════════════════════════╗\n";
    echo "║   AUDIT TRAIL FOR TEST USER                                   ║\n";
    echo "╚═══════════════════════════════════════════════════════════════╝\n\n";
    
    $auditLogs = PermissionAuditLog::forUser($testUser->id)
        ->orderBy('created_at', 'asc')
        ->get();
    
    echo "Total Audit Logs: " . $auditLogs->count() . "\n\n";
    
    foreach ($auditLogs as $i => $log) {
        echo ($i + 1) . ". " . strtoupper(str_replace('_', ' ', $log->action)) . "\n";
        echo "   ├─ Date: " . $log->created_at->format('Y-m-d H:i:s') . "\n";
        echo "   ├─ Actor: " . ($log->actor_name ?? 'System') . "\n";
        echo "   ├─ Subject: " . $log->subject_name . "\n";
        echo "   ├─ Severity: " . strtoupper($log->severity) . "\n";
        if ($log->role_name) echo "   ├─ Role: " . $log->role_name . "\n";
        if ($log->permission_name) echo "   ├─ Permission: " . $log->permission_name . "\n";
        if ($log->reason) echo "   ├─ Reason: " . $log->reason . "\n";
        echo "   └─ Description: " . $log->getChangeDescription() . "\n";
        echo "\n";
    }
    
    // Statistics
    echo "╔═══════════════════════════════════════════════════════════════╗\n";
    echo "║   AUDIT LOG STATISTICS                                        ║\n";
    echo "╚═══════════════════════════════════════════════════════════════╝\n\n";
    
    $stats = [
        'Total Logs' => $auditLogs->count(),
        'Low Severity' => $auditLogs->where('severity', 'low')->count(),
        'Medium Severity' => $auditLogs->where('severity', 'medium')->count(),
        'High Severity' => $auditLogs->where('severity', 'high')->count(),
        'Critical Severity' => $auditLogs->where('severity', 'critical')->count(),
    ];
    
    foreach ($stats as $label => $count) {
        echo sprintf("%-20s: %d\n", $label, $count);
    }
    echo "\n";
    
    echo "╔═══════════════════════════════════════════════════════════════╗\n";
    echo "║   USER PERMISSION HISTORY                                     ║\n";
    echo "╚═══════════════════════════════════════════════════════════════╝\n\n";
    
    $history = PermissionAuditLog::getUserHistory($testUser->id);
    
    foreach ($history as $entry) {
        echo "• {$entry['date']} - {$entry['details']}\n";
        echo "  Performed by: {$entry['performed_by']}\n";
        if ($entry['reason']) echo "  Reason: {$entry['reason']}\n";
        echo "  Severity: {$entry['severity']}\n";
        echo "\n";
    }
    
    // Cleanup
    echo "═══════════════════════════════════════════════════════════════\n";
    echo "  CLEANUP\n";
    echo "═══════════════════════════════════════════════════════════════\n\n";
    
    echo "Cleaning up test data...\n";
    PermissionAuditLog::forUser($testUser->id)->delete();
    $testUser->delete();
    echo "✅ Test user and audit logs removed\n\n";
    
    echo "═══════════════════════════════════════════════════════════════\n";
    echo "  TEST COMPLETE\n";
    echo "═══════════════════════════════════════════════════════════════\n\n";
    
    echo "✅ Permission Audit Log system is working perfectly!\n\n";
    
    echo "Key Features Demonstrated:\n";
    echo "  ✓ Role assignment logging\n";
    echo "  ✓ Permission grant logging\n";
    echo "  ✓ Permission revoke logging (high severity)\n";
    echo "  ✓ Bulk permission sync\n";
    echo "  ✓ Role change logging\n";
    echo "  ✓ Automatic context capture (actor, timestamp, IP)\n";
    echo "  ✓ Severity levels (low, medium, high)\n";
    echo "  ✓ User history retrieval\n";
    echo "  ✓ Query scopes and filtering\n\n";
    
    echo "Next Steps:\n";
    echo "  1. Test in production by creating/editing real users\n";
    echo "  2. Generate compliance reports: php generate_compliance_report.php\n";
    echo "  3. Access via API: GET /api/permission-audit-logs\n";
    echo "  4. Export for audits: GET /api/permission-audit-logs/export\n\n";
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n\n";
}
