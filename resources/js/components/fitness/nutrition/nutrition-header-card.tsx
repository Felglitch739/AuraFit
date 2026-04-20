import { Apple, ChefHat, LoaderCircle, UtensilsCrossed } from 'lucide-react';
import type { FormEvent } from 'react';
import type { FitnessGoal, NutritionPlanData } from '@/types/fitness';

type NutritionHeaderCardProps = {
    goal: FitnessGoal;
    nutritionPlan?: NutritionPlanData | null;
    nutritionTip?: string | null;
    isSubmitting: boolean;
    onGoalChange: (value: FitnessGoal) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function NutritionHeaderCard({
    goal,
    nutritionPlan,
    nutritionTip,
    isSubmitting,
    onGoalChange,
    onSubmit,
}: NutritionHeaderCardProps) {
    return (
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
                            Personalized diet structure for your training and
                            recovery.
                        </p>
                    </div>
                </div>

                <form className="mt-8 space-y-5" onSubmit={onSubmit}>
                    <div className="rounded-2xl border border-glass-border bg-background/40 p-4">
                        <label className="block text-sm font-semibold text-muted-foreground">
                            Goal
                        </label>
                        <select
                            value={goal}
                            onChange={(event) =>
                                onGoalChange(event.target.value as FitnessGoal)
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
                        disabled={isSubmitting}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-neon-blue to-cyan-500 py-3.5 text-base font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] transition hover:from-cyan-400 hover:to-teal-400 disabled:opacity-60"
                    >
                        {isSubmitting ? (
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
                                <UtensilsCrossed className="h-4 w-4 text-neon-pink" />
                                Nutrition tip
                            </div>
                            <p className="mt-1">{nutritionTip}</p>
                        </div>
                    ) : null}
                </div>
            </article>
        </section>
    );
}
