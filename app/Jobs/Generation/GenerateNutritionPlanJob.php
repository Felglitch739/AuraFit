<?php

namespace App\Jobs\Generation;

use App\Models\DailyLog;
use App\Models\Recommendation;
use App\Models\User;
use App\Services\Generation\PlanGenerationStateService;
use App\Services\Nutrition\NutritionPlanService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class GenerateNutritionPlanJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(
        public readonly int $userId,
        public readonly ?int $dailyLogId = null,
        public readonly ?int $recommendationId = null,
        public readonly bool $finalStep = true,
    ) {
    }

    public function handle(
        NutritionPlanService $nutritionPlanService,
        PlanGenerationStateService $generationStateService,
    ): void {
        $user = User::query()->findOrFail($this->userId);
        $dailyLog = $this->dailyLogId ? DailyLog::query()->find($this->dailyLogId) : null;
        $recommendation = $this->recommendationId ? Recommendation::query()->find($this->recommendationId) : null;

        $generationStateService->start(
            $user,
            'nutrition_plan',
            'Generating your nutrition plan...',
        );

        try {
            $nutritionPayload = $nutritionPlanService->generateUsingAiOrFallback(
                $user,
                $dailyLog,
                $recommendation,
            );

            $nutritionPlanService->saveForUser(
                $user,
                $nutritionPayload,
                $dailyLog,
                $recommendation,
            );
        } catch (Throwable $exception) {
            $generationStateService->fail(
                $user,
                'nutrition_plan',
                'We could not generate the nutrition plan right now.',
            );

            throw $exception;
        }

        if ($this->finalStep) {
            $generationStateService->clear($user);
            return;
        }

        $generationStateService->progress(
            $user,
            'onboarding',
            'Nutrition plan ready. Finalizing your setup...',
        );
    }
}
