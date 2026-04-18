<?php

namespace App\Http\Controllers;

use App\Http\Requests\WeeklyPlanRequest;
use App\Models\WeeklyPlan;
use App\Services\WeeklyPlans\WeeklyPlanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WeeklyPlanController extends Controller
{
    public function index(Request $request, WeeklyPlanService $weeklyPlanService): Response
    {
        $user = $request->user();
        $weeklyPlan = $weeklyPlanService->getForUser($user);

        return Inertia::render('dashboard', [
            'weeklyPlan' => $weeklyPlan?->plan_json,
            'weeklyPlanGoal' => $weeklyPlan?->plan_json['goal'] ?? $user->goal,
        ]);
    }

    public function store(WeeklyPlanRequest $request, WeeklyPlanService $weeklyPlanService): RedirectResponse|JsonResponse
    {
        $user = $request->user();
        $goal = $request->string('goal')->toString();

        if ($goal === '') {
            $goal = (string) ($user->goal ?? 'maintain');
        }

        if ($request->filled('goal') && in_array($goal, ['bulk', 'cut', 'maintain'], true)) {
            $user->update(['goal' => $goal]);
        }

        $planPayload = $request->boolean('use_mock')
            ? $weeklyPlanService->generateMock($goal)
            : $weeklyPlanService->generateUsingAiOrFallback($goal);

        $weeklyPlan = $weeklyPlanService->saveForUser($user, $planPayload);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Weekly plan generated successfully.',
                'data' => $weeklyPlan->plan_json,
            ]);
        }

        return redirect()->route('dashboard');
    }

    public function show(Request $request, WeeklyPlan $weeklyPlan): JsonResponse
    {
        abort_unless($weeklyPlan->user_id === $request->user()->id, 403);

        return response()->json([
            'data' => $weeklyPlan->plan_json,
        ]);
    }

    public function mock(Request $request, WeeklyPlanService $weeklyPlanService): JsonResponse
    {
        $validated = $request->validate([
            'goal' => ['nullable', 'in:bulk,cut,maintain'],
        ]);

        $goal = $validated['goal'] ?? 'maintain';

        return response()->json([
            'data' => $weeklyPlanService->generateMock($goal),
        ]);
    }
}
