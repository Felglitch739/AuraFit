import { Head, useForm } from '@inertiajs/react';
import {
    Apple,
    ChefHat,
    Droplets,
    Flame,
    SunMedium,
    Salad,
    UtensilsCrossed,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import {
    NutritionDayCard,
    NutritionHeaderCard,
    NutritionNextStepLinks,
} from '@/components/fitness/nutrition';
import { NutritionLoading } from '@/components/fitness/shared';
import type { NutritionViewModel } from '@/types/fitness';

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
                label: 'Fats',
                value: `${nutritionPlan.macroTargets.fatGrams}g`,
                icon: ChefHat,
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
                <NutritionHeaderCard
                    goal={form.data.goal}
                    nutritionPlan={nutritionPlan}
                    nutritionTip={nutritionTip}
                    isSubmitting={form.processing}
                    onGoalChange={(value) => form.setData('goal', value)}
                    onSubmit={onSubmit}
                />

                {form.processing ? (
                    <NutritionLoading />
                ) : nutritionPlan ? (
                    <>
                        <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
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
                                {nutritionPlan.days.map((day) => (
                                    <NutritionDayCard
                                        key={day.day}
                                        day={day}
                                        currentDay={currentDay}
                                        expandedMealKey={expandedMealKey}
                                        onToggleMeal={(mealKey) =>
                                            setExpandedMealKey(mealKey)
                                        }
                                    />
                                ))}
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

                <NutritionNextStepLinks />
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
