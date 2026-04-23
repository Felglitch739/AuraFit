<?php

namespace App\Http\Controllers;

use App\Http\Requests\NutritionPlanRequest;
use App\Models\FoodEntry;
use App\Jobs\Generation\GenerateNutritionPlanJob;
use App\Services\Generation\PlanGenerationStateService;
use App\Services\Checkins\DailyCheckinService;
use App\Services\Nutrition\NutritionPlanService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Bus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(
        Request $request,
        DailyCheckinService $dailyCheckinService,
        NutritionPlanService $nutritionPlanService,
        PlanGenerationStateService $generationStateService,
    ): Response {
        $user = $request->user();
        $weeklyPlan = $user->weeklyPlan?->plan_json;
        $latestDailyLog = $user->dailyLogs()->latest()->first();
        $latestRecommendation = $latestDailyLog?->recommendation;
        $nutritionPlan = $nutritionPlanService->getForUser($user);
        $nutritionPlanData = $nutritionPlanService->toViewModel($nutritionPlan);
        $weeklyPlanDays = is_array($weeklyPlan['days'] ?? null) ? $weeklyPlan['days'] : [];
        $today = Carbon::today()->toDateString();

        $foodEntriesToday = FoodEntry::query()
            ->where('user_id', $user->id)
            ->whereDate('logged_on', $today)
            ->get();

        $macroSummary = [
            'entriesCount' => $foodEntriesToday->count(),
            'latestMealName' => $foodEntriesToday->sortByDesc('created_at')->first()?->meal_name,
            'totals' => [
                'calories' => (int) $foodEntriesToday->sum('calories'),
                'proteinGrams' => (int) $foodEntriesToday->sum('protein_grams'),
                'carbsGrams' => (int) $foodEntriesToday->sum('carbs_grams'),
                'fatGrams' => (int) $foodEntriesToday->sum('fat_grams'),
            ],
            'targets' => [
                'calories' => (int) ($nutritionPlanData['targetCalories'] ?? 2200),
                'proteinGrams' => (int) ($nutritionPlanData['macroTargets']['proteinGrams'] ?? 140),
                'carbsGrams' => (int) ($nutritionPlanData['macroTargets']['carbsGrams'] ?? 250),
                'fatGrams' => (int) ($nutritionPlanData['macroTargets']['fatGrams'] ?? 70),
            ],
        ];

        $dashboardSummary = [
            'headline' => $latestRecommendation
                ? 'Your training, recovery, and nutrition are aligned for today.'
                : 'Your system is ready. Complete a check-in to activate the full summary.',
            'description' => $this->buildDashboardDescription($weeklyPlanDays, $latestRecommendation, $nutritionPlanData),
            'status' => $latestRecommendation
                ? ($latestRecommendation->readiness_score >= 70 ? 'ready' : 'recovery')
                : 'building',
            'cards' => [
                [
                    'label' => 'Weekly plan',
                    'value' => $weeklyPlan ? 'Ready' : 'Missing',
                    'detail' => $weeklyPlan ? sprintf('%d training days loaded', count($weeklyPlanDays)) : 'Generate a plan to populate the week.',
                ],
                [
                    'label' => 'Readiness',
                    'value' => $latestRecommendation ? (string) $latestRecommendation->readiness_score : '--',
                    'detail' => $latestRecommendation ? 'Latest check-in is driving your session.' : 'Complete the daily check-in first.',
                ],
                [
                    'label' => 'Nutrition',
                    'value' => $nutritionPlanData ? 'Ready' : 'Missing',
                    'detail' => $nutritionPlanData ? sprintf('%d kcal target', (int) $nutritionPlanData['targetCalories']) : 'Generate a diet plan to lock it in.',
                ],
                [
                    'label' => 'Check-in',
                    'value' => $latestDailyLog ? 'Saved' : 'Pending',
                    'detail' => $latestDailyLog ? 'Your latest recovery state is recorded.' : 'Sleep, stress, and soreness are still pending.',
                ],
            ],
        ];

        return Inertia::render('dashboard', [
            'weeklyPlan' => is_array($weeklyPlan) ? $weeklyPlan : null,
            'dailyCheckIn' => $dailyCheckinService->toDailyCheckInValues($latestDailyLog),
            'recommendation' => $dailyCheckinService->toDashboardRecommendation($latestRecommendation),
            'nutritionPlan' => $nutritionPlanData,
            'macroSummary' => $macroSummary,
            'currentDayLabel' => Carbon::now()->englishDayOfWeek,
            'dashboardSummary' => $dashboardSummary,
            'generationState' => $generationStateService->toViewModel($user),
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
            ],
        ]);
    }

    public function storeNutrition(
        NutritionPlanRequest $request,
    ): JsonResponse|RedirectResponse {
        $user = $request->user();

        if ($request->filled('goal') && in_array($request->string('goal')->toString(), ['bulk', 'cut', 'maintain'], true)) {
            $user->update(['goal' => $request->string('goal')->toString()]);
        }

        $latestDailyLog = $user->dailyLogs()->latest()->first();
        $latestRecommendation = $latestDailyLog?->recommendation;

        Bus::dispatch(new GenerateNutritionPlanJob($user->id, $latestDailyLog?->id, $latestRecommendation?->id));

        Inertia::flash('toast', [
            'type' => 'info',
            'message' => 'Nutrition plan generation started. The dashboard will refresh when it is ready.',
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Nutrition plan generation started.',
            ]);
        }

        return redirect()->route('nutrition');
    }

    private function buildDashboardDescription(
        array $weeklyPlanDays,
        ?object $latestRecommendation,
        ?array $nutritionPlan,
    ): string {
        $summaryParts = [];

        if ($weeklyPlanDays !== []) {
            $summaryParts[] = sprintf('Weekly plan loaded with %d days', count($weeklyPlanDays));
        } else {
            $summaryParts[] = 'No weekly plan yet';
        }

        if ($latestRecommendation) {
            $summaryParts[] = sprintf('readiness at %d%%', (int) $latestRecommendation->readiness_score);
        } else {
            $summaryParts[] = 'daily check-in pending';
        }

        if (is_array($nutritionPlan)) {
            $summaryParts[] = sprintf('nutrition target %d kcal', (int) ($nutritionPlan['targetCalories'] ?? 0));
        } else {
            $summaryParts[] = 'nutrition plan not generated yet';
        }

        return implode(' · ', $summaryParts);
    }
}
