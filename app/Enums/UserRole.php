<?php

declare(strict_types=1);

namespace App\Enums;

enum UserRole: string
{
    case SystemAdmin = 'SystemAdmin';
    case SuperAdmin = 'SuperAdmin';
    case Admin = 'Admin';
    case Staff = 'Staff';
}
