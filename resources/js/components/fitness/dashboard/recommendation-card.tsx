import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { RecommendationData } from '@/types/fitness';
import WorkoutExerciseList from './workout-exercise-list';

type RecommendationCardProps = {
    recommendation?: RecommendationData | null;
};

export default function RecommendationCard({
    recommendation,
}: RecommendationCardProps) {
    const readinessLabel = recommendation
        ? `${recommendation.readinessScore}/100`
        : '—';

    return (
        <Card className="relative h-full overflow-hidden border border-glass-border bg-glass-panel shadow-[0_0_20px_var(--color-neon-pink)/10] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-white/10 to-transparent" />
            <CardHeader className="relative z-10">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <CardDescription className="text-xs tracking-[0.3em] uppercase">
                            AI recommendation
                        </CardDescription>
                        <CardTitle className="text-2xl">
                            Adaptive training output
                        </CardTitle>
                    </div>
                    <Badge>{readinessLabel}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                    The component is structured for AI or fallback data, with no
                    business logic embedded.
                </p>
            </CardHeader>
            <CardContent className="relative z-10 space-y-5">
                {recommendation ? (
                    <>
                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-xl border border-glass-border bg-glass-panel/50 p-4">
                                <p className="text-xs tracking-[0.24em] text-muted-foreground uppercase">
                                    Planned
                                </p>
                                <p className="mt-2 text-sm text-foreground">
                                    {recommendation.planned}
                                </p>
                            </div>
                            <div className="rounded-xl border border-glass-border bg-glass-panel/50 p-4">
                                <p className="text-xs tracking-[0.24em] text-muted-foreground uppercase">
                                    Adjusted
                                </p>
                                <p className="mt-2 text-sm text-foreground">
                                    {recommendation.adjusted}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-glass-border bg-glass-panel/50 p-4">
                            <p className="text-xs tracking-[0.24em] text-muted-foreground uppercase">
                                Message
                            </p>
                            <p className="mt-2 text-sm text-foreground">
                                {recommendation.message ??
                                    'Message slot ready for the AI response.'}
                            </p>
                        </div>

                        <WorkoutExerciseList
                            title={recommendation.workoutJson.title}
                            summary={recommendation.workoutJson.summary}
                            exercises={
                                recommendation.workoutJson.exercises ?? []
                            }
                            notes={recommendation.workoutJson.notes ?? []}
                        />

                        <div className="rounded-xl border border-glass-border bg-glass-panel/50 p-4">
                            <p className="text-xs tracking-[0.24em] text-muted-foreground uppercase">
                                Nutrition tip
                            </p>
                            <p className="mt-2 text-sm text-foreground">
                                {recommendation.nutritionTip}
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="rounded-xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
                        Recommendation props are ready here for the future AI
                        output.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
