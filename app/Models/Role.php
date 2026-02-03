<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Role Model
 * 
 * Represents employee roles within a shop owner's business.
 * Each role is tied to a specific shop and can have specific permissions
 * for ERP modules like HR, FINANCE, etc.
 * 
 * Database table: roles
 */
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
        'description',
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
     * Available ERP module roles
     */
    const ROLE_HR = 'HR';
    const ROLE_FINANCE = 'FINANCE';
    const ROLE_MANAGER = 'MANAGER';
    const ROLE_STAFF = 'STAFF';

    /**
     * Available permissions for each role
     */
    public static function getDefaultPermissions($roleName): array
    {
        $permissions = [
            self::ROLE_HR => [
                'view_hr_dashboard',
                'manage_employees',
                'view_employees',
                'manage_payroll',
                'view_payroll',
                'manage_attendance',
                'view_attendance',
                'manage_leave_requests',
            ],
            self::ROLE_FINANCE => [
                'view_finance_dashboard',
                'manage_invoices',
                'view_invoices',
                'manage_expenses',
                'view_expenses',
                'manage_accounts',
                'view_accounts',
                'generate_financial_reports',
            ],
            self::ROLE_MANAGER => [
                'view_dashboard',
                'view_employees',
                'view_payroll',
                'view_expenses',
                'view_orders',
                'manage_orders',
            ],
            self::ROLE_STAFF => [
                'view_dashboard',
                'view_profile',
                'view_attendance',
            ],
        ];

        return $permissions[$roleName] ?? [];
    }

    /**
     * Get the shop owner this role belongs to
     */
    public function shopOwner(): BelongsTo
    {
        return $this->belongsTo(ShopOwner::class);
    }

    /**
     * Get employees with this role
     */
    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    /**
     * Check if role has a specific permission
     */
    public function hasPermission($permission): bool
    {
        if (!$this->permissions) {
            return false;
        }
        return in_array($permission, $this->permissions);
    }

    /**
     * Get all available modules for this role
     */
    public function getModules(): array
    {
        $modules = [];
        
        if (str_contains($this->name, 'HR')) {
            $modules[] = 'HR';
        }
        if (str_contains($this->name, 'FINANCE')) {
            $modules[] = 'FINANCE';
        }
        if (str_contains($this->name, 'MANAGER')) {
            $modules[] = 'DASHBOARD';
        }
        
        return $modules;
    }

    /**
     * Verify this role belongs to a specific shop
     */
    public function belongsToShop($shopOwnerId): bool
    {
        return $this->shop_owner_id === $shopOwnerId;
    }
}
