import { Link, useForm } from '@inertiajs/react';
import {
    Apple,
    ArrowRight,
    BarChart3,
    BatteryCharging,
    CalendarDays,
    CheckCircle2,
    Dumbbell,
    LoaderCircle,
    Salad,
    Sparkles,
    Target,
} from 'lucide-react';
import { DashboardTopSummary } from '@/components/fitness/dashboard';
import { SetupLoading } from '@/components/fitness/shared';
import type { DashboardViewModel } from '@/types/fitness';

export type DashboardViewProps = DashboardViewModel;

export default function DashboardView({
    weeklyPlan,
    recommendation,
    nutritionPlan,
    macroSummary,
    currentDayLabel,
    generationState,
}: DashboardViewProps) {
    const weeklyPlanForm = useForm({
        goal: weeklyPlan?.goal ?? 'maintain',
    });

    const isGenerating =
        generationState?.status === 'queued' ||
        generationState?.status === 'processing';

    const readinessScore = recommendation?.readinessScore ?? null;
    const normalizedScore = Math.max(0, Math.min(100, readinessScore ?? 0));
    const circumference = 283;
    const strokeOffset =
        circumference - (normalizedScore / 100) * circumference;

    const currentDay = currentDayLabel ?? 'Monday';
    const weeklyDays = weeklyPlan?.days ?? [];
    const acceptedWorkoutPlan = weeklyPlan?.planned_workout ?? null;
    const acceptedNutritionPlan = weeklyPlan?.planned_nutrition ?? null;
    const acceptedWorkoutDay = acceptedWorkoutPlan?.day ?? currentDay;
    const todayWeeklyDay =
        weeklyDays.find((day) => day.day === currentDay) ?? null;
    const plannedWorkoutText =
        acceptedWorkoutPlan?.summary ??
        acceptedWorkoutPlan?.focus ??
        todayWeeklyDay?.focus ??
        recommendation?.planned ??
        'Pending check-in';
    const adjustedWorkoutText =
        acceptedWorkoutPlan?.adjusted ??
        recommendation?.adjusted ??
        todayWeeklyDay?.focus ??
        'Plan will appear after a check-in or chat update.';

    const macroPercent = (current: number, target: number): number => {
        if (target <= 0) {
            return 0;
        }

        return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
    };

    const status = (() => {
        if (readinessScore === null) {
            return {
                title: 'Complete your daily check-in',
                body: "Share today's sleep, stress, and soreness to generate your personalized recommendation.",
                stroke: '#d946ef',
            };
        }

        if (readinessScore >= 80) {
            return {
                title: 'High readiness. You can train hard today.',
                body: 'Keep technical quality and recovery standards while pushing intensity.',
                stroke: '#22c55e',
            };
        }

        if (readinessScore >= 50) {
            return {
                title: 'Moderate readiness. Pace your session.',
                body: 'Run a productive session with controlled volume.',
                stroke: '#eab308',
            };
        }

        return {
            title: 'Low readiness. Recovery comes first.',
            body: 'Use mobility work and active recovery before high intensity.',
            stroke: '#ef4444',
        };
    })();

    if (weeklyPlanForm.processing || isGenerating) {
        const loadingSteps =
            generationState?.kind === 'recovery_plan'
                ? [
                      'Rebuilding your check-in response...',
                      'Updating nutrition guidance...',
                      'Refreshing your workout structure...',
                      'Finalizing the recovery flow...',
                  ]
                : generationState?.kind === 'onboarding'
                  ? [
                        'Reading your onboarding profile...',
                        'Structuring your weekly training plan...',
                        'Building nutrition targets...',
                        'Refreshing the dashboard when it is ready...',
                    ]
                  : generationState?.kind === 'check_in'
                    ? [
                          'Reading your sleep and recovery signals...',
                          'Scoring training readiness...',
                          'Preparing your recommendation...',
                          'Refreshing the dashboard when it is ready...',
                      ]
                    : generationState?.kind === 'nutrition_plan'
                      ? [
                            'Checking your profile context...',
                            'Building daily calorie targets...',
                            'Structuring meals and macros...',
                            'Refreshing the dashboard when it is ready...',
                        ]
                      : [
                            'Reading your fitness profile...',
                            'Structuring the training week...',
                            'Balancing recovery and intensity...',
                            'Refreshing the dashboard when it is ready...',
                        ];

        return (
            <SetupLoading
                title={
                    generationState?.kind === 'recovery_plan'
                        ? 'Rebuilding your recovery plan'
                        : generationState?.kind === 'onboarding'
                          ? 'Building your onboarding plans'
                          : generationState?.kind === 'check_in'
                            ? "Analyzing today's check-in"
                            : generationState?.kind === 'nutrition_plan'
                              ? 'Building your nutrition plan'
                              : 'Building your weekly plan'
                }
                steps={loadingSteps}
            />
        );
    }

    return (
        <div className="space-y-6">
            <DashboardTopSummary
                readinessScore={readinessScore}
                weeklyDaysCount={weeklyDays.length}
                entriesCount={macroSummary?.entriesCount ?? 0}
                recommendationAdjusted={recommendation?.adjusted}
                targetCalories={nutritionPlan?.targetCalories}
                hydrationLiters={nutritionPlan?.hydrationLiters}
                hasNutritionPlan={Boolean(nutritionPlan)}
                isGeneratingWeeklyPlan={weeklyPlanForm.processing}
                onRegenerateWeeklyPlan={() =>
                    weeklyPlanForm.post('/weekly-plans', {
                        preserveScroll: true,
                    })
                }
            />

            {macroSummary ? (
                <section className="glass-panel rounded-2xl p-6">
                    <div className="mb-4 flex items-center gap-3">
                        <h3 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                            <BarChart3 className="h-5 w-5 text-neon-blue" />
                            Daily macro summary
                        </h3>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {macroSummary.entriesCount > 0
                            ? `${macroSummary.entriesCount} meals saved today${macroSummary.latestMealName ? ` · latest: ${macroSummary.latestMealName}` : ''}`
                            : 'No meals saved yet today. Use Macros to analyze a meal photo.'}
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {[
                            {
                                label: 'Calories',
                                current: macroSummary.totals.calories,
                                target: macroSummary.targets.calories,
                                unit: '',
                                accent: '#f97316',
                            },
                            {
                                label: 'Protein',
                                current: macroSummary.totals.proteinGrams,
                                target: macroSummary.targets.proteinGrams,
                                unit: 'g',
                                accent: '#22c55e',
                            },
                            {
                                label: 'Carbs',
                                current: macroSummary.totals.carbsGrams,
                                target: macroSummary.targets.carbsGrams,
                                unit: 'g',
                                accent: '#3b82f6',
                            },
                            {
                                label: 'Fats',
                                current: macroSummary.totals.fatGrams,
                                target: macroSummary.targets.fatGrams,
                                unit: 'g',
                                accent: '#eab308',
                            },
                        ].map((item) => {
                            const percentage = macroPercent(
                                item.current,
                                item.target,
                            );

                            return (
                                <article
                                    key={item.label}
                                    className="rounded-xl border border-glass-border bg-background/40 p-4"
                                >
                                    <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                        {item.label}
                                    </p>
                                    <p className="mt-2 text-lg font-bold text-foreground">
                                        {item.current}
                                        {item.unit} / {item.target}
                                        {item.unit}
                                    </p>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-background/70">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: item.accent,
                                            }}
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {percentage}% of target
                                    </p>
                                </article>
                            );
                        })}
                    </div>
                </section>
            ) : null}

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <article className="glass-panel relative overflow-hidden rounded-2xl p-6 xl:col-span-2">
                    <div className="pointer-events-none absolute -top-5 -right-5 h-20 w-20 rounded-full bg-neon-pink/8 blur-xl sm:-top-8 sm:-right-8 sm:h-32 sm:w-32 sm:bg-neon-pink/15 sm:blur-2xl" />

                    <h2 className="mb-4 flex items-center gap-2 font-semibold text-muted-foreground">
                        <BatteryCharging className="h-5 w-5 text-neon-pink" />
                        Today status
                    </h2>

                    <div className="flex flex-col items-center justify-center gap-8 py-4 md:flex-row">
                        <div className="relative flex h-32 w-32 items-center justify-center">
                            <svg
                                className="h-full w-full -rotate-90"
                                viewBox="0 0 100 100"
                            >
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="oklch(0.35 0 0)"
                                    strokeWidth="8"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke={status.stroke}
                                    strokeWidth="8"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeOffset}
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>

                            <div className="absolute flex flex-col items-center">
                                <span className="font-['Orbitron',sans-serif] text-4xl font-bold text-foreground">
                                    {readinessScore ?? '--'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    %
                                </span>
                            </div>
                        </div>

                        <div className="w-full max-w-sm">
                            <p className="text-lg font-medium text-foreground">
                                {status.title}
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {status.body}
                            </p>

                            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <Link
                                    href="/check-in"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-neon-pink px-4 py-2 text-sm font-semibold text-white shadow-[0_0_15px_rgba(217,70,239,0.3)] transition hover:bg-fuchsia-600"
                                >
                                    Check-in
                                    <ArrowRight className="h-4 w-4" />
                                </Link>

                                <Link
                                    href="/nutrition"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-glass-border bg-background/40 px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-neon-blue hover:text-neon-blue"
                                >
                                    Nutrition
                                    <Apple className="h-4 w-4" />
                                </Link>

                                <button
                                    type="button"
                                    onClick={() =>
                                        weeklyPlanForm.post('/weekly-plans', {
                                            preserveScroll: true,
                                        })
                                    }
                                    disabled={weeklyPlanForm.processing}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-neon-blue/50 bg-neon-blue/10 px-4 py-2 text-sm font-semibold text-neon-blue transition hover:bg-neon-blue/20 disabled:opacity-60 sm:col-span-2"
                                >
                                    {weeklyPlanForm.processing ? (
                                        <>
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                            Generating weekly plan...
                                        </>
                                    ) : (
                                        <>
                                            Regenerate weekly plan
                                            <CalendarDays className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </article>

                <article className="glass-panel rounded-2xl p-6">
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-muted-foreground">
                        <Target className="h-5 w-5 text-neon-blue" />
                        At a glance
                    </h3>

                    <div className="space-y-3">
                        <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                            <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                Readiness
                            </p>
                            <p className="mt-2 text-xl font-bold text-foreground">
                                {readinessScore ?? '--'}
                            </p>
                        </div>

                        <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                            <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                Training focus
                            </p>
                            <p className="mt-2 text-sm font-semibold text-foreground">
                                {recommendation?.adjusted ?? 'Pending check-in'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                                <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                    Calories
                                </p>
                                <p className="mt-2 text-lg font-bold text-foreground">
                                    {nutritionPlan?.targetCalories ?? '--'}
                                </p>
                            </div>
                            <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                                <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                    Hydration
                                </p>
                                <p className="mt-2 text-lg font-bold text-foreground">
                                    {nutritionPlan?.hydrationLiters ?? '--'}
                                    {nutritionPlan ? 'L' : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                </article>
            </section>

            <section className="glass-panel rounded-2xl p-6">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                    <Dumbbell className="h-5 w-5 text-yellow-400" />
                    Today workout decision
                </h3>

                {recommendation ? (
                    <div className="space-y-4">
                        {acceptedWorkoutPlan ? (
                            <div className="rounded-xl border border-neon-blue/40 bg-neon-blue/10 p-4 text-sm text-neon-blue">
                                Accepted chat update active for{' '}
                                {acceptedWorkoutDay}.
                            </div>
                        ) : null}

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-glass-border bg-background/50 p-5">
                                <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
                                    Planned
                                </p>
                                <p className="mt-2 text-sm text-foreground">
                                    {plannedWorkoutText}
                                </p>
                            </div>
                            <div className="rounded-xl border border-glass-border bg-background/50 p-5">
                                <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
                                    Adjusted
                                </p>
                                <p className="mt-2 text-sm text-foreground">
                                    {adjustedWorkoutText}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl border-l-4 border-neon-pink bg-background/50 p-5">
                            <p className="mb-4 text-foreground/90 italic">
                                "
                                {recommendation.message ??
                                    'Balanced day: train with intent and recover with consistency.'}
                                "
                            </p>
                            <div className="space-y-2">
                                {(
                                    acceptedWorkoutPlan?.exercises ??
                                    recommendation.workoutJson.exercises ??
                                    []
                                ).map((item) => (
                                    <div
                                        key={item.name}
                                        className="flex items-center gap-2 rounded-lg border border-glass-border bg-background/50 p-2 text-sm text-foreground"
                                    >
                                        <CheckCircle2 className="h-4 w-4 text-neon-pink" />
                                        {item.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-glass-border bg-background/40 p-5 text-sm text-muted-foreground">
                        No recommendation is available yet. Complete your daily
                        check-in to populate this panel.
                    </div>
                )}
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <article className="glass-panel rounded-2xl p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                        <Salad className="h-5 w-5 text-green-500" />
                        Nutrition snapshot
                    </h3>

                    {nutritionPlan ? (
                        <div className="space-y-4">
                            <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                                <p className="text-sm font-semibold text-foreground">
                                    {nutritionPlan.title}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {nutritionPlan.summary}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                                    <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                        Protein
                                    </p>
                                    <p className="mt-2 text-xl font-bold text-foreground">
                                        {
                                            nutritionPlan.macroTargets
                                                .proteinGrams
                                        }
                                        g
                                    </p>
                                </div>
                                <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                                    <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                        Carbs
                                    </p>
                                    <p className="mt-2 text-xl font-bold text-foreground">
                                        {nutritionPlan.macroTargets.carbsGrams}g
                                    </p>
                                </div>
                                <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                                    <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                        Fats
                                    </p>
                                    <p className="mt-2 text-xl font-bold text-foreground">
                                        {nutritionPlan.macroTargets.fatGrams}g
                                    </p>
                                </div>
                                <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                                    <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                        Hydration
                                    </p>
                                    <p className="mt-2 text-xl font-bold text-foreground">
                                        {nutritionPlan.hydrationLiters}L
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-xl border-l-4 border-green-500 bg-background/50 p-4">
                                <p className="text-sm text-foreground italic">
                                    "{nutritionPlan.nutritionTip}"
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-glass-border bg-background/40 p-5 text-sm text-muted-foreground">
                            Generate your nutrition plan to show macros and
                            recovery guidance.
                        </div>
                    )}
                </article>

                <article className="glass-panel rounded-2xl p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                        <Sparkles className="h-5 w-5 text-neon-blue" />
                        System summary
                    </h3>

                    <div className="space-y-3 text-sm text-muted-foreground">
                        <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                            <p className="font-semibold text-foreground">
                                Weekly plan
                            </p>
                            <p className="mt-1">
                                {weeklyPlan
                                    ? acceptedWorkoutPlan
                                        ? 'Training structure includes an accepted chat update.'
                                        : 'Training structure is loaded and active.'
                                    : 'No weekly plan yet. Generate one to define the week.'}
                            </p>
                        </div>

                        <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                            <p className="font-semibold text-foreground">
                                Recovery signal
                            </p>
                            <p className="mt-1">
                                {recommendation
                                    ? 'Latest check-in is already connected to workout adjustment.'
                                    : 'Complete check-in to activate daily adjustment.'}
                            </p>
                        </div>

                        <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                            <p className="font-semibold text-foreground">
                                Nutrition alignment
                            </p>
                            <p className="mt-1">
                                {recommendation?.nutritionTip
                                    ? recommendation.nutritionTip
                                    : 'Nutrition guidance appears here after check-in or plan generation.'}
                            </p>
                        </div>
                    </div>
                </article>
            </section>

            <section className="glass-panel rounded-2xl p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                        <CalendarDays className="h-5 w-5 text-neon-blue" />
                        Weekly map
                    </h3>

                    <Link
                        href="/weekly-plan-preview"
                        className="inline-flex items-center gap-2 rounded-lg border border-neon-blue/40 bg-neon-blue/10 px-3 py-1.5 text-xs font-semibold text-neon-blue transition hover:bg-neon-blue/20"
                    >
                        Open weekly plan
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                {weeklyDays.length ? (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {weeklyDays.map((day) => {
                            const isCurrent = day.day === currentDay;
                            const isAcceptedDay =
                                acceptedWorkoutPlan?.day === day.day;
                            const displayFocus =
                                isAcceptedDay && acceptedWorkoutPlan?.focus
                                    ? acceptedWorkoutPlan.focus
                                    : day.focus;

                            return (
                                <article
                                    key={day.day}
                                    className={[
                                        'rounded-xl border p-4',
                                        isCurrent
                                            ? 'border-neon-blue/35 bg-neon-blue/8 shadow-[0_0_14px_rgba(59,130,246,0.14)]'
                                            : 'border-glass-border bg-background/35',
                                    ].join(' ')}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-semibold text-foreground">
                                            {day.day}
                                        </p>
                                        {isCurrent ? (
                                            <span className="rounded-full bg-neon-blue/15 px-2 py-0.5 text-[11px] font-semibold text-neon-blue uppercase">
                                                Today
                                            </span>
                                        ) : null}
                                    </div>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {displayFocus}
                                    </p>

                                    <p className="mt-2 text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                                        {day.intensity ?? 'moderate'} •{' '}
                                        {day.durationMinutes ?? 45} min
                                    </p>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-glass-border bg-background/40 p-5 text-sm text-muted-foreground">
                        No weekly plan is available yet. Use the "Regenerate
                        weekly plan" button to create one.
                    </div>
                )}
            </section>
        </div>
    );
}
