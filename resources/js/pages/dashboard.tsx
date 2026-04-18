import { Head, Link, useForm } from '@inertiajs/react';
import {
    Apple,
    ArrowRight,
    BatteryCharging,
    CalendarDays,
    CheckCircle2,
    Dumbbell,
    LoaderCircle,
    Sparkles,
    Target,
} from 'lucide-react';
import { dashboard } from '@/routes';
import type { DashboardViewModel } from '@/types/fitness';

type DashboardProps = DashboardViewModel;

export default function Dashboard({
    weeklyPlan,
    recommendation,
    currentDayLabel,
}: DashboardProps) {
    const weeklyPlanForm = useForm({
        goal: weeklyPlan?.goal ?? 'maintain',
        use_mock: false,
    });

    const readinessScore = recommendation?.readinessScore ?? null;
    const normalizedScore = Math.max(0, Math.min(100, readinessScore ?? 0));
    const circumference = 283;
    const strokeOffset =
        circumference - (normalizedScore / 100) * circumference;

    const currentDay = currentDayLabel ?? 'Monday';
    const weeklyDays = weeklyPlan?.days ?? [];

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

                <section className="glass-panel rounded-2xl p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                        <Dumbbell className="h-5 w-5 text-yellow-400" />
                        Planned vs adjusted training
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
