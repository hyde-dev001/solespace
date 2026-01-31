<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Finance\JournalLine;

class ExpenseAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_owner_id',
        'cost_center_id',
        'finance_journal_line_id',
        'amount',
        'percentage',
        'notes',
        'allocation_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'percentage' => 'decimal:2',
        'allocation_date' => 'date',
    ];

    /**
     * Get the shop owner that owns this allocation.
     */
    public function shopOwner(): BelongsTo
    {
        return $this->belongsTo(ShopOwner::class);
    }

    /**
     * Get the cost center this allocation belongs to.
     */
    public function costCenter(): BelongsTo
    {
        return $this->belongsTo(CostCenter::class);
    }

    /**
     * Get the journal line this allocation is for.
     */
    public function journalLine(): BelongsTo
    {
        return $this->belongsTo(JournalLine::class, 'finance_journal_line_id');
    }
}
