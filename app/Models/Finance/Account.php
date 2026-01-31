<?php

namespace App\Models\Finance;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Account extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'finance_accounts';

    protected $fillable = [
        'code', 'name', 'type', 'parent_id', 'normal_balance', 'group', 'balance', 'active', 'shop_id', 'shop_owner_id', 'meta'
    ];

    protected $casts = [
        'meta' => 'array',
        'active' => 'boolean',
        'balance' => 'decimal:2',
    ];

    public function parent()
    {
        return $this->belongsTo(Account::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Account::class, 'parent_id');
    }

    public function journalLines()
    {
        return $this->hasMany(\App\Models\Finance\JournalLine::class, 'account_id');
    }
}
