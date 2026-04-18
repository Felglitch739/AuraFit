import { Head, useForm } from '@inertiajs/react';
import {
    Apple,
    ChefHat,
    LoaderCircle,
    UtensilsCrossed,
    Droplets,
    Flame,
    SunMedium,
    Salad,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import type {
    NutritionViewModel,
    NutritionMeal,
    FitnessGoal,
} from '@/types/fitness';

type NutritionPageProps = NutritionViewModel;

const goalLabelMap = {
    bulk: 'Bulk',
    cut: 'Cut',
    maintain: 'Maintain',
} as const;

export default function NutritionPage({
    goal,
    nutritionPlan,
    nutritionTip,
    currentDayLabel,
    nutritionFormDefaults,
}: NutritionPageProps) {
    const form = useForm({
        goal: nutritionFormDefaults?.goal ?? goal ?? 'maintain',
    });
    type NutritionGoal = FitnessGoal;
    const [expandedMealKey, setExpandedMealKey] = React.useState<string | null>(
        null,
    );

    const currentDay = currentDayLabel ?? 'Monday';

    const summaryTiles = React.useMemo(() => {
        if (!nutritionPlan) {
            return [];
        }

        return [
            {
                label: 'Calories',
                value: `${nutritionPlan.targetCalories}`,
                icon: Flame,
            },
            {
                label: 'Protein',
                value: `${nutritionPlan.macroTargets.proteinGrams}g`,
                icon: Salad,
            },
            {
                label: 'Carbs',
                value: `${nutritionPlan.macroTargets.carbsGrams}g`,
                icon: SunMedium,
            },
            {
                label: 'Hydration',
                value: `${nutritionPlan.hydrationLiters}L`,
                icon: Droplets,
            },
        ];
    }, [nutritionPlan]);

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post('/nutrition', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Nutrition plan generated successfully.');
            },
            onError: () => {
                toast.error('Could not generate the nutrition plan.');
            },
        });
    };

    return (
        <>
            <Head title="Nutrition" />

            <div className="space-y-6">
                <section className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                    <article className="glass-panel rounded-2xl p-6 md:p-8">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-neon-blue/15 p-3">
                                <UtensilsCrossed className="h-6 w-6 text-neon-blue" />
                            </div>
                            <div>
                                <h1 className="font-['Orbitron',sans-serif] text-2xl font-bold text-foreground md:text-3xl">
                                    Nutrition
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Personalized diet structure for your
                                    training and recovery.
                                </p>
                            </div>
                        </div>

                        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
                            <div className="rounded-2xl border border-glass-border bg-background/40 p-4">
                                <label className="block text-sm font-semibold text-muted-foreground">
                                    Goal
                                </label>
                                <select
                                    value={form.data.goal}
                                    onChange={(event) =>
                                        form.setData(
                                            'goal',
                                            event.target.value as NutritionGoal,
                                        )
                                    }
                                    className="mt-2 w-full rounded-lg border border-glass-border bg-background/60 p-3 text-foreground"
                                >
                                    <option value="bulk">Bulk</option>
                                    <option value="cut">Cut</option>
                                    <option value="maintain">Maintain</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-neon-blue to-cyan-500 py-3.5 text-base font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] transition hover:from-cyan-400 hover:to-teal-400 disabled:opacity-60"
                            >
                                {form.processing ? (
                                    <>
                                        <LoaderCircle className="h-5 w-5 animate-spin" />
                                        Generating diet plan...
                                    </>
                                ) : (
                                    <>
                                        Generate menu
                                        <ChefHat className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </article>

                    <article className="glass-panel rounded-2xl p-6 md:p-8">
                        <div className="flex h-full min-h-70 flex-col items-center justify-center text-center">
                            <Apple className="mb-4 h-16 w-16 text-neon-blue" />
                            <h2 className="text-lg font-semibold text-foreground">
                                {nutritionPlan
                                    ? nutritionPlan.title
                                    : 'Backend ready for nutrition'}
                            </h2>
                            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                                {nutritionPlan
                                    ? nutritionPlan.summary
                                    : 'Generate your weekly nutrition plan and reload the page to keep it persisted from the database.'}
                            </p>

                            {nutritionTip ? (
                                <div className="mt-5 rounded-xl border border-glass-border bg-background/50 px-4 py-3 text-left text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2 text-foreground">
                                        <Salad className="h-4 w-4 text-neon-pink" />
                                        Nutrition tip
                                    </div>
                                    <p className="mt-1">{nutritionTip}</p>
                                </div>
                            ) : null}
                        </div>
                    </article>
                </section>

                {nutritionPlan ? (
                    <>
                        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            {summaryTiles.map((tile) => {
                                const Icon = tile.icon;

                                return (
                                    <article
                                        key={tile.label}
                                        className="rounded-2xl border border-glass-border bg-background/40 p-4 shadow-sm"
                                    >
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Icon className="h-4 w-4" />
                                            <span className="text-xs tracking-[0.25em] uppercase">
                                                {tile.label}
                                            </span>
                                        </div>
                                        <p className="mt-3 text-2xl font-bold text-foreground">
                                            {tile.value}
                                        </p>
                                    </article>
                                );
                            })}
                        </section>

                        <section className="glass-panel rounded-2xl p-6">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                                        <UtensilsCrossed className="h-5 w-5 text-neon-pink" />
                                        7-day nutrition structure
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {goal
                                            ? `Goal: ${goalLabelMap[goal]}`
                                            : 'Goal: maintain'}{' '}
                                        · Today: {currentDay}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {nutritionPlan.days.map((day) => {
                                    const isCurrent = day.day === currentDay;

                                    return (
                                        <div
                                            key={day.day}
                                            className={[
                                                'rounded-2xl border p-4 transition-all',
                                                isCurrent
                                                    ? 'border-neon-blue bg-neon-blue/10 shadow-[0_0_20px_rgba(59,130,246,0.12)]'
                                                    : 'border-glass-border bg-background/40',
                                            ].join(' ')}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="font-semibold text-foreground">
                                                    {day.day}
                                                </p>
                                                {isCurrent ? (
                                                    <span className="rounded-full bg-neon-blue/20 px-2 py-0.5 text-xs text-neon-blue">
                                                        Today
                                                    </span>
                                                ) : null}
                                            </div>

                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {day.focus}
                                            </p>

                                            <div className="mt-4 space-y-2">
                                                {day.meals.map(
                                                    (meal: NutritionMeal) =>
                                                        (() => {
                                                            const mealKey = `${day.day}-${meal.time}-${meal.name}`;
                                                            const isExpanded =
                                                                expandedMealKey ===
                                                                mealKey;

                                                            return (
                                                                <button
                                                                    key={
                                                                        mealKey
                                                                    }
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setExpandedMealKey(
                                                                            isExpanded
                                                                                ? null
                                                                                : mealKey,
                                                                        )
                                                                    }
                                                                    className="w-full rounded-xl border border-glass-border bg-background/50 p-3 text-left transition hover:border-neon-blue/60"
                                                                >
                                                                    <div className="flex items-center justify-between gap-3">
                                                                        <p className="text-xs tracking-[0.24em] text-muted-foreground uppercase">
                                                                            {
                                                                                meal.time
                                                                            }
                                                                        </p>
                                                                        <span className="text-xs text-neon-blue">
                                                                            {
                                                                                meal.calories
                                                                            }{' '}
                                                                            kcal
                                                                        </span>
                                                                    </div>
                                                                    <p className="mt-1 text-sm font-medium text-foreground">
                                                                        {
                                                                            meal.name
                                                                        }
                                                                    </p>
                                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                                        {
                                                                            meal.description
                                                                        }
                                                                    </p>

                                                                    <div
                                                                        className={[
                                                                            'mt-3 overflow-hidden rounded-lg border border-glass-border bg-background/60 transition-all duration-200',
                                                                            isExpanded
                                                                                ? 'max-h-56 p-3 opacity-100'
                                                                                : 'max-h-0 p-0 opacity-0',
                                                                        ].join(
                                                                            ' ',
                                                                        )}
                                                                    >
                                                                        <p className="text-[11px] tracking-[0.24em] text-muted-foreground uppercase">
                                                                            Example
                                                                            platillos
                                                                        </p>
                                                                        <div className="mt-2 space-y-1 text-xs text-foreground">
                                                                            {(meal
                                                                                .examples
                                                                                ?.length
                                                                                ? meal.examples
                                                                                : [
                                                                                      meal.name,
                                                                                  ]
                                                                            ).map(
                                                                                (
                                                                                    example,
                                                                                ) => (
                                                                                    <p
                                                                                        key={
                                                                                            example
                                                                                        }
                                                                                    >
                                                                                        •{' '}
                                                                                        {
                                                                                            example
                                                                                        }
                                                                                    </p>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })(),
                                                )}
                                            </div>

                                            <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                                                {day.notes.map((note) => (
                                                    <p key={note}>• {note}</p>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="glass-panel rounded-2xl p-6">
                            <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                                <Apple className="h-5 w-5 text-green-500" />
                                Nutrition notes
                            </h3>
                            <div className="grid gap-3 md:grid-cols-3">
                                {nutritionPlan.notes.map((note) => (
                                    <div
                                        key={note}
                                        className="rounded-xl border border-glass-border bg-background/40 p-4 text-sm text-muted-foreground"
                                    >
                                        {note}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                ) : (
                    <section className="glass-panel rounded-2xl p-6 text-sm text-muted-foreground">
                        Generate a nutrition plan to see weekly meals, macros,
                        and hydration targets here.
                    </section>
                )}
            </div>
        </>
    );
}

NutritionPage.layout = {
    breadcrumbs: [
        {
            title: 'Nutrition',
            href: '/nutrition',
        },
    ],
};
