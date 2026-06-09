<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Kiosk\GenerateKioskTokenAction;
use App\Http\Requests\GenerateKioskTokenRequest;
use Illuminate\Http\JsonResponse;

final class KioskController extends Controller
{
    public function generateToken(
        GenerateKioskTokenRequest $request,
        GenerateKioskTokenAction $action
    ): JsonResponse {
        $token = $action->execute((int) $request->validated('company_id'));

        return response()->json([
            'token' => $token->token,
            'expires_at' => $token->expires_at->toIso8601String(),
        ]);
    }
}
