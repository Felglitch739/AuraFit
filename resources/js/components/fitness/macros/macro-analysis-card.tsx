import { MessageCircle, Save, Sparkles, Utensils } from 'lucide-react';

export type MacroAnalysis = {
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
    recommendation: string;
    detectedItems?: string[];
    confidence?: number | null;
};

type MacroAnalysisCardProps = {
    analysis: MacroAnalysis;
    isSaving: boolean;
    onSaveMeal: () => void;
};

export default function MacroAnalysisCard({
    analysis,
    isSaving,
    onSaveMeal,
}: MacroAnalysisCardProps) {
    return (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <article className="glass-panel rounded-2xl p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                    <MessageCircle className="h-5 w-5 text-neon-pink" />
                    Chatbot recommendation
                </h2>

                <div className="space-y-3">
                    <div className="rounded-xl border border-glass-border bg-background/40 p-4 text-sm text-muted-foreground">
                        <p className="text-xs tracking-[0.22em] uppercase">
                            Detected meal
                        </p>
                        <p className="mt-1 text-base font-semibold text-foreground">
                            {analysis.mealName}
                        </p>
                        {analysis.mealLabel ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                                Label: {analysis.mealLabel}
                            </p>
                        ) : null}
                    </div>

                    <div className="rounded-xl border border-neon-pink/35 bg-neon-pink/10 p-4">
                        <p className="text-sm text-foreground">
                            {analysis.recommendation}
                        </p>
                    </div>

                    <div className="rounded-xl border border-glass-border bg-background/40 p-4 text-sm text-muted-foreground">
                        {analysis.summary}
                    </div>

                    {analysis.detectedItems?.length ? (
                        <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                            <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                Detected items
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {analysis.detectedItems.map((item) => (
                                    <span
                                        key={item}
                                        className="rounded-full border border-glass-border bg-background/60 px-2.5 py-1 text-xs text-foreground"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </article>

            <article className="glass-panel rounded-2xl p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Sparkles className="h-5 w-5 text-neon-blue" />
                    Nutrition facts (summary)
                </h2>

                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                        <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                            Calories
                        </p>
                        <p className="mt-2 text-xl font-bold text-foreground">
                            {analysis.calories}
                        </p>
                    </div>
                    <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                        <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                            Protein
                        </p>
                        <p className="mt-2 text-xl font-bold text-foreground">
                            {analysis.proteinGrams}g
                        </p>
                    </div>
                    <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                        <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                            Carbs
                        </p>
                        <p className="mt-2 text-xl font-bold text-foreground">
                            {analysis.carbsGrams}g
                        </p>
                    </div>
                    <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                        <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                            Fats
                        </p>
                        <p className="mt-2 text-xl font-bold text-foreground">
                            {analysis.fatGrams}g
                        </p>
                    </div>
                    <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                        <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                            Fiber
                        </p>
                        <p className="mt-2 text-xl font-bold text-foreground">
                            {analysis.fiberGrams ?? '--'}
                            {analysis.fiberGrams !== null &&
                            analysis.fiberGrams !== undefined
                                ? 'g'
                                : ''}
                        </p>
                    </div>
                    <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                        <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                            Sodium
                        </p>
                        <p className="mt-2 text-xl font-bold text-foreground">
                            {analysis.sodiumMg ?? '--'}
                            {analysis.sodiumMg !== null &&
                            analysis.sodiumMg !== undefined
                                ? 'mg'
                                : ''}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onSaveMeal}
                    disabled={isSaving}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-neon-pink to-fuchsia-600 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(217,70,239,0.35)] transition hover:from-fuchsia-500 hover:to-purple-500 disabled:opacity-60"
                >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save to daily progress'}
                </button>
            </article>
        </section>
    );
}

type MacroQuickLogEntry = {
    id: number;
    mealName: string;
    mealLabel?: string | null;
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
};

type MacroQuickLogProps = {
    entries: MacroQuickLogEntry[];
};

export function MacroQuickLog({ entries }: MacroQuickLogProps) {
    return (
        <section className="glass-panel rounded-2xl p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Utensils className="h-5 w-5 text-neon-blue" />
                Today quick log
            </h3>

            {entries.length ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="rounded-xl border border-glass-border bg-background/40 p-4"
                        >
                            <p className="text-sm font-semibold text-foreground">
                                {entry.mealName}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {entry.mealLabel ?? 'Unlabeled meal'}
                            </p>
                            <p className="mt-3 text-xs text-muted-foreground">
                                {entry.calories} kcal · P {entry.proteinGrams}g · C{' '}
                                {entry.carbsGrams}g · F {entry.fatGrams}g
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">
                    No meals saved yet today.
                </p>
            )}
        </section>
    );
}