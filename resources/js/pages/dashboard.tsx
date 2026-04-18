import { Head, Link, useForm } from '@inertiajs/react';
import {
    Apple,
    ArrowRight,
    BatteryCharging,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Dumbbell,
    LoaderCircle,
    Sparkles,
    Salad,
    Target,
} from 'lucide-react';
import { dashboard } from '@/routes';
import type { DashboardViewModel } from '@/types/fitness';

type DashboardProps = DashboardViewModel;

export default function Dashboard({
    weeklyPlan,
    recommendation,
    nutritionPlan,
    currentDayLabel,
    dashboardSummary,
}: DashboardProps) {
    const weeklyPlanForm = useForm({
        goal: weeklyPlan?.goal ?? 'maintain',
    });

    const readinessScore = recommendation?.readinessScore ?? null;
    const normalizedScore = Math.max(0, Math.min(100, readinessScore ?? 0));
    const circumference = 283;
    const strokeOffset =
        circumference - (normalizedScore / 100) * circumference;

    const currentDay = currentDayLabel ?? 'Monday';
    const weeklyDays = weeklyPlan?.days ?? [];
    const summaryCards = dashboardSummary?.cards ?? [];

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

    return (
        <>
            <Head title="Dashboard" />
            <div className="space-y-6">
                <section className="glass-panel rounded-2xl p-6 md:p-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-glass-border bg-background/40 px-3 py-1 text-xs tracking-[0.28em] text-muted-foreground uppercase">
                                <ClipboardList className="h-3.5 w-3.5 text-neon-blue" />
                                Full system summary
                            </div>
                            <h1 className="font-['Orbitron',sans-serif] text-2xl font-bold text-foreground md:text-4xl">
                                {dashboardSummary?.headline ??
                                    'Your training system is coming together.'}
                            </h1>
                            <p className="mt-3 max-w-3xl text-sm text-muted-foreground md:text-base">
                                {dashboardSummary?.description ??
                                    'Complete your check-in, generate your weekly plan, and build nutrition around the same backend state.'}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-glass-border bg-background/50 px-4 py-3">
                            <p className="text-xs tracking-[0.24em] text-muted-foreground uppercase">
                                Status
                            </p>
                            <p className="mt-1 text-sm font-semibold text-foreground">
                                {dashboardSummary?.status === 'ready'
                                    ? 'Ready'
                                    : dashboardSummary?.status === 'recovery'
                                      ? 'Recovery mode'
                                      : 'Building'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {summaryCards.map((card) => (
                            <div
                                key={card.label}
                                className="rounded-xl border border-glass-border bg-background/40 p-4"
                            >
                                <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                    {card.label}
                                </p>
                                <p className="mt-2 text-2xl font-bold text-foreground">
                                    {card.value}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {card.detail}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <article className="glass-panel relative overflow-hidden rounded-2xl p-6 md:col-span-2">
                        <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-neon-pink/15 blur-2xl" />

                        <h2 className="mb-4 flex items-center gap-2 font-semibold text-muted-foreground">
                            <BatteryCharging className="h-5 w-5 text-neon-pink" />
                            Energy and readiness today
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

                            <div className="w-full max-w-xs">
                                <p className="text-lg font-medium text-foreground">
                                    {status.title}
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {status.body}
                                </p>
                                <div className="mt-4 grid grid-cols-1 gap-2">
                                    <Link
                                        href="/check-in"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-neon-pink px-4 py-2 text-sm font-semibold text-white shadow-[0_0_15px_rgba(217,70,239,0.3)] transition hover:bg-fuchsia-600"
                                    >
                                        Start check-in
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            weeklyPlanForm.post(
                                                '/weekly-plans',
                                                {
                                                    preserveScroll: true,
                                                },
                                            )
                                        }
                                        disabled={weeklyPlanForm.processing}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-neon-blue/50 bg-neon-blue/10 px-4 py-2 text-sm font-semibold text-neon-blue transition hover:bg-neon-blue/20 disabled:opacity-60"
                                    >
                                        {weeklyPlanForm.processing ? (
                                            <>
                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                                Generating plan...
                                            </>
                                        ) : (
                                            <>
                                                Generate weekly plan
                                                <CalendarDays className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>

                    <article className="glass-panel flex flex-col gap-4 rounded-2xl p-6">
                        <h3 className="flex items-center gap-2 font-semibold text-muted-foreground">
                            <Target className="h-5 w-5 text-neon-blue" />
                            Current focus
                        </h3>

                        <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                            <p className="font-semibold text-foreground">
                                {status.title}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Updated from your latest check-in and backend
                                recommendation.
                            </p>
                        </div>

                        <Link
                            href="/nutrition"
                            className="mt-auto inline-flex w-full items-center justify-center rounded-lg border border-glass-border px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-neon-blue hover:text-neon-blue"
                        >
                            Open nutrition page
                        </Link>
                    </article>
                </section>

                <section className="glass-panel rounded-2xl p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                        <CalendarDays className="h-5 w-5 text-neon-blue" />
                        Weekly plan structure
                    </h3>

                    {weeklyDays.length ? (
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {weeklyDays.map((day) => {
                                const isCurrent = day.day === currentDay;

                                return (
                                    <div
                                        key={day.day}
                                        className={[
                                            'rounded-xl border p-4 transition-all',
                                            isCurrent
                                                ? 'border-neon-pink bg-neon-pink/10 shadow-[0_0_20px_rgba(217,70,239,0.15)]'
                                                : 'border-glass-border bg-background/40',
                                        ].join(' ')}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-semibold text-foreground">
                                                {day.day}
                                            </p>
                                            {isCurrent ? (
                                                <span className="rounded-full bg-neon-pink/20 px-2 py-0.5 text-xs text-neon-pink">
                                                    Today
                                                </span>
                                            ) : null}
                                        </div>

                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {day.focus}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-glass-border bg-background/40 p-5 text-sm text-muted-foreground">
                            No weekly plan is available yet. Use the "Generate
                            weekly plan" button to create one.
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
                                            Calories
                                        </p>
                                        <p className="mt-2 text-xl font-bold text-foreground">
                                            {nutritionPlan.targetCalories}
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
                                Generate your nutrition plan to show calories,
                                macros, and recovery guidance here.
                            </div>
                        )}
                    </article>

                    <article className="glass-panel rounded-2xl p-6">
                        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                            <Sparkles className="h-5 w-5 text-neon-blue" />
                            Integration summary
                        </h3>

                        <div className="space-y-3 text-sm text-muted-foreground">
                            <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                                <p className="font-semibold text-foreground">
                                    Weekly plan
                                </p>
                                <p className="mt-1">
                                    {weeklyPlan
                                        ? 'Your training week is already loaded from the database.'
                                        : 'No weekly plan yet. Generate one to define the training structure.'}
                                </p>
                            </div>

                            <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                                <p className="font-semibold text-foreground">
                                    Check-in and recovery
                                </p>
                                <p className="mt-1">
                                    {recommendation
                                        ? 'Latest readiness and workout adjustment are connected to the dashboard.'
                                        : 'Complete the check-in to connect recovery with training decisions.'}
                                </p>
                            </div>

                            <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                                <p className="font-semibold text-foreground">
                                    Nutrition
                                </p>
                                <p className="mt-1">
                                    {nutritionPlan
                                        ? 'Nutrition is now part of the same live summary, so training and diet stay aligned.'
                                        : 'Nutrition remains ready to generate from the dedicated page.'}
                                </p>
                            </div>
                        </div>
                    </article>
                </section>

                <section className="glass-panel rounded-2xl p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                        <Dumbbell className="h-5 w-5 text-yellow-400" />
                        Planned vs adjusted muscle focus
                    </h3>

                    {recommendation ? (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl border border-glass-border bg-background/50 p-5">
                                    <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
                                        Planned
                                    </p>
                                    <p className="mt-2 text-sm text-foreground">
                                        {recommendation.planned}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-glass-border bg-background/50 p-5">
                                    <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
                                        Adjusted
                                    </p>
                                    <p className="mt-2 text-sm text-foreground">
                                        {recommendation.adjusted}
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
                            No recommendation is available yet. Complete your
                            daily check-in to populate this panel from backend
                            data.
                        </div>
                    )}
                </section>

                <section className="glass-panel rounded-2xl p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                        <Apple className="h-5 w-5 text-green-500" />
                        Nutrition insight
                    </h3>

                    {recommendation?.nutritionTip ? (
                        <div className="rounded-xl border-l-4 border-green-500 bg-background/50 p-5">
                            <p className="text-foreground italic">
                                "{recommendation.nutritionTip}"
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-glass-border bg-background/40 p-5 text-sm text-muted-foreground">
                            Complete your daily check-in to receive a
                            personalized nutrition recommendation based on your
                            current state.
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
