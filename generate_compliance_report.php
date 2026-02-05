<?php

/**
 * Compliance Report Generator Script
 * 
 * Generates a comprehensive permission audit compliance report
 * Useful for regulatory audits (GDPR, SOX, HIPAA, etc.)
 * 
 * Usage:
 *   php generate_compliance_report.php
 *   php generate_compliance_report.php --days=90
 *   php generate_compliance_report.php --from=2026-01-01 --to=2026-02-05
 */

require __DIR__ . '/vendor/autoload.php';

use App\Models\PermissionAuditLog;
use Illuminate\Support\Facades\DB;

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Parse command line arguments
$options = getopt('', ['days:', 'from:', 'to:', 'shop:']);
$days = $options['days'] ?? 30;
$dateFrom = $options['from'] ?? now()->subDays($days)->format('Y-m-d');
$dateTo = $options['to'] ?? now()->format('Y-m-d');
$shopOwnerId = $options['shop'] ?? 1;

echo "\n";
echo "╔══════════════════════════════════════════════════════════════════╗\n";
echo "║     PERMISSION AUDIT COMPLIANCE REPORT                           ║\n";
echo "╚══════════════════════════════════════════════════════════════════╝\n";
echo "\n";
echo "📅 Period: {$dateFrom} to {$dateTo}\n";
echo "🏢 Shop Owner ID: {$shopOwnerId}\n";
echo "📊 Generated: " . now()->format('Y-m-d H:i:s') . "\n";
echo "\n";

// Get compliance report
$report = PermissionAuditLog::getComplianceReport($shopOwnerId, $dateFrom, $dateTo);

echo "═══════════════════════════════════════════════════════════════════\n";
echo "  EXECUTIVE SUMMARY\n";
echo "═══════════════════════════════════════════════════════════════════\n\n";

echo "Total Permission Changes: " . $report['total_changes'] . "\n";
echo "  ├─ High Severity: " . $report['high_severity_count'] . "\n";
echo "  └─ Critical Severity: " . $report['critical_count'] . "\n";
echo "\n";

echo "═══════════════════════════════════════════════════════════════════\n";
echo "  CHANGES BY ACTION\n";
echo "═══════════════════════════════════════════════════════════════════\n\n";

if (!empty($report['by_action'])) {
    foreach ($report['by_action'] as $action => $count) {
        $actionName = ucwords(str_replace('_', ' ', $action));
        echo sprintf("%-30s : %4d changes\n", $actionName, $count);
    }
} else {
    echo "No actions recorded in this period.\n";
}
echo "\n";

echo "═══════════════════════════════════════════════════════════════════\n";
echo "  MOST ACTIVE ACTORS (Who made changes)\n";
echo "═══════════════════════════════════════════════════════════════════\n\n";

if (!empty($report['by_actor'])) {
    $actorCount = 1;
    foreach ($report['by_actor'] as $actor => $count) {
        echo sprintf("%2d. %-40s : %4d changes\n", $actorCount++, $actor ?: 'Unknown', $count);
        if ($actorCount > 10) break; // Top 10
    }
} else {
    echo "No actors recorded.\n";
}
echo "\n";

echo "═══════════════════════════════════════════════════════════════════\n";
echo "  MOST AFFECTED USERS\n";
echo "═══════════════════════════════════════════════════════════════════\n\n";

if (!empty($report['by_subject'])) {
    $subjectCount = 1;
    foreach ($report['by_subject'] as $subject => $count) {
        echo sprintf("%2d. %-40s : %4d changes\n", $subjectCount++, $subject, $count);
        if ($subjectCount > 10) break; // Top 10
    }
} else {
    echo "No subjects recorded.\n";
}
echo "\n";

// Get critical changes requiring review
echo "═══════════════════════════════════════════════════════════════════\n";
echo "  ⚠️  CRITICAL CHANGES REQUIRING REVIEW\n";
echo "═══════════════════════════════════════════════════════════════════\n\n";

if (!empty($report['recent_critical']) && count($report['recent_critical']) > 0) {
    foreach ($report['recent_critical'] as $log) {
        echo "┌─────────────────────────────────────────────────────────────────\n";
        echo "│ Date: " . $log['created_at'] . "\n";
        echo "│ Action: " . ucwords(str_replace('_', ' ', $log['action'])) . "\n";
        echo "│ Actor: " . ($log['actor_name'] ?? 'System') . "\n";
        echo "│ Subject: " . $log['subject_name'] . "\n";
        if ($log['role_name']) echo "│ Role: " . $log['role_name'] . "\n";
        if ($log['permission_name']) echo "│ Permission: " . $log['permission_name'] . "\n";
        if ($log['reason']) echo "│ Reason: " . $log['reason'] . "\n";
        echo "│ Severity: 🔴 CRITICAL\n";
        echo "└─────────────────────────────────────────────────────────────────\n\n";
    }
} else {
    echo "✅ No critical changes in this period.\n\n";
}

