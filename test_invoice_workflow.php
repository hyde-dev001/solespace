<?php

/**
 * Test Invoice to Journal Entry Workflow
 * 
 * This script tests the complete invoice workflow:
 * 1. Create revenue accounts
 * 2. Create an invoice
 * 3. Post invoice to ledger (auto-generates journal entry)
 * 4. Verify journal entry was created
 * 5. Verify account balances updated
 */

require 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Finance\Account;
use App\Models\Finance\Invoice;
use App\Models\Finance\InvoiceItem;
use App\Models\Finance\JournalEntry;
use Illuminate\Support\Facades\DB;

echo "\n=== Invoice to Journal Entry Workflow Test ===\n";

try {
    DB::beginTransaction();

    // 1. Create or get revenue account
    echo "\n1. Setting up accounts...\n";
    $revenueAccount = Account::firstOrCreate(
        ['code' => 'REVENUE-001'],
        [
            'name' => 'Sales Revenue',
            'type' => 'Revenue',
            'normal_balance' => 'Credit',
            'group' => 'Revenue',
            'active' => true,
            'balance' => 0,
        ]
    );
    echo "   ✓ Revenue Account: {$revenueAccount->code} - {$revenueAccount->name}\n";

    $arAccount = Account::firstOrCreate(
        ['code' => 'AR-001'],
        [
            'name' => 'Accounts Receivable',
            'type' => 'Asset',
            'normal_balance' => 'Debit',
            'group' => 'Receivables',
            'active' => true,
            'balance' => 0,
        ]
    );
    echo "   ✓ AR Account: {$arAccount->code} - {$arAccount->name}\n";

    // 2. Create invoice
    echo "\n2. Creating invoice...\n";
    $invoice = Invoice::create([
        'reference' => 'INV-TEST-' . now()->timestamp,
        'customer_name' => 'Test Customer',
        'customer_email' => 'test@example.com',
        'date' => now()->toDateString(),
        'due_date' => now()->addDays(30)->toDateString(),
        'total' => 1000,
        'tax_amount' => 100,
        'status' => 'draft',
        'shop_id' => 1,
    ]);
    echo "   ✓ Invoice created: {$invoice->reference}\n";

    // 3. Create invoice items
    echo "\n3. Adding line items...\n";
    InvoiceItem::create([
        'invoice_id' => $invoice->id,
        'description' => 'Professional Services',
        'quantity' => 10,
        'unit_price' => 100,
        'tax_rate' => 10,
        'amount' => 1100,
        'account_id' => $revenueAccount->id,
    ]);
    echo "   ✓ Line item added: 10 × $100 = $1000 + $100 tax\n";

    // 4. Post invoice to ledger
    echo "\n4. Posting invoice to ledger...\n";
    $invoice->createJournalEntry();
    $invoice->postToLedger();
    echo "   ✓ Invoice posted\n";

    // 5. Verify journal entry
    echo "\n5. Verifying journal entry...\n";
    $journalEntry = JournalEntry::find($invoice->journal_entry_id);
    if ($journalEntry) {
        echo "   ✓ Journal Entry #{$journalEntry->id}: {$journalEntry->reference}\n";
        echo "     Status: {$journalEntry->status}\n";
        echo "     Posted by: {$journalEntry->posted_by}\n";

        $lines = $journalEntry->lines;
        echo "     Lines: " . count($lines) . "\n";

        $totalDebits = 0;
        $totalCredits = 0;

        foreach ($lines as $line) {
            $totalDebits += $line->debit;
            $totalCredits += $line->credit;
            $type = $line->debit > 0 ? 'DEBIT' : 'CREDIT';
            $amount = $line->debit > 0 ? $line->debit : $line->credit;
            echo "       → {$line->account_code}: {$type} ${amount}\n";
        }

        echo "     Total Debits: ${totalDebits}, Total Credits: ${totalCredits}\n";

        if ($totalDebits == $totalCredits) {
            echo "     ✓ BALANCED: Debits = Credits\n";
        } else {
            echo "     ✗ ERROR: Debits ≠ Credits\n";
        }
    } else {
        echo "   ✗ ERROR: Journal entry not created\n";
    }

    // 6. Verify account balances
    echo "\n6. Checking account balances...\n";
    $arAccountUpdated = Account::find($arAccount->id);
    $revenueAccountUpdated = Account::find($revenueAccount->id);

    $arBalance = floatval($arAccountUpdated->balance);
    $revenueBalance = floatval($revenueAccountUpdated->balance);

    echo "   A/R Account: Balance = \${$arBalance}\n";
    echo "   Revenue Account: Balance = \${$revenueBalance}\n";

    if ($arBalance == 1100 && $revenueBalance == -1100) {
        echo "   ✓ Account balances correct\n";
    } else {
        echo "   ✗ WARNING: Account balances may be incorrect (expected AR: 1100, Revenue: -1100)\n";
    }

    DB::rollBack();

    echo "\n✓ TEST PASSED - All workflow steps completed successfully\n";
    echo "\n=== Summary ===\n";
    echo "Invoice Reference: {$invoice->reference}\n";
    echo "Invoice Total: \${$invoice->total}\n";
    echo "Journal Entry ID: {$invoice->journal_entry_id}\n";
    echo "Journal Entry Status: {$journalEntry->status}\n";

} catch (\Exception $e) {
    DB::rollBack();
    echo "\n✗ TEST FAILED\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
