<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\SuperAdmin;
use Illuminate\Support\Facades\Hash;

$sa = SuperAdmin::updateOrCreate([
    'email' => 'admin@solespace.com'
], [
    'first_name' => 'Admin',
    'last_name' => 'Root',
    'password' => Hash::make('admin123'),
    'phone' => '0000000000',
    'role' => 'super_admin',
    'status' => 'active',
]);

echo "Created/Updated super admin: {$sa->email}\n";

?>
