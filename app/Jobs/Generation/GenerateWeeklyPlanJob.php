<?php

namespace App\Jobs\Generation;

use App\Models\User;
use App\Services\Generation\PlanGenerationStateService;
use App\Services\WeeklyPlans\WeeklyPlanService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class GenerateWeeklyPlanJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(
        public readonly int $userId,
        public readonly bool $finalStep = true,
    ) {
    }

    public function handle(
        WeeklyPlanService $weeklyPlanService,
        PlanGenerationStateService $generationStateService,
    ): void {
        $startedAt = microtime(true);

        Log::debug('GenerateWeeklyPlanJob started.', [
            'user_id' => $this->userId,
            'final_step' => $this->finalStep,
            'connection' => $this->connection,
            'queue' => $this->queue,
        ]);

        $user = User::query()->findOrFail($this->userId);

        $generationStateService->start(
            $user,
            'weekly_plan',
            'Generating your weekly plan...',
        );

        try {
            $planPayload = $weeklyPlanService->generateUsingAiOrFallback($user);
            $weeklyPlanService->saveForUser($user, $planPayload);

            Log::debug('GenerateWeeklyPlanJob saved plan.', [
                'user_id' => $user->id,
                'days_count' => is_array($planPayload['days'] ?? null) ? count($planPayload['days']) : null,
                'duration_ms' => (int) round((microtime(true) - $startedAt) * 1000),
            ]);
        } catch (Throwable $exception) {
            Log::error('GenerateWeeklyPlanJob failed.', [
                'user_id' => $this->userId,
                'duration_ms' => (int) round((microtime(true) - $startedAt) * 1000),
                'exception_class' => get_class($exception),
                'message' => $exception->getMessage(),
            ]);

            $generationStateService->fail(
                $user,
                'weekly_plan',
                'We could not generate the weekly plan right now.',
            );

            throw $exception;
        }

        if ($this->finalStep) {
            Log::debug('GenerateWeeklyPlanJob completed final step.', [
                'user_id' => $user->id,
                'duration_ms' => (int) round((microtime(true) - $startedAt) * 1000),
            ]);

            $generationStateService->clear($user);
            return;
        }

        Log::debug('GenerateWeeklyPlanJob completed and moving chain forward.', [
            'user_id' => $user->id,
            'duration_ms' => (int) round((microtime(true) - $startedAt) * 1000),
        ]);

        $generationStateService->progress(
            $user,
            'onboarding',
            'Weekly plan ready. Building your nutrition plan next...',
        );
    }
}
