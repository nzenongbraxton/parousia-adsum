<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\ProcessWebhookPayloadAction;
use App\DTOs\WebhookPayloadData;
use App\Http\Requests\WebhookPayloadRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

final class WebhookController extends Controller
{
    /**
     * Single entry-point for all bot & kiosk webhook payloads.
     *
     * Immediately dispatches the heavy lifting to a queue worker and
     * returns HTTP 200 to avoid platform-level timeouts.
     */

    // 1. Log the exact raw payload we receive

    public function handleBotPayload(
        WebhookPayloadRequest $request,
        string $platform,
        ProcessWebhookPayloadAction $action,
    ): JsonResponse {

        // 1. Log the exact raw payload we receive
        Log::info('--- WEBHOOK HIT ---', $request->all());
        try {
            $action->execute(
                WebhookPayloadData::fromRequest($request, $platform)
            );
        } catch (\Throwable $e) {
            // 2. Log the hidden error!
            Log::error('--- WEBHOOK CRASHED ---: ' . $e->getMessage());

            return response()->json(['status' => 'error', 'message' => 'Failed to process payload'], 500);
        }

        // $action->execute(
        //     WebhookPayloadData::fromRequest($request, $platform)
        // );

        return response()->json(['status' => 'accepted']);
    }
}
