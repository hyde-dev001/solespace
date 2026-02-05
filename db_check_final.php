<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Direct database check
$result = DB::select("
    SELECT 
        u.id as user_id,
        u.email,
        u.role as old_role,
        r.id as role_id,
        r.name as spatie_role,
        r.guard_name,
        COUNT(p.id) as permission_count
    FROM users u
    LEFT JOIN model_has_roles mhr ON mhr.model_id = u.id AND mhr.model_type = 'App\\\\Models\\\\User'
    LEFT JOIN roles r ON r.id = mhr.role_id
    LEFT JOIN role_has_permissions rhp ON rhp.role_id = r.id
    LEFT JOIN permissions p ON p.id = rhp.permission_id
    WHERE u.email = 'dan@gmail.com'
    GROUP BY u.id, u.email, u.role, r.id, r.name, r.guard_name
");

echo "\n";
echo "==========================================\n";
echo " DIRECT DATABASE CHECK\n";
echo "==========================================\n\n";

if (empty($result)) {
    echo "❌ No user found!\n";
    exit(1);
}

$user = $result[0];

echo "User: {$user->email}\n";
echo "Old role column: {$user->old_role}\n";
echo "Spatie role: " . ($user->spatie_role ?? 'NONE') . "\n";
echo "Guard: " . ($user->guard_name ?? 'N/A') . "\n";
echo "Permissions: {$user->permission_count}\n\n";

if ($user->spatie_role === 'Manager' && $user->permission_count > 0) {
    echo "✅ DATABASE IS CORRECT!\n\n";
    echo "==========================================\n";
    echo " NEXT STEPS TO FIX UNAUTHORIZED ERROR:\n";
    echo "==========================================\n\n";
    echo "1. Close ALL browser tabs/windows\n";
    echo "2. Clear browser cookies:\n";
    echo "   - Press F12 (Developer Tools)\n";
    echo "   - Go to Application tab\n";
    echo "   - Storage > Cookies > http://127.0.0.1:8000\n";
    echo "   - Right-click > Clear\n";
    echo "3. Or use Incognito/Private window\n";
    echo "4. Login again\n\n";
    echo "The session was cached with old permissions.\n";
    echo "==========================================\n\n";
} else {
    echo "❌ PROBLEM FOUND!\n\n";
    
    if (!$user->spatie_role) {
        echo "Issue: No Spatie role assigned\n";
        echo "Fix: Running assignment now...\n\n";
        
        $manager = App\Models\User::where('email', 'dan@gmail.com')->first();
        $manager->syncRoles(['Manager']);
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        
        echo "✓ Role assigned. Please logout and login again.\n";
    } else if ($user->permission_count == 0) {
        echo "Issue: Role has no permissions\n";
        echo "Fix: Need to run RolesAndPermissionsSeeder\n";
    }
}

echo "\n";
