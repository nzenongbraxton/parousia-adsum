<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class KioskToken extends Model
{
    /** @use HasFactory<\Database\Factories\KioskTokenFactory> */
    use HasFactory;

    protected $fillable = [
        'company_id',
        'token',
        'expires_at',
        'used_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'used_at' => 'datetime',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isBefore(now());
    }

    public function isValid(): bool
    {
        return $this->used_at === null && ! $this->isExpired();
    }

    public function markAsUsed(): void
    {
        $this->update(['used_at' => now()]);
    }
}
