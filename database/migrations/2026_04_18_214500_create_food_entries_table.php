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
        Schema::create('food_entries', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('logged_on');
            $table->string('meal_name');
            $table->string('meal_label')->nullable();
            $table->text('summary');
            $table->unsignedInteger('calories');
            $table->unsignedInteger('protein_grams');
            $table->unsignedInteger('carbs_grams');
            $table->unsignedInteger('fat_grams');
            $table->unsignedInteger('fiber_grams')->nullable();
            $table->unsignedInteger('sugar_grams')->nullable();
            $table->unsignedInteger('sodium_mg')->nullable();
            $table->json('nutrition_json');
            $table->string('image_path')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'logged_on']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('food_entries');
    }
};
