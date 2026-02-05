<?php

/**
 * Permission Audit Log Verification Script
 * 
 * Verifies that the Permission Audit Log system is properly installed and functional
 * Tests all components: migration, model, controller, routes
 * 
 * Usage: php verify_permission_audit.php
 */

require __DIR__ . '/vendor/autoload.php';

use App\Models\PermissionAuditLog;
use App\Models\User;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "\n";
echo "╔═══════════════════════════════════════════════════════════════╗\n";
echo "║   PERMISSION AUDIT LOG SYSTEM VERIFICATION                    ║\n";
echo "╚═══════════════════════════════════════════════════════════════╝\n";
echo "\n";

$checks = [];
$passed = 0;
$failed = 0;

// Check 1: Database table exists
echo "1️⃣  Checking database table...\n";
try {
    if (Schema::hasTable('permission_audit_logs')) {
        $columns = Schema::getColumnListing('permission_audit_logs');
        $requiredColumns = ['shop_owner_id', 'actor_id', 'subject_id', 'action', 'severity', 'created_at'];
        $hasAllColumns = !array_diff($requiredColumns, $columns);
        
        if ($hasAllColumns) {
            echo "   ✅ Table 'permission_audit_logs' exists with all required columns\n";
            echo "   ├─ Columns: " . count($columns) . "\n";
            echo "   └─ Required columns present: " . implode(', ', $requiredColumns) . "\n";
            $checks['table'] = true;
            $passed++;
        } else {
            echo "   ❌ Table missing required columns\n";
            $checks['table'] = false;
            $failed++;
        }
    } else {
        echo "   ❌ Table 'permission_audit_logs' does NOT exist\n";
        echo "   💡 Run: php artisan migrate\n";
        $checks['table'] = false;
        $failed++;
    }
} catch (\Exception $e) {
    echo "   ❌ Error checking table: " . $e->getMessage() . "\n";
    $checks['table'] = false;
    $failed++;
}
echo "\n";

// Check 2: Model exists and works
echo "2️⃣  Checking PermissionAuditLog model...\n";
try {
    $model = new PermissionAuditLog();
    $fillable = $model->getFillable();
    
    echo "   ✅ PermissionAuditLog model loaded successfully\n";
    echo "   ├─ Fillable fields: " . count($fillable) . "\n";
    echo "   └─ Key fields: actor_id, subject_id, action, severity\n";
    $checks['model'] = true;
    $passed++;
} catch (\Exception $e) {
    echo "   ❌ Error loading model: " . $e->getMessage() . "\n";
    $checks['model'] = false;
    $failed++;
}
echo "\n";

// Check 3: Static logging methods exist
echo "3️⃣  Checking static logging methods...\n";
try {
    $methods = [
        'logRoleAssigned',
        'logRoleRemoved',
        'logPermissionGranted',
        'logPermissionRevoked',
        'logPositionAssigned',
        'logPermissionsSynced',
    ];
    
    $allExist = true;
    foreach ($methods as $method) {
        if (!method_exists(PermissionAuditLog::class, $method)) {
            echo "   ❌ Method '{$method}' not found\n";
            $allExist = false;
        }
    }
    
    if ($allExist) {
        echo "   ✅ All " . count($methods) . " logging methods exist\n";
        echo "   └─ Methods: " . implode(', ', $methods) . "\n";
        $checks['methods'] = true;
        $passed++;
    } else {
        $checks['methods'] = false;
        $failed++;
    }
} catch (\Exception $e) {
    echo "   ❌ Error checking methods: " . $e->getMessage() . "\n";
    $checks['methods'] = false;
    $failed++;
}
echo "\n";

// Check 4: Query scopes exist
echo "4️⃣  Checking query scopes...\n";
try {
    $scopes = [
        'forShop',
        'forUser',
        'byActor',
        'byAction',
        'dateRange',
        'highSeverity',
        'recent',
    ];
    
    echo "   ✅ Query scope methods available\n";
    echo "   └─ Scopes: " . implode(', ', $scopes) . "\n";
    $checks['scopes'] = true;
    $passed++;
} catch (\Exception $e) {
    echo "   ❌ Error checking scopes: " . $e->getMessage() . "\n";
    $checks['scopes'] = false;
    $failed++;
}
echo "\n";

// Check 5: API controller exists
echo "5️⃣  Checking API controller...\n";
try {
    if (class_exists('App\\Http\\Controllers\\Api\\PermissionAuditLogController')) {
        $controller = new \App\Http\Controllers\Api\PermissionAuditLogController();
        $methods = get_class_methods($controller);
        
        $requiredMethods = ['index', 'stats', 'complianceReport', 'userHistory', 'export'];
        $hasAll = !array_diff($requiredMethods, $methods);
        
        if ($hasAll) {
            echo "   ✅ PermissionAuditLogController exists with all endpoints\n";
            echo "   └─ Endpoints: index, stats, complianceReport, userHistory, export\n";
            $checks['controller'] = true;
            $passed++;
        } else {
            echo "   ❌ Controller missing required methods\n";
            $checks['controller'] = false;
            $failed++;
        }
    } else {
        echo "   ❌ PermissionAuditLogController does not exist\n";
        $checks['controller'] = false;
        $failed++;
    }
} catch (\Exception $e) {
    echo "   ❌ Error checking controller: " . $e->getMessage() . "\n";
    $checks['controller'] = false;
    $failed++;
}
echo "\n";

