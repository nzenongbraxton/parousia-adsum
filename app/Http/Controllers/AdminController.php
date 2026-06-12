<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Staff\CreateStaffAction;
use App\DTOs\CreateUserDTO;
use App\Enums\AttendanceStatus;
use App\Enums\AttendanceType;
use App\Http\Requests\StoreStaffRequest;
use App\Http\Requests\UpdateGeofenceRequest;
use App\Models\AttendanceLog;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

final class AdminController extends Controller
{
    public function dashboard(Request $request): Response
    {
        /** @var User $admin */
        $admin = $request->user();
        $companyId = (int) $admin->company_id;

        $logs = AttendanceLog::with('user')
            ->where('company_id', $companyId)
            ->latest()
            ->take(50)
            ->get()
            ->map(fn (AttendanceLog $log): array => [
                'id' => $log->id,
                'user_name' => $log->user->name,
                'initials' => self::initials($log->user->name),
                'type' => $log->type->value,
                'status' => $log->status->value,
                'time' => $log->created_at->format('H:i'),
            ]);

        $today = Carbon::today();
        $todayStats = AttendanceLog::where('company_id', $companyId)
            ->whereDate('created_at', $today)
            ->get(['type', 'status']);

        $presentToday = $todayStats->where('status', AttendanceStatus::Verified)->count();
        $gpsVerified = $todayStats->where('type', AttendanceType::Telegram)->where('status', AttendanceStatus::Verified)->count();
        $qrKiosk = $todayStats->where('type', AttendanceType::QrKiosk)->where('status', AttendanceStatus::Verified)->count();
        $flagged = $todayStats->where('status', AttendanceStatus::Rejected)->count();

        return Inertia::render('ParousiaAdsum/admin/Index', [
            'logs' => $logs,
            'stats' => [
                'present_today' => $presentToday,
                'gps_verified' => $gpsVerified,
                'qr_kiosk' => $qrKiosk,
                'flagged' => $flagged,
            ],
        ]);
    }

    public function staff(Request $request): Response
    {
        /** @var User $admin */
        $admin = $request->user();

        $staff = User::where('company_id', $admin->company_id)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role'])
            ->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'initials' => self::initials($user->name),
                'email' => $user->email,
                'role' => $user->role->value ?? 'Staff',
            ]);

        return Inertia::render('ParousiaAdsum/admin/Staff', [
            'staff' => $staff,
            'currentUserRole' => $admin->role->value ?? 'Staff',
        ]);
    }

    public function storeStaff(StoreStaffRequest $request, CreateStaffAction $action): RedirectResponse
    {
        $action->execute(
            $request->user(),
            CreateUserDTO::fromRequest($request)
        );

        return redirect()->route('admin.staff')
            ->with('success', 'Staff member created successfully.');
    }

    public function geofence(Request $request): Response
    {
        /** @var User $admin */
        $admin = $request->user();
        $company = Company::findOrFail($admin->company_id);

        return Inertia::render('ParousiaAdsum/admin/Geofence', [
            'company' => [
                'name' => $company->name,
                'latitude' => $company->latitude,
                'longitude' => $company->longitude,
                'allowed_radius' => $company->allowed_radius,
            ],
        ]);
    }

    public function updateGeofence(UpdateGeofenceRequest $request): RedirectResponse
    {
        /** @var User $admin */
        $admin = $request->user();
        $company = Company::findOrFail($admin->company_id);

        $company->update([
            'latitude' => $request->validated('latitude'),
            'longitude' => $request->validated('longitude'),
            'allowed_radius' => $request->validated('radius_meters'),
        ]);

        return redirect()->route('admin.geofence')
            ->with('success', 'Geofence settings saved successfully.');
    }

    private static function initials(string $name): string
    {
        $parts = array_filter(explode(' ', trim($name)));
        $first = mb_substr((string) array_shift($parts), 0, 1);
        $last = $parts ? mb_substr((string) array_shift($parts), 0, 1) : '';

        return mb_strtoupper($first.$last);
    }
}
