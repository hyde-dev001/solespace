<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$exists = (bool) App\Models\SuperAdmin::where('email','admin@solespace.com')->exists();
if ($exists) { echo "FOUND\n"; } else { echo "NOT FOUND\n"; }

?>
