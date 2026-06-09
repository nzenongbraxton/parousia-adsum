<?php

declare(strict_types=1);

namespace App\Actions;

use App\DTOs\WebhookPayloadData;
use App\Jobs\ProcessStaffAttendance;
use Illuminate\Support\Facades\Log;

final readonly class ProcessWebhookPayloadAction
{
    /**
     * Execute the action to process the webhook payload.
     */
    public function execute(WebhookPayloadData $data): void
    {
        Log::info('--- ATTEMPTING DISPATCH ---');
        ProcessStaffAttendance::dispatch(
            $data->platform,
            $data->platformId,
            $data->latitude,
            $data->longitude,
            $data->kioskToken,
            $data->metadata
        );
        Log::info('--- DISPATCH SUCCESSFUL ---');
    }
}
