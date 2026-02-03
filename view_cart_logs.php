<?php
/**
 * View recent CartController::add() log entries
 */

$logFile = __DIR__ . '/storage/logs/laravel.log';

if (!file_exists($logFile)) {
    echo "Log file not found: $logFile\n";
    exit(1);
}

$content = file_get_contents($logFile);

// Find all CartController::add() entries
preg_match_all('/\[.*?\] local\.INFO: .*CartController::add\(\).*?\{[\s\S]*?\}\s*$/m', $content, $matches);

if (empty($matches[0])) {
    echo "No CartController::add() log entries found.\n";
    echo "Log file size: " . filesize($logFile) . " bytes\n";
    exit(0);
}

echo "Found " . count($matches[0]) . " CartController::add() calls:\n";
echo str_repeat("=", 80) . "\n\n";

foreach ($matches[0] as $entry) {
    echo $entry . "\n";
    echo str_repeat("-", 80) . "\n\n";
}

// Also show last 20 lines of log for context
echo "\n\n" . str_repeat("=", 80) . "\n";
echo "LAST 20 LINES OF LOG:\n";
echo str_repeat("=", 80) . "\n";
exec('tail -n 20 ' . escapeshellarg($logFile), $output);
echo implode("\n", $output);