// Get high-risk patterns
echo "═══════════════════════════════════════════════════════════════════\n";
echo "  COMPLIANCE METRICS\n";
echo "═══════════════════════════════════════════════════════════════════\n\n";

$lowSeverity = $report['total_changes'] > 0 ? 
    PermissionAuditLog::forShop($shopOwnerId)
        ->dateRange($dateFrom, $dateTo)
        ->where('severity', 'low')
        ->count() : 0;

$mediumSeverity = $report['total_changes'] > 0 ?
    PermissionAuditLog::forShop($shopOwnerId)
        ->dateRange($dateFrom, $dateTo)
        ->where('severity', 'medium')
        ->count() : 0;

echo "Severity Distribution:\n";
echo "  ├─ Low: " . $lowSeverity . " (" . ($report['total_changes'] > 0 ? round($lowSeverity / $report['total_changes'] * 100, 1) : 0) . "%)\n";
echo "  ├─ Medium: " . $mediumSeverity . " (" . ($report['total_changes'] > 0 ? round($mediumSeverity / $report['total_changes'] * 100, 1) : 0) . "%)\n";
echo "  ├─ High: " . $report['high_severity_count'] . " (" . ($report['total_changes'] > 0 ? round($report['high_severity_count'] / $report['total_changes'] * 100, 1) : 0) . "%)\n";
echo "  └─ Critical: " . $report['critical_count'] . " (" . ($report['total_changes'] > 0 ? round($report['critical_count'] / $report['total_changes'] * 100, 1) : 0) . "%)\n";
echo "\n";

// Compliance recommendations
echo "═══════════════════════════════════════════════════════════════════\n";
echo "  COMPLIANCE RECOMMENDATIONS\n";
echo "═══════════════════════════════════════════════════════════════════\n\n";

if ($report['critical_count'] > 0) {
    echo "⚠️  IMMEDIATE ACTION REQUIRED:\n";
    echo "   • Review all " . $report['critical_count'] . " critical changes\n";
    echo "   • Verify authorization for each change\n";
    echo "   • Document business justification\n\n";
}

if ($report['high_severity_count'] > 5) {
    echo "⚠️  HIGH-RISK ACTIVITY DETECTED:\n";
    echo "   • " . $report['high_severity_count'] . " high-severity changes recorded\n";
    echo "   • Consider implementing approval workflow\n";
    echo "   • Review access control policies\n\n";
}

if ($report['total_changes'] > 100) {
    echo "📊 HIGH CHANGE VOLUME:\n";
    echo "   • " . $report['total_changes'] . " total changes in " . $days . " days\n";
    echo "   • Average: " . round($report['total_changes'] / $days, 1) . " changes per day\n";
    echo "   • Consider reviewing permission management procedures\n\n";
}

if ($report['total_changes'] === 0) {
    echo "ℹ️  NO CHANGES RECORDED:\n";
    echo "   • No permission changes in this period\n";
    echo "   • System appears stable\n\n";
} else {
    echo "✅ AUDIT TRAIL COMPLETE:\n";
    echo "   • All changes properly logged\n";
    echo "   • Compliance requirements met\n";
    echo "   • Ready for regulatory review\n\n";
}

echo "═══════════════════════════════════════════════════════════════════\n";
echo "  EXPORT OPTIONS\n";
echo "═══════════════════════════════════════════════════════════════════\n\n";

echo "To export detailed report:\n";
echo "  • CSV Export: GET /api/permission-audit-logs/export?date_from={$dateFrom}&date_to={$dateTo}\n";
echo "  • API Report: POST /api/permission-audit-logs/compliance-report\n";
echo "\n";

echo "═══════════════════════════════════════════════════════════════════\n";
echo "  REPORT COMPLETE\n";
echo "═══════════════════════════════════════════════════════════════════\n\n";

echo "📋 For detailed analysis, access the Permission Audit Log dashboard at:\n";
echo "   /erp/manager/permission-audit-logs\n\n";

echo "📧 Questions? Contact your system administrator.\n\n";
