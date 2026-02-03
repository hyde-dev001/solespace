<?php

namespace App\Http\Controllers;

use App\Models\Finance\Account;
use App\Models\Finance\JournalEntry;
use App\Models\Finance\JournalLine;
use App\Models\Reconciliation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReconciliationController extends Controller
{
    /**
     * Get transactions for reconciliation
     */
    public function getTransactions(Request $request)
    {
        try {
            $user = Auth::guard('user')->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
            
            $shopOwnerId = $user->role === 'shop_owner' ? $user->id : $user->shop_owner_id;

            if (!$shopOwnerId) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $accountId = $request->query('account_id');
            
            if (!$accountId) {
                return response()->json(['error' => 'Account ID is required'], 400);
            }

            // Verify account exists (shop isolation handled by middleware)
            $account = Account::find($accountId);

            if (!$account) {
                return response()->json(['error' => 'Account not found'], 404);
            }
            
            // Optional: verify account belongs to shop owner if shop_owner_id is set
            if ($account->shop_owner_id && $account->shop_owner_id != $shopOwnerId) {
                return response()->json(['error' => 'Account not found'], 404);
            }

            // Get journal entry lines for this account
            $transactions = DB::table('finance_journal_lines')
                ->select(
                    'finance_journal_lines.id',
                    'finance_journal_entries.date',
                    'finance_journal_entries.reference',
                    'finance_journal_entries.description',
                    'finance_journal_lines.debit',
                    'finance_journal_lines.credit',
                    'finance_accounts.name as account_name',
                    'reconciliations.id as reconciliation_id'
                )
                ->join('finance_journal_entries', 'finance_journal_lines.journal_entry_id', '=', 'finance_journal_entries.id')
                ->join('finance_accounts', 'finance_journal_lines.account_id', '=', 'finance_accounts.id')
                ->leftJoin('reconciliations', function($join) {
                    $join->on('finance_journal_lines.id', '=', 'reconciliations.journal_entry_line_id')
                        ->where('reconciliations.status', '=', 'reconciled');
                })
                ->where('finance_journal_lines.account_id', $accountId)
                ->orderBy('finance_journal_entries.date', 'desc')
                ->get()
                ->map(function ($line) {
                    return [
                        'id' => $line->id,
                        'date' => $line->date,
                        'reference' => $line->reference,
                        'description' => $line->description,
                        'debit' => (float) $line->debit,
                        'credit' => (float) $line->credit,
                        'account_name' => $line->account_name,
                        'status' => $line->reconciliation_id ? 'reconciled' : 'unreconciled'
                    ];
                });

            return response()->json([
                'success' => true,
                'transactions' => $transactions
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching reconciliation transactions: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load transactions'], 500);
        }
    }

    /**
     * Create or update reconciliation session
     */
    public function store(Request $request)
    {
        try {
            $user = Auth::guard('user')->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
            
            $shopOwnerId = $user->role === 'shop_owner' ? $user->id : $user->shop_owner_id;

            if (!$shopOwnerId) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $validated = $request->validate([
                'account_id' => 'required|exists:finance_accounts,id',
                'statement_date' => 'required|date',
                'opening_balance' => 'required|numeric',
                'closing_balance' => 'required|numeric',
                'matches' => 'array',
                'matches.*.bank_transaction_id' => 'string',
                'matches.*.journal_entry_line_id' => 'required|exists:finance_journal_lines,id'
            ]);

            // Verify account belongs to shop owner
            $account = Account::where('id', $validated['account_id'])
                ->where('shop_owner_id', $shopOwnerId)
                ->first();

            if (!$account) {
                return response()->json(['error' => 'Account not found'], 404);
            }

            DB::beginTransaction();

            // Create reconciliation records for each match
            $reconciliations = [];
            if (isset($validated['matches'])) {
                foreach ($validated['matches'] as $match) {
                    $reconciliation = Reconciliation::updateOrCreate(
                        [
                            'journal_entry_line_id' => $match['journal_entry_line_id'],
                        ],
                        [
                            'account_id' => $validated['account_id'],
                            'statement_date' => $validated['statement_date'],
                            'opening_balance' => $validated['opening_balance'],
                            'closing_balance' => $validated['closing_balance'],
                            'bank_transaction_reference' => $match['bank_transaction_id'] ?? null,
                            'reconciled_by' => $user->id,
                            'reconciled_at' => now(),
                            'status' => 'reconciled',
                            'shop_owner_id' => $shopOwnerId
                        ]
                    );
                    
                    $reconciliations[] = $reconciliation;
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Reconciliation completed successfully',
                'reconciliations' => $reconciliations
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error saving reconciliation: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to save reconciliation'], 500);
        }
    }

    /**
     * Get reconciliation history
     */
    public function history(Request $request)
    {
        try {
            $user = Auth::guard('user')->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
            
            $shopOwnerId = $user->role === 'shop_owner' ? $user->id : $user->shop_owner_id;

            if (!$shopOwnerId) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $accountId = $request->query('account_id');

            $query = Reconciliation::select(
                'reconciliations.id',
                'reconciliations.account_id',
                'finance_accounts.name as account_name',
                'reconciliations.statement_date',
                'reconciliations.opening_balance',
                'reconciliations.closing_balance',
                'reconciliations.reconciled_at',
                'users.name as reconciled_by',
                DB::raw('COUNT(DISTINCT reconciliations.id) as transaction_count')
            )
            ->join('finance_accounts', 'reconciliations.account_id', '=', 'finance_accounts.id')
            ->join('users', 'reconciliations.reconciled_by', '=', 'users.id')
            ->where('reconciliations.shop_owner_id', $shopOwnerId)
            ->where('reconciliations.status', 'reconciled')
            ->groupBy(
                'reconciliations.id',
                'reconciliations.account_id',
                'finance_accounts.name',
                'reconciliations.statement_date',
                'reconciliations.opening_balance',
                'reconciliations.closing_balance',
                'reconciliations.reconciled_at',
                'users.name'
            );

            if ($accountId) {
                $query->where('reconciliations.account_id', $accountId);
            }

            $sessions = $query->orderBy('reconciliations.reconciled_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'sessions' => $sessions
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching reconciliation history: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load history'], 500);
        }
    }

    /**
     * Unmatch/reverse a reconciliation
     */
    public function unmatch(Request $request, $id)
    {
        try {
            $user = Auth::guard('user')->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
            
            $shopOwnerId = $user->role === 'shop_owner' ? $user->id : $user->shop_owner_id;

            if (!$shopOwnerId) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $reconciliation = Reconciliation::where('id', $id)
                ->where('shop_owner_id', $shopOwnerId)
                ->first();

            if (!$reconciliation) {
                return response()->json(['error' => 'Reconciliation not found'], 404);
            }

            $reconciliation->delete();

            return response()->json([
                'success' => true,
                'message' => 'Reconciliation unmatched successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error unmatching reconciliation: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to unmatch'], 500);
        }
    }

    /**
     * Auto-match bank transactions with journal entries
     * Intelligent matching algorithm based on amount, date proximity, and description similarity
     */
    public function autoMatch(Request $request)
    {
        try {
            $user = Auth::guard('user')->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
            
            $shopOwnerId = $user->role === 'shop_owner' ? $user->id : $user->shop_owner_id;

            if (!$shopOwnerId) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $validated = $request->validate([
                'account_id' => 'required|exists:finance_accounts,id',
                'bank_transactions' => 'required|array',
                'bank_transactions.*.id' => 'required|string',
                'bank_transactions.*.date' => 'required|date',
                'bank_transactions.*.description' => 'nullable|string',
                'bank_transactions.*.reference' => 'nullable|string',
                'bank_transactions.*.debit' => 'nullable|numeric',
                'bank_transactions.*.credit' => 'nullable|numeric',
                'bank_transactions.*.amount' => 'nullable|numeric',
                'tolerance_amount' => 'nullable|numeric|min:0',
                'tolerance_days' => 'nullable|integer|min:0|max:30'
            ]);

            // Verify account belongs to shop owner
            $account = Account::where('id', $validated['account_id'])
                ->where('shop_owner_id', $shopOwnerId)
                ->first();

            if (!$account) {
                return response()->json(['error' => 'Account not found'], 404);
            }

            // Get unreconciled journal entry lines for this account
            $journalLines = DB::table('finance_journal_lines')
                ->select(
                    'finance_journal_lines.id',
                    'finance_journal_entries.date',
                    'finance_journal_entries.reference',
                    'finance_journal_entries.description',
                    'finance_journal_lines.debit',
                    'finance_journal_lines.credit',
                    'finance_accounts.name as account_name'
                )
                ->join('finance_journal_entries', 'finance_journal_lines.journal_entry_id', '=', 'finance_journal_entries.id')
                ->join('finance_accounts', 'finance_journal_lines.account_id', '=', 'finance_accounts.id')
                ->leftJoin('reconciliations', function($join) {
                    $join->on('finance_journal_lines.id', '=', 'reconciliations.journal_entry_line_id')
                        ->where('reconciliations.status', '=', 'reconciled');
                })
                ->where('finance_journal_lines.account_id', $validated['account_id'])
                ->whereNull('reconciliations.id') // Only unreconciled transactions
                ->orderBy('finance_journal_entries.date', 'desc')
                ->get();

            // Matching configuration
            $toleranceAmount = $validated['tolerance_amount'] ?? 0.01; // Default: 1 cent
            $toleranceDays = $validated['tolerance_days'] ?? 3; // Default: 3 days

            $matches = [];
            $unmatchedBank = [];

            foreach ($validated['bank_transactions'] as $bankTxn) {
                $bankAmount = $bankTxn['debit'] ?? $bankTxn['credit'] ?? $bankTxn['amount'] ?? 0;
                $bankDate = new \DateTime($bankTxn['date']);
                
                $bestMatch = null;
                $bestScore = 0;

                foreach ($journalLines as $journalLine) {
                    // Skip if already matched in this batch
                    if (isset($matches[$journalLine->id])) {
                        continue;
                    }

                    $journalAmount = $journalLine->debit ?: $journalLine->credit;
                    $journalDate = new \DateTime($journalLine->date);

                    // Calculate matching score
                    $score = $this->calculateMatchScore(
                        $bankAmount,
                        $journalAmount,
                        $bankDate,
                        $journalDate,
                        $bankTxn['description'] ?? '',
                        $journalLine->description,
                        $bankTxn['reference'] ?? '',
                        $journalLine->reference,
                        $toleranceAmount,
                        $toleranceDays
                    );

                    if ($score > $bestScore && $score >= 50) { // Minimum 50% confidence
                        $bestScore = $score;
                        $bestMatch = $journalLine;
                    }
                }

                if ($bestMatch) {
                    $matches[$bestMatch->id] = [
                        'bank_transaction' => $bankTxn,
                        'journal_line' => [
                            'id' => $bestMatch->id,
                            'date' => $bestMatch->date,
                            'reference' => $bestMatch->reference,
                            'description' => $bestMatch->description,
                            'debit' => (float) $bestMatch->debit,
                            'credit' => (float) $bestMatch->credit,
                            'account_name' => $bestMatch->account_name
                        ],
                        'confidence' => round($bestScore, 2),
                        'match_type' => $this->getMatchType($bestScore)
                    ];
                } else {
                    $unmatchedBank[] = $bankTxn;
                }
            }

            return response()->json([
                'success' => true,
                'matches' => array_values($matches),
                'matched_count' => count($matches),
                'unmatched_count' => count($unmatchedBank),
                'unmatched_bank' => $unmatchedBank
            ]);

        } catch (\Exception $e) {
            Log::error('Error in auto-match: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json(['error' => 'Auto-match failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Calculate match score between bank transaction and journal line
     * Returns score from 0-100
     */
    private function calculateMatchScore(
        $bankAmount,
        $journalAmount,
        \DateTime $bankDate,
        \DateTime $journalDate,
        $bankDescription,
        $journalDescription,
        $bankReference,
        $journalReference,
        $toleranceAmount,
        $toleranceDays
    ) {
        $score = 0;

        // 1. Amount matching (40 points max)
        $amountDiff = abs($bankAmount - $journalAmount);
        if ($amountDiff <= $toleranceAmount) {
            $score += 40; // Exact match
        } elseif ($amountDiff <= ($bankAmount * 0.01)) { // Within 1%
            $score += 30;
        } elseif ($amountDiff <= ($bankAmount * 0.05)) { // Within 5%
            $score += 15;
        }

        // 2. Date proximity (30 points max)
        $daysDiff = abs(($bankDate->getTimestamp() - $journalDate->getTimestamp()) / 86400);
        if ($daysDiff == 0) {
            $score += 30; // Same day
        } elseif ($daysDiff <= $toleranceDays) {
            $score += 30 - ($daysDiff * 5); // Reduce 5 points per day
        }

        // 3. Reference matching (15 points max)
        if (!empty($bankReference) && !empty($journalReference)) {
            $refSimilarity = similar_text(
                strtolower($bankReference),
                strtolower($journalReference)
            );
            if ($refSimilarity > 0) {
                $score += min(15, $refSimilarity);
            }
        }

        // 4. Description similarity (15 points max)
        if (!empty($bankDescription) && !empty($journalDescription)) {
            $descSimilarity = $this->calculateTextSimilarity(
                strtolower($bankDescription),
                strtolower($journalDescription)
            );
            $score += $descSimilarity * 15; // Convert to 0-15 range
        }

        return $score;
    }

    /**
     * Calculate text similarity using Levenshtein distance
     * Returns value from 0-1
     */
    private function calculateTextSimilarity($str1, $str2)
    {
        $maxLen = max(strlen($str1), strlen($str2));
        if ($maxLen == 0) return 0;
        
        $distance = levenshtein(substr($str1, 0, 255), substr($str2, 0, 255)); // Levenshtein limit
        return 1 - ($distance / $maxLen);
    }

    /**
     * Get match type based on confidence score
     */
    private function getMatchType($score)
    {
        if ($score >= 90) return 'exact';
        if ($score >= 70) return 'high_confidence';
        if ($score >= 50) return 'medium_confidence';
        return 'low_confidence';
    }

    /**
     * Batch create reconciliation records
     */
    public function batchReconcile(Request $request)
    {
        try {
            $user = Auth::guard('user')->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
            
            $shopOwnerId = $user->role === 'shop_owner' ? $user->id : $user->shop_owner_id;

            if (!$shopOwnerId) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $validated = $request->validate([
                'account_id' => 'required|exists:finance_accounts,id',
                'statement_date' => 'required|date',
                'opening_balance' => 'required|numeric',
                'closing_balance' => 'required|numeric',
                'matches' => 'required|array|min:1',
                'matches.*.bank_transaction_id' => 'required|string',
                'matches.*.journal_entry_line_id' => 'required|exists:finance_journal_lines,id'
            ]);

            // Verify account belongs to shop owner
            $account = Account::where('id', $validated['account_id'])
                ->where('shop_owner_id', $shopOwnerId)
                ->first();

            if (!$account) {
                return response()->json(['error' => 'Account not found'], 404);
            }

            DB::beginTransaction();

            $reconciliations = [];
            $errors = [];

            foreach ($validated['matches'] as $match) {
                try {
                    // Check if already reconciled
                    $existing = Reconciliation::where('journal_entry_line_id', $match['journal_entry_line_id'])
                        ->where('status', 'reconciled')
                        ->first();

                    if ($existing) {
                        $errors[] = [
                            'journal_entry_line_id' => $match['journal_entry_line_id'],
                            'error' => 'Already reconciled'
                        ];
                        continue;
                    }

                    $reconciliation = Reconciliation::create([
                        'account_id' => $validated['account_id'],
                        'journal_entry_line_id' => $match['journal_entry_line_id'],
                        'bank_transaction_reference' => $match['bank_transaction_id'],
                        'statement_date' => $validated['statement_date'],
                        'opening_balance' => $validated['opening_balance'],
                        'closing_balance' => $validated['closing_balance'],
                        'reconciled_by' => $user->id,
                        'reconciled_at' => now(),
                        'status' => 'reconciled',
                        'shop_owner_id' => $shopOwnerId
                    ]);

                    $reconciliations[] = $reconciliation;
                } catch (\Exception $e) {
                    $errors[] = [
                        'journal_entry_line_id' => $match['journal_entry_line_id'],
                        'error' => $e->getMessage()
                    ];
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Batch reconciliation completed',
                'reconciled_count' => count($reconciliations),
                'error_count' => count($errors),
                'reconciliations' => $reconciliations,
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in batch reconciliation: ' . $e->getMessage());
            return response()->json(['error' => 'Batch reconciliation failed'], 500);
        }
    }
}
