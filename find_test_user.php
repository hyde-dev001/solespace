<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

echo "Looking for test@example.com...\n\n";

$testUser = User::where('email', 'test@example.com')->first();

if ($testUser) {
    echo "Found: {$testUser->id} - {$testUser->name} ({$testUser->email}) - Role: {$testUser->role}\n";
} else {
    echo "NOT FOUND!\n\n";
    echo "All users:\n";
    $allUsers = User::all(['id', 'name', 'email', 'role']);
    foreach($allUsers as $user) {
        echo "  {$user->id} - {$user->name} ({$user->email}) - Role: {$user->role}\n";
    }
}
