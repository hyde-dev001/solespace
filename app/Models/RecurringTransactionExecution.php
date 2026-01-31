<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Finance\JournalEntry;

class RecurringTransactionExecution extends Model
{
    use HasFactory;

    protected $table = 'recurring_transaction_executions';

    protected $fillable = [
        'recurring_transaction_id',
        'finance_journal_header_id',
        'execution_date',
        'status',
        'notes',
        'executed_by',
    ];

    protected $casts = [
        'execution_date' => 'date',
    ];

    /**
     * Get the recurring transaction this execution belongs to.
     */
    public function recurringTransaction(): BelongsTo
    {
        return $this->belongsTo(RecurringTransaction::class);
    }

    /**
     * Get the journal entry if executed.
     */
    public function journalEntry(): BelongsTo
    {
        return $this->belongsTo(JournalEntry::class, 'finance_journal_entry_id');
    }
}
