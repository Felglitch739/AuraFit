<?php

namespace App\Services\Nutrition;

use App\Models\DailyLog;
use App\Models\NutritionPlan;
use App\Models\Recommendation;
use App\Models\User;
use App\Services\Ai\OpenAiClientService;
use App\Services\Ai\UserProfilePromptBuilder;
use RuntimeException;

class NutritionPlanService
{
    public function __construct(
        private readonly OpenAiClientService $openAiClient,
        private readonly UserProfilePromptBuilder $profilePromptBuilder,
        private readonly \App\Services\Ai\PromptTemplateService $promptTemplateService,
    ) {
    }

    public function generateUsingAiOrFallback(User $user, ?DailyLog $dailyLog = null, ?Recommendation $recommendation = null): array
    {
        $goal = $this->resolveGoal($user);

        $payload = $this->generateUsingAi($user, $dailyLog, $recommendation, $goal);

        return $this->normalize($payload, $user, $dailyLog, $recommendation, $goal);
    }

    public function saveForUser(User $user, array $payload, ?DailyLog $dailyLog = null, ?Recommendation $recommendation = null): NutritionPlan
    {
        return NutritionPlan::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'daily_log_id' => $dailyLog?->id,
                'recommendation_id' => $recommendation?->id,
                'nutrition_json' => $payload,
            ],
        );
    }

    public function getForUser(User $user): ?NutritionPlan
    {
        return $user->nutritionPlan()->first();
    }

    public function toViewModel(?NutritionPlan $nutritionPlan): ?array
    {
        return $nutritionPlan?->nutrition_json;
    }

    public function regenerateCurrentDay(User $user, DailyLog $dailyLog, Recommendation $recommendation, string $dayName): NutritionPlan
    {
        $existingPlan = $this->getForUser($user);

        if (!$existingPlan || !is_array($existingPlan->nutrition_json)) {
            throw new RuntimeException('Nutrition plan must exist before regenerating a single day.');
        }

        $generatedPayload = $this->generateUsingAiOrFallback($user, $dailyLog, $recommendation);
        $existingPayload = $existingPlan->nutrition_json;

        $existingDays = $existingPayload['days'] ?? null;
        $generatedDays = $generatedPayload['days'] ?? null;

        if (!is_array($existingDays) || !is_array($generatedDays)) {
            throw new RuntimeException('Nutrition days are invalid for day regeneration.');
        }

        $generatedDay = null;
        foreach ($generatedDays as $candidateDay) {
            if (is_array($candidateDay) && ($candidateDay['day'] ?? null) === $dayName) {
                $generatedDay = $candidateDay;
                break;
            }
        }

        if (!is_array($generatedDay)) {
            throw new RuntimeException('Could not find regenerated nutrition for today.');
        }

        $replaced = false;
        foreach ($existingDays as $index => $existingDay) {
            if (is_array($existingDay) && ($existingDay['day'] ?? null) === $dayName) {
                $existingDays[$index] = $generatedDay;
                $replaced = true;
                break;
            }
        }

        if (!$replaced) {
            throw new RuntimeException('Current day was not found in existing nutrition plan.');
        }

        $mergedPayload = [
            ...$existingPayload,
            'days' => array_values($existingDays),
            'nutritionTip' => (string) ($generatedPayload['nutritionTip'] ?? ($existingPayload['nutritionTip'] ?? '')),
            'daily_log_id' => $dailyLog->id,
            'recommendation_id' => $recommendation->id,
        ];

        return $this->saveForUser($user, $mergedPayload, $dailyLog, $recommendation);
    }

    private function generateUsingAi(User $user, ?DailyLog $dailyLog, ?Recommendation $recommendation, string $goal): array
    {
        $systemPrompt = $this->promptTemplateService->load('ai/nutrition.system.txt');

        $userPrompt = $this->promptTemplateService->render('ai/nutrition.user.txt', [
            'profile_context' => $this->profilePromptBuilder->build($user),
            'goal' => $goal,
            'sleep_hours' => $dailyLog ? number_format((float) $dailyLog->sleep_hours, 1, '.', '') : 'n/a',
            'stress_level' => $dailyLog ? (string) (int) $dailyLog->stress_level : 'n/a',
            'soreness' => $dailyLog ? (string) (int) $dailyLog->soreness : 'n/a',
            'readiness_line' => $recommendation
                ? 'Latest workout recommendation readiness score: ' . (int) $recommendation->readiness_score . '.'
                : 'No recommendation has been generated yet.',
        ]);

        return $this->openAiClient->chatJson($systemPrompt, $userPrompt);
    }

    private function normalize(array $payload, User $user, ?DailyLog $dailyLog, ?Recommendation $recommendation, string $goal): array
    {
        $days = $payload['days'] ?? [];

        if (!is_array($days)) {
            throw new RuntimeException('Nutrition response is missing days.');
        }

        $normalizedDays = [];

        foreach ($days as $day) {
            if (!is_array($day) || !is_string($day['day'] ?? null) || !is_string($day['focus'] ?? null)) {
                throw new RuntimeException('Nutrition day entry is invalid.');
            }

            $meals = [];
            foreach (($day['meals'] ?? []) as $meal) {
                if (!is_array($meal) || !is_string($meal['name'] ?? null) || trim($meal['name']) === '') {
                    throw new RuntimeException('Nutrition meal entry is invalid.');
                }

                $examples = [];
                foreach (($meal['examples'] ?? []) as $example) {
                    if (is_string($example) && trim($example) !== '') {
                        $examples[] = $example;
                    }
                }

                if (count($examples) < 2) {
                    throw new RuntimeException('Nutrition meal examples must contain at least 2 items.');
                }

                $meals[] = [
                    'time' => is_string($meal['time'] ?? null) ? $meal['time'] : 'Meal',
                    'name' => $meal['name'],
                    'description' => is_string($meal['description'] ?? null) ? $meal['description'] : '',
                    'calories' => isset($meal['calories']) ? (int) $meal['calories'] : 0,
                    'examples' => array_slice($examples, 0, 3),
                ];
            }

            $normalizedDays[] = [
                'day' => $day['day'],
                'focus' => $day['focus'],
                'meals' => $meals,
                'notes' => $this->normalizeNotes($day['notes'] ?? []),
            ];
        }

        if (count($normalizedDays) !== 7) {
            throw new RuntimeException('Nutrition response must contain exactly 7 days.');
        }

        if (!isset($payload['macroTargets']) || !is_array($payload['macroTargets'])) {
            throw new RuntimeException('Nutrition macro targets are invalid.');
        }

        $macroTargets = $payload['macroTargets'];

        if (!isset($payload['goal'], $payload['title'], $payload['summary'], $payload['targetCalories'], $payload['hydrationLiters'], $payload['notes'], $payload['nutritionTip'])) {
            throw new RuntimeException('Nutrition response is missing required fields.');
        }

        if (!is_array($payload['notes']) || count($payload['notes']) < 3) {
            throw new RuntimeException('Nutrition notes must contain at least 3 items.');
        }

        $cleanNotes = [];
        foreach ($payload['notes'] as $note) {
            if (!is_string($note) || trim($note) === '') {
                continue;
            }

            $cleanNotes[] = $note;
        }

        if (count($cleanNotes) < 3) {
            throw new RuntimeException('Nutrition notes must contain at least 3 strings.');
        }

        return [
            'goal' => in_array(($payload['goal'] ?? ''), ['bulk', 'cut', 'maintain'], true)
                ? $payload['goal']
                : $goal,
            'title' => (string) $payload['title'],
            'summary' => (string) $payload['summary'],
            'targetCalories' => (int) $payload['targetCalories'],
            'macroTargets' => [
                'proteinGrams' => (int) ($macroTargets['proteinGrams'] ?? 0),
                'carbsGrams' => (int) ($macroTargets['carbsGrams'] ?? 0),
                'fatGrams' => (int) ($macroTargets['fatGrams'] ?? 0),
            ],
            'hydrationLiters' => (float) $payload['hydrationLiters'],
            'days' => $normalizedDays,
            'notes' => array_values(array_slice($cleanNotes, 0, 3)),
            'nutritionTip' => (string) $payload['nutritionTip'],
            'daily_log_id' => $dailyLog?->id,
            'recommendation_id' => $recommendation?->id,
        ];
    }

    private function resolveGoal(User $user): string
    {
        $goal = $user->goal;

        if (is_string($goal) && in_array($goal, ['bulk', 'cut', 'maintain'], true)) {
            return $goal;
        }

        return match ($user->fitness_goal) {
            'strength' => 'bulk',
            'definition' => 'cut',
            'recomposition', 'maintenance' => 'maintain',
            default => 'maintain',
        };
    }

    private function resolveCalories(string $goal, ?DailyLog $dailyLog, User $user): int
    {
        $weight = is_numeric($user->weight_kg) ? (float) $user->weight_kg : 75.0;
        $activityFactor = match ($user->activity_level) {
            'sedentary' => 28,
            'light' => 31,
            'moderate' => 34,
            'advanced' => 38,
            default => 32,
        };

        $base = (int) round($weight * $activityFactor);

        if ($goal === 'bulk') {
            $base += 250;
        } elseif ($goal === 'cut') {
            $base -= 300;
        }

        if ($dailyLog) {
            if ((int) $dailyLog->stress_level >= 7 || (int) $dailyLog->soreness >= 7) {
                $base -= 100;
            }

            if ((float) $dailyLog->sleep_hours >= 8) {
                $base += 50;
            }
        }

        return max(1400, $base);
    }

    private function resolveMacronutrients(string $goal, int $calorieTarget): array
    {
        return match ($goal) {
            'bulk' => [
                'proteinGrams' => (int) round($calorieTarget * 0.28 / 4),
                'carbsGrams' => (int) round($calorieTarget * 0.42 / 4),
                'fatGrams' => (int) round($calorieTarget * 0.30 / 9),
            ],
            'cut' => [
                'proteinGrams' => (int) round($calorieTarget * 0.34 / 4),
                'carbsGrams' => (int) round($calorieTarget * 0.34 / 4),
                'fatGrams' => (int) round($calorieTarget * 0.32 / 9),
            ],
            default => [
                'proteinGrams' => (int) round($calorieTarget * 0.30 / 4),
                'carbsGrams' => (int) round($calorieTarget * 0.38 / 4),
                'fatGrams' => (int) round($calorieTarget * 0.32 / 9),
            ],
        };
    }

    private function normalizeNotes(mixed $notes): array
    {
        if (!is_array($notes) || $notes === []) {
            throw new RuntimeException('Nutrition notes are missing.');
        }

        $clean = [];

        foreach ($notes as $note) {
            if (!is_string($note) || trim($note) === '') {
                continue;
            }

            $clean[] = $note;
        }

        if ($clean === []) {
            throw new RuntimeException('Nutrition notes are invalid.');
        }

        return array_slice($clean, 0, 3);
    }
}
