<?php

namespace App\Services\Checkins;

use App\Models\DailyLog;
use App\Models\Recommendation;
use App\Models\User;
use App\Services\Ai\OpenAiClientService;
use Carbon\Carbon;
use Throwable;

class DailyCheckinService
{
    public function __construct(private readonly OpenAiClientService $openAiClient)
    {
    }

    public function createDailyLog(array $payload): DailyLog
    {
        return DailyLog::query()->create([
            'user_id' => $payload['user_id'],
            'sleep_hours' => $payload['sleep_hours'],
            'stress_level' => $payload['stress_level'],
            'soreness' => $payload['soreness'],
        ]);
    }

    public function buildMockResponse(DailyLog $dailyLog, ?string $planned = null): array
    {
        $plannedWorkout = $planned ?? 'Moderate full-body strength session';

        return [
            'readiness_score' => $this->calculateReadinessScore($dailyLog),
            'message' => 'You are in a good spot to train today. Keep your effort controlled and focus on consistency.',
            'planned' => $plannedWorkout,
            'adjusted' => 'Slightly reduced volume with extra mobility work',
            'workout_json' => [
                'title' => 'Smart Training Session',
                'summary' => 'Prioritize quality reps and controlled tempo.',
                'exercises' => [
                    ['name' => 'Goblet Squat', 'sets' => 3, 'reps' => '10'],
                    ['name' => 'Push-Up', 'sets' => 3, 'reps' => '8-12'],
                    ['name' => 'Band Row', 'sets' => 3, 'reps' => '12'],
                ],
            ],
            'nutrition_tip' => 'Add a balanced post-workout meal with protein and complex carbs.',
            'daily_log_id' => $dailyLog->id,
        ];
    }

    public function generateRecommendationUsingAiOrFallback(DailyLog $dailyLog, User $user): array
    {
        $planned = $this->getPlannedWorkoutForToday($user);

        try {
            $aiPayload = $this->generateRecommendationUsingAi($dailyLog, $user, $planned);

            return $this->normalizeRecommendationPayload($aiPayload, $dailyLog, $planned);
        } catch (Throwable) {
            return $this->buildMockResponse($dailyLog, $planned);
        }
    }

    public function saveRecommendation(DailyLog $dailyLog, array $payload): Recommendation
    {
        $workoutJson = is_array($payload['workout_json'] ?? null) ? $payload['workout_json'] : [];
        $workoutJson['message'] = $payload['message'] ?? ($workoutJson['message'] ?? null);

        return Recommendation::query()->updateOrCreate(
            ['daily_log_id' => $dailyLog->id],
            [
                'user_id' => $dailyLog->user_id,
                'readiness_score' => max(0, min(100, (int) ($payload['readiness_score'] ?? 0))),
                'planned' => (string) ($payload['planned'] ?? 'Recovery-oriented session'),
                'adjusted' => (string) ($payload['adjusted'] ?? 'Lower intensity with mobility emphasis'),
                'workout_json' => $workoutJson,
                'nutrition_tip' => (string) ($payload['nutrition_tip'] ?? 'Stay hydrated and keep balanced meals.'),
            ],
        );
    }

    public function toCheckinResult(?Recommendation $recommendation): ?array
    {
        if (!$recommendation) {
            return null;
        }

        return [
            'readiness_score' => $recommendation->readiness_score,
            'message' => $recommendation->workout_json['message'] ?? $this->buildReadinessMessage($recommendation->readiness_score),
            'workout_json' => $recommendation->workout_json,
        ];
    }

    public function toDashboardRecommendation(?Recommendation $recommendation): ?array
    {
        if (!$recommendation) {
            return null;
        }

        return [
            'readinessScore' => $recommendation->readiness_score,
            'planned' => $recommendation->planned,
            'adjusted' => $recommendation->adjusted,
            'workoutJson' => $recommendation->workout_json,
            'nutritionTip' => $recommendation->nutrition_tip,
            'message' => $recommendation->workout_json['message'] ?? $this->buildReadinessMessage($recommendation->readiness_score),
        ];
    }

