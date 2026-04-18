<?php

namespace App\Services\Nutrition;

use App\Models\DailyLog;
use App\Models\NutritionPlan;
use App\Models\Recommendation;
use App\Models\User;
use App\Services\Ai\OpenAiClientService;
use App\Services\Ai\UserProfilePromptBuilder;
use Carbon\Carbon;
use Throwable;

class NutritionPlanService
{
    public function __construct(
        private readonly OpenAiClientService $openAiClient,
        private readonly UserProfilePromptBuilder $profilePromptBuilder,
    ) {
    }

    public function generateMock(User $user, ?DailyLog $dailyLog = null, ?Recommendation $recommendation = null): array
    {
        $goal = $this->resolveGoal($user);
        $calorieTarget = $this->resolveCalories($goal, $dailyLog, $user);
        $macroTargets = $this->resolveMacronutrients($goal, $calorieTarget);

        return [
            'goal' => $goal,
            'title' => 'Weekly fuel plan',
            'summary' => 'A practical nutrition structure that supports training, recovery, and consistent energy.',
            'targetCalories' => $calorieTarget,
            'macroTargets' => $macroTargets,
            'hydrationLiters' => $goal === 'cut' ? 2.8 : 3.2,
            'days' => $this->buildMockDays($goal),
            'notes' => [
                'Build each meal around a clear protein source.',
                'Increase carbohydrates on harder training days.',
                'Keep hydration steady through the day, not only around workouts.',
            ],
            'nutritionTip' => $this->resolveNutritionTip($goal, $recommendation),
            'daily_log_id' => $dailyLog?->id,
            'recommendation_id' => $recommendation?->id,
        ];
    }

