<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "DIRECT DATABASE FIX\n";
echo "===================\n\n";

// Get manager user ID
$manager = DB::table('users')->where('role', 'MANAGER')->first();
if (!$manager) {
    die("No manager found!\n");
}

echo "Manager: {$manager->email} (ID: {$manager->id})\n\n";

// Get Manager role ID
$managerRole = DB::table('roles')->where('name', 'Manager')->where('guard_name', 'user')->first();
if (!$managerRole) {
    die("Manager role not found in database!\n");
}

echo "Manager role: ID {$managerRole->id}, Name '{$managerRole->name}', Guard '{$managerRole->guard_name}'\n\n";

// Check existing assignment
$existing = DB::table('model_has_roles')
    ->where('role_id', $managerRole->id)
    ->where('model_type', 'App\\Models\\User')
    ->where('model_id', $manager->id)
    ->first();

if ($existing) {
    echo "✓ Role assignment already exists in database\n";
} else {
    echo "❌ Role assignment missing! Inserting...\n";
    
    // Delete any old assignments
    DB::table('model_has_roles')
        ->where('model_type', 'App\\Models\\User')
        ->where('model_id', $manager->id)
        ->delete();
    
    // Insert new assignment
    DB::table('model_has_roles')->insert([
        'role_id' => $managerRole->id,
        'model_type' => 'App\\Models\\User',
        'model_id' => $manager->id
    ]);
    
    echo "✓ Inserted role assignment\n";
}

echo "\n";

// Verify
$verify = DB::table('model_has_roles')
    ->where('role_id', $managerRole->id)
    ->where('model_type', 'App\\Models\\User')
    ->where('model_id', $manager->id)
    ->first();

if ($verify) {
    echo "✅ VERIFIED: Role assignment exists in database\n";
    echo "   Role ID: {$verify->role_id}\n";
    echo "   Model: {$verify->model_type}\n";
    echo "   User ID: {$verify->model_id}\n\n";
    
    echo "Clearing caches...\n";
    Artisan::call('permission:cache-reset');
    Artisan::call('cache:clear');
    echo "✓ Caches cleared\n\n";
    
    echo "Testing with fresh model instance...\n";
    $testUser = App\Models\User::find($manager->id);
    echo "  hasRole('Manager'): " . ($testUser->hasRole('Manager') ? 'YES ✓' : 'NO ✗') . "\n";
    echo "  can('view-expenses'): " . ($testUser->can('view-expenses') ? 'YES ✓' : 'NO ✗') . "\n\n";
    
    echo "===================\n";
    echo "✅ FIX COMPLETE\n";
    echo "===================\n";
    echo "Please LOGOUT and LOGIN again.\n";
    
} else {
    echo "❌ FAILED: Could not verify role assignment!\n";
}
