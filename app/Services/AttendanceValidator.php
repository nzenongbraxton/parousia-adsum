<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\KioskToken;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final readonly class AttendanceValidator
{
    /**
     * Verify whether the supplied GPS coordinates fall within the company's
     * allowed geofence radius using MySQL 8's native ST_Distance_Sphere.
     */
    public function verifyGeofence(User $user, float $lat, float $lon): bool
    {
        $result = DB::selectOne(
            'SELECT ST_Distance_Sphere(
                POINT(companies.longitude, companies.latitude),
                POINT(?, ?)
            ) <= companies.allowed_radius AS within_range
            FROM companies
            INNER JOIN users ON users.company_id = companies.id
            WHERE users.id = ?
            LIMIT 1',
            [$lon, $lat, $user->id]
        );

        return (bool) ($result->within_range ?? false);
    }

    /**
     * Consume a one-time kiosk token, preventing replay attacks.
     * Returns true when the token is found, unexpired, and not yet used.
     */
    public function verifyKioskToken(User $user, string $tokenString): bool
    {
        $record = KioskToken::query()
            ->where('token', $tokenString)
            ->where('expires_at', '>', now())
            ->whereNull('used_at')
            ->first();

        if ($record === null) {
            return false;
        }

        $record->delete();

        return true;
    }
}
