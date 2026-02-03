<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        then: function () {
            Route::middleware('web')
                ->group(base_path('routes/finance-api.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);
        $middleware->api([
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            \Illuminate\Http\Middleware\HandleCors::class
        ]);
        // Exclude payment endpoint from Sanctum middleware
        $middleware->validateCsrfTokens(except: [
            'api/create-payment-link',
            'api/staff/*',
        ]);
        $middleware->alias([
            'super_admin.auth' => \App\Http\Middleware\SuperAdminAuth::class,
            'super_admin.role' => \App\Http\Middleware\CheckSuperAdminRole::class,
            'shop.isolation' => \App\Http\Middleware\ShopIsolationMiddleware::class,
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'gate.erp.access' => \App\Http\Middleware\GateErpAccess::class,
            'manager.staff' => \App\Http\Middleware\CheckManagerStaffAccess::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
