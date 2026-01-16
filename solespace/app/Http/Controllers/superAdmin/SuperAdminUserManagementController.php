<?php

namespace App\Http\Controllers\superAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminUserManagementController extends Controller
{
    public function index(): Response
    {
        $users = User::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'firstName' => $user->first_name,
                    'lastName' => $user->last_name,
                    'name' => $user->name ?? ($user->first_name . ' ' . $user->last_name),
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'age' => $user->age,
                    'address' => $user->address,
                    'status' => $user->status,
                    'validIdPath' => $user->valid_id_path,
                    'createdAt' => $user->created_at->format('Y-m-d H:i:s'),
                    'lastLogin' => $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i:s') : null,
                ];
            })
            ->toArray();

        return Inertia::render('superAdmin/SuperAdminUserManagement', [
            'users' => $users,
        ]);
    }
}
