<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Finance\JournalEntry;
use App\Models\Finance\JournalLine;

class RecurringTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_owner_id',
        'name',
        'description',
        'frequency',
        'day_of_month',
        'month',
        'start_date',
        'end_date',
        'is_active',
        'total_debit',
        'total_credit',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
        'total_debit' => 'decimal:2',
        'total_credit' => 'decimal:2',
    ];

    /**
     * Get the shop owner that owns this recurring transaction.
     */
    public function shopOwner(): BelongsTo
    {
        return $this->belongsTo(ShopOwner::class);
    }

    /**
     * Get the line items for this recurring transaction.
     */
    public function lines(): HasMany
    {
        return $this->hasMany(RecurringTransactionLine::class);
    }

    /**
     * Get the execution history for this recurring transaction.
     */
    public function executions(): HasMany
    {
        return $this->hasMany(RecurringTransactionExecution::class);
    }

    /**
     * Get the next execution date.
     */
    public function getNextExecutionDate()
    {
        $lastExecution = $this->executions()
            ->where('status', 'executed')
            ->latest('execution_date')
            ->first();

        $from = $lastExecution ? $lastExecution->execution_date : $this->start_date;

        return match ($this->frequency) {
            'daily' => $from->addDay(),
            'weekly' => $from->addWeek(),
            'monthly' => $from->addMonth(),
            'quarterly' => $from->addMonths(3),
            'annually' => $from->addYear(),
            default => $from->addMonth(),
        };
    }

    /**
     * Check if this recurring transaction is due for execution.
     */
    public function isDue(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->end_date && now()->isAfter($this->end_date)) {
            return false;
        }

        $nextExecution = $this->getNextExecutionDate();
        return now()->isAfter($nextExecution);
    }

    /**
     * Execute this recurring transaction (creates journal entry).
     */
    public function execute(string $executedBy = 'System'): ?FinanceJournalEntry
    {
        if (!$this->isDue()) {
            return null;
        }

        try {
            // Create journal entry
            $entry = FinanceJournalEntry::create([
                'shop_owner_id' => $this->shop_owner_id,
                'date' => now(),
                'description' => $this->name,
                'reference' => 'AUTO-' . uniqid(),
                'status' => 'posted',
                'posted_by' => $executedBy,
            ]);

            // Create journal lines
            foreach ($this->lines as $line) {
                FinanceJournalLine::create([
                    'finance_journal_entry_id' => $entry->id,
                    'chart_of_account_id' => $line->chart_of_account_id,
                    'debit' => $line->debit,
                    'credit' => $line->credit,
                    'description' => $line->description ?? $this->name,
                ]);
            }

            // Create execution record
            RecurringTransactionExecution::create([
                'recurring_transaction_id' => $this->id,
                'finance_journal_entry_id' => $entry->id,
                'execution_date' => now()->toDateString(),
                'status' => 'executed',
                'executed_by' => $executedBy,
            ]);

            return $entry;
        } catch (\Exception $e) {
            RecurringTransactionExecution::create([
                'recurring_transaction_id' => $this->id,
                'execution_date' => now()->toDateString(),
                'status' => 'failed',
                'notes' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
