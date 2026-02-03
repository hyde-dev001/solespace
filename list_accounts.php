<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Finance\Account;

$accounts = Account::select('id', 'code', 'name', 'type', 'balance')
    ->orderBy('code')
    ->get();

echo "=== ALL ACCOUNTS IN DATABASE ===\n\n";
printf("%-4s | %-10s | %-40s | %-10s | %12s\n", "ID", "CODE", "NAME", "TYPE", "BALANCE");
echo str_repeat("-", 85) . "\n";

foreach ($accounts as $acc) {
    printf("%-4s | %-10s | %-40s | %-10s | %12.2f\n", 
        $acc->id, 
        $acc->code, 
        substr($acc->name, 0, 40), 
        $acc->type, 
        $acc->balance
    );
}
