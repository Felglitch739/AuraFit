<?php

namespace App\Http\Controllers;

use App\Jobs\Generation\GenerateDailyRecommendationJob;
use App\Jobs\Generation\RegenerateNutritionPlanDayJob;
use App\Jobs\Generation\RegenerateWeeklyPlanDayJob;
use App\Http\Requests\DailyLogRequest;
use App\Services\Checkins\DailyCheckinService;
use App\Services\Generation\PlanGenerationStateService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DailyLogController extends Controller
{
    public function index(DailyCheckinService $dailyCheckinService): Response
    {
        $latestDailyLog = auth()->user()->dailyLogs()->latest()->first();
        $latestRecommendation = $latestDailyLog?->recommendation;

        return Inertia::render('check-in', [
            'checkinResult' => $dailyCheckinService->toCheckinResult($latestRecommendation),
            'checkinFormDefaults' => [
                'sleep_hours' => $latestDailyLog?->sleep_hours ?? 7,
                'soreness' => $latestDailyLog?->soreness ?? 3,
                'stress_level' => $latestDailyLog?->stress_level ?? 4,
            ],
        ]);
    }

    public function store(
        DailyLogRequest $request,
        DailyCheckinService $dailyCheckinService,
        PlanGenerationStateService $generationStateService,
    ): RedirectResponse {
        $dailyLog = DB::transaction(function () use ($request, $dailyCheckinService) {
            $payload = [
                ...$request->validated(),
                'user_id' => $request->user()->id,
            ];

            return $dailyCheckinService->createDailyLog($payload);
        });

        $generationStateService->queue(
            $request->user(),
            'check_in',
            'Generating your recommendation in the background.',
        );

        Bus::dispatch(new GenerateDailyRecommendationJob($dailyLog->id, $request->user()->id));

        Inertia::flash('toast', [
            'type' => 'info',
            'message' => 'Your check-in is being analyzed in the background. The page will refresh when the recommendation is ready.',
        ]);

        return redirect()->route('check-in.index');
    }

    public function reduceLoad(
        Request $request,
        PlanGenerationStateService $generationStateService,
    ): RedirectResponse {
        $user = $request->user();
        $latestDailyLog = $user->dailyLogs()->latest()->first();
        $currentDay = Carbon::now()->englishDayOfWeek;

        if (!$latestDailyLog) {
            return redirect()->route('check-in.index');
        }

        $generationStateService->queue(
            $user,
            'recovery_plan',
            'Rebuilding today\'s recommendation, nutrition, and workout structure in the background.',
        );

        Bus::chain([
            new GenerateDailyRecommendationJob($latestDailyLog->id, $user->id, 'reduced', false),
            new RegenerateNutritionPlanDayJob($user->id, $latestDailyLog->id, false),
            new RegenerateWeeklyPlanDayJob($user->id, $latestDailyLog->id, true),
        ])->dispatch();

        Inertia::flash('toast', [
            'type' => 'info',
            'message' => 'Reduced-load regeneration started. We will refresh the page when the updated plan is ready.',
        ]);

        return redirect()->route('check-in.index');
    }
}