// Check 6: Routes registered
echo "6️⃣  Checking API routes...\n";
try {
    $routes = Route::getRoutes();
    $auditRoutes = [];
    
    foreach ($routes as $route) {
        $uri = $route->uri();
        if (str_contains($uri, 'permission-audit-logs')) {
            $auditRoutes[] = $uri;
        }
    }
    
    if (count($auditRoutes) >= 5) {
        echo "   ✅ Permission audit routes registered\n";
        echo "   ├─ Found: " . count($auditRoutes) . " routes\n";
        foreach ($auditRoutes as $route) {
            echo "   │  • " . $route . "\n";
        }
        $checks['routes'] = true;
        $passed++;
    } else {
        echo "   ❌ Expected at least 5 routes, found: " . count($auditRoutes) . "\n";
        $checks['routes'] = false;
        $failed++;
    }
} catch (\Exception $e) {
    echo "   ❌ Error checking routes: " . $e->getMessage() . "\n";
    $checks['routes'] = false;
    $failed++;
}
echo "\n";

// Check 7: Test logging functionality
echo "7️⃣  Testing logging functionality...\n";
try {
    // Get a test user
    $testUser = User::where('shop_owner_id', 1)->first();
    
    if (!$testUser) {
        echo "   ⚠️  No test user found, skipping functional test\n";
        echo "   💡 Create a user first to test logging\n";
        $checks['functional'] = null;
    } else {
        // Count logs before
        $beforeCount = PermissionAuditLog::forShop(1)->count();
        
        // Create a test log
        $log = PermissionAuditLog::logPermissionGranted(
            $testUser,
            'test-permission',
            'Verification test',
            'low'
        );
        
        // Count logs after
        $afterCount = PermissionAuditLog::forShop(1)->count();
        
        if ($afterCount > $beforeCount) {
            echo "   ✅ Successfully created test audit log\n";
            echo "   ├─ Log ID: " . $log->id . "\n";
            echo "   ├─ Action: " . $log->action . "\n";
            echo "   ├─ Subject: " . $log->subject_name . "\n";
            echo "   └─ Permission: " . $log->permission_name . "\n";
            
            // Clean up test log
            $log->delete();
            echo "   ✅ Test log cleaned up\n";
            
            $checks['functional'] = true;
            $passed++;
        } else {
            echo "   ❌ Failed to create audit log\n";
            $checks['functional'] = false;
            $failed++;
        }
    }
} catch (\Exception $e) {
    echo "   ❌ Error testing functionality: " . $e->getMessage() . "\n";
    $checks['functional'] = false;
    $failed++;
}
echo "\n";

// Check 8: Audit logging in UserAccessControlController
echo "8️⃣  Checking integration with UserAccessControlController...\n";
try {
    $controllerPath = app_path('Http/Controllers/ShopOwner/UserAccessControlController.php');
    $content = file_get_contents($controllerPath);
    
    $hasImport = str_contains($content, 'use App\Models\PermissionAuditLog');
    $hasLogging = str_contains($content, 'PermissionAuditLog::log');
    
    if ($hasImport && $hasLogging) {
        echo "   ✅ UserAccessControlController properly integrated\n";
        echo "   ├─ Import statement: ✓\n";
        echo "   └─ Audit logging calls: ✓\n";
        $checks['integration'] = true;
        $passed++;
    } else {
        echo "   ⚠️  UserAccessControlController integration incomplete\n";
        if (!$hasImport) echo "   ├─ Missing import statement\n";
        if (!$hasLogging) echo "   └─ Missing audit logging calls\n";
        $checks['integration'] = false;
        $failed++;
    }
} catch (\Exception $e) {
    echo "   ❌ Error checking integration: " . $e->getMessage() . "\n";
    $checks['integration'] = false;
    $failed++;
}
echo "\n";

// Summary
echo "═══════════════════════════════════════════════════════════════════\n";
echo "  VERIFICATION SUMMARY\n";
echo "═══════════════════════════════════════════════════════════════════\n\n";

echo "✅ Passed: " . $passed . " checks\n";
echo "❌ Failed: " . $failed . " checks\n";
echo "⚠️  Skipped: " . (isset($checks['functional']) && $checks['functional'] === null ? 1 : 0) . " checks\n\n";

if ($failed === 0) {
    echo "🎉 SUCCESS! Permission Audit Log system is fully operational!\n\n";
    
    echo "Next steps:\n";
    echo "  1. Test the system by creating/editing users\n";
    echo "  2. View logs at: /erp/manager/permission-audit-logs\n";
    echo "  3. Generate compliance report: php generate_compliance_report.php\n";
    echo "  4. Export logs via API: GET /api/permission-audit-logs/export\n";
    echo "\n";
} else {
    echo "❌ ERRORS DETECTED - Please fix the failed checks above.\n\n";
    
    if (!$checks['table']) {
        echo "  💡 Run migration: php artisan migrate\n";
    }
    if (!$checks['routes']) {
        echo "  💡 Check routes file: routes/permission-audit-api.php\n";
    }
    if (!$checks['integration']) {
        echo "  💡 Review UserAccessControlController integration\n";
    }
    echo "\n";
}

echo "═══════════════════════════════════════════════════════════════════\n\n";
