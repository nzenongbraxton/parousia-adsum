<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;

final readonly class StaffIdentityService
{
    /**
     * Resolve an internal staff member from an external bot/platform identity.
     *
     * @throws ModelNotFoundException
     */
    public function resolvePlatformUser(string $platform, string $platformId): User
    {
        $user = User::query()
            ->when(
                $platform === 'telegram',
                fn ($query) => $query->where(fn ($q) => $q->where('telegram_id', $platformId)
                    ->orWhere(fn ($sub) => $sub->where('platform', $platform)->where('platform_id', $platformId))),
                fn ($query) => $query->where('platform', $platform)->where('platform_id', $platformId)
            )
            ->first();

        if (! $user instanceof User) {
            throw new ModelNotFoundException(
                "No staff member found for platform [{$platform}] with ID [{$platformId}]."
            );
        }

        return $user;
    }
}
