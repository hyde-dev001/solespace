<?php

namespace App\Http\Controllers\UserSide;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageController extends Controller
{
    /**
     * Display the landing page.
     */
    public function index(): Response
    {
        return Inertia::render('UserSide/LandingPage');
    }

    /**
     * Display the products page.
     */
    public function products(): Response
    {
        return Inertia::render('UserSide/Products');
    }

    /**
     * Display the repair services page.
     */
    public function repair(): Response
    {
        return Inertia::render('UserSide/Repair');
    }

    /**
     * Display the services page.
     */
    public function services(): Response
    {
        return Inertia::render('UserSide/Services');
    }

    /**
     * Display the contact page.
     */
    public function contact(): Response
    {
        return Inertia::render('UserSide/Contact');
    }

    /**
     * Display the register page.
     */
    public function register(): Response
    {
        return Inertia::render('UserSide/Register');
    }

    /**
     * Display the login page.
     */
    public function login(): Response
    {
        return Inertia::render('UserSide/Login');
    }

    /**
     * Display the shop owner registration page.
     */
    public function shopOwnerRegister(): Response
    {
        return Inertia::render('UserSide/ShopOwnerRegistration');
    }
}
