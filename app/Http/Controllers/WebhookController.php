<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Jobs\ProcessStaffAttendance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class WebhookController extends Controller
{
    /**
     * Single entry-point for all bot & kiosk webhook payloads.
     *
     * Immediately dispatches the heavy lifting to a queue worker and
     * returns HTTP 200 to avoid platform-level timeouts.
     */
    public function handleBotPayload(Request $request, string $platform): JsonResponse
    {
        $validated = $request->validate([
            'platform_id' => ['required', 'string'],
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lon' => ['required', 'numeric', 'between:-180,180'],
            'metadata' => ['sometimes', 'array'],
        ]);

        ProcessStaffAttendance::dispatch(
            $platform,
            $validated['platform_id'],
            (float) $validated['lat'],
            (float) $validated['lon'],
            $validated['metadata'] ?? [],
        );

        return response()->json(['status' => 'accepted']);
    }
}
