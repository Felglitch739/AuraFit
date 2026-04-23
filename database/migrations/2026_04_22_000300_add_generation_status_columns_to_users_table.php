<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->enum('generation_status', ['idle', 'queued', 'processing', 'failed'])
                ->default('idle')
                ->after('onboarding_completed_at');
            $table->string('generation_kind')->nullable()->after('generation_status');
            $table->string('generation_message')->nullable()->after('generation_kind');
            $table->timestamp('generation_started_at')->nullable()->after('generation_message');
            $table->timestamp('generation_failed_at')->nullable()->after('generation_started_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn([
                'generation_status',
                'generation_kind',
                'generation_message',
                'generation_started_at',
                'generation_failed_at',
            ]);
        });
    }
};
