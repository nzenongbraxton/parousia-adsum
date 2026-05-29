<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\ProcessWebhookPayloadAction;
use App\DTOs\WebhookPayloadData;
use App\Http\Requests\WebhookPayloadRequest;
use Illuminate\Http\JsonResponse;

final class WebhookController extends Controller
{
    /**
     * Single entry-point for all bot & kiosk webhook payloads.
     *
     * Immediately dispatches the heavy lifting to a queue worker and
     * returns HTTP 200 to avoid platform-level timeouts.
     */
    public function handleBotPayload(
        WebhookPayloadRequest $request,
        string $platform,
        ProcessWebhookPayloadAction $action,
    ): JsonResponse {
        $action->execute(
            WebhookPayloadData::fromRequest($request, $platform)
        );

        return response()->json(['status' => 'accepted']);
    }
}
