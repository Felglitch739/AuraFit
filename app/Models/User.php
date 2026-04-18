<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable([
    'name',
    'email',
    'goal',
    'activity_level',
    'fitness_goal',
    'workout_mode',
    'age',
    'weight_kg',
    'height_cm',
    'sports_practiced',
    'sports_schedule',
    'sports_intensity',
    'sports_other',
    'onboarding_custom_routine',
    'onboarding_completed_at',
    'password',
])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'age' => 'integer',
            'weight_kg' => 'float',
            'height_cm' => 'float',
            'sports_practiced' => 'array',
            'sports_schedule' => 'array',
            'sports_intensity' => 'array',
            'onboarding_custom_routine' => 'array',
            'onboarding_completed_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function weeklyPlan(): HasOne
    {
        return $this->hasOne(WeeklyPlan::class);
    }

    public function dailyLogs(): HasMany
    {
        return $this->hasMany(DailyLog::class);
    }

    public function nutritionPlan(): HasOne
    {
        return $this->hasOne(NutritionPlan::class);
    }

    public function foodEntries(): HasMany
    {
        return $this->hasMany(FoodEntry::class);
    }
}
