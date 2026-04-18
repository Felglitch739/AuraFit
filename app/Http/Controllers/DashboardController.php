<?php

namespace App\Http\Controllers;

use App\Services\Checkins\DailyCheckinService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request, DailyCheckinService $dailyCheckinService): Response
    {
        $user = $request->user();
        $weeklyPlan = $user->weeklyPlan?->plan_json;
        $latestDailyLog = $user->dailyLogs()->latest()->first();
        $latestRecommendation = $latestDailyLog?->recommendation;

        return Inertia::render('dashboard', [
            'weeklyPlan' => is_array($weeklyPlan) ? $weeklyPlan : null,
            'dailyCheckIn' => $dailyCheckinService->toDailyCheckInValues($latestDailyLog),
            'recommendation' => $dailyCheckinService->toDashboardRecommendation($latestRecommendation),
            'currentDayLabel' => Carbon::now()->englishDayOfWeek,
        ]);
    }

    public function nutrition(Request $request): Response
    {
        $user = $request->user();
        $latestDailyLog = $user->dailyLogs()->latest()->first();
        $latestRecommendation = $latestDailyLog?->recommendation;

        return Inertia::render('nutrition', [
            'goal' => $user->goal,
            'nutritionTip' => $latestRecommendation?->nutrition_tip,
            'hasRecommendation' => $latestRecommendation !== null,
        ]);
    }
}
