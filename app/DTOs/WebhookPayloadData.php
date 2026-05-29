<?php

declare(strict_types=1);

namespace App\DTOs;

use App\Http\Requests\WebhookPayloadRequest;

final readonly class WebhookPayloadData
{
    /**
     * @param  array<string, mixed>  $metadata
     */
    public function __construct(
        public string $platform,
        public string $platformId,
        public float $latitude,
        public float $longitude,
        public array $metadata,
    ) {}

    /**
     * Create a DTO from the Form Request and platform parameter.
     */
    public static function fromRequest(WebhookPayloadRequest $request, string $platform): self
    {
        return new self(
            platform: $platform,
            platformId: (string) $request->validated('platform_id'),
            latitude: (float) $request->validated('lat'),
            longitude: (float) $request->validated('lon'),
            metadata: (array) ($request->validated('metadata') ?? []),
        );
    }
}
