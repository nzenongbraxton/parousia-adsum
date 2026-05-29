<?php

declare(strict_types=1);

namespace App\Actions;

use App\DTOs\WebhookPayloadData;
use App\Jobs\ProcessStaffAttendance;

final readonly class ProcessWebhookPayloadAction
{
    /**
     * Execute the action to process the webhook payload.
     */
    public function execute(WebhookPayloadData $data): void
    {
        ProcessStaffAttendance::dispatch(
            $data->platform,
            $data->platformId,
            $data->latitude,
            $data->longitude,
            $data->metadata
        );
    }
}
