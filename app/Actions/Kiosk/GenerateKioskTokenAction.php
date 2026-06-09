<?php

declare(strict_types=1);

namespace App\Actions\Kiosk;

use App\Models\KioskToken;
use Illuminate\Support\Str;

final readonly class GenerateKioskTokenAction
{
    public function execute(int $companyId): KioskToken
    {
        return KioskToken::create([
            'company_id' => $companyId,
            'token' => Str::random(64),
            'expires_at' => now()->addSeconds(30),
        ]);
    }
}