    public function generateUsingAiOrFallback(User $user, ?DailyLog $dailyLog = null, ?Recommendation $recommendation = null): array
    {
        $goal = $this->resolveGoal($user);

        try {
            $payload = $this->generateUsingAi($user, $dailyLog, $recommendation, $goal);

            return $this->normalize($payload, $user, $dailyLog, $recommendation, $goal);
        } catch (Throwable) {
            return $this->generateMock($user, $dailyLog, $recommendation);
        }
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

    private function generateUsingAi(User $user, ?DailyLog $dailyLog, ?Recommendation $recommendation, string $goal): array
    {
        $systemPrompt = <<<PROMPT
You are an expert sports nutrition coach.
Return only valid JSON and use this exact shape:
{
  "goal": "bulk|cut|maintain",
  "title": "...",
  "summary": "...",
  "targetCalories": 0,
  "macroTargets": {
    "proteinGrams": 0,
    "carbsGrams": 0,
    "fatGrams": 0
  },
  "hydrationLiters": 0,
  "days": [
    {
      "day": "Monday",
      "focus": "...",
      "meals": [
        {"time": "Breakfast", "name": "...", "description": "...", "calories": 0}
      ],
      "notes": ["...", "..."]
    }
  ],
  "notes": ["...", "...", "..."]
}
Rules:
- Always return exactly 7 days from Monday to Sunday.
- Keep food suggestions realistic, accessible, and sports-focused.
- Match calories and macros to the goal and activity level.
- Increase carbohydrate emphasis for heavier training or performance days.
- Keep explanations short and practical.
- If the user is in custom workout mode, keep the nutrition style consistent with their habits and sports background.
PROMPT;

        $userPrompt = implode("\n", [
            $this->profilePromptBuilder->build($user),
            'Nutrition target goal: ' . $goal,
            $dailyLog ? sprintf(
                'Latest recovery input: sleep_hours=%.1f, stress_level=%d, soreness=%d.',
                (float) $dailyLog->sleep_hours,
                (int) $dailyLog->stress_level,
                (int) $dailyLog->soreness,
            ) : 'No daily check-in is available yet.',
            $recommendation ? 'Latest workout recommendation readiness score: ' . (int) $recommendation->readiness_score : 'No recommendation has been generated yet.',
            'Build a 7-day meal plan with goal-appropriate calories, macros, hydration guidance, and meal timing.',
            'Each day should have 3 to 4 meals and one short recovery/performance note.',
        ]);

        return $this->openAiClient->chatJson($systemPrompt, $userPrompt);
    }

    private function normalize(array $payload, User $user, ?DailyLog $dailyLog, ?Recommendation $recommendation, string $goal): array
    {
        $fallback = $this->generateMock($user, $dailyLog, $recommendation);
        $days = $payload['days'] ?? [];

        if (!is_array($days)) {
            $days = [];
        }

        $normalizedDays = [];

        foreach ($days as $day) {
            if (!is_array($day) || !is_string($day['day'] ?? null) || !is_string($day['focus'] ?? null)) {
                continue;
            }

            $meals = [];
            foreach (($day['meals'] ?? []) as $meal) {
                if (!is_array($meal) || !is_string($meal['name'] ?? null) || trim($meal['name']) === '') {
                    continue;
                }

                $meals[] = [
                    'time' => is_string($meal['time'] ?? null) ? $meal['time'] : 'Meal',
                    'name' => $meal['name'],
                    'description' => is_string($meal['description'] ?? null) ? $meal['description'] : '',
                    'calories' => isset($meal['calories']) ? (int) $meal['calories'] : 0,
                ];
            }

            $normalizedDays[] = [
                'day' => $day['day'],
                'focus' => $day['focus'],
                'meals' => $meals !== [] ? $meals : ($fallback['days'][count($normalizedDays)]['meals'] ?? []),
                'notes' => $this->normalizeNotes($day['notes'] ?? []),
            ];
        }

        if (count($normalizedDays) !== 7) {
            return $fallback;
        }

        $macroTargets = is_array($payload['macroTargets'] ?? null) ? $payload['macroTargets'] : $fallback['macroTargets'];

        return [
            'goal' => in_array(($payload['goal'] ?? ''), ['bulk', 'cut', 'maintain'], true)
                ? $payload['goal']
                : $goal,
            'title' => is_string($payload['title'] ?? null) && trim($payload['title']) !== ''
                ? $payload['title']
                : $fallback['title'],
            'summary' => is_string($payload['summary'] ?? null) && trim($payload['summary']) !== ''
                ? $payload['summary']
                : $fallback['summary'],
            'targetCalories' => isset($payload['targetCalories']) ? (int) $payload['targetCalories'] : $fallback['targetCalories'],
            'macroTargets' => [
                'proteinGrams' => isset($macroTargets['proteinGrams']) ? (int) $macroTargets['proteinGrams'] : $fallback['macroTargets']['proteinGrams'],
                'carbsGrams' => isset($macroTargets['carbsGrams']) ? (int) $macroTargets['carbsGrams'] : $fallback['macroTargets']['carbsGrams'],
                'fatGrams' => isset($macroTargets['fatGrams']) ? (int) $macroTargets['fatGrams'] : $fallback['macroTargets']['fatGrams'],
            ],
            'hydrationLiters' => isset($payload['hydrationLiters']) ? (float) $payload['hydrationLiters'] : $fallback['hydrationLiters'],
            'days' => $normalizedDays,
            'notes' => $this->normalizeNotes($payload['notes'] ?? $fallback['notes']),
            'nutritionTip' => is_string($payload['nutritionTip'] ?? null) && trim($payload['nutritionTip']) !== ''
                ? $payload['nutritionTip']
                : $fallback['nutritionTip'],
            'daily_log_id' => $dailyLog?->id,
            'recommendation_id' => $recommendation?->id,
        ];
    }

    private function buildMockDays(string $goal): array
    {
        $dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        $dayTemplates = [
            'bulk' => ['Protein-dense breakfast', 'Balanced lunch', 'Recovery dinner'],
            'cut' => ['High-protein breakfast', 'Lean lunch', 'Light dinner'],
            'maintain' => ['Balanced breakfast', 'Training lunch', 'Recovery dinner'],
        ];
        $template = $dayTemplates[$goal] ?? $dayTemplates['maintain'];

        $days = [];

        foreach ($dayNames as $index => $dayName) {
            $days[] = [
                'day' => $dayName,
                'focus' => $goal === 'cut'
                    ? 'Fuel lightly and keep energy steady'
                    : ($goal === 'bulk' ? 'Support muscle gain and performance' : 'Maintain energy and recovery balance'),
                'meals' => [
                    [
                        'time' => 'Breakfast',
                        'name' => $template[0],
                        'description' => 'Protein + fiber to start the day with stable energy.',
                        'calories' => $goal === 'cut' ? 380 : 520,
                    ],
                    [
                        'time' => 'Lunch',
                        'name' => $template[1],
                        'description' => 'Main meal with enough carbs to support training.',
                        'calories' => $goal === 'cut' ? 520 : 720,
                    ],
                    [
                        'time' => 'Dinner',
                        'name' => $template[2],
                        'description' => 'Recover with protein, vegetables, and a controlled carb portion.',
                        'calories' => $goal === 'cut' ? 420 : 650,
                    ],
                ],
                'notes' => [
                    $goal === 'cut' ? 'Keep portions controlled and protein high.' : 'Stay consistent with meal timing.',
                    $goal === 'bulk' ? 'Add an extra snack on hard training days.' : 'Hydrate before and after training.',
                ],
            ];
        }

        return $days;
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

    private function resolveNutritionTip(string $goal, ?Recommendation $recommendation): string
    {
        if ($recommendation?->nutrition_tip) {
            return $recommendation->nutrition_tip;
        }

        return match ($goal) {
            'bulk' => 'Use an extra carb-based snack before or after training to support recovery.',
            'cut' => 'Prioritize lean protein and vegetables, and keep liquid calories low.',
            default => 'Keep meals balanced and hydrate consistently across the day.',
        };
    }

    private function normalizeNotes(mixed $notes): array
    {
        if (!is_array($notes) || $notes === []) {
            return [
                'Stay consistent with meal timing.',
                'Hydrate well around training.',
            ];
        }

        $clean = [];

        foreach ($notes as $note) {
            if (!is_string($note) || trim($note) === '') {
                continue;
            }

            $clean[] = $note;
        }

        return array_slice($clean !== [] ? $clean : [
            'Stay consistent with meal timing.',
            'Hydrate well around training.',
        ], 0, 3);
    }
}
