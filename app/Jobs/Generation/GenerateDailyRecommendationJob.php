<?php

namespace App\Jobs\Generation;

use App\Models\DailyLog;
use App\Models\User;
use App\Services\Checkins\DailyCheckinService;
use App\Services\Generation\PlanGenerationStateService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class GenerateDailyRecommendationJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(
        public readonly int $dailyLogId,
        public readonly int $userId,
        public readonly string $trainingLoadMode = 'normal',
        public readonly bool $finalStep = true,
    ) {
    }

    public function handle(
        DailyCheckinService $dailyCheckinService,
        PlanGenerationStateService $generationStateService,
    ): void {
        $dailyLog = DailyLog::query()->findOrFail($this->dailyLogId);
        $user = User::query()->findOrFail($this->userId);

        $generationStateService->start(
            $user,
            'check_in',
            'Generating your training recommendation...',
        );

        try {
            $recommendationPayload = $dailyCheckinService->generateRecommendationUsingAi(
                $dailyLog,
                $user,
                $this->trainingLoadMode,
            );

            $dailyCheckinService->saveRecommendation($dailyLog, $recommendationPayload);
        } catch (Throwable $exception) {
            $generationStateService->fail(
                $user,
                'check_in',
                'We could not generate your recommendation right now.',
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
            'Recommendation ready. Rebuilding your nutrition and workout structure...',
        );
    }
}
