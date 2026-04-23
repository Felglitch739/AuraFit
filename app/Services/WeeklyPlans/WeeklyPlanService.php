<?php

namespace App\Services\WeeklyPlans;

use App\Models\Recommendation;
use App\Models\User;
use App\Models\WeeklyPlan;
use App\Services\Ai\OpenAiClientService;
use App\Services\Ai\UserProfilePromptBuilder;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class WeeklyPlanService
{
    public function __construct(
        private readonly OpenAiClientService $openAiClient,
        private readonly UserProfilePromptBuilder $profilePromptBuilder,
        private readonly \App\Services\Ai\PromptTemplateService $promptTemplateService,
    ) {
    }

    public function generateUsingAiOrFallback(User $user): array
    {
        $startedAt = microtime(true);
        $goal = $this->resolveGoal($user);
        $currentPlan = $this->getForUser($user)?->plan_json;
        $nutritionPlan = $user->nutritionPlan?->nutrition_json;
        $latestRecommendation = $user->dailyLogs()->latest()->first()?->recommendation;

        Log::debug('WeeklyPlanService generation started.', [
            'user_id' => $user->id,
            'goal' => $goal,
            'has_current_plan' => is_array($currentPlan),
            'has_nutrition_plan' => is_array($nutritionPlan),
            'has_latest_recommendation' => $latestRecommendation !== null,
        ]);

        try {
            $result = $this->generateUsingAi(
                $user,
                $goal,
                is_array($currentPlan) ? $currentPlan : null,
                is_array($nutritionPlan) ? $nutritionPlan : null,
                $latestRecommendation,
            );

            Log::debug('WeeklyPlanService AI payload received.', [
                'user_id' => $user->id,
                'top_level_keys' => array_keys($result),
                'days_count_raw' => is_array($result['days'] ?? null) ? count($result['days']) : null,
            ]);

            $normalized = $this->normalize(
                $result,
                $goal,
                is_array($nutritionPlan) ? $nutritionPlan : null,
            );

            Log::debug('WeeklyPlanService generation completed.', [
                'user_id' => $user->id,
                'days_count_normalized' => is_array($normalized['days'] ?? null) ? count($normalized['days']) : null,
                'duration_ms' => (int) round((microtime(true) - $startedAt) * 1000),
            ]);

            return $normalized;
        } catch (Throwable $exception) {
            Log::error('WeeklyPlanService generation failed.', [
                'user_id' => $user->id,
                'goal' => $goal,
                'has_current_plan' => is_array($currentPlan),
                'has_nutrition_plan' => is_array($nutritionPlan),
                'has_latest_recommendation' => $latestRecommendation !== null,
                'duration_ms' => (int) round((microtime(true) - $startedAt) * 1000),
                'exception_class' => get_class($exception),
                'message' => $exception->getMessage(),
            ]);

            throw $exception;
        }
    }

    public function saveForUser(User $user, array $planPayload): WeeklyPlan
    {
        return WeeklyPlan::query()->updateOrCreate(
            ['user_id' => $user->id],
            ['plan_json' => $planPayload],
        );
    }

    public function getForUser(User $user): ?WeeklyPlan
    {
        return $user->weeklyPlan()->first();
    }

    public function regenerateCurrentDayFromRecommendation(User $user, Recommendation $recommendation, string $dayName): WeeklyPlan
    {
        $weeklyPlan = $this->getForUser($user);

        if (!$weeklyPlan || !is_array($weeklyPlan->plan_json)) {
            throw new RuntimeException('Weekly plan must exist before regenerating a single day.');
        }

        $planPayload = $weeklyPlan->plan_json;
        $days = $planPayload['days'] ?? null;

        if (!is_array($days)) {
            throw new RuntimeException('Weekly plan days are invalid.');
        }

        $workoutJson = $recommendation->workout_json;
        if (!is_array($workoutJson)) {
            throw new RuntimeException('Recommendation workout JSON is invalid.');
        }

        $normalizedExercises = $this->normalizeRecommendationExercises($workoutJson['exercises'] ?? null);

        $updated = false;
        foreach ($days as $index => $day) {
            if (!is_array($day) || ($day['day'] ?? null) !== $dayName) {
                continue;
            }

            $existingNotes = is_array($day['notes'] ?? null) ? $day['notes'] : [];
            $notes = [
                'Updated after reduced-load check-in to protect recovery.',
                ...array_values(array_filter($existingNotes, fn(mixed $note): bool => is_string($note) && trim($note) !== '')),
            ];

            $days[$index] = [
                ...$day,
                'focus' => is_string($recommendation->adjusted) && trim($recommendation->adjusted) !== ''
                    ? $recommendation->adjusted
                    : (is_string($workoutJson['title'] ?? null) && trim($workoutJson['title']) !== ''
                        ? $workoutJson['title']
                        : ($day['focus'] ?? 'Recovery-focused training')),
                'intensity' => 'low',
                'durationMinutes' => min((int) ($day['durationMinutes'] ?? 45), 45),
                'exercises' => $normalizedExercises,
                'notes' => array_slice($notes, 0, 3),
            ];

            $updated = true;
            break;
        }

        if (!$updated) {
            throw new RuntimeException('Current day was not found in weekly plan.');
        }

        return $this->saveForUser($user, [
            ...$planPayload,
            'days' => array_values($days),
        ]);
    }

    private function generateUsingAi(
        User $user,
        string $goal,
        ?array $existingPlan = null,
        ?array $nutritionPlan = null,
        ?Recommendation $latestRecommendation = null,
    ): array {
        $startedAt = microtime(true);

        $systemPrompt = $this->promptTemplateService->load('ai/weekly-plan.system.txt');

        $userPrompt = $this->promptTemplateService->render('ai/weekly-plan.user.txt', [
            'profile_context' => $this->profilePromptBuilder->build($user),
            'goal' => $goal,
            'nutrition_context' => $this->buildNutritionContext($nutritionPlan),
            'existing_plan_context' => $this->buildExistingPlanContext($existingPlan),
            'recommendation_context' => $this->buildRecommendationContext($latestRecommendation),
        ]);

        Log::debug('WeeklyPlanService sending AI request.', [
            'user_id' => $user->id,
            'goal' => $goal,
            'system_prompt_length' => strlen($systemPrompt),
            'user_prompt_length' => strlen($userPrompt),
            'has_existing_plan_context' => $existingPlan !== null,
            'has_nutrition_context' => $nutritionPlan !== null,
            'has_recommendation_context' => $latestRecommendation !== null,
        ]);

        $response = $this->openAiClient->chatJson($systemPrompt, $userPrompt, $user->id);

        Log::debug('WeeklyPlanService AI response received.', [
            'user_id' => $user->id,
            'duration_ms' => (int) round((microtime(true) - $startedAt) * 1000),
            'response_keys' => array_keys($response),
            'days_count_raw' => is_array($response['days'] ?? null) ? count($response['days']) : null,
        ]);

        return $response;
    }

    private function normalize(array $payload, string $goal, ?array $nutritionPlan = null): array
    {
        $days = $payload['days'] ?? [];

        Log::debug('WeeklyPlanService normalize started.', [
            'goal' => $goal,
            'payload_keys' => array_keys($payload),
            'days_count_raw' => is_array($days) ? count($days) : null,
            'has_nutrition_plan' => $nutritionPlan !== null,
        ]);

        if (!is_array($days)) {
            Log::warning('WeeklyPlanService normalize failed: days missing or invalid type.');
            throw new RuntimeException('Weekly plan response is missing days.');
        }

        if (count($days) !== 7) {
            Log::warning('WeeklyPlanService normalize failed: days count is not 7.', [
                'days_count_raw' => count($days),
            ]);
            throw new RuntimeException('Weekly plan response must contain exactly 7 days.');
        }

        $normalizedDays = [];

        foreach ($days as $day) {
            if (!is_array($day) || !is_string($day['day'] ?? null) || !is_string($day['focus'] ?? null)) {
                Log::warning('WeeklyPlanService normalize failed: invalid day row.', [
                    'day_row' => $day,
                ]);
                throw new RuntimeException('Weekly plan day entry is invalid.');
            }

            $dayName = $day['day'];
            $notes = $day['notes'] ?? [];

            if (is_string($notes) && trim($notes) !== '') {
                $notes = [$notes];
            }

            if (!is_array($notes)) {
                Log::warning('WeeklyPlanService normalize failed: notes are invalid for day.', [
                    'day' => $dayName,
                    'notes_type' => gettype($notes),
                ]);
                throw new RuntimeException(sprintf('Weekly plan day notes are invalid for %s.', $dayName));
            }

            $cleanNotes = [];

            foreach ($notes as $note) {
                if (!is_string($note) || trim($note) === '') {
                    continue;
                }

                $cleanNotes[] = $note;
            }

            if (count($cleanNotes) === 1) {
                $cleanNotes[] = 'Focus on quality movement and recovery.';
            }

            if (count($cleanNotes) < 2) {
                Log::warning('WeeklyPlanService normalize failed: insufficient notes for day.', [
                    'day' => $dayName,
                    'notes_count' => count($cleanNotes),
                ]);
                throw new RuntimeException(sprintf('Weekly plan day notes must contain at least 2 strings for %s.', $dayName));
            }

            $intensity = in_array($day['intensity'] ?? '', ['low', 'moderate', 'high'], true)
                ? $day['intensity']
                : 'moderate';

            $cleanExercises = $this->normalizeWeeklyDayExercises(
                $day['exercises'] ?? [],
                $day['focus'],
                $intensity,
            );

            $normalizedDays[] = [
                'day' => $day['day'],
                'focus' => $day['focus'],
                'durationMinutes' => isset($day['durationMinutes']) ? (int) $day['durationMinutes'] : 45,
                'intensity' => $intensity,
                'exercises' => array_values($cleanExercises),
                'notes' => array_values(array_slice($cleanNotes, 0, 2)),
            ];
        }

        if (count($normalizedDays) !== 7) {
            Log::warning('WeeklyPlanService normalize failed: normalized day count is invalid.', [
                'normalized_days_count' => count($normalizedDays),
            ]);
            throw new RuntimeException('Weekly plan response contains invalid days.');
        }

        $notes = $payload['notes'] ?? [];

        if (is_string($notes) && trim($notes) !== '') {
            $notes = [$notes];
        }

        if (!is_array($notes)) {
            Log::warning('WeeklyPlanService normalize failed: plan notes are invalid type.', [
                'notes_type' => gettype($notes),
            ]);
            throw new RuntimeException('Weekly plan notes are invalid.');
        }

        if (count($notes) < 2) {
            Log::warning('WeeklyPlanService normalize failed: insufficient top-level notes.', [
                'notes_count_raw' => count($notes),
            ]);
            throw new RuntimeException('Weekly plan notes must contain at least 2 items.');
        }

        $cleanNotes = [];
        foreach ($notes as $note) {
            if (!is_string($note) || trim($note) === '') {
                continue;
            }

            $cleanNotes[] = $note;
        }

        if (count($cleanNotes) < 2) {
            Log::warning('WeeklyPlanService normalize failed: insufficient clean top-level notes.', [
                'clean_notes_count' => count($cleanNotes),
            ]);
            throw new RuntimeException('Weekly plan notes must contain at least 2 strings.');
        }

        $todayName = now()->englishDayOfWeek;
        $todayPlan = collect($normalizedDays)->first(
            fn(array $day): bool => ($day['day'] ?? null) === $todayName,
        );

        $plannedWorkout = $this->normalizePlannedWorkout(
            $payload['planned_workout'] ?? null,
            $todayPlan,
            $goal,
        );

        $plannedNutrition = $this->normalizePlannedNutrition(
            $payload['planned_nutrition'] ?? null,
            $nutritionPlan,
            $goal,
        );

        Log::debug('WeeklyPlanService normalize completed.', [
            'normalized_days_count' => count($normalizedDays),
            'planned_workout_keys' => array_keys($plannedWorkout),
            'planned_nutrition_keys' => array_keys($plannedNutrition),
        ]);

        return [
            'goal' => in_array(($payload['goal'] ?? ''), ['bulk', 'cut', 'maintain'], true)
                ? $payload['goal']
                : $goal,
            'days' => $normalizedDays,
            'notes' => array_values(array_slice($cleanNotes, 0, 2)),
            'planned_workout' => $plannedWorkout,
            'planned_nutrition' => $plannedNutrition,
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

    private function normalizeRecommendationExercises(mixed $exercises): array
    {
        if (!is_array($exercises) || $exercises === []) {
            throw new RuntimeException('Recommendation exercises are missing for day update.');
        }

        $normalized = [];

        foreach ($exercises as $exercise) {
            if (!is_array($exercise)) {
                continue;
            }

            $normalizedExercise = $this->normalizeExerciseRow($exercise);
            if ($normalizedExercise !== null) {
                $normalized[] = $normalizedExercise;
            }
        }

        if ($normalized === []) {
            throw new RuntimeException('Recommendation exercises are invalid for day update.');
        }

        return array_values(array_slice($normalized, 0, 10));
    }

    private function normalizeWeeklyDayExercises(mixed $exercises, string $focus, string $intensity): array
    {
        if (!is_array($exercises)) {
            throw new RuntimeException('Weekly plan exercises are invalid.');
        }

        $normalized = [];
        $seenNames = [];

        foreach ($exercises as $exercise) {
            if (!is_array($exercise)) {
                continue;
            }

            $normalizedExercise = $this->normalizeExerciseRow($exercise);
            if ($normalizedExercise === null) {
                continue;
            }

            $nameKey = strtolower($normalizedExercise['name']);
            if (isset($seenNames[$nameKey])) {
                continue;
            }

            $seenNames[$nameKey] = true;
            $normalized[] = $normalizedExercise;
        }

        $normalized = $this->enforceFocusCoherence($normalized, $focus);
        $seenNames = [];
        foreach ($normalized as $exercise) {
            $seenNames[strtolower($exercise['name'])] = true;
        }

        $targetCount = $this->targetExerciseCountByFocus($focus, $intensity);
        if (count($normalized) < $targetCount) {
            foreach ($this->fallbackExercisesForFocus($focus) as $fallbackExercise) {
                $nameKey = strtolower($fallbackExercise['name']);
                if (isset($seenNames[$nameKey])) {
                    continue;
                }

                $seenNames[$nameKey] = true;
                $normalized[] = $fallbackExercise;

                if (count($normalized) >= $targetCount) {
                    break;
                }
            }
        }

        if ($normalized === []) {
            throw new RuntimeException('Weekly plan exercises are invalid.');
        }

        return array_values(array_slice($normalized, 0, 10));
    }

    private function normalizeExerciseRow(array $exercise): ?array
    {
        if (!is_string($exercise['name'] ?? null) || trim($exercise['name']) === '') {
            return null;
        }

        $muscleGroup = null;
        if (is_string($exercise['muscleGroup'] ?? null) && trim($exercise['muscleGroup']) !== '') {
            $muscleGroup = trim($exercise['muscleGroup']);
        } elseif (is_string($exercise['muscle_group'] ?? null) && trim($exercise['muscle_group']) !== '') {
            $muscleGroup = trim($exercise['muscle_group']);
        }

        if ($muscleGroup === null) {
            $muscleGroup = $this->inferMuscleGroupFromName(trim($exercise['name']));
        }

        $purpose = null;
        if (is_string($exercise['purpose'] ?? null) && trim($exercise['purpose']) !== '') {
            $purpose = trim($exercise['purpose']);
        } elseif (is_string($exercise['description'] ?? null) && trim($exercise['description']) !== '') {
            $purpose = trim($exercise['description']);
        }

        $techniquePoints = $this->normalizeTechniquePoints(
            $exercise['technique_points'] ?? $exercise['techniquePoints'] ?? null,
        );

        return [
            'name' => trim($exercise['name']),
            'muscleGroup' => $muscleGroup,
            'sets' => $this->parseExerciseSets($exercise['sets'] ?? null),
            'reps' => is_string($exercise['reps'] ?? null) && trim($exercise['reps']) !== ''
                ? trim($exercise['reps'])
                : '8-12',
            'rest' => is_string($exercise['rest'] ?? null) && trim($exercise['rest']) !== ''
                ? trim($exercise['rest'])
                : '60s',
            'notes' => is_string($exercise['notes'] ?? null) ? trim($exercise['notes']) : '',
            'purpose' => $purpose,
            'description' => $purpose,
            'technique_points' => $techniquePoints,
            'techniquePoints' => $techniquePoints,
        ];
    }

    private function normalizeTechniquePoints(mixed $points): array
    {
        if (!is_array($points)) {
            return [];
        }

        $normalized = [];

        foreach ($points as $point) {
            if (!is_string($point) || trim($point) === '') {
                continue;
            }

            $normalized[] = trim($point);
        }

        return array_values(array_slice($normalized, 0, 3));
    }

    private function parseExerciseSets(mixed $sets): int|string
    {
        if (is_int($sets)) {
            return $sets;
        }

        if (is_numeric($sets)) {
            return (int) $sets;
        }

        if (is_string($sets) && trim($sets) !== '') {
            return trim($sets);
        }

        return 3;
    }

    private function targetExerciseCountByFocus(string $focus, string $intensity): int
    {
        $focusLabel = strtolower($focus);

        if (
            str_contains($focusLabel, 'recovery') ||
            str_contains($focusLabel, 'mobility') ||
            str_contains($focusLabel, 'cardio') ||
            str_contains($focusLabel, 'active rest')
        ) {
            return 4;
        }

        if (
            str_contains($focusLabel, 'push') ||
            str_contains($focusLabel, 'pull') ||
            str_contains($focusLabel, 'leg') ||
            str_contains($focusLabel, 'lower') ||
            str_contains($focusLabel, 'upper')
        ) {
            return 8;
        }

        return match ($intensity) {
            'high' => 7,
            'moderate' => 6,
            default => 4,
        };
    }

    private function fallbackExercisesForFocus(string $focus): array
    {
        $focusLabel = strtolower($focus);

        if (
            str_contains($focusLabel, 'recovery') ||
            str_contains($focusLabel, 'mobility') ||
            str_contains($focusLabel, 'cardio') ||
            str_contains($focusLabel, 'active rest')
        ) {
            return [
                ['name' => 'Mobility Flow', 'muscleGroup' => 'Mobility', 'sets' => 2, 'reps' => '8-10 min', 'rest' => '60s', 'notes' => 'Move slowly and prioritize range quality.'],
                ['name' => 'Zone 2 Walk', 'muscleGroup' => 'Cardio', 'sets' => 1, 'reps' => '20-30 min', 'rest' => 'N/A', 'notes' => 'Keep pace conversational and steady.'],
                ['name' => 'Dead Bug', 'muscleGroup' => 'Core', 'sets' => 3, 'reps' => '10 each side', 'rest' => '45s', 'notes' => 'Control breathing and rib cage position.'],
                ['name' => 'Breathing Reset', 'muscleGroup' => 'Recovery', 'sets' => 1, 'reps' => '4-6 min', 'rest' => 'N/A', 'notes' => 'Lengthen exhales to downregulate stress.'],
            ];
        }

        if (str_contains($focusLabel, 'push')) {
            return [
                ['name' => 'Incline Barbell Press', 'muscleGroup' => 'Chest', 'sets' => 4, 'reps' => '6-8', 'rest' => '120s', 'notes' => 'Drive elbows under the bar and maintain controlled tempo.'],
                ['name' => 'Flat Dumbbell Press', 'muscleGroup' => 'Chest', 'sets' => 3, 'reps' => '8-10', 'rest' => '90s', 'notes' => 'Use full range and controlled lockout.'],
                ['name' => 'Cable Fly', 'muscleGroup' => 'Chest', 'sets' => 3, 'reps' => '12-15', 'rest' => '60s', 'notes' => 'Keep tension through full arc.'],
                ['name' => 'Seated Dumbbell Shoulder Press', 'muscleGroup' => 'Shoulders', 'sets' => 3, 'reps' => '8-10', 'rest' => '90s', 'notes' => 'Maintain neutral spine and stable core.'],
                ['name' => 'Dumbbell Lateral Raise', 'muscleGroup' => 'Shoulders', 'sets' => 3, 'reps' => '12-15', 'rest' => '60s', 'notes' => 'Lead with elbows and avoid momentum.'],
                ['name' => 'Rear Delt Cable Fly', 'muscleGroup' => 'Shoulders', 'sets' => 2, 'reps' => '12-15', 'rest' => '60s', 'notes' => 'Control scapular movement each rep.'],
                ['name' => 'Rope Triceps Pushdown', 'muscleGroup' => 'Triceps', 'sets' => 3, 'reps' => '10-12', 'rest' => '60s', 'notes' => 'Lock elbows and finish with full extension.'],
                ['name' => 'Overhead Triceps Extension', 'muscleGroup' => 'Triceps', 'sets' => 2, 'reps' => '12-15', 'rest' => '60s', 'notes' => 'Keep upper arm stable during extension.'],
            ];
        }

        if (str_contains($focusLabel, 'pull')) {
            return [
                ['name' => 'Pull-Up', 'muscleGroup' => 'Back', 'sets' => 4, 'reps' => '6-10', 'rest' => '120s', 'notes' => 'Start each rep by depressing scapula.'],
                ['name' => 'Lat Pulldown', 'muscleGroup' => 'Back', 'sets' => 3, 'reps' => '8-12', 'rest' => '90s', 'notes' => 'Drive elbows down without swinging.'],
                ['name' => 'Chest-Supported Row', 'muscleGroup' => 'Back', 'sets' => 3, 'reps' => '8-10', 'rest' => '90s', 'notes' => 'Control the eccentric for better recruitment.'],
                ['name' => 'Single-Arm Cable Row', 'muscleGroup' => 'Back', 'sets' => 2, 'reps' => '10-12', 'rest' => '60s', 'notes' => 'Keep torso quiet and pull through elbow.'],
                ['name' => 'Face Pull', 'muscleGroup' => 'Rear Delts', 'sets' => 3, 'reps' => '12-15', 'rest' => '60s', 'notes' => 'Finish with external rotation.'],
                ['name' => 'Reverse Pec Deck', 'muscleGroup' => 'Rear Delts', 'sets' => 2, 'reps' => '12-15', 'rest' => '60s', 'notes' => 'Avoid shrugging at the top.'],
                ['name' => 'Incline Dumbbell Curl', 'muscleGroup' => 'Biceps', 'sets' => 3, 'reps' => '10-12', 'rest' => '60s', 'notes' => 'Keep shoulders pinned and full extension.'],
                ['name' => 'Hammer Curl', 'muscleGroup' => 'Biceps', 'sets' => 2, 'reps' => '10-12', 'rest' => '60s', 'notes' => 'Control both concentric and eccentric phases.'],
            ];
        }

        if (str_contains($focusLabel, 'leg') || str_contains($focusLabel, 'lower')) {
            return [
                ['name' => 'Back Squat', 'muscleGroup' => 'Quadriceps', 'sets' => 4, 'reps' => '5-8', 'rest' => '150s', 'notes' => 'Brace hard and maintain depth consistency.'],
                ['name' => 'Leg Press', 'muscleGroup' => 'Quadriceps', 'sets' => 3, 'reps' => '10-12', 'rest' => '90s', 'notes' => 'Control eccentric with full foot contact.'],
                ['name' => 'Walking Lunge', 'muscleGroup' => 'Quadriceps', 'sets' => 2, 'reps' => '10 each side', 'rest' => '75s', 'notes' => 'Keep knee tracking stable each step.'],
                ['name' => 'Romanian Deadlift', 'muscleGroup' => 'Hamstrings', 'sets' => 3, 'reps' => '8-10', 'rest' => '120s', 'notes' => 'Hinge with neutral spine and loaded hamstrings.'],
                ['name' => 'Lying Leg Curl', 'muscleGroup' => 'Hamstrings', 'sets' => 3, 'reps' => '10-12', 'rest' => '75s', 'notes' => 'Pause at peak contraction each rep.'],
                ['name' => 'Barbell Hip Thrust', 'muscleGroup' => 'Glutes', 'sets' => 3, 'reps' => '8-12', 'rest' => '90s', 'notes' => 'Lock pelvis and squeeze at top.'],
                ['name' => 'Standing Calf Raise', 'muscleGroup' => 'Calves', 'sets' => 3, 'reps' => '12-15', 'rest' => '60s', 'notes' => 'Use full stretch and controlled pause.'],
                ['name' => 'Cable Crunch', 'muscleGroup' => 'Core', 'sets' => 2, 'reps' => '12-15', 'rest' => '45s', 'notes' => 'Brace and flex through trunk.'],
            ];
        }

        if (str_contains($focusLabel, 'upper')) {
            return [
                ['name' => 'Incline Dumbbell Press', 'muscleGroup' => 'Chest', 'sets' => 3, 'reps' => '8-10', 'rest' => '90s', 'notes' => 'Use full range with controlled descent.'],
                ['name' => 'Chest-Supported Row', 'muscleGroup' => 'Back', 'sets' => 3, 'reps' => '8-10', 'rest' => '90s', 'notes' => 'Pull through elbow with stable torso.'],
                ['name' => 'Seated Shoulder Press', 'muscleGroup' => 'Shoulders', 'sets' => 3, 'reps' => '8-10', 'rest' => '75s', 'notes' => 'Avoid lumbar extension and keep core tight.'],
                ['name' => 'Lat Pulldown', 'muscleGroup' => 'Back', 'sets' => 3, 'reps' => '10-12', 'rest' => '75s', 'notes' => 'Depress scapula before pulling down.'],
                ['name' => 'Cable Lateral Raise', 'muscleGroup' => 'Shoulders', 'sets' => 2, 'reps' => '12-15', 'rest' => '60s', 'notes' => 'Lead with elbows and avoid swinging.'],
                ['name' => 'Rope Triceps Pushdown', 'muscleGroup' => 'Triceps', 'sets' => 3, 'reps' => '10-12', 'rest' => '60s', 'notes' => 'Lock elbows at sides and finish hard.'],
                ['name' => 'Incline Dumbbell Curl', 'muscleGroup' => 'Biceps', 'sets' => 3, 'reps' => '10-12', 'rest' => '60s', 'notes' => 'Control both lift and lowering phases.'],
                ['name' => 'Face Pull', 'muscleGroup' => 'Rear Delts', 'sets' => 2, 'reps' => '12-15', 'rest' => '60s', 'notes' => 'Finish with external rotation.'],
            ];
        }

        return [
            ['name' => 'Barbell Bench Press', 'muscleGroup' => 'Chest', 'sets' => 3, 'reps' => '6-8', 'rest' => '120s', 'notes' => 'Maintain bar path consistency.'],
            ['name' => 'Bent-Over Row', 'muscleGroup' => 'Back', 'sets' => 3, 'reps' => '8-10', 'rest' => '90s', 'notes' => 'Keep trunk stable and row to lower ribs.'],
            ['name' => 'Back Squat', 'muscleGroup' => 'Quadriceps', 'sets' => 3, 'reps' => '6-8', 'rest' => '120s', 'notes' => 'Brace and control depth each set.'],
            ['name' => 'Romanian Deadlift', 'muscleGroup' => 'Hamstrings', 'sets' => 3, 'reps' => '8-10', 'rest' => '120s', 'notes' => 'Push hips back and keep lats engaged.'],
            ['name' => 'Dumbbell Shoulder Press', 'muscleGroup' => 'Shoulders', 'sets' => 3, 'reps' => '8-10', 'rest' => '75s', 'notes' => 'Stack joints and avoid lumbar extension.'],
            ['name' => 'Plank', 'muscleGroup' => 'Core', 'sets' => 3, 'reps' => '30-45s', 'rest' => '45s', 'notes' => 'Keep neutral spine and active brace.'],
        ];
    }

    private function enforceFocusCoherence(array $exercises, string $focus): array
    {
        $focusType = $this->resolveFocusType($focus);

        if (in_array($focusType, ['full_body', 'other'], true)) {
            return $exercises;
        }

        $filtered = array_values(array_filter(
            $exercises,
            fn(array $exercise): bool => $this->isExerciseCompatibleWithFocus($exercise, $focusType),
        ));

        return $filtered;
    }

    private function resolveFocusType(string $focus): string
    {
        $label = strtolower($focus);

        if (str_contains($label, 'full body')) {
            return 'full_body';
        }

        if (str_contains($label, 'push')) {
            return 'push';
        }

        if (str_contains($label, 'pull')) {
            return 'pull';
        }

        if (str_contains($label, 'upper')) {
            return 'upper';
        }

        if (str_contains($label, 'leg') || str_contains($label, 'lower')) {
            return 'lower';
        }

        if (
            str_contains($label, 'recovery') ||
            str_contains($label, 'mobility') ||
            str_contains($label, 'cardio') ||
            str_contains($label, 'rest')
        ) {
            return 'recovery';
        }

        return 'other';
    }

    private function isExerciseCompatibleWithFocus(array $exercise, string $focusType): bool
    {
        $group = $this->normalizeMuscleGroupLabel(
            (string) ($exercise['muscleGroup'] ?? $this->inferMuscleGroupFromName((string) ($exercise['name'] ?? ''))),
        );

        return match ($focusType) {
            'push' => in_array($group, ['chest', 'shoulders', 'triceps'], true),
            'pull' => in_array($group, ['back', 'rear_delts', 'biceps'], true),
            'upper' => in_array($group, ['chest', 'shoulders', 'triceps', 'back', 'rear_delts', 'biceps'], true),
            'lower' => in_array($group, ['quadriceps', 'hamstrings', 'glutes', 'calves', 'core'], true),
            'recovery' => in_array($group, ['mobility', 'cardio', 'recovery', 'core'], true),
            default => true,
        };
    }

    private function inferMuscleGroupFromName(string $exerciseName): string
    {
        $label = strtolower($exerciseName);

        if (
            str_contains($label, 'mobility') ||
            str_contains($label, 'stretch')
        ) {
            return 'Mobility';
        }

        if (
            str_contains($label, 'walk') ||
            str_contains($label, 'bike') ||
            str_contains($label, 'cardio') ||
            str_contains($label, 'zone 2')
        ) {
            return 'Cardio';
        }

        if (
            str_contains($label, 'breath') ||
            str_contains($label, 'recovery')
        ) {
            return 'Recovery';
        }

        if (str_contains($label, 'curl')) {
            return 'Biceps';
        }

        if (
            str_contains($label, 'triceps') ||
            str_contains($label, 'pushdown')
        ) {
            return 'Triceps';
        }

        if (
            str_contains($label, 'pull') ||
            str_contains($label, 'row') ||
            str_contains($label, 'lat')
        ) {
            return 'Back';
        }

        if (
            str_contains($label, 'rear delt') ||
            str_contains($label, 'face pull')
        ) {
            return 'Rear Delts';
        }

        if (
            str_contains($label, 'press') ||
            str_contains($label, 'fly') ||
            str_contains($label, 'bench')
        ) {
            return 'Chest';
        }

        if (
            str_contains($label, 'shoulder') ||
            str_contains($label, 'lateral raise') ||
            str_contains($label, 'delt')
        ) {
            return 'Shoulders';
        }

        if (
            str_contains($label, 'squat') ||
            str_contains($label, 'lunge') ||
            str_contains($label, 'leg press')
        ) {
            return 'Quadriceps';
        }

        if (
            str_contains($label, 'deadlift') ||
            str_contains($label, 'rdl') ||
            str_contains($label, 'leg curl')
        ) {
            return 'Hamstrings';
        }

        if (
            str_contains($label, 'hip thrust') ||
            str_contains($label, 'glute')
        ) {
            return 'Glutes';
        }

        if (str_contains($label, 'calf')) {
            return 'Calves';
        }

        if (
            str_contains($label, 'plank') ||
            str_contains($label, 'crunch') ||
            str_contains($label, 'core') ||
            str_contains($label, 'dead bug')
        ) {
            return 'Core';
        }

        return 'Primary Target';
    }

    private function normalizeMuscleGroupLabel(string $muscleGroup): string
    {
        $group = strtolower(trim($muscleGroup));

        return match (true) {
            str_contains($group, 'chest') => 'chest',
            str_contains($group, 'shoulder') || str_contains($group, 'delt') => str_contains($group, 'rear') ? 'rear_delts' : 'shoulders',
            str_contains($group, 'tricep') => 'triceps',
            str_contains($group, 'bicep') => 'biceps',
            str_contains($group, 'lat') || str_contains($group, 'back') => 'back',
            str_contains($group, 'quad') => 'quadriceps',
            str_contains($group, 'hamstring') => 'hamstrings',
            str_contains($group, 'glute') => 'glutes',
            str_contains($group, 'calf') => 'calves',
            str_contains($group, 'core') || str_contains($group, 'abs') => 'core',
            str_contains($group, 'mobility') => 'mobility',
            str_contains($group, 'cardio') => 'cardio',
            str_contains($group, 'recovery') || str_contains($group, 'warm') => 'recovery',
            default => 'other',
        };
    }

    private function buildNutritionContext(?array $nutritionPlan): string
    {
        if (!$nutritionPlan) {
            return 'No nutrition plan available yet.';
        }

        $targetCalories = (int) ($nutritionPlan['targetCalories'] ?? 0);
        $macroTargets = is_array($nutritionPlan['macroTargets'] ?? null)
            ? $nutritionPlan['macroTargets']
            : [];

        $protein = (int) ($macroTargets['proteinGrams'] ?? 0);
        $carbs = (int) ($macroTargets['carbsGrams'] ?? 0);
        $fats = (int) ($macroTargets['fatGrams'] ?? 0);
        $hydration = (float) ($nutritionPlan['hydrationLiters'] ?? 0);
        $tip = is_string($nutritionPlan['nutritionTip'] ?? null)
            ? $nutritionPlan['nutritionTip']
            : 'No nutrition tip available.';

        return sprintf(
            'Target calories: %d. Macros: protein %dg, carbs %dg, fats %dg. Hydration: %.1fL. Nutrition tip: %s',
            $targetCalories,
            $protein,
            $carbs,
            $fats,
            $hydration,
            $tip,
        );
    }

    private function buildExistingPlanContext(?array $existingPlan): string
    {
        if (!$existingPlan) {
            return 'No existing weekly plan available.';
        }

        $days = is_array($existingPlan['days'] ?? null) ? $existingPlan['days'] : [];

        if ($days === []) {
            return 'Existing weekly plan has no valid day entries.';
        }

        $summary = collect($days)
            ->filter(fn(mixed $day): bool => is_array($day) && is_string($day['day'] ?? null))
            ->map(function (array $day): string {
                $focus = is_string($day['focus'] ?? null) ? $day['focus'] : 'No focus';
                $intensity = in_array(($day['intensity'] ?? null), ['low', 'moderate', 'high'], true)
                    ? $day['intensity']
                    : 'moderate';

                return sprintf('%s: %s (%s)', $day['day'], $focus, $intensity);
            })
            ->values()
            ->all();

        return $summary === []
            ? 'Existing weekly plan is present but cannot be summarized.'
            : 'Existing weekly plan summary: ' . implode('; ', $summary);
    }

    private function buildRecommendationContext(?Recommendation $recommendation): string
    {
        if (!$recommendation) {
            return 'No latest recommendation available.';
        }

        return sprintf(
            'Latest readiness score: %d. Planned: %s. Adjusted: %s. Nutrition tip: %s',
            (int) $recommendation->readiness_score,
            (string) $recommendation->planned,
            (string) $recommendation->adjusted,
            (string) $recommendation->nutrition_tip,
        );
    }

    private function normalizePlannedWorkout(mixed $payload, ?array $todayPlan, string $goal): array
    {
        if (is_array($payload)) {
            $day = is_string($payload['day'] ?? null) && trim($payload['day']) !== ''
                ? $payload['day']
                : ($todayPlan['day'] ?? now()->englishDayOfWeek);

            $summary = is_string($payload['summary'] ?? null) && trim($payload['summary']) !== ''
                ? $payload['summary']
                : sprintf('Recommended routine for %s based on your %s goal.', $day, $goal);

            $focus = is_string($payload['focus'] ?? null) && trim($payload['focus']) !== ''
                ? $payload['focus']
                : ($todayPlan['focus'] ?? 'Balanced training day');

            $adjusted = is_string($payload['adjusted'] ?? null) && trim($payload['adjusted']) !== ''
                ? $payload['adjusted']
                : $focus;

            $duration = isset($payload['durationMinutes'])
                ? (int) $payload['durationMinutes']
                : (int) ($todayPlan['durationMinutes'] ?? 45);

            $intensity = in_array(($payload['intensity'] ?? null), ['low', 'moderate', 'high'], true)
                ? $payload['intensity']
                : (in_array(($todayPlan['intensity'] ?? null), ['low', 'moderate', 'high'], true)
                    ? $todayPlan['intensity']
                    : 'moderate');

            $exercises = $this->normalizeWeeklyDayExercises(
                $payload['exercises'] ?? ($todayPlan['exercises'] ?? []),
                $focus,
                $intensity,
            );

            $notesPayload = $payload['notes'] ?? [];
            if (is_string($notesPayload) && trim($notesPayload) !== '') {
                $notesPayload = [$notesPayload];
            }

            $notes = [];
            if (is_array($notesPayload)) {
                foreach ($notesPayload as $note) {
                    if (is_string($note) && trim($note) !== '') {
                        $notes[] = $note;
                    }
                }
            }

            if ($notes === []) {
                $notes = [
                    'Use controlled tempo and preserve technical quality.',
                    'Adjust effort based on your recovery and nutrition targets.',
                ];
            }

            return [
                'day' => $day,
                'summary' => $summary,
                'focus' => $focus,
                'adjusted' => $adjusted,
                'durationMinutes' => max(20, min(120, $duration)),
                'intensity' => $intensity,
                'exercises' => $exercises,
                'notes' => array_values(array_slice($notes, 0, 2)),
            ];
        }

        $day = $todayPlan['day'] ?? now()->englishDayOfWeek;

        $fallbackFocus = (string) ($todayPlan['focus'] ?? 'Balanced training day');
        $fallbackIntensity = in_array(($todayPlan['intensity'] ?? null), ['low', 'moderate', 'high'], true)
            ? $todayPlan['intensity']
            : 'moderate';

        return [
            'day' => $day,
            'summary' => sprintf('Recommended routine for %s based on your %s goal and recovery context.', $day, $goal),
            'focus' => $fallbackFocus,
            'adjusted' => $fallbackFocus,
            'durationMinutes' => (int) ($todayPlan['durationMinutes'] ?? 45),
            'intensity' => $fallbackIntensity,
            'exercises' => $this->normalizeWeeklyDayExercises($todayPlan['exercises'] ?? [
                [
                    'name' => 'Mobility and activation block',
                    'muscleGroup' => 'Warm-up',
                    'sets' => 2,
                    'reps' => '8-10',
                    'rest' => '60s',
                    'notes' => 'Prioritize movement quality.',
                ]
            ], $fallbackFocus, $fallbackIntensity),
            'notes' => [
                'Align training effort with your nutrition and hydration targets.',
                'Prioritize technical consistency before adding load.',
            ],
        ];
    }

    private function normalizePlannedNutrition(mixed $payload, ?array $nutritionPlan, string $goal): array
    {
        if (is_array($payload)) {
            $notesPayload = $payload['notes'] ?? [];
            if (is_string($notesPayload) && trim($notesPayload) !== '') {
                $notesPayload = [$notesPayload];
            }

            $notes = [];
            if (is_array($notesPayload)) {
                foreach ($notesPayload as $note) {
                    if (is_string($note) && trim($note) !== '') {
                        $notes[] = $note;
                    }
                }
            }

            if ($notes === []) {
                $notes = ['Keep meal timing consistent around training sessions.'];
            }

            return [
                'summary' => is_string($payload['summary'] ?? null) && trim($payload['summary']) !== ''
                    ? $payload['summary']
                    : sprintf('Nutrition strategy aligned to %s goal and weekly workload.', $goal),
                'calories' => isset($payload['calories']) ? (int) $payload['calories'] : (int) ($nutritionPlan['targetCalories'] ?? 2200),
                'proteinGrams' => isset($payload['proteinGrams']) ? (int) $payload['proteinGrams'] : (int) ($nutritionPlan['macroTargets']['proteinGrams'] ?? 140),
                'carbsGrams' => isset($payload['carbsGrams']) ? (int) $payload['carbsGrams'] : (int) ($nutritionPlan['macroTargets']['carbsGrams'] ?? 250),
                'fatGrams' => isset($payload['fatGrams']) ? (int) $payload['fatGrams'] : (int) ($nutritionPlan['macroTargets']['fatGrams'] ?? 70),
                'hydrationLiters' => isset($payload['hydrationLiters']) ? (float) $payload['hydrationLiters'] : (float) ($nutritionPlan['hydrationLiters'] ?? 2.5),
                'notes' => array_values(array_slice($notes, 0, 2)),
            ];
        }

        return [
            'summary' => sprintf('Nutrition strategy aligned to %s goal and weekly workload.', $goal),
            'calories' => (int) ($nutritionPlan['targetCalories'] ?? 2200),
            'proteinGrams' => (int) ($nutritionPlan['macroTargets']['proteinGrams'] ?? 140),
            'carbsGrams' => (int) ($nutritionPlan['macroTargets']['carbsGrams'] ?? 250),
            'fatGrams' => (int) ($nutritionPlan['macroTargets']['fatGrams'] ?? 70),
            'hydrationLiters' => (float) ($nutritionPlan['hydrationLiters'] ?? 2.5),
            'notes' => [
                'Distribute carbs around high-demand sessions for performance support.',
                'Keep hydration and sodium intake consistent through the week.',
            ],
        ];
    }
}
