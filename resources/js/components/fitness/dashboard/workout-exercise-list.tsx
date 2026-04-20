import { Badge } from '@/components/ui/badge';
import type { WorkoutExercise } from '@/types/fitness';

type WorkoutExerciseListProps = {
    title?: string;
    summary?: string;
    exercises: WorkoutExercise[];
    notes?: string[];
};

export default function WorkoutExerciseList({
    title,
    summary,
    exercises,
    notes,
}: WorkoutExerciseListProps) {
    return (
        <section className="rounded-xl border border-border/60 bg-background/70 p-4">
            <div className="space-y-1">
                <p className="text-xs tracking-[0.24em] text-muted-foreground uppercase">
                    Workout details
                </p>
                {title ? (
                    <h3 className="text-sm font-semibold text-foreground">
                        {title}
                    </h3>
                ) : null}
                {summary ? (
                    <p className="text-sm text-muted-foreground">{summary}</p>
                ) : null}
            </div>

            {exercises.length ? (
                <div className="mt-4 grid gap-2">
                    {exercises.map((exercise) => (
                        <div
                            key={exercise.name}
                            className="flex flex-col gap-2 rounded-lg border border-border/60 p-3 md:flex-row md:items-center md:justify-between"
                        >
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    {exercise.name}
                                </p>
                                {exercise.notes ? (
                                    <p className="text-xs text-muted-foreground">
                                        {exercise.notes}
                                    </p>
                                ) : null}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {exercise.sets !== undefined && (
                                    <Badge variant="secondary">
                                        Sets: {exercise.sets}
                                    </Badge>
                                )}
                                {exercise.reps && (
                                    <Badge variant="outline">
                                        Reps: {exercise.reps}
                                    </Badge>
                                )}
                                {exercise.rest && (
                                    <Badge variant="outline">
                                        Rest: {exercise.rest}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                    Exercise list slot ready for AI payloads.
                </p>
            )}

            {notes?.length ? (
                <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                    {notes.map((note) => (
                        <li key={note}>• {note}</li>
                    ))}
                </ul>
            ) : null}
        </section>
    );
}
