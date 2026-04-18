import { Head, Link } from '@inertiajs/react';
import { BarChart3, CalendarDays, Flame, Salad, Utensils } from 'lucide-react';

type ProgressEntry = {
    id: number;
    mealName: string;
    mealLabel?: string | null;
    summary: string;
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    fiberGrams?: number | null;
    sugarGrams?: number | null;
    sodiumMg?: number | null;
    createdAt?: string | null;
};

type ProgressPageProps = {
    dateLabel: string;
    totals: {
        calories: number;
        proteinGrams: number;
        carbsGrams: number;
        fatGrams: number;
    };
    targets: {
        calories: number;
        proteinGrams: number;
        carbsGrams: number;
        fatGrams: number;
    };
    entries: ProgressEntry[];
};

function percent(current: number, target: number): number {
    if (target <= 0) {
        return 0;
    }

    return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

function MacroBar({
    label,
    current,
    target,
    accent,
}: {
    label: string;
    current: number;
    target: number;
    accent: string;
}) {
    const value = percent(current, target);

    return (
        <div className="rounded-xl border border-glass-border bg-background/40 p-4">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                    {label}
                </p>
                <p className="text-sm font-semibold text-foreground">
                    {current} / {target}
                    {label === 'Calories' ? '' : 'g'}
                </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-background/70">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${value}%`,
                        backgroundColor: accent,
                    }}
                />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
                {value}% of target
            </p>
        </div>
    );
}

export default function ProgressPage({
    dateLabel,
    totals,
    targets,
    entries,
}: ProgressPageProps) {
    return (
        <>
            <Head title="Daily Progress" />

            <div className="space-y-6">
                <section className="glass-panel rounded-2xl p-6 md:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="font-['Orbitron',sans-serif] text-2xl font-bold text-foreground md:text-3xl">
                                Daily progress
                            </h1>
                            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                <CalendarDays className="h-4 w-4" />
                                {dateLabel}
                            </p>
                        </div>

                        <Link
                            href="/macros"
                            className="rounded-lg border border-glass-border bg-background/40 px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-neon-blue hover:text-neon-blue"
                        >
                            Add another meal photo
                        </Link>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <MacroBar
                            label="Calories"
                            current={totals.calories}
                            target={targets.calories}
                            accent="#f97316"
                        />
                        <MacroBar
                            label="Protein"
                            current={totals.proteinGrams}
                            target={targets.proteinGrams}
                            accent="#22c55e"
                        />
                        <MacroBar
                            label="Carbs"
                            current={totals.carbsGrams}
                            target={targets.carbsGrams}
                            accent="#3b82f6"
                        />
                        <MacroBar
                            label="Fats"
                            current={totals.fatGrams}
                            target={targets.fatGrams}
                            accent="#eab308"
                        />
                    </div>
                </section>

                <section className="glass-panel rounded-2xl p-6">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                        <Utensils className="h-5 w-5 text-neon-blue" />
                        Saved meals and nutrition facts
                    </h2>

                    {entries.length ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {entries.map((entry) => (
                                <article
                                    key={entry.id}
                                    className="rounded-xl border border-glass-border bg-background/40 p-5"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-base font-semibold text-foreground">
                                                {entry.mealName}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {entry.mealLabel ??
                                                    'Unlabeled meal'}
                                                {entry.createdAt
                                                    ? ` · ${entry.createdAt}`
                                                    : ''}
                                            </p>
                                        </div>
                                        <div className="inline-flex items-center gap-1 rounded-full border border-glass-border bg-background/60 px-2.5 py-1 text-xs text-muted-foreground">
                                            <Flame className="h-3.5 w-3.5 text-orange-400" />
                                            {entry.calories} kcal
                                        </div>
                                    </div>

                                    <p className="mt-3 text-sm text-muted-foreground">
                                        {entry.summary}
                                    </p>

                                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                        <div className="rounded-lg border border-glass-border bg-background/60 px-3 py-2 text-foreground">
                                            Protein: {entry.proteinGrams}g
                                        </div>
                                        <div className="rounded-lg border border-glass-border bg-background/60 px-3 py-2 text-foreground">
                                            Carbs: {entry.carbsGrams}g
                                        </div>
                                        <div className="rounded-lg border border-glass-border bg-background/60 px-3 py-2 text-foreground">
                                            Fats: {entry.fatGrams}g
                                        </div>
                                        <div className="rounded-lg border border-glass-border bg-background/60 px-3 py-2 text-foreground">
                                            Fiber: {entry.fiberGrams ?? '--'}
                                            {entry.fiberGrams !== null &&
                                            entry.fiberGrams !== undefined
                                                ? 'g'
                                                : ''}
                                        </div>
                                        <div className="rounded-lg border border-glass-border bg-background/60 px-3 py-2 text-foreground">
                                            Sugar: {entry.sugarGrams ?? '--'}
                                            {entry.sugarGrams !== null &&
                                            entry.sugarGrams !== undefined
                                                ? 'g'
                                                : ''}
                                        </div>
                                        <div className="rounded-lg border border-glass-border bg-background/60 px-3 py-2 text-foreground">
                                            Sodium: {entry.sodiumMg ?? '--'}
                                            {entry.sodiumMg !== null &&
                                            entry.sodiumMg !== undefined
                                                ? 'mg'
                                                : ''}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-glass-border bg-background/40 p-5 text-sm text-muted-foreground">
                            No meals saved for today yet. Open Macro Counter and
                            analyze your first meal photo.
                        </div>
                    )}
                </section>

                <section className="glass-panel rounded-2xl p-6">
                    <h3 className="mb-3 flex items-center gap-2 text-sm tracking-[0.22em] text-muted-foreground uppercase">
                        <BarChart3 className="h-4 w-4" />
                        Next step
                    </h3>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <Link
                            href="/dashboard"
                            className="rounded-xl border border-glass-border bg-background/40 px-4 py-3 text-center text-sm font-semibold text-foreground transition hover:border-neon-pink hover:text-neon-pink"
                        >
                            Go to Dashboard
                        </Link>
                        <Link
                            href="/check-in"
                            className="rounded-xl border border-glass-border bg-background/40 px-4 py-3 text-center text-sm font-semibold text-foreground transition hover:border-neon-blue hover:text-neon-blue"
                        >
                            Open Check-in
                        </Link>
                        <Link
                            href="/nutrition"
                            className="rounded-xl border border-glass-border bg-background/40 px-4 py-3 text-center text-sm font-semibold text-foreground transition hover:border-neon-blue hover:text-neon-blue"
                        >
                            Open Nutrition
                        </Link>
                    </div>
                </section>
            </div>
        </>
    );
}

ProgressPage.layout = {
    breadcrumbs: [
        {
            title: 'Progress',
            href: '/progress',
        },
    ],
};
