#!/usr/bin/env php
<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Simulate authentication
$user = \App\Models\User::find(1);

if (!$user) {
    echo "User not found!\n";
    exit(1);
}

\Illuminate\Support\Facades\Auth::login($user);

echo "Testing Balance Sheet endpoint...\n";
echo "User: {$user->name}\n\n";

$request = \Illuminate\Http\Request::create(
    '/api/finance/reports/balance-sheet',
    'GET',
    ['as_of_date' => date('Y-m-d')]
);

$controller = new \App\Http\Controllers\FinancialReportController();

try {
    $response = $controller->balanceSheet($request);
    
    if ($response->getStatusCode() === 200) {
        echo "✓ Balance Sheet endpoint working!\n\n";
        $data = json_decode($response->getContent(), true);
        echo "Total Assets: " . number_format($data['summary']['total_assets'], 2) . "\n";
        echo "Total Liabilities+Equity: " . number_format($data['summary']['total_liabilities_equity'], 2) . "\n";
        echo "Balanced: " . ($data['summary']['balanced'] ? 'Yes' : 'No') . "\n";
    } else {
        echo "✗ Error! Status: " . $response->getStatusCode() . "\n";
    }
} catch (\Exception $e) {
    echo "✗ Exception: " . $e->getMessage() . "\n";
    echo $e->getFile() . ":" . $e->getLine() . "\n";
}
