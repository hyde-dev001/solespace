#!/usr/bin/env php
<?php

/**
 * Test KPI Endpoint
 * 
 * This script tests the KPI endpoint directly to see what error is being returned.
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Simulate authentication - you'll need to replace this with actual user ID
$userId = 1; // Replace with your actual shop owner ID

$user = \App\Models\User::find($userId);

if (!$user) {
    echo "User not found!\n";
    exit(1);
}

\Illuminate\Support\Facades\Auth::login($user);

echo "Testing KPI endpoint...\n";
echo "User: {$user->name}\n";
echo "Shop Owner ID: " . ($user->shop_owner_id ?? $user->id) . "\n\n";

// Create request
$request = \Illuminate\Http\Request::create(
    '/api/finance/reports/kpis',
    'GET',
    ['as_of_date' => date('Y-m-d')]
);

// Call controller
$controller = new \App\Http\Controllers\FinancialReportController();

try {
    $response = $controller->kpis($request);
    
    if ($response->getStatusCode() === 200) {
        echo "✓ Success!\n\n";
        $data = json_decode($response->getContent(), true);
        echo json_encode($data, JSON_PRETTY_PRINT) . "\n";
    } else {
        echo "✗ Error! Status: " . $response->getStatusCode() . "\n\n";
        echo $response->getContent() . "\n";
    }
} catch (\Exception $e) {
    echo "✗ Exception thrown!\n\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
