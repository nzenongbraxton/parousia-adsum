<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\AttendanceStatus;
use App\Enums\AttendanceType;
use App\Models\AttendanceLog;
use App\Services\AttendanceValidator;
use App\Services\StaffIdentityService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

final class ProcessStaffAttendance implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public readonly string $platform,
        public readonly string $platformId,
        public readonly float $lat,
        public readonly float $lon,
        public readonly array $metadata,
    ) {}

    /**
     * Execute the job.
     *
     * @throws Throwable
     */
    public function handle(
        StaffIdentityService $identityService,
        AttendanceValidator $validator,
    ): void {
        $user = $identityService->resolvePlatformUser(
            $this->platform,
            $this->platformId
        );

        $isValidLocation = $validator->verifyGeofence($user, $this->lat, $this->lon);

        $status = $isValidLocation
            ? AttendanceStatus::Verified
            : AttendanceStatus::Rejected;

        AttendanceLog::create([
            'company_id' => $user->company_id,
            'user_id' => $user->id,
            'type' => AttendanceType::from($this->platform),
            'status' => $status,
            'gps_lat' => $this->lat,
            'gps_lon' => $this->lon,
            'metadata' => $this->metadata,
        ]);
    }
}
