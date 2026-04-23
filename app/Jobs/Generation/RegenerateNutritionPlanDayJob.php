<?php

namespace App\Jobs\Generation;

use App\Models\DailyLog;
use App\Models\User;
use App\Services\Generation\PlanGenerationStateService;
use App\Services\Nutrition\NutritionPlanService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use RuntimeException;
use Throwable;

class RegenerateNutritionPlanDayJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(
        public readonly int $userId,
        public readonly int $dailyLogId,
        public readonly bool $finalStep = false,
    ) {
    }

    public function handle(
        NutritionPlanService $nutritionPlanService,
        PlanGenerationStateService $generationStateService,
    ): void {
        $dailyLog = DailyLog::query()->findOrFail($this->dailyLogId);
        $user = User::query()->findOrFail($this->userId);
        $recommendation = $dailyLog->recommendation;

        if (!$recommendation) {
            throw new RuntimeException('Recommendation must exist before regenerating nutrition.');
        }

        $generationStateService->start(
            $user,
            'recovery_plan',
            'Rebuilding your nutrition plan for today...',
        );

        try {
            $nutritionPlanService->regenerateCurrentDay(
                $user,
                $dailyLog,
                $recommendation,
                now()->englishDayOfWeek,
            );
        } catch (Throwable $exception) {
            $generationStateService->fail(
                $user,
                'recovery_plan',
                'We could not regenerate today\'s nutrition plan right now.',
            );

            throw $exception;
        }

        if ($this->finalStep) {
            $generationStateService->clear($user);
            return;
        }

        $generationStateService->progress(
            $user,
            'recovery_plan',
            'Nutrition update ready. Rebuilding your workout structure...',
        );
    }
}
