<?php

namespace App\Http\Controllers;

use App\Jobs\Generation\GenerateWeeklyPlanJob;
use App\Http\Requests\WeeklyPlanRequest;
use App\Models\WeeklyPlan;
use App\Services\Generation\PlanGenerationStateService;
use App\Services\WeeklyPlans\WeeklyPlanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Inertia\Inertia;
use Inertia\Response;

class WeeklyPlanController extends Controller
{
    public function preview(
        Request $request,
        WeeklyPlanService $weeklyPlanService,
        PlanGenerationStateService $generationStateService,
    ): Response {
        $user = $request->user();
        $weeklyPlan = $weeklyPlanService->getForUser($user);

        if (!$weeklyPlan && in_array($user->generation_status, [PlanGenerationStateService::STATUS_IDLE, PlanGenerationStateService::STATUS_FAILED], true)) {
            $generationStateService->queue(
                $user,
                'weekly_plan',
                'Generating your weekly plan in the background.',
            );

            Bus::dispatch(new GenerateWeeklyPlanJob($user->id));
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

    public function store(WeeklyPlanRequest $request): RedirectResponse|JsonResponse
    {
        $user = $request->user();
        $goal = $request->string('goal')->toString();

        if ($goal === '') {
            $goal = (string) ($user->goal ?? 'maintain');
        }

        if ($request->filled('goal') && in_array($goal, ['bulk', 'cut', 'maintain'], true)) {
            $user->update(['goal' => $goal]);
        }

        Bus::dispatch(new GenerateWeeklyPlanJob($user->id));

        Inertia::flash('toast', [
            'type' => 'info',
            'message' => 'Weekly plan generation started. The dashboard will refresh when it is ready.',
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Weekly plan generation started.',
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
