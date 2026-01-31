<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Finance\Account;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\Api\Finance\StoreAccountRequest;

class AccountController extends Controller
{
    public function index(Request $request)
    {
        $q = Account::query();
        if ($request->filled('type')) $q->where('type', $request->type);
        if ($request->filled('active')) $q->where('active', filter_var($request->active, FILTER_VALIDATE_BOOLEAN));
        if ($request->filled('search')) {
            $s = $request->search;
            $q->where(function($w) use ($s) {
                $w->where('name', 'like', "%$s%")->orWhere('code', 'like', "%$s%");
            });
        }
        $accounts = $q->orderBy('code')->get();
        return response()->json(['data' => $accounts]);
    }

    public function show($id)
    {
        $acc = Account::findOrFail($id);
        return response()->json($acc);
    }

    public function store(StoreAccountRequest $request)
    {
        $data = $request->validated();

        // Automatically set shop_owner_id from authenticated user
        $data['shop_owner_id'] = Auth::user()?->shop_owner_id ?? Auth::user()?->id ?? 1;

        try {
            $acc = Account::create($data);
            $actorUserId = Auth::guard('user')->id() ?? Auth::id();
            $shopOwnerId = Auth::user()?->shop_owner_id ?? Auth::guard('shop_owner')->id() ?? 1;
            AuditLog::create([
                'shop_owner_id' => $shopOwnerId,
                'actor_user_id' => $actorUserId,
                'action' => 'create_account',
                'target_type' => 'account',
                'target_id' => $acc->id,
                'metadata' => $acc->toArray()
            ]);
            return response()->json($acc, 201);
        } catch (\Exception $e) {
            Log::error('Account creation failed: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Server error while creating account'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $acc = Account::findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|string|max:191',
            'active' => 'sometimes|boolean',
            'group' => 'nullable|string|max:100',
            'parent_id' => 'nullable|integer|exists:finance_accounts,id',
        ]);
        $acc->update($data);
        $actorUserId = Auth::guard('user')->id() ?? Auth::id();
        $shopOwnerId = Auth::user()?->shop_owner_id ?? Auth::guard('shop_owner')->id() ?? 1;
        AuditLog::create([
            'shop_owner_id' => $shopOwnerId,
            'actor_user_id' => $actorUserId,
            'action' => 'update_account',
            'target_type' => 'account',
            'target_id' => $acc->id,
            'metadata' => $data
        ]);
        return response()->json($acc);
    }

    public function ledger(Request $request, $id)
    {
        $start = $request->query('start');
        $end = $request->query('end');

        $query = \App\Models\Finance\JournalLine::where('account_id', $id)
            ->join('finance_journal_entries as je', 'finance_journal_lines.journal_entry_id', '=', 'je.id')
            ->where('je.status', 'posted')
            ->select('finance_journal_lines.*', 'je.reference', 'je.date as entry_date')
            ->orderBy('je.date', 'asc');

        if ($start) $query->where('je.date', '>=', $start);
        if ($end) $query->where('je.date', '<=', $end);

        $lines = $query->get();

        // compute running balance
        $balance = 0;
        $ledger = [];
        foreach ($lines as $line) {
            $balance += ($line->debit - $line->credit);
            $ledger[] = [
                'id' => $line->id,
                'date' => $line->entry_date,
                'description' => $line->memo,
                'debit' => (float)$line->debit,
                'credit' => (float)$line->credit,
                'balance' => (float)$balance,
                'reference' => $line->reference,
            ];
        }

        return response()->json(['ledger' => $ledger]);
    }
}
