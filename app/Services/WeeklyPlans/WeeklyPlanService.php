<?php

namespace App\Services\WeeklyPlans;

use App\Models\User;
use App\Models\WeeklyPlan;
use App\Services\Ai\OpenAiClientService;
use App\Services\Ai\UserProfilePromptBuilder;
use Throwable;

class WeeklyPlanService
{
    public function __construct(
        private readonly OpenAiClientService $openAiClient,
        private readonly WeeklyPlanTemplateService $templateService,
        private readonly UserProfilePromptBuilder $profilePromptBuilder,
    ) {
    }

    public function generateMock(string $goal): array
    {
        return $this->templateService->build($goal);
    }

    public function generateUsingAiOrFallback(User $user): array
    {
        $goal = $this->resolveGoal($user);

        try {
            $result = $this->generateUsingAi($user, $goal);

            return $this->normalize($result, $goal);
        } catch (Throwable) {
            return $this->templateService->build($goal);
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

    private function generateUsingAi(User $user, string $goal): array
    {
        $systemPrompt = <<<PROMPT
You are an expert sports training planner.
Return only valid JSON.
Create a 7-day weekly plan for a real user with a fitness goal.
Use this exact shape:
{
  "goal": "bulk|cut|maintain",
  "days": [
        {
            "day": "Monday",
            "focus": "...",
            "durationMinutes": 45,
            "intensity": "low|moderate|high",
            "exercises": [
                {"name": "...", "sets": 3, "reps": "8-10", "rest": "60s", "notes": "..."}
            ],
            "notes": "..."
        }
  ],
  "notes": ["..."]
}
Rules:
- Exactly 7 day entries from Monday to Sunday.
- Use recovery-aware pacing based on activity level, age, and workout mode.
- If workout_mode is custom, keep the structure familiar to the user and adapt load instead of replacing the split.
- If the user lists sports, bias accessory work, conditioning, or mobility toward those demands.
- Keep focus concise but specific enough for a frontend card.
- Notes must contain exactly 2 short strings.
- Match the plan to the user's activity level, preferred workout mode, sports background, and custom routine when available.
- If the user is in custom workout mode, preserve their training identity while adapting load and structure.
PROMPT;

        $userPrompt = implode("\n", [
            $this->profilePromptBuilder->build($user),
            'Weekly plan target goal: ' . $goal,
            'Build a Monday-to-Sunday plan that matches the profile context and the target goal.',
            'Prefer muscle-group based sessions, but keep sport-specific prep, mobility, and conditioning when the user profile suggests it.',
            'For advanced or high-activity users, increase density and specificity; for lower activity users, reduce total load and simplify the split.',
        ]);

        return $this->openAiClient->chatJson($systemPrompt, $userPrompt);
    }

    private function normalize(array $payload, string $goal): array
    {
        $days = $payload['days'] ?? [];

        if (!is_array($days)) {
            $days = [];
        }

        if (count($days) !== 7) {
            return $this->templateService->build($goal);
        }

        $normalizedDays = [];

        foreach ($days as $day) {
            if (!is_array($day) || !is_string($day['day'] ?? null) || !is_string($day['focus'] ?? null)) {
                continue;
            }

            $normalizedDays[] = [
                'day' => $day['day'],
                'focus' => $day['focus'],
                'durationMinutes' => isset($day['durationMinutes']) ? (int) $day['durationMinutes'] : 45,
                'intensity' => in_array($day['intensity'] ?? '', ['low', 'moderate', 'high'], true)
                    ? $day['intensity']
                    : 'moderate',
                'exercises' => is_array($day['exercises'] ?? null) ? array_values($day['exercises']) : [],
                'notes' => is_string($day['notes'] ?? null) ? $day['notes'] : '',
            ];
        }

        if (count($normalizedDays) !== 7) {
            return $this->templateService->build($goal);
        }

        $notes = $payload['notes'] ?? [];

        if (!is_array($notes) || count($notes) < 2) {
            $notes = [
                'Prioritize warm-up and cooldown every session.',
                'Adjust intensity if readiness is low.',
            ];
        }

        return [
            'goal' => in_array(($payload['goal'] ?? ''), ['bulk', 'cut', 'maintain'], true)
                ? $payload['goal']
                : $goal,
            'days' => $normalizedDays,
            'notes' => array_values(array_slice($notes, 0, 2)),
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
