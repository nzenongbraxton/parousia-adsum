<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['telegram', 'whatsapp', 'sms', 'qr_kiosk']);
            $table->enum('status', ['verified', 'pending', 'rejected'])->default('pending');
            $table->decimal('gps_lat', 10, 8)->nullable();
            $table->decimal('gps_lon', 11, 8)->nullable();
            $table->json('metadata');

            // MySQL 8 virtual generated columns for indexing JSON hardware / IP data
            $table->string('meta_ip_address', 45)->nullable()->virtualAs("JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.ip_address'))");
            $table->string('meta_device_fingerprint', 255)->nullable()->virtualAs("JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.device_fingerprint'))");

            $table->timestamps();

            $table->index(['company_id', 'status']);
            $table->index('created_at');
            $table->index('meta_ip_address');
            $table->index('meta_device_fingerprint');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_logs');
    }
};
