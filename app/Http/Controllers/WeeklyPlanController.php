<?php

namespace App\Http\Controllers;

use App\Http\Requests\WeeklyPlanRequest;
use App\Models\WeeklyPlan;
use App\Services\WeeklyPlans\WeeklyPlanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class WeeklyPlanController extends Controller
{
    public function preview(Request $request, WeeklyPlanService $weeklyPlanService): Response
    {
        $user = $request->user();
        $weeklyPlan = $weeklyPlanService->getForUser($user);

        if (!$weeklyPlan) {
            try {
                $weeklyPlan = DB::transaction(function () use ($user, $weeklyPlanService) {
                    $planPayload = $weeklyPlanService->generateUsingAiOrFallback($user);

                    return $weeklyPlanService->saveForUser($user, $planPayload);
                });
            } catch (Throwable) {
                return Inertia::render('weekly-plan', [
                    'weeklyPlan' => null,
                    'generationError' => 'We could not generate your weekly plan right now. Please try again from Dashboard.',
                ]);
            }
        }

        return Inertia::render('weekly-plan', [
            'weeklyPlan' => $weeklyPlan?->plan_json,
            'generationError' => null,
        ]);
    }

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

        try {
            $weeklyPlan = DB::transaction(function () use ($user, $weeklyPlanService) {
                $planPayload = $weeklyPlanService->generateUsingAiOrFallback($user);

                return $weeklyPlanService->saveForUser($user, $planPayload);
            });
        } catch (Throwable) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'We could not generate the weekly plan right now. No fallback content was created.',
                ], 500);
            }

            return back()->withErrors([
                'weekly_plan' => 'We could not generate the weekly plan right now. No fallback content was created.',
            ]);
        }

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

}
