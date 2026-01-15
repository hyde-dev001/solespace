<?php

namespace App\Models\ShopOwner;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ShopOwner as ShopOwnerModel;

class Role extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'shop_owner_id',
        'name',
        'permissions',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'permissions' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the shop owner that owns the role.
     */
    public function shopOwner()
    {
        return $this->belongsTo(ShopOwnerModel::class, 'shop_owner_id');
    }

    /**
     * Get the employees for the role.
     */
    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    /**
     * Check if role has a specific permission.
     */
    public function hasPermission($permission)
    {
        $permissions = $this->permissions ?? [];
        return in_array($permission, $permissions);
    }

    /**
     * Add a permission to the role.
     */
    public function addPermission($permission)
    {
        $permissions = $this->permissions ?? [];
        if (!in_array($permission, $permissions)) {
            $permissions[] = $permission;
            $this->permissions = $permissions;
            $this->save();
        }
    }

    /**
     * Remove a permission from the role.
     */
    public function removePermission($permission)
    {
        $permissions = $this->permissions ?? [];
        $permissions = array_filter($permissions, function($p) use ($permission) {
            return $p !== $permission;
        });
        $this->permissions = array_values($permissions);
        $this->save();
    }

    /**
     * Get the count of employees with this role.
     */
    public function getUserCountAttribute()
    {
        return $this->employees()->count();
    }
}
