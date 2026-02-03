<?php
require __DIR__ . '/vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

$capsule = new Capsule;

$capsule->addConnection([
    'driver' => 'mysql',
    'host' => '127.0.0.1',
    'database' => 'solespace',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

echo "=== CHECKING FOR DATABASE TRIGGERS ===\n\n";

// Check for triggers on cart_items table
$sql = "SELECT TRIGGER_NAME, TRIGGER_SCHEMA, EVENT_OBJECT_TABLE, TRIGGER_EVENT, ACTION_TIMING 
        FROM INFORMATION_SCHEMA.TRIGGERS 
        WHERE EVENT_OBJECT_TABLE = 'cart_items' AND TRIGGER_SCHEMA = 'solespace'";

$triggers = Capsule::select($sql);

if (empty($triggers)) {
    echo "✓ No triggers found on cart_items table\n";
} else {
    echo "Found " . count($triggers) . " trigger(s):\n\n";
    foreach ($triggers as $trigger) {
        echo sprintf(
            "  Trigger: %s\n    Table: %s.%s\n    Event: %s %s\n\n",
            $trigger->TRIGGER_NAME,
            $trigger->TRIGGER_SCHEMA,
            $trigger->EVENT_OBJECT_TABLE,
            $trigger->ACTION_TIMING,
            $trigger->TRIGGER_EVENT
        );
        
        // Get trigger body
        $triggerSQL = "SHOW CREATE TRIGGER `{$trigger->TRIGGER_NAME}`";
        $triggerInfo = Capsule::select($triggerSQL);
        if ($triggerInfo) {
            echo "    Code:\n";
            echo "    " . str_replace("\n", "\n    ", $triggerInfo[0]->{'Trigger Statement'}) . "\n\n";
        }
    }
}

echo "\n=== CHECKING FOR DATABASE VIEWS OR STORED PROCEDURES ===\n\n";

// Check for stored procedures or functions that might modify cart_items
$sql = "SELECT ROUTINE_NAME, ROUTINE_TYPE 
        FROM INFORMATION_SCHEMA.ROUTINES 
        WHERE ROUTINE_SCHEMA = 'solespace' 
        AND (ROUTINE_NAME LIKE '%cart%' OR ROUTINE_NAME LIKE '%quantity%')";

$routines = Capsule::select($sql);

if (empty($routines)) {
    echo "✓ No stored procedures/functions related to cart or quantity found\n";
} else {
    echo "Found procedures/functions:\n";
    foreach ($routines as $routine) {
        echo "  {$routine->ROUTINE_TYPE}: {$routine->ROUTINE_NAME}\n";
    }
}
