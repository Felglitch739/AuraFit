import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { WeeklyPlanData } from '@/types/fitness';

type WeeklyPlanCardProps = {
    plan?: WeeklyPlanData | null;
    currentDayLabel?: string;
};

export default function WeeklyPlanCard({
    plan,
    currentDayLabel,
}: WeeklyPlanCardProps) {
    return (
        <Card className="relative h-full overflow-hidden border border-glass-border bg-glass-panel shadow-[0_0_20px_var(--color-neon-pink)/10] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_30%,transparent_70%,rgba(255,255,255,0.04))]" />
            <CardHeader className="relative z-10">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <CardDescription className="text-xs tracking-[0.3em] uppercase">
                            Weekly plan
                        </CardDescription>
                        <CardTitle className="text-2xl">
                            Training structure
                        </CardTitle>
                    </div>
                    {plan?.goal && <Badge variant="outline">{plan.goal}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                    {currentDayLabel
                        ? `Current day: ${currentDayLabel}`
                        : 'Prepared for daily adaptation'}
                </p>
                {plan?.planned_workout ? (
                    <div className="rounded-xl border border-neon-blue/40 bg-neon-blue/10 p-3 text-sm text-neon-blue">
                        Accepted chat update active for{' '}
                        {plan.planned_workout.day ?? currentDayLabel ?? 'today'}
                        .
                    </div>
                ) : null}
                {plan?.planned_nutrition ? (
                    <div className="rounded-xl border border-green-400/40 bg-green-500/10 p-3 text-sm text-green-200">
                        Nutrition change accepted:{' '}
                        {plan.planned_nutrition.summary ?? 'updated macro plan'}
                    </div>
                ) : null}
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
                {plan?.days?.length ? (
                    <div className="grid gap-3">
                        {plan.days.map((day) => {
                            const isCurrentDay = currentDayLabel === day.day;
                            const isAcceptedDay =
                                plan?.planned_workout?.day === day.day;

                            return (
                                <div
                                    key={day.day}
                                    className={[
                                        'rounded-xl border p-4 transition-colors',
                                        isCurrentDay
                                            ? 'border-neon-pink/50 bg-neon-pink/10 shadow-[0_0_15px_var(--color-neon-pink)/20]'
                                            : 'border-glass-border bg-glass-panel/50',
                                    ].join(' ')}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                {day.day}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {day.focus}
                                            </p>
                                            {isAcceptedDay ? (
                                                <p className="mt-1 text-[11px] tracking-[0.22em] text-neon-blue uppercase">
                                                    Accepted in chat
                                                </p>
                                            ) : null}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {day.durationMinutes !==
                                                undefined && (
                                                <Badge variant="secondary">
                                                    {day.durationMinutes} min
                                                </Badge>
                                            )}
                                            {day.intensity && (
                                                <Badge variant="outline">
                                                    {day.intensity}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {day.exercises?.length ? (
                                        <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                                            {day.exercises.map((exercise) => (
                                                <li
                                                    key={`${day.day}-${exercise.name}`}
                                                    className="flex items-center justify-between gap-4 rounded-lg border border-glass-border bg-glass-panel px-3 py-2"
                                                >
                                                    <span className="font-medium text-foreground">
                                                        {exercise.name}
                                                    </span>
                                                    <span className="text-right">
                                                        {[
                                                            exercise.sets,
                                                            exercise.reps,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' x ')}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-glass-border p-6 text-sm text-muted-foreground">
                        Weekly plan props are ready here. Backend data can be
                        injected later without changing the component contract.
                    </div>
                )}

                {plan?.notes?.length ? (
                    <div className="space-y-2 rounded-xl border border-glass-border bg-glass-panel/50 p-4">
                        <p className="text-xs tracking-[0.24em] text-muted-foreground uppercase">
                            Notes
                        </p>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                            {plan.notes.map((note) => (
                                <li key={note}>• {note}</li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
