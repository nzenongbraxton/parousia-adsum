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
            abort(500, 'Webhook secret is not configured.');
        }

        $signature = $request->header('X-Webhook-Signature');

        if (! is_string($signature)) {
            abort(401, 'Missing webhook signature header.');
        }

        $computed = hash_hmac('sha256', $request->getContent(), $secret);

        if (! hash_equals($computed, $signature)) {
            abort(401, 'Invalid webhook signature.');
        }

        return $next($request);
    }
}
