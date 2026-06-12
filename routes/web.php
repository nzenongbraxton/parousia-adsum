<?php

// use App\Http\Controllers\ProfileController;
// use Illuminate\Foundation\Application;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProfileController;
use App\Models\Company;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// 1. The Kiosk Route (Root)
// Find your existing route for the Kiosk/Index page and update it:
Route::get('/', function () {
    // For now, grab the Test Clinic we seeded earlier
    $company = Company::firstOrFail();

    return Inertia::render('ParousiaAdsum/Index', [
        'companyId' => $company->id,
    ]);
});

// Admin Routes Grouped by Prefix
Route::middleware(['auth', 'verified'])
    ->prefix('admin')
    ->name('admin.')
    ->controller(AdminController::class)
    ->group(function () {
        Route::get('/', 'dashboard')->name('index');
        Route::get('/staff', 'staff')->name('staff');
        Route::post('/staff', 'storeStaff')->name('staff.store');
        Route::get('/geofence', 'geofence')->name('geofence');
        Route::put('/geofence', 'updateGeofence')->name('geofence.update');
    });

// 5. Dashboard Redirect (Breeze compatibility)
Route::get('/dashboard', function () {
    return redirect()->route('admin.index');
})->middleware(['auth', 'verified'])->name('dashboard');

// 6. User Profile Routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
