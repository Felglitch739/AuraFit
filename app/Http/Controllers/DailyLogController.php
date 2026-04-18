<?php

namespace App\Http\Controllers;

use App\Http\Requests\DailyLogRequest;
use App\Services\Checkins\DailyCheckinService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

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
        try {
            DB::transaction(function () use ($request, $dailyCheckinService): void {
                $payload = [
                    ...$request->validated(),
                    'user_id' => $request->user()->id,
                ];

                $dailyLog = $dailyCheckinService->createDailyLog($payload);
                $recommendationPayload = $dailyCheckinService->generateRecommendationUsingAi(
                    $dailyLog,
                    $request->user(),
                );
                $dailyCheckinService->saveRecommendation($dailyLog, $recommendationPayload);
            });
        } catch (Throwable) {
            return back()->withErrors([
                'check_in' => 'We could not generate your recommendation right now. No fallback content was created.',
            ])->withInput();
        }

        return redirect()->route('check-in.index');
    }

    public function reduceLoad(Request $request, DailyCheckinService $dailyCheckinService): RedirectResponse
    {
        $user = $request->user();
        $latestDailyLog = $user->dailyLogs()->latest()->first();

        if (!$latestDailyLog) {
            return redirect()->route('check-in.index');
        }

        try {
            DB::transaction(function () use ($dailyCheckinService, $latestDailyLog, $user): void {
                $recommendationPayload = $dailyCheckinService->generateRecommendationUsingAi(
                    $latestDailyLog,
                    $user,
                    'reduced',
                );
                $dailyCheckinService->saveRecommendation($latestDailyLog, $recommendationPayload);
            });
        } catch (Throwable) {
            return back()->withErrors([
                'check_in' => 'We could not regenerate your reduced-load recommendation right now. No fallback content was created.',
            ]);
        }

        return redirect()->route('check-in.index')->with('success', 'Today\'s load has been reduced and regenerated.');
    }
}
