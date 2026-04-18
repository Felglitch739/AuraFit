<?php

namespace App\Services\Ai;

use App\Models\User;
use Carbon\Carbon;
use RuntimeException;
use Throwable;

class CoachChatService
{
    public function __construct(
        private readonly OpenAiClientService $openAiClient,
        private readonly UserProfilePromptBuilder $profilePromptBuilder,
        private readonly PromptTemplateService $promptTemplateService,
    ) {
    }

    public function respond(User $user, string $message, array $history = []): array
    {
        $contextSnapshot = $this->buildContextSnapshot($user);

        try {
            $systemPrompt = $this->promptTemplateService->load('ai/chat.system.txt');
            $userPrompt = $this->promptTemplateService->render('ai/chat.user.txt', [
                'profile_context' => $this->profilePromptBuilder->build($user),
                'context_snapshot' => json_encode($contextSnapshot, JSON_UNESCAPED_SLASHES),
                'conversation_history' => $this->formatConversationHistory($history),
                'user_message' => trim($message),
            ]);

            $payload = $this->openAiClient->chatJson($systemPrompt, $userPrompt);

            return [
                'reply' => $this->extractReply($payload),
                'focusAreas' => $this->extractFocusAreas($payload),
                'context' => $contextSnapshot,
            ];
        } catch (Throwable) {
            return [
                'reply' => $this->fallbackReply($contextSnapshot),
                'focusAreas' => $this->fallbackFocusAreas($contextSnapshot),
                'context' => $contextSnapshot,
            ];
        }
    }

    public function buildContextSnapshot(User $user): array
    {
        $today = Carbon::now()->englishDayOfWeek;
        $dailyLog = $user->dailyLogs()->latest()->first();
        $recommendation = $dailyLog?->recommendation;

        $weeklyPlan = $user->weeklyPlan?->plan_json;
        $nutritionPlan = $user->nutritionPlan?->nutrition_json;

        $dayFocus = $this->resolveDayFocus($weeklyPlan, $today);

        return [
            'userName' => (string) ($user->name ?: 'Athlete'),
            'goal' => (string) ($user->goal ?: 'maintain'),
            'fitnessGoal' => (string) ($user->fitness_goal ?: 'unspecified'),
            'activityLevel' => (string) ($user->activity_level ?: 'unspecified'),
            'today' => [
                'day' => $today,
                'plannedSession' => (string) ($recommendation?->planned ?: $dayFocus),
                'adjustedSession' => $recommendation?->adjusted,
                'readinessScore' => $recommendation?->readiness_score,
                'sleepHours' => $dailyLog ? (float) $dailyLog->sleep_hours : null,
                'stressLevel' => $dailyLog ? (int) $dailyLog->stress_level : null,
                'soreness' => $dailyLog ? (int) $dailyLog->soreness : null,
            ],
            'nutrition' => [
                'targetCalories' => is_numeric($nutritionPlan['targetCalories'] ?? null) ? (int) $nutritionPlan['targetCalories'] : null,
                'hydrationLiters' => is_numeric($nutritionPlan['hydrationLiters'] ?? null) ? (float) $nutritionPlan['hydrationLiters'] : null,
                'proteinGrams' => is_numeric($nutritionPlan['macroTargets']['proteinGrams'] ?? null) ? (int) $nutritionPlan['macroTargets']['proteinGrams'] : null,
                'carbsGrams' => is_numeric($nutritionPlan['macroTargets']['carbsGrams'] ?? null) ? (int) $nutritionPlan['macroTargets']['carbsGrams'] : null,
                'fatGrams' => is_numeric($nutritionPlan['macroTargets']['fatGrams'] ?? null) ? (int) $nutritionPlan['macroTargets']['fatGrams'] : null,
                'nutritionTip' => is_string($nutritionPlan['nutritionTip'] ?? null)
                    ? $nutritionPlan['nutritionTip']
                    : (is_string($recommendation?->nutrition_tip) ? $recommendation->nutrition_tip : null),
            ],
            'mentalWellbeing' => [
                'coachingFocus' => $this->resolveCoachingFocus(
                    $dailyLog ? (int) $dailyLog->stress_level : null,
                    $recommendation?->readiness_score,
                ),
                'recoveryReminder' => $this->resolveRecoveryReminder($dailyLog ? (float) $dailyLog->sleep_hours : null),
            ],
        ];
    }

