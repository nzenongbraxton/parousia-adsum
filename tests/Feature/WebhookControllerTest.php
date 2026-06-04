<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\AttendanceStatus;
use App\Enums\AttendanceType;
use App\Jobs\ProcessStaffAttendance;
use App\Models\Company;
use App\Models\User;
use App\Services\AttendanceValidator;
use App\Services\StaffIdentityService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

final class WebhookControllerTest extends TestCase
{
    use RefreshDatabase;

    private string $secret = 'test_webhook_secret';

    protected function setUp(): void
    {
        parent::setUp();
        Config::set('services.webhook.secret', $this->secret);
    }

    /**
     * Helper to compute signature for test payloads.
     */
    private function getSignature(string $content): string
    {
        return hash_hmac('sha256', $content, $this->secret);
    }

    public function test_webhook_requires_signature_header(): void
    {
        $payload = [
            'platform_id' => 'tg_user_123',
            'lat' => 45.0,
            'lon' => 9.0,
        ];

        $response = $this->postJson('/api/webhooks/telegram', $payload);

        $response->assertStatus(401)
            ->assertJsonPath('message', 'Missing Telegram secret token header.');
    }

    public function test_webhook_rejects_invalid_signature(): void
    {
        $payload = [
            'platform_id' => 'tg_user_123',
            'lat' => 45.0,
            'lon' => 9.0,
        ];

        $response = $this->postJson(
            '/api/webhooks/telegram',
            $payload,
            ['X-Telegram-Bot-Api-Secret-Token' => 'invalid_secret_token']
        );

        $response->assertStatus(401)
            ->assertJsonPath('message', 'Invalid Telegram secret token.');
    }

    public function test_webhook_validates_required_parameters(): void
    {
        $payload = [
            'platform_id' => '',
            'lat' => 120.0, // Invalid latitude (between -90 and 90)
            'lon' => 200.0, // Invalid longitude (between -180 and 180)
        ];

        $response = $this->postJson(
            '/api/webhooks/telegram',
            $payload,
            ['X-Telegram-Bot-Api-Secret-Token' => $this->secret]
        );

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['platform_id', 'lat', 'lon']);
    }

    public function test_webhook_dispatches_queued_job_successfully(): void
    {
        Queue::fake();

        $payload = [
            'platform_id' => 'tg_user_123',
            'lat' => 4.8156,
            'lon' => 7.0498,
            'metadata' => ['device' => 'iPhone 15'],
        ];

        $response = $this->postJson(
            '/api/webhooks/telegram',
            $payload,
            ['X-Telegram-Bot-Api-Secret-Token' => $this->secret]
        );

        $response->assertStatus(200)
            ->assertJson(['status' => 'accepted']);

        Queue::assertPushed(ProcessStaffAttendance::class, function (ProcessStaffAttendance $job) use ($payload) {
            return $job->platform === 'telegram'
                && $job->platformId === $payload['platform_id']
                && $job->lat === $payload['lat']
                && $job->lon === $payload['lon']
                && $job->metadata === $payload['metadata'];
        });
    }

    public function test_job_successfully_processes_verified_check_in(): void
    {
        // Seed Company: Centered at Port Harcourt, Nigeria
        $company = Company::create([
            'name' => 'ACME HQ',
            'latitude' => 4.815620,
            'longitude' => 7.049830,
            'allowed_radius' => 100.0, // 100 meters
        ]);

        // Seed User mapped to company and Telegram platform
        $user = User::create([
            'name' => 'Braxton',
            'email' => 'braxton@example.com',
            'password' => bcrypt('password'),
            'company_id' => $company->id,
            'platform' => 'telegram',
            'platform_id' => 'tg_user_123',
        ]);

        // Payload is extremely close (under 5 meters) to company HQ
        $job = new ProcessStaffAttendance(
            platform: 'telegram',
            platformId: 'tg_user_123',
            lat: 4.815630,
            lon: 7.049840,
            metadata: ['ip_address' => '192.168.1.50', 'device_fingerprint' => 'df_98a7c6']
        );

        $job->handle(
            $this->app->make(StaffIdentityService::class),
            $this->app->make(AttendanceValidator::class)
        );

        $this->assertDatabaseHas('attendance_logs', [
            'company_id' => $company->id,
            'user_id' => $user->id,
            'type' => AttendanceType::Telegram->value,
            'status' => AttendanceStatus::Verified->value,
            'gps_lat' => 4.815630,
            'gps_lon' => 7.049840,
            'meta_ip_address' => '192.168.1.50',
            'meta_device_fingerprint' => 'df_98a7c6',
        ]);
    }

    public function test_job_rejects_check_in_outside_geofence(): void
    {
        // Seed Company
        $company = Company::create([
            'name' => 'ACME HQ',
            'latitude' => 4.815620,
            'longitude' => 7.049830,
            'allowed_radius' => 100.0, // 100 meters
        ]);

        // Seed User
        $user = User::create([
            'name' => 'Braxton',
            'email' => 'braxton@example.com',
            'password' => bcrypt('password'),
            'company_id' => $company->id,
            'platform' => 'telegram',
            'platform_id' => 'tg_user_123',
        ]);

        // Payload coordinate is far away (in another city)
        $job = new ProcessStaffAttendance(
            platform: 'telegram',
            platformId: 'tg_user_123',
            lat: 6.5244, // Lagos
            lon: 3.3792,
            metadata: ['ip_address' => '192.168.1.50', 'device_fingerprint' => 'df_98a7c6']
        );

        $job->handle(
            $this->app->make(StaffIdentityService::class),
            $this->app->make(AttendanceValidator::class)
        );

        $this->assertDatabaseHas('attendance_logs', [
            'company_id' => $company->id,
            'user_id' => $user->id,
            'type' => AttendanceType::Telegram->value,
            'status' => AttendanceStatus::Rejected->value,
            'gps_lat' => 6.5244,
            'gps_lon' => 3.3792,
            'meta_ip_address' => '192.168.1.50',
            'meta_device_fingerprint' => 'df_98a7c6',
        ]);
    }
}
