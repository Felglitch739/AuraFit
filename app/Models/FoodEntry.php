<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'logged_on',
    'meal_name',
    'meal_label',
    'summary',
    'calories',
    'protein_grams',
    'carbs_grams',
    'fat_grams',
    'fiber_grams',
    'sugar_grams',
    'sodium_mg',
    'nutrition_json',
    'image_path',
])]
class FoodEntry extends Model
{
    protected function casts(): array
    {
        return [
            'logged_on' => 'date',
            'nutrition_json' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
