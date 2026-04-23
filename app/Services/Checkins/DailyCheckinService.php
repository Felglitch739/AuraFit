<?php

namespace App\Services\Checkins;

use App\Models\DailyLog;
use App\Models\Recommendation;
use App\Models\User;
use App\Services\Ai\OpenAiClientService;
use App\Services\Ai\UserProfilePromptBuilder;
use Carbon\Carbon;
use RuntimeException;

class DailyCheckinService
{
    public function __construct(
        private readonly OpenAiClientService $openAiClient,
        private readonly UserProfilePromptBuilder $profilePromptBuilder,
        private readonly \App\Services\Ai\PromptTemplateService $promptTemplateService,
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

    public function generateRecommendationUsingAi(DailyLog $dailyLog, User $user, string $trainingLoadMode = 'normal'): array
    {
        $planned = $this->getPlannedWorkoutForToday($user);

        $aiPayload = $this->generateRecommendationUsingAiPayload($dailyLog, $user, $planned, $trainingLoadMode);


        return $this->normalizeRecommendationPayload($aiPayload, $dailyLog, $planned, $trainingLoadMode);
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
            'nutrition_tip' => $recommendation->nutrition_tip,
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

    private function generateRecommendationUsingAiPayload(DailyLog $dailyLog, User $user, string $plannedWorkout, string $trainingLoadMode): array
    {
        $systemPrompt = $this->promptTemplateService->load('ai/checkin.system.txt');

        $userPrompt = $this->promptTemplateService->render('ai/checkin.user.txt', [
            'profile_context' => $this->profilePromptBuilder->build($user),
            'sleep_hours' => number_format((float) $dailyLog->sleep_hours, 1, '.', ''),
            'stress_level' => (string) (int) $dailyLog->stress_level,
            'soreness' => (string) (int) $dailyLog->soreness,
            'planned_workout' => $plannedWorkout,
            'training_load_mode' => $trainingLoadMode,
        ]);

        return $this->openAiClient->chatJson($systemPrompt, $userPrompt, $user->id);
    }

    private function normalizeRecommendationPayload(array $payload, DailyLog $dailyLog, string $plannedWorkout, string $trainingLoadMode): array
    {
        if (!isset($payload['readiness_score'], $payload['message'], $payload['planned'], $payload['adjusted'], $payload['workout_json'], $payload['nutrition_tip'])) {
            throw new RuntimeException('Recommendation response is missing required fields.');
        }

        $readiness = (int) $payload['readiness_score'];
        $workout = is_array($payload['workout_json']) ? $payload['workout_json'] : null;

        if (!$workout) {
            throw new RuntimeException('Recommendation workout JSON is invalid.');
        }

        $message = trim((string) ($payload['message'] ?? ''));

        if ($message === '') {
            throw new RuntimeException('Recommendation message is empty.');
        }

        if ($trainingLoadMode === 'reduced' && !str_contains(strtolower($message), 'not at 100%')) {
            $message = 'You are not at 100% today, so the session has been reduced to protect recovery while keeping momentum.';
        }

        return [
            'readiness_score' => max(0, min(100, $readiness)),
            'message' => $message,
            'planned' => (string) $payload['planned'],
            'adjusted' => (string) $payload['adjusted'],
            'workout_json' => [
                'title' => is_string($workout['title'] ?? null) && trim($workout['title']) !== ''
                    ? $workout['title']
                    : throw new RuntimeException('Recommendation workout title is invalid.'),
                'summary' => is_string($workout['summary'] ?? null) && trim($workout['summary']) !== ''
                    ? $workout['summary']
                    : throw new RuntimeException('Recommendation workout summary is invalid.'),
                'exercises' => $this->normalizeFocusBlocks($workout['exercises'] ?? null),
            ],
            'nutrition_tip' => (string) $payload['nutrition_tip'],
            'daily_log_id' => $dailyLog->id,
        ];
    }

    private function normalizeFocusBlocks(mixed $exercises): array
    {
        if (!is_array($exercises) || $exercises === []) {
            throw new RuntimeException('Recommendation exercises are missing.');
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
                throw new RuntimeException('Recommendation exercise entry is invalid.');
            }

            $normalized[] = [
                'name' => $exercise['name'],
                'sets' => isset($exercise['sets']) ? (int) $exercise['sets'] : 3,
                'reps' => is_string($exercise['reps'] ?? null) ? $exercise['reps'] : '8-12',
                'rest' => is_string($exercise['rest'] ?? null) ? $exercise['rest'] : '60s',
                'notes' => is_string($exercise['notes'] ?? null) ? $exercise['notes'] : '',
            ];
        }

        if ($normalized === []) {
            throw new RuntimeException('Recommendation exercises are invalid.');
        }

        return array_slice($normalized, 0, 5);
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
