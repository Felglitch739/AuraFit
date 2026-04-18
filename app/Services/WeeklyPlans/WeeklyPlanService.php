<?php

namespace App\Services\WeeklyPlans;

use App\Models\User;
use App\Models\WeeklyPlan;
use App\Services\Ai\OpenAiClientService;
use App\Services\Ai\UserProfilePromptBuilder;
use RuntimeException;

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
        $goal = $this->resolveGoal($user);

        $result = $this->generateUsingAi($user, $goal);

        return $this->normalize($result, $goal);
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

    private function generateUsingAi(User $user, string $goal): array
    {
        $systemPrompt = $this->promptTemplateService->load('ai/weekly-plan.system.txt');

        $userPrompt = $this->promptTemplateService->render('ai/weekly-plan.user.txt', [
            'profile_context' => $this->profilePromptBuilder->build($user),
            'goal' => $goal,
        ]);

        return $this->openAiClient->chatJson($systemPrompt, $userPrompt);
    }

    private function normalize(array $payload, string $goal): array
    {
        $days = $payload['days'] ?? [];

        if (!is_array($days)) {
            throw new RuntimeException('Weekly plan response is missing days.');
        }

        if (count($days) !== 7) {
            throw new RuntimeException('Weekly plan response must contain exactly 7 days.');
        }

        $normalizedDays = [];

        foreach ($days as $day) {
            if (!is_array($day) || !is_string($day['day'] ?? null) || !is_string($day['focus'] ?? null)) {
                throw new RuntimeException('Weekly plan day entry is invalid.');
            }

            $notes = $day['notes'] ?? [];
            if (!is_array($notes) || count($notes) < 2) {
                throw new RuntimeException('Weekly plan day notes must contain at least 2 items.');
            }

            $cleanNotes = [];

            foreach ($notes as $note) {
                if (!is_string($note) || trim($note) === '') {
                    continue;
                }

                $cleanNotes[] = $note;
            }

            if (count($cleanNotes) < 2) {
                throw new RuntimeException('Weekly plan day notes must contain at least 2 strings.');
            }

            $cleanExercises = [];
            foreach (($day['exercises'] ?? []) as $exercise) {
                if (!is_array($exercise) || !is_string($exercise['name'] ?? null) || trim($exercise['name']) === '') {
                    throw new RuntimeException('Weekly plan exercises are invalid.');
                }

                $cleanExercises[] = $exercise;
            }

            $normalizedDays[] = [
                'day' => $day['day'],
                'focus' => $day['focus'],
                'durationMinutes' => isset($day['durationMinutes']) ? (int) $day['durationMinutes'] : 45,
                'intensity' => in_array($day['intensity'] ?? '', ['low', 'moderate', 'high'], true)
                    ? $day['intensity']
                    : 'moderate',
                'exercises' => array_values($cleanExercises),
                'notes' => array_values($cleanNotes),
            ];
        }

        if (count($normalizedDays) !== 7) {
            throw new RuntimeException('Weekly plan response contains invalid days.');
        }

        $notes = $payload['notes'] ?? [];

        if (!is_array($notes) || count($notes) < 2) {
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
            throw new RuntimeException('Weekly plan notes must contain at least 2 strings.');
        }

        return [
            'goal' => in_array(($payload['goal'] ?? ''), ['bulk', 'cut', 'maintain'], true)
                ? $payload['goal']
                : $goal,
            'days' => $normalizedDays,
            'notes' => array_values(array_slice($cleanNotes, 0, 2)),
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
}
