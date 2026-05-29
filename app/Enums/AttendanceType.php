<?php

declare(strict_types=1);

namespace App\Enums;

enum AttendanceType: string
{
    case Telegram = 'telegram';
    case Whatsapp = 'whatsapp';
    case Sms = 'sms';
    case QrKiosk = 'qr_kiosk';
}
