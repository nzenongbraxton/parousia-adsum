<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->string('platform')->nullable();
            $table->string('platform_id')->nullable();

            $table->index(['platform', 'platform_id']);
            $table->index('company_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['platform', 'platform_id']);
            $table->dropIndex(['company_id']);
            $table->dropForeign(['company_id']);
            $table->dropColumn(['company_id', 'platform', 'platform_id']);
        });
    }
};
