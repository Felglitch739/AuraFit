<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DailyLogController;
use App\Http\Controllers\WeeklyPlanController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('nutrition', [DashboardController::class, 'nutrition'])->name('nutrition');

    Route::resource('check-in', DailyLogController::class)
        ->only(['index', 'store']);

    Route::resource('weekly-plans', WeeklyPlanController::class)
        ->only(['index', 'store', 'show']);
});

require __DIR__ . '/settings.php';
