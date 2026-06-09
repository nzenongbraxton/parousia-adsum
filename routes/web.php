<?php

// use App\Http\Controllers\ProfileController;
// use Illuminate\Foundation\Application;
use App\Models\Company;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// 1. The Kiosk Route (Root)
// Find your existing route for the Kiosk/Index page and update it:
Route::get('/', function () {
    // For now, grab the Test Clinic we seeded earlier
    $company = Company::first();

    return Inertia::render('ParousiaAdsum/Index', [
        'companyId' => $company->id
    ]);
});

// Admin Routes Grouped by Prefix
Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {

    // 2. Admin Root (/admin)
    Route::get('/', function () {
        return Inertia::render('ParousiaAdsum/Admin/Index');
    })->name('index');

    // 3. Admin Staff (/admin/staff)
    Route::get('/staff', function () {
        return Inertia::render('ParousiaAdsum/Admin/Staff');
    })->name('staff');

    // 4. Admin Geofence (/admin/geofence)
    Route::get('/geofence', function () {
        return Inertia::render('ParousiaAdsum/Admin/Geofence');
    })->name('geofence');
});

// 5. Dashboard Redirect (Breeze compatibility)
Route::get('/dashboard', function () {
    return redirect()->route('admin.index');
})->middleware(['auth', 'verified'])->name('dashboard');

// 6. User Profile Routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [App\Http\Controllers\ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
