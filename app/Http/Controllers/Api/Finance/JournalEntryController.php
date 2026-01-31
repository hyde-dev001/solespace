<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Finance\JournalEntry;
use App\Models\Finance\JournalLine;
use App\Models\Finance\Account;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class JournalEntryController extends Controller
{
    public function index(Request $request)
    {
        $q = JournalEntry::query();
        if ($request->filled('status')) $q->where('status', $request->status);
        if ($request->filled('q')) $q->where('reference', 'like', "%{$request->q}%")->orWhere('description', 'like', "%{$request->q}%");
        $entries = $q->with('lines')->orderBy('date', 'desc')->get();
        return response()->json(['data' => $entries]);
    }

    public function show($id)
    {
        $entry = JournalEntry::with('lines')->findOrFail($id);
        return response()->json($entry);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'reference' => 'required|string',
            'date' => 'required|date',
            'description' => 'nullable|string',
            'lines' => 'required|array|min:2',
            'lines.*.account_id' => 'required|integer|exists:finance_accounts,id',
            'lines.*.debit' => 'nullable|numeric',
            'lines.*.credit' => 'nullable|numeric',
            'lines.*.memo' => 'nullable|string',
        ]);

        $entry = JournalEntry::create([
            'reference' => $data['reference'],
            'date' => $data['date'],
            'description' => $data['description'] ?? null,
            'status' => 'draft',
        ]);

        foreach ($data['lines'] as $ln) {
            $acct = Account::find($ln['account_id']);
            JournalLine::create([
                'journal_entry_id' => $entry->id,
                'account_id' => $acct->id,
                'account_code' => $acct->code,
                'account_name' => $acct->name,
                'debit' => $ln['debit'] ?? 0,
                'credit' => $ln['credit'] ?? 0,
                'memo' => $ln['memo'] ?? null,
            ]);
        }

        $actorUserId = Auth::id();
        $shopOwnerId = Auth::user()?->shop_owner_id ?? Auth::guard('shop_owner')->id() ?? 1;
        AuditLog::create([
            'shop_owner_id' => $shopOwnerId,
            'actor_user_id' => $actorUserId,
            'action' => 'create_journal',
            'target_type' => 'journal_entry',
            'target_id' => $entry->id,
            'metadata' => $entry->toArray()
        ]);

        return response()->json($entry->load('lines'), 201);
    }

    public function update(Request $request, $id)
    {
        $entry = JournalEntry::findOrFail($id);
        if ($entry->status !== 'draft') return response()->json(['error' => 'Only drafts can be edited'], 422);

        $data = $request->validate([
            'reference' => 'sometimes|string',
            'date' => 'sometimes|date',
            'description' => 'nullable|string',
            'lines' => 'sometimes|array|min:2',
        ]);

        $entry->update(array_filter($data));

        if (!empty($data['lines'])) {
            $entry->lines()->delete();
            foreach ($data['lines'] as $ln) {
                $acct = Account::find($ln['account_id']);
                JournalLine::create([
                    'journal_entry_id' => $entry->id,
                    'account_id' => $acct->id,
                    'account_code' => $acct->code,
                    'account_name' => $acct->name,
                    'debit' => $ln['debit'] ?? 0,
                    'credit' => $ln['credit'] ?? 0,
                    'memo' => $ln['memo'] ?? null,
                ]);
            }
        }

        $actorUserId = Auth::id();
        $shopOwnerId = Auth::user()?->shop_owner_id ?? Auth::guard('shop_owner')->id() ?? 1;
        AuditLog::create([
            'shop_owner_id' => $shopOwnerId,
            'actor_user_id' => $actorUserId,
            'action' => 'update_journal',
            'target_type' => 'journal_entry',
            'target_id' => $entry->id,
            'metadata' => $data
        ]);
        return response()->json($entry->load('lines'));
    }

    public function post(Request $request, $id)
    {
        $entry = JournalEntry::with('lines')->findOrFail($id);
        if ($entry->status !== 'draft') return response()->json(['error' => 'Only drafts can be posted'], 422);

        // validate balancing
        $totalDebit = $entry->lines->sum('debit');
        $totalCredit = $entry->lines->sum('credit');
        if (bccomp($totalDebit, $totalCredit, 2) !== 0) {
            return response()->json(['error' => 'Entry not balanced'], 422);
        }

        DB::beginTransaction();
        try {
            // mark posted
            $entry->status = 'posted';
            $entry->posted_by = Auth::user()?->name ?? null;
            $entry->posted_at = now();
            $entry->save();

            // update account balances using account.normal_balance to determine sign
            foreach ($entry->lines as $line) {
                $account = Account::find($line->account_id);
                if (!$account) continue;
                $normal = strtolower($account->normal_balance ?? 'debit');
                if ($normal === 'credit') {
                    // for credit-normal accounts, credits increase balance
                    $delta = ($line->credit - $line->debit);
                } else {
                    // debit-normal (default): debits increase balance
                    $delta = ($line->debit - $line->credit);
                }
                $account->balance = bcadd((string)$account->balance, (string)$delta, 2);
                $account->save();
            }

            $actorUserId = Auth::id();
            $shopOwnerId = Auth::user()?->shop_owner_id ?? Auth::guard('shop_owner')->id() ?? 1;
            AuditLog::create([
                'shop_owner_id' => $shopOwnerId,
                'actor_user_id' => $actorUserId,
                'action' => 'post_journal',
                'target_type' => 'journal_entry',
                'target_id' => $entry->id,
                'metadata' => ['posted_by' => $actorUserId]
            ]);

            DB::commit();
            return response()->json($entry->load('lines'));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to post entry', 'message' => $e->getMessage()], 500);
        }
    }

    public function reverse(Request $request, $id)
    {
        $data = $request->validate(['reason' => 'required|string']);
        $entry = JournalEntry::with('lines')->findOrFail($id);
        if ($entry->status !== 'posted') return response()->json(['error' => 'Only posted entries can be reversed'], 422);

        DB::beginTransaction();
        try {
            // create reversing entry
            $rev = JournalEntry::create([
                'reference' => $entry->reference . '-REV',
                'date' => now()->toDateString(),
                'description' => 'Reversal of ' . $entry->reference . ': ' . $data['reason'],
                'status' => 'posted',
                'posted_by' => Auth::user()?->name ?? null,
                'posted_at' => now(),
            ]);

            foreach ($entry->lines as $line) {
                JournalLine::create([
                    'journal_entry_id' => $rev->id,
                    'account_id' => $line->account_id,
                    'account_code' => $line->account_code,
                    'account_name' => $line->account_name,
                    'debit' => $line->credit,
                    'credit' => $line->debit,
                    'memo' => 'Reversal of line ' . $line->id,
                ]);

                // update account balances (apply reversing amounts)
                $account = Account::find($line->account_id);
                if ($account) {
                    $normal = strtolower($account->normal_balance ?? 'debit');
                    if ($normal === 'credit') {
                        $delta = ($line->debit - $line->credit); // reversing
                    } else {
                        $delta = ($line->credit - $line->debit);
                    }
                    $account->balance = bcadd((string)$account->balance, (string)$delta, 2);
                    $account->save();
                }
            }

            // mark original void
            $entry->status = 'void';
            $entry->save();

            $actorUserId = Auth::id();
            $shopOwnerId = Auth::user()?->shop_owner_id ?? Auth::guard('shop_owner')->id() ?? 1;
            AuditLog::create([
                'shop_owner_id' => $shopOwnerId,
                'actor_user_id' => $actorUserId,
                'action' => 'reverse_journal',
                'target_type' => 'journal_entry',
                'target_id' => $entry->id,
                'metadata' => ['reversal_id' => $rev->id, 'reason' => $data['reason']]
            ]);

            DB::commit();
            return response()->json(['reversal' => $rev->load('lines')]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to reverse', 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $entry = JournalEntry::findOrFail($id);
        if ($entry->status !== 'draft') return response()->json(['error' => 'Only drafts can be deleted'], 422);
        $entry->delete();
        $actorUserId = Auth::id();
        $shopOwnerId = Auth::user()?->shop_owner_id ?? Auth::guard('shop_owner')->id() ?? 1;
        AuditLog::create([
            'shop_owner_id' => $shopOwnerId,
            'actor_user_id' => $actorUserId,
            'action' => 'delete_journal',
            'target_type' => 'journal_entry',
            'target_id' => $id,
            'metadata' => null
        ]);
        return response()->json(['deleted' => true]);
    }
}
