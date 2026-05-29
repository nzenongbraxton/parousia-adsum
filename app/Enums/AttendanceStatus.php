<?php

declare(strict_types=1);

namespace App\Enums;

enum AttendanceStatus: string
{
    case Verified = 'verified';
    case Pending = 'pending';
    case Rejected = 'rejected';
}
