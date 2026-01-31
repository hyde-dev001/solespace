<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Finance\Account;
use App\Models\Finance\JournalLine;

class Reconciliation extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'journal_entry_line_id',
        'bank_transaction_reference',
        'statement_date',
        'opening_balance',
        'closing_balance',
        'reconciled_by',
        'reconciled_at',
        'status',
        'shop_owner_id',
        'notes'
    ];

    protected $casts = [
        'statement_date' => 'date',
        'opening_balance' => 'decimal:2',
        'closing_balance' => 'decimal:2',
        'reconciled_at' => 'datetime'
    ];

    /**
     * Get the account associated with the reconciliation
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Get the journal entry line associated with the reconciliation
     */
    public function journalEntryLine(): BelongsTo
    {
        return $this->belongsTo(JournalLine::class, 'journal_entry_line_id');
    }

    /**
     * Get the user who reconciled the transaction
     */
    public function reconciledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reconciled_by');
    }

    /**
     * Get the shop owner
     */
    public function shopOwner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'shop_owner_id');
    }
}
