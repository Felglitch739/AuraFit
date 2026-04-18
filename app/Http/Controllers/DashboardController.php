<?php

namespace App\Http\Controllers;

use App\Services\Checkins\DailyCheckinService;
use App\Services\Nutrition\NutritionPlanService;
use Carbon\Carbon;
use App\Http\Requests\NutritionPlanRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
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

    public function nutrition(Request $request, NutritionPlanService $nutritionPlanService): Response
    {
        $user = $request->user();
        $latestDailyLog = $user->dailyLogs()->latest()->first();
        $latestRecommendation = $latestDailyLog?->recommendation;
        $nutritionPlan = $nutritionPlanService->getForUser($user);

        return Inertia::render('nutrition', [
            'goal' => $user->goal,
            'nutritionPlan' => $nutritionPlanService->toViewModel($nutritionPlan),
            'nutritionTip' => $nutritionPlan?->nutrition_json['nutritionTip'] ?? $latestRecommendation?->nutrition_tip,
            'hasNutritionPlan' => $nutritionPlan !== null,
            'currentDayLabel' => Carbon::now()->englishDayOfWeek,
            'nutritionFormDefaults' => [
                'goal' => $user->goal ?? 'maintain',
                'use_mock' => false,
            ],
        ]);
    }

    public function storeNutrition(
        NutritionPlanRequest $request,
        NutritionPlanService $nutritionPlanService,
    ): RedirectResponse|JsonResponse {
        $user = $request->user();

        if ($request->filled('goal') && in_array($request->string('goal')->toString(), ['bulk', 'cut', 'maintain'], true)) {
            $user->update(['goal' => $request->string('goal')->toString()]);
        }

        $latestDailyLog = $user->dailyLogs()->latest()->first();
        $latestRecommendation = $latestDailyLog?->recommendation;

        $nutritionPayload = $request->boolean('use_mock')
            ? $nutritionPlanService->generateMock($user, $latestDailyLog, $latestRecommendation)
            : $nutritionPlanService->generateUsingAiOrFallback($user, $latestDailyLog, $latestRecommendation);

        $nutritionPlan = $nutritionPlanService->saveForUser(
            $user,
            $nutritionPayload,
            $latestDailyLog,
            $latestRecommendation,
        );

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Nutrition plan generated successfully.',
                'data' => $nutritionPlan->nutrition_json,
            ]);
        }

        return redirect()->route('nutrition');
    }
}