    public function toDailyCheckInValues(?DailyLog $dailyLog): ?array
    {
        if (!$dailyLog) {
            return null;
        }

        return [
            'sleepHours' => (float) $dailyLog->sleep_hours,
            'stressLevel' => (int) $dailyLog->stress_level,
            'soreness' => (int) $dailyLog->soreness,
        ];
    }

    private function generateRecommendationUsingAi(DailyLog $dailyLog, User $user, string $plannedWorkout): array
    {
        $systemPrompt = <<<PROMPT
You are an empathetic sports recovery and workout adaptation assistant.
Return only valid JSON and use this exact shape:
{
  "readiness_score": 0,
  "message": "...",
  "planned": "...",
  "adjusted": "...",
  "workout_json": {
    "title": "...",
    "summary": "...",
    "exercises": [
      {"name": "...", "sets": 3, "reps": "8-10"}
    ]
  },
  "nutrition_tip": "..."
}
Rules:
- readiness_score must be integer from 0 to 100.
- Keep message short and empathetic.
- Provide 3 to 5 exercises.
PROMPT;

        $userPrompt = sprintf(
            'User goal: %s. Planned workout today: %s. Check-in: sleep_hours=%.1f, stress_level=%d, soreness=%d. Adapt safely.',
            $user->goal ?? 'maintain',
            $plannedWorkout,
            (float) $dailyLog->sleep_hours,
            (int) $dailyLog->stress_level,
            (int) $dailyLog->soreness,
        );

        return $this->openAiClient->chatJson($systemPrompt, $userPrompt);
    }

    private function normalizeRecommendationPayload(array $payload, DailyLog $dailyLog, string $plannedWorkout): array
    {
        $fallback = $this->buildMockResponse($dailyLog, $plannedWorkout);

        $readiness = (int) ($payload['readiness_score'] ?? $fallback['readiness_score']);
        $workout = is_array($payload['workout_json'] ?? null) ? $payload['workout_json'] : $fallback['workout_json'];
        $message = trim((string) ($payload['message'] ?? ''));

        if ($message === '') {
            $message = $fallback['message'];
        }

        return [
            'readiness_score' => max(0, min(100, $readiness)),
            'message' => $message,
            'planned' => (string) ($payload['planned'] ?? $plannedWorkout),
            'adjusted' => (string) ($payload['adjusted'] ?? $fallback['adjusted']),
            'workout_json' => $workout,
            'nutrition_tip' => (string) ($payload['nutrition_tip'] ?? $fallback['nutrition_tip']),
            'daily_log_id' => $dailyLog->id,
        ];
    }

    private function calculateReadinessScore(DailyLog $dailyLog): int
    {
        $sleep = (float) $dailyLog->sleep_hours;
        $soreness = (int) $dailyLog->soreness;
        $stress = (int) $dailyLog->stress_level;

        $sleepScore = $sleep >= 7 && $sleep <= 9 ? 100 : ($sleep < 7 ? ($sleep / 7) * 100 : 80);
        $sorenessScore = 100 - ($soreness * 10);
        $stressScore = 100 - ($stress * 10);

        return (int) round(max(0, min(100, ($sleepScore * 0.4) + ($sorenessScore * 0.3) + ($stressScore * 0.3))));
    }

    private function getPlannedWorkoutForToday(User $user): string
    {
        $weeklyPlan = $user->weeklyPlan?->plan_json;

        if (!is_array($weeklyPlan)) {
            return 'Moderate full-body strength session';
        }

        $dayName = Carbon::now()->englishDayOfWeek;
        $days = $weeklyPlan['days'] ?? [];

        if (!is_array($days)) {
            return 'Moderate full-body strength session';
        }

        foreach ($days as $day) {
            if (!is_array($day)) {
                continue;
            }

            if (($day['day'] ?? null) === $dayName && is_string($day['focus'] ?? null)) {
                return $day['focus'];
            }
        }

        return 'Moderate full-body strength session';
    }

    private function buildReadinessMessage(int $score): string
    {
        if ($score >= 80) {
            return 'High readiness today. Push quality work and keep your recovery basics strong.';
        }

        if ($score >= 50) {
            return 'Moderate readiness. Train with control and avoid unnecessary fatigue.';
        }

        return 'Low readiness today. Prioritize recovery and reduce training intensity.';
    }
}
