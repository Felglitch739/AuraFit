import type { NutritionDay, NutritionMeal } from '@/types/fitness';

type NutritionDayCardProps = {
    day: NutritionDay;
    currentDay: string;
    expandedMealKey: string | null;
    onToggleMeal: (mealKey: string | null) => void;
};

export default function NutritionDayCard({
    day,
    currentDay,
    expandedMealKey,
    onToggleMeal,
}: NutritionDayCardProps) {
    const isCurrent = day.day === currentDay;

    return (
        <div
            className={[
                'rounded-2xl border p-4 transition-all',
                isCurrent
                    ? 'border-neon-blue bg-neon-blue/10 shadow-[0_0_20px_rgba(59,130,246,0.12)]'
                    : 'border-glass-border bg-background/40',
            ].join(' ')}
        >
            <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-foreground">{day.day}</p>
                {isCurrent ? (
                    <span className="rounded-full bg-neon-blue/20 px-2 py-0.5 text-xs text-neon-blue">
                        Today
                    </span>
                ) : null}
            </div>

            <p className="mt-2 text-sm text-muted-foreground">{day.focus}</p>

            <div className="mt-4 space-y-2">
                {day.meals.map((meal: NutritionMeal) => {
                    const mealKey = `${day.day}-${meal.time}-${meal.name}`;
                    const isExpanded = expandedMealKey === mealKey;

                    return (
                        <button
                            key={mealKey}
                            type="button"
                            onClick={() => onToggleMeal(isExpanded ? null : mealKey)}
                            className="w-full rounded-xl border border-glass-border bg-background/50 p-3 text-left transition hover:border-neon-blue/60"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs tracking-[0.24em] text-muted-foreground uppercase">
                                    {meal.time}
                                </p>
                                <span className="text-xs text-neon-blue">
                                    {meal.calories} kcal
                                </span>
                            </div>
                            <p className="mt-1 text-sm font-medium text-foreground">
                                {meal.name}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {meal.description}
                            </p>

                            <div
                                className={[
                                    'mt-3 overflow-hidden rounded-lg border border-glass-border bg-background/60 transition-all duration-200',
                                    isExpanded
                                        ? 'max-h-56 p-3 opacity-100'
                                        : 'max-h-0 p-0 opacity-0',
                                ].join(' ')}
                            >
                                <p className="text-[11px] tracking-[0.24em] text-muted-foreground uppercase">
                                    Example platillos
                                </p>
                                <div className="mt-2 space-y-1 text-xs text-foreground">
                                    {(meal.examples?.length
                                        ? meal.examples
                                        : [meal.name]
                                    ).map((example) => (
                                        <p key={example}>• {example}</p>
                                    ))}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                {day.notes.map((note) => (
                    <p key={note}>• {note}</p>
                ))}
            </div>
        </div>
    );
}
