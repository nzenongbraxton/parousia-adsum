<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class VerifyWebhookSignature
{
    /**
     * Validate that the incoming webhook payload is signed with the
     * shared WEBHOOK_SECRET configured in the environment.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $secret = config('services.webhook.secret');

        if (! is_string($secret) || $secret === '') {
            \Illuminate\Support\Facades\Log::error('--- WEBHOOK SIGNATURE FAILED ---: Webhook secret is not configured.');
            abort(500, 'Webhook secret is not configured.');
        }

        $platform = $request->route('platform');

        if ($platform === 'telegram') {
            $token = $request->header('X-Telegram-Bot-Api-Secret-Token');

            if (! is_string($token)) {
                \Illuminate\Support\Facades\Log::warning('--- WEBHOOK SIGNATURE FAILED ---: Missing Telegram secret token header.');
                abort(401, 'Missing Telegram secret token header.');
            }

            if (! hash_equals($secret, $token)) {
                \Illuminate\Support\Facades\Log::warning('--- WEBHOOK SIGNATURE FAILED ---: Invalid Telegram secret token.');
                abort(401, 'Invalid Telegram secret token.');
            }

            return $next($request);
        }

        $signature = $request->header('X-Webhook-Signature');

        if (! is_string($signature)) {
            \Illuminate\Support\Facades\Log::warning('--- WEBHOOK SIGNATURE FAILED ---: Missing webhook signature header.');
            abort(401, 'Missing webhook signature header.');
        }

        $computed = hash_hmac('sha256', $request->getContent(), $secret);

        if (! hash_equals($computed, $signature)) {
            \Illuminate\Support\Facades\Log::warning('--- WEBHOOK SIGNATURE FAILED ---: Invalid webhook signature.');
            abort(401, 'Invalid webhook signature.');
        }

        return $next($request);
    }
}
