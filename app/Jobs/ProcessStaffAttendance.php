<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\AttendanceStatus;
use App\Enums\AttendanceType;
use App\Models\AttendanceLog;
use App\Models\User;
use App\Services\AttendanceValidator;
use App\Services\StaffIdentityService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
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
        public readonly ?float $lat,
        public readonly ?float $lon,
        public readonly ?string $kioskToken,
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

        if ($this->kioskToken !== null) {
            $this->handleKioskScan($user, $validator, $this->kioskToken);
        } else {
            $this->handleGpsScan($user, $validator);
        }
    }

    private function handleKioskScan(
        User $user,
        AttendanceValidator $validator,
        string $kioskToken,
    ): void {
        $isValid = $validator->verifyKioskToken($user, $kioskToken);

        AttendanceLog::create([
            'company_id' => $user->company_id,
            'user_id' => $user->id,
            'type' => AttendanceType::QrKiosk,
            'status' => $isValid ? AttendanceStatus::Verified : AttendanceStatus::Rejected,
            'gps_lat' => null,
            'gps_lon' => null,
            'metadata' => $this->metadata,
        ]);

        $message = $isValid
            ? '✅ Kiosk Scan Successful!'
            : '❌ Invalid or Expired QR Code.';

        $this->sendTelegramReply($message);
    }

    private function handleGpsScan(
        User $user,
        AttendanceValidator $validator,
    ): void {
        $isValidLocation = $validator->verifyGeofence($user, (float) $this->lat, (float) $this->lon);

        AttendanceLog::create([
            'company_id' => $user->company_id,
            'user_id' => $user->id,
            'type' => AttendanceType::from($this->platform),
            'status' => $isValidLocation ? AttendanceStatus::Verified : AttendanceStatus::Rejected,
            'gps_lat' => $this->lat,
            'gps_lon' => $this->lon,
            'metadata' => $this->metadata,
        ]);

        $message = $isValidLocation
            ? '✅ Check-in successful! Your attendance has been logged.'
            : '❌ Geofence Failed. You are not within the clinic boundaries. Please connect to the Wi-Fi or move closer.';

        $this->sendTelegramReply($message);
    }

    private function sendTelegramReply(string $message): void
    {
        try {
            Http::post('https://api.telegram.org/bot'.env('TELEGRAM_BOT_TOKEN').'/sendMessage', [
                'chat_id' => $this->platformId,
                'text' => $message,
            ]);
        } catch (Throwable) {
            // Fire-and-forget — do not fail the job if Telegram is unreachable.
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(Throwable $exception): void
    {
        Log::error('ProcessStaffAttendance failed: '.$exception->getMessage(), [
            'platform' => $this->platform,
            'platform_id' => $this->platformId,
        ]);
    }
}
