import { Head } from '@inertiajs/react';
import { AlertCircle, Apple, ChefHat } from 'lucide-react';

type NutritionPageProps = {
    goal?: 'bulk' | 'cut' | 'maintain' | null;
    nutritionTip?: string | null;
    hasRecommendation?: boolean;
};

const goalLabelMap: Record<NonNullable<NutritionPageProps['goal']>, string> = {
    bulk: 'Bulk',
    cut: 'Cut',
    maintain: 'Maintain',
};

export default function NutritionPage({
    goal,
    nutritionTip,
    hasRecommendation,
}: NutritionPageProps) {
    return (
        <>
            <Head title="Nutrition" />

            <div className="space-y-6">
                <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <article className="glass-panel rounded-2xl p-6 md:col-span-1">
                        <h1 className="font-['Orbitron',sans-serif] text-2xl font-bold text-foreground">
                            Nutrition
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            This section is prepared for backend integration.
                        </p>

                        <div className="mt-6 space-y-3">
                            <label className="block text-sm font-semibold text-muted-foreground">
                                Goal
                            </label>
                            <select
                                disabled
                                className="w-full cursor-not-allowed rounded-lg border border-glass-border bg-background/60 p-3 text-foreground opacity-70"
                            >
                                <option>
                                    {goal
                                        ? goalLabelMap[goal]
                                        : 'Body recomposition'}
                                </option>
                            </select>

                            <label className="block pt-2 text-sm font-semibold text-muted-foreground">
                                Diet type
                            </label>
                            <select
                                disabled
                                className="w-full cursor-not-allowed rounded-lg border border-glass-border bg-background/60 p-3 text-foreground opacity-70"
                            >
                                <option>Balanced omnivore</option>
                                <option>Vegetarian</option>
                                <option>Vegan</option>
                            </select>

                            <button
                                type="button"
                                disabled
                                className="mt-3 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border-2 border-neon-blue py-3 font-bold text-neon-blue opacity-70"
                            >
                                Generate menu
                                <ChefHat className="h-4 w-4" />
                            </button>
                        </div>
                    </article>

                    <article className="glass-panel rounded-2xl p-6 md:col-span-2">
                        <div className="flex h-full min-h-70 flex-col items-center justify-center text-center">
                            <Apple className="mb-4 h-16 w-16 text-muted-foreground" />
                            <h2 className="text-lg font-semibold text-foreground">
                                {nutritionTip
                                    ? 'Personalized nutrition tip available'
                                    : 'Backend pending for nutrition'}
                            </h2>
                            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                                {nutritionTip
                                    ? nutritionTip
                                    : 'The nutrition screen is styled and ready, but no backend endpoint exists yet for nutrition generation.'}
                            </p>

                            <div className="mt-5 rounded-xl border border-glass-border bg-background/50 px-4 py-3 text-left text-sm text-muted-foreground">
                                <div className="flex items-center gap-2 text-foreground">
                                    <AlertCircle className="h-4 w-4 text-neon-pink" />
                                    Implemented now:
                                </div>
                                <p className="mt-1">
                                    {hasRecommendation
                                        ? 'This recommendation comes from your latest check-in stored in database.'
                                        : 'Check-in is fully connected to backend via POST /api/checkin.'}
                                </p>
                            </div>
                        </div>
                    </article>
                </section>
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
