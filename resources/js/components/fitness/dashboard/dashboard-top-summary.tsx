import { Link } from '@inertiajs/react';
import {
    Apple,
    ArrowRight,
    BatteryCharging,
    CalendarDays,
    Target,
} from 'lucide-react';

type DashboardTopSummaryProps = {
    readinessScore: number | null;
    weeklyDaysCount: number;
    entriesCount: number;
    recommendationAdjusted?: string | null;
    targetCalories?: number | null;
    hydrationLiters?: number | null;
    hasNutritionPlan: boolean;
    isGeneratingWeeklyPlan: boolean;
    onRegenerateWeeklyPlan: () => void;
};

export default function DashboardTopSummary({
    readinessScore,
    weeklyDaysCount,
    entriesCount,
    recommendationAdjusted,
    targetCalories,
    hydrationLiters,
    hasNutritionPlan,
    isGeneratingWeeklyPlan,
    onRegenerateWeeklyPlan,
}: DashboardTopSummaryProps) {
    return (
        <section className="glass-panel rounded-2xl p-3 md:p-4">
            <div className="flex flex-col gap-3 md:grid md:grid-cols-[auto_1fr] md:items-stretch md:gap-3">
                <nav
                    className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:flex md:flex-wrap md:items-center md:gap-3"
                    aria-label="Quick actions"
                >
                    {[
                        {
                            label: 'Setup',
                            href: '/onboarding',
                            icon: Target,
                        },
                        {
                            label: 'Check-in',
                            href: '/check-in',
                            icon: BatteryCharging,
                        },
                        {
                            label: 'Nutrition',
                            href: '/nutrition',
                            icon: Apple,
                        },
                        {
                            label: 'Weekly Plan',
                            href: '/weekly-plan-preview',
                            icon: CalendarDays,
                        },
                    ].map((item) => {
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex flex-col items-center justify-center gap-1 rounded-xl border border-glass-border bg-background/40 px-2 py-2 text-center transition hover:border-neon-blue hover:text-neon-blue md:min-w-24 md:px-3"
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-[11px] font-medium text-muted-foreground">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="hidden md:grid md:grid-cols-3 md:gap-2">
                    <div className="rounded-xl border border-glass-border bg-background/40 px-3 py-2">
                        <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Readiness
                        </p>
                        <p className="mt-1 text-lg font-bold text-foreground">
                            {readinessScore ?? '--'}
                        </p>
                    </div>
                    <div className="rounded-xl border border-glass-border bg-background/40 px-3 py-2">
                        <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Week Days
                        </p>
                        <p className="mt-1 text-lg font-bold text-foreground">
                            {weeklyDaysCount}
                        </p>
                    </div>
                    <div className="rounded-xl border border-glass-border bg-background/40 px-3 py-2">
                        <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Meals Today
                        </p>
                        <p className="mt-1 text-lg font-bold text-foreground">
                            {entriesCount}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-6 xl:grid-cols-3">
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
                                    stroke={
                                        readinessScore === null
                                            ? '#d946ef'
                                            : readinessScore >= 80
                                              ? '#22c55e'
                                              : readinessScore >= 50
                                                ? '#eab308'
                                                : '#ef4444'
                                    }
                                    strokeWidth="8"
                                    strokeDasharray={283}
                                    strokeDashoffset={
                                        283 -
                                        ((Math.max(
                                            0,
                                            Math.min(100, readinessScore ?? 0),
                                        ) /
                                            100) *
                                            283)
                                    }
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
                                {readinessScore === null
                                    ? 'Complete your daily check-in'
                                    : readinessScore >= 80
                                      ? 'High readiness. You can train hard today.'
                                      : readinessScore >= 50
                                        ? 'Moderate readiness. Pace your session.'
                                        : 'Low readiness. Recovery comes first.'}
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {readinessScore === null
                                    ? "Share today's sleep, stress, and soreness to generate your personalized recommendation."
                                    : readinessScore >= 80
                                      ? 'Keep technical quality and recovery standards while pushing intensity.'
                                      : readinessScore >= 50
                                        ? 'Run a productive session with controlled volume.'
                                        : 'Use mobility work and active recovery before high intensity.'}
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
                                    onClick={onRegenerateWeeklyPlan}
                                    disabled={isGeneratingWeeklyPlan}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-neon-blue/50 bg-neon-blue/10 px-4 py-2 text-sm font-semibold text-neon-blue transition hover:bg-neon-blue/20 disabled:opacity-60 sm:col-span-2"
                                >
                                    {isGeneratingWeeklyPlan ? (
                                        <>
                                            <CalendarDays className="h-4 w-4 animate-spin" />
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
                                {recommendationAdjusted ?? 'Pending check-in'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                                <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                    Calories
                                </p>
                                <p className="mt-2 text-lg font-bold text-foreground">
                                    {targetCalories ?? '--'}
                                </p>
                            </div>
                            <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                                <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                    Hydration
                                </p>
                                <p className="mt-2 text-lg font-bold text-foreground">
                                    {hydrationLiters ?? '--'}
                                    {hasNutritionPlan ? 'L' : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </section>
    );
}