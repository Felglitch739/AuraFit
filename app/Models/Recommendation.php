<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'daily_log_id', 'readiness_score', 'planned', 'adjusted', 'workout_json', 'nutrition_tip'])]
class Recommendation extends Model
{
    protected function casts(): array
    {
        return [
            'workout_json' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function dailyLog(): BelongsTo
    {
        return $this->belongsTo(DailyLog::class);
    }
}
