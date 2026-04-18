<?php

namespace App\Http\Controllers;

use App\Http\Requests\DailyLogRequest;
use App\Services\Checkins\DailyCheckinService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
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

    public function store(DailyLogRequest $request, DailyCheckinService $dailyCheckinService): RedirectResponse
    {
        $payload = [
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ];

        $dailyLog = $dailyCheckinService->createDailyLog($payload);
        $recommendationPayload = $dailyCheckinService->generateRecommendationUsingAiOrFallback(
            $dailyLog,
            $request->user(),
        );
        $dailyCheckinService->saveRecommendation($dailyLog, $recommendationPayload);

        return redirect()->route('check-in.index');
    }

    public function mock(DailyLogRequest $request, DailyCheckinService $dailyCheckinService): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'sleep_hours' => ['required', 'numeric', 'min:0', 'max:24'],
            'stress_level' => ['required', 'integer', 'min:1', 'max:10'],
            'soreness' => ['required', 'integer', 'min:1', 'max:10'],
        ]);

        $dailyLog = $dailyCheckinService->createDailyLog($validated);
        $recommendationPayload = $dailyCheckinService->generateRecommendationUsingAiOrFallback(
            $dailyLog,
            $dailyLog->user,
        );
        $recommendation = $dailyCheckinService->saveRecommendation($dailyLog, $recommendationPayload);

        return response()->json([
            'message' => 'Daily check-in saved successfully.',
            'daily_log' => $dailyLog,
            'mock_recommendation' => $dailyCheckinService->toCheckinResult($recommendation),
        ], 201);
    }
}
