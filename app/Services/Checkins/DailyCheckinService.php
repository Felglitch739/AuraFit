<?php

namespace App\Services\Checkins;

use App\Models\DailyLog;
use App\Models\Recommendation;
use App\Models\User;
use App\Services\Ai\OpenAiClientService;
use App\Services\Ai\UserProfilePromptBuilder;
use Carbon\Carbon;
use Throwable;

class DailyCheckinService
{
    public function __construct(
        private readonly OpenAiClientService $openAiClient,
        private readonly UserProfilePromptBuilder $profilePromptBuilder,
    ) {
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
            'adjusted' => 'Slightly reduced load with controlled intensity and mobility work',
            'workout_json' => [
                'title' => 'Smart Muscle Focus',
                'summary' => 'Focus on muscle groups and keep effort controlled.',
                'exercises' => [
                    ['name' => 'Push day (chest, shoulders, triceps) with light to moderate load'],
                    ['name' => 'Scapular and upper-back activation (back, rear delts)'],
                    ['name' => 'Core stability and breathing reset'],
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
- Keep message short, empathetic, and actionable.
- planned must reflect the intended session from the user's weekly plan or custom routine.
- adjusted must explain the adaptation in one clear line.
- workout_json.exercises must contain 3 to 5 focus blocks centered on muscle groups or movement patterns, not a random exercise list.
- nutrition_tip must be specific and practical, using food or hydration advice that fits the day's training load.
- Adapt the recommendation to the user profile, current readiness drivers, and the planned workout.
- Respect workout_mode: if custom, keep the user's training identity intact while adjusting intensity.
- Use sports background and custom routine clues to make the output feel personal.
- Use a lower readiness score when sleep is short, stress is high, or soreness is high; reward good recovery when all three are favorable.
PROMPT;

        $userPrompt = implode("\n", [
            $this->profilePromptBuilder->build($user),
            sprintf(
                'Current check-in: sleep_hours=%.1f, stress_level=%d, soreness=%d.',
                (float) $dailyLog->sleep_hours,
                (int) $dailyLog->stress_level,
                (int) $dailyLog->soreness,
            ),
            'Planned workout today: ' . $plannedWorkout,
            'Return a concise recommendation tailored to the user profile, with planned vs adjusted text, structured focus blocks, and a nutrition tip that feels realistic for the current state.',
        ]);

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
            'workout_json' => [
                'title' => is_string($workout['title'] ?? null) && trim($workout['title']) !== ''
                    ? $workout['title']
                    : 'Adaptive training focus',
                'summary' => is_string($workout['summary'] ?? null) && trim($workout['summary']) !== ''
                    ? $workout['summary']
                    : 'Training adjusted to your current recovery state.',
                'exercises' => $this->normalizeFocusBlocks($workout['exercises'] ?? $fallback['workout_json']['exercises']),
            ],
            'nutrition_tip' => (string) ($payload['nutrition_tip'] ?? $fallback['nutrition_tip']),
            'daily_log_id' => $dailyLog->id,
        ];
    }

    private function normalizeFocusBlocks(mixed $exercises): array
    {
        if (!is_array($exercises) || $exercises === []) {
            return [
                ['name' => 'Upper-body push emphasis', 'sets' => 3, 'reps' => '8-10', 'rest' => '60s', 'notes' => 'Controlled tempo'],
                ['name' => 'Upper-back and scapular stability', 'sets' => 3, 'reps' => '10-12', 'rest' => '45s', 'notes' => 'Focus on posture'],
                ['name' => 'Core and mobility reset', 'sets' => 2, 'reps' => '30-45s', 'rest' => '30s', 'notes' => 'Stay smooth'],
            ];
        }

        $normalized = [];

        foreach ($exercises as $exercise) {
            if (is_string($exercise)) {
                $normalized[] = [
                    'name' => $exercise,
                    'sets' => 3,
                    'reps' => '8-12',
                    'rest' => '60s',
                    'notes' => '',
                ];

                continue;
            }

            if (!is_array($exercise) || !is_string($exercise['name'] ?? null) || trim($exercise['name']) === '') {
                continue;
            }

            $normalized[] = [
                'name' => $exercise['name'],
                'sets' => isset($exercise['sets']) ? (int) $exercise['sets'] : 3,
                'reps' => is_string($exercise['reps'] ?? null) ? $exercise['reps'] : '8-12',
                'rest' => is_string($exercise['rest'] ?? null) ? $exercise['rest'] : '60s',
                'notes' => is_string($exercise['notes'] ?? null) ? $exercise['notes'] : '',
            ];
        }

        return array_slice($normalized !== [] ? $normalized : $this->normalizeFocusBlocks([]), 0, 5);
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
        $customRoutine = $user->onboarding_custom_routine;
        $dayName = Carbon::now()->englishDayOfWeek;

        if (is_array($customRoutine) && isset($customRoutine[$dayName]) && is_string($customRoutine[$dayName])) {
            $focus = trim($customRoutine[$dayName]);

            if ($focus !== '') {
                return $focus;
            }
        }

        $weeklyPlan = $user->weeklyPlan?->plan_json;

        if (!is_array($weeklyPlan)) {
            return 'Moderate full-body strength session';
        }

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
