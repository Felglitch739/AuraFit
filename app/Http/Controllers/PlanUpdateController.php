<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\WeeklyPlan;
use App\Services\Ai\CoachChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PlanUpdateController extends Controller
{
    public function update(Request $request, CoachChatService $coachChatService): JsonResponse
    {
        $validated = $request->validate([
            'proposal' => ['required', 'array'],
            'proposal.type' => ['required', 'in:nutrition,workout'],
            'proposal.data' => ['required', 'array'],
        ]);

        /** @var array{type:string,data:array<string,mixed>} $proposal */
        $proposal = $validated['proposal'];
        $user = $request->user();

        /** @var WeeklyPlan|null $weeklyPlan */
        $weeklyPlan = $user->weeklyPlan()->first();

        if (!$weeklyPlan) {
            throw ValidationException::withMessages([
                'proposal' => 'The user does not have a weekly plan yet.',
            ]);
        }

        $planPayload = is_array($weeklyPlan->plan_json) ? $weeklyPlan->plan_json : [];

        if ($proposal['type'] === 'nutrition') {
            $planPayload = $this->applyNutritionProposal($planPayload, $proposal['data']);
        } else {
            $planPayload = $this->applyWorkoutProposal($planPayload, $proposal['data']);
        }

        $weeklyPlan->update([
            'plan_json' => $planPayload,
        ]);

        return response()->json([
            'message' => 'Plan updated successfully.',
            'weeklyPlan' => $planPayload,
            'context' => $coachChatService->buildContextSnapshot($user->fresh()),
        ]);
    }

    private function applyWorkoutProposal(array $planPayload, array $proposalData): array
    {
        $targetDay = $this->resolveTargetDay($proposalData);
        $summary = $this->stringValue(
            $proposalData['summary'] ?? $proposalData['focus'] ?? $proposalData['title'] ?? $proposalData['session'] ?? null,
            'Updated workout',
        );
        $adjusted = $this->stringValue(
            $proposalData['adjusted'] ?? $proposalData['message'] ?? null,
            $summary,
        );
        $durationMinutes = $this->integerValue($proposalData['durationMinutes'] ?? $proposalData['duration'] ?? $proposalData['minutes'] ?? null);
        $intensity = $this->intensityValue($proposalData['intensity'] ?? $proposalData['load'] ?? $proposalData['volume'] ?? null);
        $exercises = $this->normalizeExercises($proposalData['exercises'] ?? null);

        $dayPatch = [
            'focus' => $summary,
            'durationMinutes' => $durationMinutes,
            'intensity' => $intensity,
            'exercises' => $exercises,
            'notes' => array_values(array_filter([
                $this->stringValue($proposalData['notes'][0] ?? null, '') ?: null,
                'Updated from Aura Coach chat acceptance.',
            ])),
        ];

        $days = is_array($planPayload['days'] ?? null) ? $planPayload['days'] : [];
        $matched = false;

        foreach ($days as $index => $day) {
            if (!is_array($day) || ($day['day'] ?? null) !== $targetDay) {
                continue;
            }

            $days[$index] = [
                ...$day,
                ...array_filter($dayPatch, static fn(mixed $value): bool => $value !== null),
            ];
            $matched = true;
            break;
        }

        if (!$matched && $days !== []) {
            $days[0] = [
                ...$days[0],
                ...array_filter($dayPatch, static fn(mixed $value): bool => $value !== null),
            ];
        }

        $planPayload['days'] = array_values($days);
        $planPayload['planned_workout'] = [
            'day' => $targetDay,
            'summary' => $summary,
            'focus' => $summary,
            'adjusted' => $adjusted,
            'durationMinutes' => $durationMinutes,
            'intensity' => $intensity,
            'exercises' => $exercises,
        ];

        return $planPayload;
    }

    private function applyNutritionProposal(array $planPayload, array $proposalData): array
    {
        $notes = [];

        foreach (($proposalData['notes'] ?? []) as $note) {
            if (is_string($note) && trim($note) !== '') {
                $notes[] = $note;
            }
        }

        $planPayload['planned_nutrition'] = [
            'summary' => $this->stringValue($proposalData['summary'] ?? null, 'Updated nutrition plan'),
            'calories' => $this->integerValue($proposalData['calories'] ?? $proposalData['targetCalories'] ?? null),
            'proteinGrams' => $this->integerValue($proposalData['proteinGrams'] ?? $proposalData['protein'] ?? null),
            'carbsGrams' => $this->integerValue($proposalData['carbsGrams'] ?? $proposalData['carbs'] ?? null),
            'fatGrams' => $this->integerValue($proposalData['fatGrams'] ?? $proposalData['fat'] ?? null),
            'hydrationLiters' => $this->floatValue($proposalData['hydrationLiters'] ?? $proposalData['hydration'] ?? null),
            'notes' => $notes,
        ];

        return $planPayload;
    }

    private function resolveTargetDay(array $proposalData): string
    {
        $candidateDay = $this->stringValue($proposalData['day'] ?? $proposalData['targetDay'] ?? null, '');

        if ($candidateDay !== '') {
            return $candidateDay;
        }

        return Carbon::now()->englishDayOfWeek;
    }

    private function normalizeExercises(mixed $exercises): array
    {
        if (!is_array($exercises) || $exercises === []) {
            return [];
        }

        $normalized = [];

        foreach ($exercises as $exercise) {
            if (is_string($exercise) && trim($exercise) !== '') {
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

        return array_slice($normalized, 0, 5);
    }

    private function stringValue(mixed $value, string $fallback): string
    {
        if (is_string($value) && trim($value) !== '') {
            return trim($value);
        }

        if (is_numeric($value)) {
            return (string) $value;
        }

        return $fallback;
    }

    private function integerValue(mixed $value): ?int
    {
        if (is_int($value)) {
            return $value;
        }

        if (is_numeric($value)) {
            return (int) $value;
        }

        return null;
    }

    private function floatValue(mixed $value): ?float
    {
        if (is_float($value) || is_int($value)) {
            return (float) $value;
        }

        if (is_numeric($value)) {
            return (float) $value;
        }

        return null;
    }

    private function intensityValue(mixed $value): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        return in_array($value, ['low', 'moderate', 'high'], true) ? $value : null;
    }
}
