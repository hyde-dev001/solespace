<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Finance\Account;

class RecurringTransactionLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'recurring_transaction_id',
        'chart_of_account_id',
        'debit',
        'credit',
        'description',
        'cost_center',
        'line_number',
    ];

    protected $casts = [
        'debit' => 'decimal:2',
        'credit' => 'decimal:2',
    ];

    /**
     * Get the recurring transaction this line belongs to.
     */
    public function recurringTransaction(): BelongsTo
    {
        return $this->belongsTo(RecurringTransaction::class);
    }

    /**
     * Get the chart of account for this line.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'chart_of_account_id');
    }
}
