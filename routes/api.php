<?php

declare(strict_types=1);

use App\Http\Controllers\WebhookController;
use App\Http\Middleware\VerifyWebhookSignature;
use Illuminate\Support\Facades\Route;

Route::middleware([VerifyWebhookSignature::class])
    ->post('/webhooks/{platform}', [WebhookController::class, 'handleBotPayload'])
    ->whereIn('platform', ['telegram', 'whatsapp', 'sms', 'qr_kiosk'])
    ->name('webhooks.bot');
