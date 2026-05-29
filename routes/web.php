<?php

// use App\Http\Controllers\ProfileController;
// use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// 1. The Kiosk Route (Root)
Route::get('/', function () {
    return Inertia::render('ParousiaAdsum/Index');
})->name('kiosk.index');

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

require __DIR__.'/auth.php';
