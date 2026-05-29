<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AttendanceStatus;
use App\Enums\AttendanceType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class AttendanceLog extends Model
{
    /** @use HasFactory<\Database\Factories\AttendanceLogFactory> */
    use HasFactory;

    protected $fillable = [
        'company_id',
        'user_id',
        'type',
        'status',
        'gps_lat',
        'gps_lon',
        'metadata',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => AttendanceType::class,
            'status' => AttendanceStatus::class,
            'gps_lat' => 'float',
            'gps_lon' => 'float',
            'metadata' => 'array',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
