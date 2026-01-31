<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Finance\Invoice;
use App\Models\Finance\InvoiceItem;
use App\Models\Finance\Account;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InvoiceController extends Controller
{
    /**
     * List invoices with filtering
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::guard('user')->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
            
            $shopOwnerId = $user->role === 'shop_owner' ? $user->id : $user->shop_owner_id;
            
            if (!$shopOwnerId) {
                return response()->json(['error' => 'No shop association found'], 403);
            }
            
            $q = Invoice::where('shop_id', $shopOwnerId);

            if ($request->filled('status')) {
                $q->where('status', $request->status);
            }

        if ($request->filled('search')) {
            $search = $request->search;
            $q->where(function ($w) use ($search) {
                $w->where('reference', 'like', "%$search%")
                    ->orWhere('customer_name', 'like', "%$search%")
                    ->orWhere('customer_email', 'like', "%$search%");
            });
        }

        if ($request->filled('date_from')) {
            $q->where('date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $q->where('date', '<=', $request->date_to);
        }

        $invoices = $q->with('items')
            ->orderBy('date', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($invoices);
        } catch (\Exception $e) {
            Log::error('Error fetching invoices: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load invoices', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get single invoice with items
     */
    public function show($id)
    {
        $user = Auth::guard('user')->user();
        $shopOwnerId = $user->role === 'shop_owner' ? $user->id : $user->shop_owner_id;
        
        $invoice = Invoice::where('shop_id', $shopOwnerId)
            ->with('items', 'journalEntry.lines')
            ->findOrFail($id);
        return response()->json($invoice);
    }

    /**
     * Create new invoice (draft)
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'reference' => 'required|string|unique:finance_invoices,reference',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'nullable|email',
            'date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'nullable|numeric|min:0|max:100',
            'items.*.account_id' => 'required|integer|exists:finance_accounts,id',
        ]);

        try {
            $user = Auth::guard('user')->user();
            $shopOwnerId = $user->role === 'shop_owner' ? $user->id : $user->shop_owner_id;
            
            if (!$shopOwnerId) {
                return response()->json(['error' => 'No shop association found'], 403);
            }
            
            DB::beginTransaction();

            // Calculate totals
            $total = 0;
            $taxAmount = 0;

            foreach ($data['items'] as $item) {
                $itemAmount = $item['quantity'] * $item['unit_price'];
                $itemTax = $itemAmount * ($item['tax_rate'] ?? 0) / 100;
                $total += $itemAmount + $itemTax;
                $taxAmount += $itemTax;
            }

            // Create invoice
            $invoice = Invoice::create([
                'reference' => $data['reference'],
                'customer_name' => $data['customer_name'],
                'customer_email' => $data['customer_email'] ?? null,
                'date' => $data['date'],
                'due_date' => $data['due_date'] ?? null,
                'total' => $total,
                'tax_amount' => $taxAmount,
                'status' => 'draft',
                'notes' => $data['notes'] ?? null,
                'shop_id' => $shopOwnerId,
                'meta' => [
                    'created_by' => $user->id,
                ],
            ]);

            // Create line items
            foreach ($data['items'] as $item) {
                $itemAmount = $item['quantity'] * $item['unit_price'];
                $itemTax = $itemAmount * ($item['tax_rate'] ?? 0) / 100;

                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'tax_rate' => $item['tax_rate'] ?? 0,
                    'amount' => $itemAmount + $itemTax,
                    'account_id' => $item['account_id'],
                ]);
            }

            // Audit log
            $actorUserId = Auth::guard('user')->id() ?? Auth::id();
            $shopOwnerId = Auth::user()?->shop_owner_id ?? 1;
            AuditLog::create([
                'shop_owner_id' => $shopOwnerId,
                'actor_user_id' => $actorUserId,
                'action' => 'create_invoice',
                'target_type' => 'invoice',
                'target_id' => $invoice->id,
                'metadata' => $invoice->toArray(),
            ]);

            DB::commit();

            return response()->json($invoice->load('items'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Invoice creation failed: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Failed to create invoice', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update invoice (draft only)
     */
    public function update(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);

        if ($invoice->status !== 'draft') {
            return response()->json(['message' => 'Only draft invoices can be edited'], 422);
        }

        $data = $request->validate([
            'customer_name' => 'sometimes|string|max:255',
            'customer_email' => 'sometimes|nullable|email',
            'due_date' => 'sometimes|nullable|date',
            'notes' => 'sometimes|nullable|string',
            'items' => 'sometimes|array|min:1',
            'items.*.description' => 'required_with:items|string',
            'items.*.quantity' => 'required_with:items|numeric|min:0.01',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
            'items.*.tax_rate' => 'nullable|numeric|min:0|max:100',
            'items.*.account_id' => 'required_with:items|integer|exists:finance_accounts,id',
        ]);

        try {
            DB::beginTransaction();

            // Update header
            $invoice->update(array_filter($data, fn($k) => !in_array($k, ['items']), ARRAY_FILTER_USE_KEY));

            // Update items if provided
            if (!empty($data['items'])) {
                $invoice->items()->delete();

                $total = 0;
                $taxAmount = 0;

                foreach ($data['items'] as $item) {
                    $itemAmount = $item['quantity'] * $item['unit_price'];
                    $itemTax = $itemAmount * ($item['tax_rate'] ?? 0) / 100;
                    $total += $itemAmount + $itemTax;
                    $taxAmount += $itemTax;

                    InvoiceItem::create([
                        'invoice_id' => $invoice->id,
                        'description' => $item['description'],
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'tax_rate' => $item['tax_rate'] ?? 0,
                        'amount' => $itemAmount + $itemTax,
                        'account_id' => $item['account_id'],
                    ]);
                }

                $invoice->update(['total' => $total, 'tax_amount' => $taxAmount]);
            }

            // Audit log
            $actorUserId = Auth::guard('user')->id() ?? Auth::id();
            $shopOwnerId = Auth::user()?->shop_owner_id ?? 1;
            AuditLog::create([
                'shop_owner_id' => $shopOwnerId,
                'actor_user_id' => $actorUserId,
                'action' => 'update_invoice',
                'target_type' => 'invoice',
                'target_id' => $invoice->id,
                'metadata' => $data,
            ]);

            DB::commit();

            return response()->json($invoice->load('items'));
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Invoice update failed: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Failed to update invoice', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Post invoice to ledger (creates journal entry and transitions status)
     */
    public function post(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);

        if ($invoice->status === 'posted') {
            return response()->json(['message' => 'Invoice already posted'], 422);
        }

        try {
            DB::beginTransaction();

            // Create journal entry if not exists
            if (!$invoice->journal_entry_id) {
                $invoice->createJournalEntry();
            }

            // Post the journal entry
            $invoice->postToLedger();

            // Audit log
            $actorUserId = Auth::guard('user')->id() ?? Auth::id();
            $shopOwnerId = Auth::user()?->shop_owner_id ?? 1;
            AuditLog::create([
                'shop_owner_id' => $shopOwnerId,
                'actor_user_id' => $actorUserId,
                'action' => 'post_invoice',
                'target_type' => 'invoice',
                'target_id' => $invoice->id,
                'metadata' => ['status' => 'posted'],
            ]);

            DB::commit();

            return response()->json($invoice->load('items', 'journalEntry.lines'));
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Invoice posting failed: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Failed to post invoice', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete invoice (draft only)
     */
    public function destroy($id)
    {
        $invoice = Invoice::findOrFail($id);

        if ($invoice->status !== 'draft') {
            return response()->json(['message' => 'Only draft invoices can be deleted'], 422);
        }

        // Audit log
        $actorUserId = Auth::guard('user')->id() ?? Auth::id();
        $shopOwnerId = Auth::user()?->shop_owner_id ?? 1;
        AuditLog::create([
            'shop_owner_id' => $shopOwnerId,
            'actor_user_id' => $actorUserId,
            'action' => 'delete_invoice',
            'target_type' => 'invoice',
            'target_id' => $invoice->id,
        ]);

        $invoice->delete();

        return response()->json(['message' => 'Invoice deleted']);
    }
}
