<?php

namespace App\Http\Controllers\ShopOwner;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class UserAccessControlController extends Controller
{
    /**
     * Display the user access control page.
     */
    public function index(): Response
    {
        return Inertia::render('ShopOwner/UserAccessControl');
    }
}
