<?php

namespace App\Jobs\Generation;

use App\Models\DailyLog;
use App\Models\User;
use App\Services\Generation\PlanGenerationStateService;
use App\Services\WeeklyPlans\WeeklyPlanService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class RegenerateWeeklyPlanDayJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(
        public readonly int $userId,
        public readonly int $dailyLogId,
        public readonly bool $finalStep = true,
    ) {
    }

    public function handle(
        WeeklyPlanService $weeklyPlanService,
        PlanGenerationStateService $generationStateService,
    ): void {
        $dailyLog = DailyLog::query()->findOrFail($this->dailyLogId);
        $recommendation = $dailyLog->recommendation;
        $user = User::query()->findOrFail($this->userId);

        if (!$recommendation) {
            throw new \RuntimeException('Recommendation must exist before regenerating the weekly plan.');
        }

        $generationStateService->start(
            $user,
            'recovery_plan',
            'Rebuilding your workout structure for today...',
        );

        try {
            $weeklyPlanService->regenerateCurrentDayFromRecommendation(
                $user,
                $recommendation,
                now()->englishDayOfWeek,
            );
        } catch (Throwable $exception) {
            $generationStateService->fail(
                $user,
                'recovery_plan',
                'We could not regenerate today\'s workout structure right now.',
            );

            throw $exception;
        }

        if ($this->finalStep) {
            $generationStateService->clear($user);
        }
    }
}
