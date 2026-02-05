<?php

/**
 * Test Payroll Specialist Position
 * Demonstrates the thesis adviser's requirement for flexible positions
 * 
 * Run: php test_payroll_specialist.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Employee;
use App\Models\PositionTemplate;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

echo "\n╔════════════════════════════════════════════════════════════╗\n";
echo "║     PAYROLL SPECIALIST POSITION TEST                       ║\n";
echo "║     (Thesis Adviser's Requirement)                         ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n\n";

// Find Payroll Specialist template
$payrollTemplate = PositionTemplate::where('name', 'Payroll Specialist')->first();

if (!$payrollTemplate) {
    echo "❌ Payroll Specialist template not found!\n";
    exit(1);
}

echo "✅ Found Payroll Specialist Template\n";
echo "   Description: {$payrollTemplate->description}\n";
echo "   Category: {$payrollTemplate->category}\n";
echo "   Recommended Role: {$payrollTemplate->recommended_role}\n\n";

echo "📋 Permissions for Payroll Specialist:\n";
$permissions = $payrollTemplate->templatePermissions->pluck('permission_name')->toArray();
foreach ($permissions as $perm) {
    echo "   ✓ {$perm}\n";
}
echo "\n";

// Check if test user already exists
$testEmail = 'payroll.specialist@test.com';
$existingUser = User::where('email', $testEmail)->first();

if ($existingUser) {
    echo "ℹ️  Test user already exists. Using existing user.\n";
    $testUser = $existingUser;
} else {
    echo "📝 Creating test Payroll Specialist user...\n";
    
    try {
        DB::beginTransaction();
        
        // Create user
        $testUser = User::create([
            'name' => 'Maria Santos',
            'email' => $testEmail,
            'password' => Hash::make('password'),
            'role' => 'STAFF',
            'position' => 'Payroll Specialist',
            'shop_owner_id' => 1, // Assuming shop owner with ID 1 exists
            'status' => 'active',
            'force_password_change' => false,
        ]);
        
        // Assign Staff role
        $testUser->assignRole('Staff');
        
        // Apply Payroll Specialist template
        $payrollTemplate->applyToUser($testUser, false);
        
        // Create employee record
        Employee::create([
            'name' => 'Maria Santos',
            'email' => $testEmail,
            'password' => Hash::make('password'),
            'position' => 'Payroll Specialist',
            'shop_owner_id' => 1,
            'status' => 'active',
        ]);
        
        DB::commit();
        
        echo "✅ Test user created successfully!\n\n";
    } catch (\Exception $e) {
        DB::rollBack();
        echo "❌ Error creating test user: {$e->getMessage()}\n";
        exit(1);
    }
}

// Verify permissions
echo "╔════════════════════════════════════════════════════════════╗\n";
echo "║          PERMISSION VERIFICATION                           ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n\n";

echo "User: {$testUser->name}\n";
echo "Email: {$testUser->email}\n";
echo "Role: {$testUser->role}\n";
echo "Position: {$testUser->position}\n";
echo "Spatie Role: " . $testUser->getRoleNames()->first() . "\n\n";

echo "📊 Permission Check:\n";
echo "═══════════════════════════════════════════════\n\n";

// What they SHOULD have access to
$shouldHave = [
    'view-employees' => 'View employees',
    'view-payroll' => 'View payroll',
    'process-payroll' => 'Process payroll',
    'generate-payslip' => 'Generate payslips',
    'view-dashboard' => 'View dashboard',
];

echo "✅ SHOULD HAVE ACCESS TO (Payroll-specific):\n";
foreach ($shouldHave as $perm => $desc) {
    $hasIt = $testUser->can($perm);
    $icon = $hasIt ? '✅' : '❌';
    echo "   {$icon} {$desc} ({$perm})\n";
}

// What they should NOT have access to
$shouldNotHave = [
    'create-employees' => 'Create employees',
    'edit-employees' => 'Edit employees',
    'delete-employees' => 'Delete employees',
    'view-invoices' => 'View invoices',
    'create-invoices' => 'Create invoices',
    'approve-expenses' => 'Approve expenses',
    'view-customers' => 'View customers',
    'create-users' => 'Create users',
];

echo "\n❌ SHOULD NOT HAVE ACCESS TO (Other departments):\n";
foreach ($shouldNotHave as $perm => $desc) {
    $hasIt = $testUser->can($perm);
    $icon = $hasIt ? '⚠️  WARNING' : '✅';
    echo "   {$icon} {$desc} ({$perm})\n";
}

// Summary
echo "\n\n╔════════════════════════════════════════════════════════════╗\n";
echo "║                    TEST SUMMARY                            ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n\n";

$totalPermissions = $testUser->getAllPermissions()->count();
$hasPayrollPerms = $testUser->can('view-payroll') && 
                   $testUser->can('process-payroll') && 
                   $testUser->can('generate-payslip');
$doesntHaveOtherPerms = !$testUser->can('view-invoices') && 
                        !$testUser->can('create-users') && 
                        !$testUser->can('approve-expenses');

echo "Total Permissions: {$totalPermissions}\n";
echo "Has Payroll Permissions: " . ($hasPayrollPerms ? "✅ YES" : "❌ NO") . "\n";
echo "Restricted from other areas: " . ($doesntHaveOtherPerms ? "✅ YES" : "❌ NO") . "\n\n";

if ($hasPayrollPerms && $doesntHaveOtherPerms && $totalPermissions <= 10) {
    echo "🎉 SUCCESS! Payroll Specialist position works as expected!\n";
    echo "\n✨ This demonstrates:\n";
    echo "   1. Staff can be assigned ONLY specific permissions\n";
    echo "   2. Position is flexible - not locked to departments\n";
    echo "   3. Thesis adviser's requirement is met\n";
    echo "   4. A staff member who ONLY generates payslips is possible\n";
} else {
    echo "⚠️  WARNING: Some checks didn't pass as expected.\n";
    echo "   Please review the permissions above.\n";
}

echo "\n╚════════════════════════════════════════════════════════════╝\n\n";

// Login credentials
echo "📋 Test Login Credentials:\n";
echo "   Email: {$testEmail}\n";
echo "   Password: password\n\n";
