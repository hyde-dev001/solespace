<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$result = DB::select("
    SELECT u.email, u.role as old_role, r.name as spatie_role, COUNT(p.id) as perms
    FROM users u
    LEFT JOIN model_has_roles mhr ON mhr.model_id = u.id AND mhr.model_type = 'App\\\\Models\\\\User'
    LEFT JOIN roles r ON r.id = mhr.role_id
    LEFT JOIN role_has_permissions rhp ON rhp.role_id = r.id
    LEFT JOIN permissions p ON p.id = rhp.permission_id
    WHERE u.email = 'dan@gmail.com'
    GROUP BY u.email, u.role, r.name
");

if (!empty($result)) {
    $u = $result[0];
    echo "\nManager Status:\n";
    echo "  Email: {$u->email}\n";
    echo "  Old Role: {$u->old_role}\n";
    echo "  Spatie Role: " . ($u->spatie_role ?? 'NONE') . "\n";
    echo "  Permissions: {$u->perms}\n\n";
    
    if ($u->spatie_role && $u->perms > 0) {
        echo "✅ Database is correct!\n";
        echo "❗ Clear browser cookies and login again in INCOGNITO mode\n\n";
    } else {
        echo "❌ Fixing role assignment...\n";
        $manager = App\Models\User::where('email', 'dan@gmail.com')->first();
        if ($manager) {
            DB::table('model_has_roles')->where('model_id', $manager->id)->delete();
            $manager->assignRole('Manager');
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
            echo "✓ Fixed! Logout and login again.\n\n";
        }
    }
}
