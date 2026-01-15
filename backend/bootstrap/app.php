<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // <!-- Enable CORS for frontend API requests -->
        $middleware->statefulApi();
        $middleware->trustProxies(at: '*');
        
        // <!-- Add CORS middleware for Vite dev server -->
        $middleware->append(\Illuminate\Http\Middleware\HandleCors::class);
        
        // <!-- Add Inertia middleware -->
        $middleware->web(\App\Http\Middleware\HandleInertiaRequests::class);
        
        // <!-- Register custom middleware aliases -->
        // <!-- Super Admin Authentication Middleware -->
        // <!-- Protects admin routes from unauthorized access -->
        $middleware->alias([
            'super_admin.auth' => \App\Http\Middleware\SuperAdminAuth::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