    private function formatConversationHistory(array $history): string
    {
        if ($history === []) {
            return 'No previous messages.';
        }

        $lines = [];

        foreach (array_slice($history, -8) as $item) {
            if (!is_array($item)) {
                continue;
            }

            $sender = ($item['sender'] ?? '') === 'ai' ? 'coach' : 'user';
            $text = is_string($item['text'] ?? null) ? trim($item['text']) : '';

            if ($text === '') {
                continue;
            }

            $lines[] = sprintf('%s: %s', $sender, preg_replace('/\s+/', ' ', $text) ?? $text);
        }

        return $lines !== [] ? implode("\n", $lines) : 'No previous messages.';
    }

    private function resolveDayFocus(mixed $weeklyPlan, string $day): string
    {
        if (!is_array($weeklyPlan) || !is_array($weeklyPlan['days'] ?? null)) {
            return 'Recovery-aware full body training';
        }

        foreach ($weeklyPlan['days'] as $entry) {
            if (!is_array($entry)) {
                continue;
            }

            if (($entry['day'] ?? null) === $day && is_string($entry['focus'] ?? null) && trim($entry['focus']) !== '') {
                return $entry['focus'];
            }
        }

        return 'Recovery-aware full body training';
    }

    private function extractReply(array $payload): string
    {
        $reply = is_string($payload['reply'] ?? null) ? trim($payload['reply']) : '';

        if ($reply === '') {
            throw new RuntimeException('Coach chat reply is empty.');
        }

        return $reply;
    }

    private function extractFocusAreas(array $payload): array
    {
        $areas = $payload['focusAreas'] ?? [];

        if (!is_array($areas)) {
            return [];
        }

        $normalized = [];

        foreach ($areas as $area) {
            if (!is_string($area) || trim($area) === '') {
                continue;
            }

            $normalized[] = $area;
        }

        return array_values(array_slice($normalized, 0, 3));
    }

    private function fallbackReply(array $contextSnapshot): string
    {
        $readiness = $contextSnapshot['today']['readinessScore'] ?? null;
        $stress = $contextSnapshot['today']['stressLevel'] ?? null;

        if (is_int($readiness) && $readiness < 50) {
            return 'Estoy contigo. Hoy vamos con una sesion mas ligera, enfocados en tecnica, movilidad y recuperacion para cuidar tu cuerpo y tu cabeza.';
        }

        if (is_int($stress) && $stress >= 7) {
            return 'Vamos paso a paso. Antes de entrenar fuerte, hagamos una pausa corta de respiracion y luego una sesion controlada para bajar carga mental y fisica.';
        }

        return 'Estoy contigo en esto. Puedes avanzar hoy con una sesion de calidad, buena hidratacion y una rutina breve de descarga mental al terminar.';
    }

    private function fallbackFocusAreas(array $contextSnapshot): array
    {
        $areas = ['training', 'nutrition', 'mental-recovery'];

        if (($contextSnapshot['today']['readinessScore'] ?? 100) < 60) {
            $areas = ['recovery', 'hydration', 'stress-management'];
        }

        return $areas;
    }

    private function resolveCoachingFocus(?int $stressLevel, ?int $readinessScore): string
    {
        if (is_int($stressLevel) && $stressLevel >= 7) {
            return 'Lower stress load first, then train with controlled effort.';
        }

        if (is_int($readinessScore) && $readinessScore < 50) {
            return 'Protect recovery and keep momentum with lighter, high-quality work.';
        }

        return 'Build consistency with quality reps and calm execution.';
    }

    private function resolveRecoveryReminder(?float $sleepHours): string
    {
        if ($sleepHours !== null && $sleepHours < 7.0) {
            return 'Prioritize sleep extension tonight and reduce unnecessary intensity today.';
        }

        return 'Keep hydration, post-workout nutrition, and a short decompression routine today.';
    }
}
