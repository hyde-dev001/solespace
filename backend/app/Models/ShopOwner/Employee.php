<?php

namespace App\Models\ShopOwner;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\ShopOwner as ShopOwnerModel;

class Employee extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'shop_owner_id',
        'name',
        'email',
        'password',
        'role_id',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the shop owner that owns the employee.
     */
    public function shopOwner()
    {
        return $this->belongsTo(ShopOwnerModel::class, 'shop_owner_id');
    }

    /**
     * Get the role of the employee.
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Check if employee is active.
     */
    public function isActive()
    {
        return $this->status === 'active';
    }

    /**
     * Activate employee.
     */
    public function activate()
    {
        $this->status = 'active';
        $this->save();
    }

    /**
     * Deactivate employee.
     */
    public function deactivate()
    {
        $this->status = 'inactive';
        $this->save();
    }
}
