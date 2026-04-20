import { Link, useForm } from '@inertiajs/react';
import {
    BatteryCharging,
    BrainCircuit,
    CheckCircle2,
    Cpu,
    Flame,
    LoaderCircle,
    Moon,
} from 'lucide-react';
import { useMemo, type FormEvent } from 'react';
import { toast } from 'sonner';
import { DailyLoading } from '@/components/fitness/shared';
import {
    CheckInNextStepLinks,
    CheckInResultCard,
} from '@/components/fitness/checkin';
import type { WorkoutExercise } from '@/types/fitness';

type CheckinResult = {
    readiness_score?: number;
    message?: string;
    nutrition_tip?: string;
    workout_json?: {
        exercises?: WorkoutExercise[];
    };
};

type RecommendationState = {
    score: number;
    message: string;
    focusBlocks: string[];
    nutritionTip?: string;
};

export type CheckInViewProps = {
    checkinResult?: CheckinResult | null;
    checkinFormDefaults?: {
        sleep_hours: number;
        soreness: number;
        stress_level: number;
    };
};

export default function CheckInView({
    checkinResult,
    checkinFormDefaults,
}: CheckInViewProps) {
    const form = useForm({
        sleep_hours: checkinFormDefaults?.sleep_hours ?? 7,
        soreness: checkinFormDefaults?.soreness ?? 3,
        stress_level: checkinFormDefaults?.stress_level ?? 4,
    });
    const reduceLoadForm = useForm({});

    const result: RecommendationState | null = checkinResult
        ? {
              score: checkinResult.readiness_score ?? 0,
              message:
                  checkinResult.message ??
                  'Your check-in was saved successfully. Keep training with recovery in mind.',
              focusBlocks: checkinResult.workout_json?.exercises?.map(
                  (exercise) => exercise.name,
              ) ?? [
                  'Push focus (chest, shoulders, triceps) with lower load',
                  'Back and biceps activation with controlled tempo',
                  'Core and mobility finish',
              ],
              nutritionTip: checkinResult.nutrition_tip,
          }
        : null;

    const calcScore = (sleep: number, sore: number, stress: number) => {
        const sleepScore =
            sleep >= 7 && sleep <= 9 ? 100 : sleep < 7 ? (sleep / 7) * 100 : 80;
        const sorenessScore = 100 - sore * 10;
        const stressScore = 100 - stress * 10;

        return Math.round(
            Math.max(
                0,
                Math.min(
                    100,
                    sleepScore * 0.4 + sorenessScore * 0.3 + stressScore * 0.3,
                ),
            ),
        );
    };

    const status = useMemo(() => {
        if (!result) {
            return {
                title: 'Ready to analyze your day',
                stroke: '#d946ef',
            };
        }

        if (result.score >= 80) {
            return {
                title: 'High readiness',
                stroke: '#22c55e',
            };
        }

        if (result.score >= 50) {
            return {
                title: 'Moderate readiness',
                stroke: '#eab308',
            };
        }

        return {
            title: 'Low readiness',
            stroke: '#ef4444',
        };
    }, [result]);

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post('/check-in', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Check-in saved successfully.');
            },
            onError: () => {
                const fallbackScore = calcScore(
                    form.data.sleep_hours,
                    form.data.soreness,
                    form.data.stress_level,
                );

                toast.error(
                    `Validation failed. Local readiness estimate: ${fallbackScore}/100.`,
                );
            },
        });
    };

    const acceptReducedLoad = () => {
        reduceLoadForm.post('/check-in/reduce-load', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Reduced-load plan regenerated for today.');
            },
            onError: () => {
                toast.error('Could not regenerate the reduced-load plan.');
            },
        });
    };

    const normalizedScore = Math.max(0, Math.min(100, result?.score ?? 0));
    const circumference = 283;
    const strokeOffset =
        circumference - (normalizedScore / 100) * circumference;

    if (form.processing) {
        return (
            <div className="space-y-6">
                <DailyLoading />
            </div>
        );
    }

    if (reduceLoadForm.processing) {
        return (
            <div className="space-y-6">
                <DailyLoading
                    title="Rebuilding Lower-Load Plan"
                    steps={[
                        'Lowering session intensity and volume...',
                        'Prioritizing recovery and technique work...',
                        'Recalculating readiness-safe nutrition...',
                        'Finalizing a recovery-first training flow...',
                    ]}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
                <section className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                    <article className="glass-panel rounded-2xl p-6 md:p-8">
                        <h1 className="font-['Orbitron',sans-serif] text-2xl font-bold text-foreground md:text-3xl">
                            Wellness check-in
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Share your body signals so we can adapt today&apos;s
                            training safely.
                        </p>

                        <form className="mt-8 space-y-8" onSubmit={onSubmit}>
                            <div>
                                <div className="mb-2 flex justify-between">
                                    <label className="flex items-center gap-2 font-medium text-foreground">
                                        <Moon className="h-4 w-4 text-indigo-400" />
                                        Sleep hours
                                    </label>
                                    <span className="font-bold text-neon-pink">
                                        {form.data.sleep_hours} h
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={12}
                                    step={0.5}
                                    value={form.data.sleep_hours}
                                    onChange={(event) =>
                                        form.setData(
                                            'sleep_hours',
                                            Number(event.target.value),
                                        )
                                    }
                                    className="range-input"
                                />
                            </div>

                            <div>
                                <div className="mb-2 flex justify-between">
                                    <label className="flex items-center gap-2 font-medium text-foreground">
                                        <Flame className="h-4 w-4 text-orange-400" />
                                        Muscle soreness
                                    </label>
                                    <span className="font-bold text-orange-400">
                                        {form.data.soreness}/10
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={10}
                                    step={1}
                                    value={form.data.soreness}
                                    onChange={(event) =>
                                        form.setData(
                                            'soreness',
                                            Number(event.target.value),
                                        )
                                    }
                                    className="range-input"
                                />
                            </div>

                            <div>
                                <div className="mb-2 flex justify-between">
                                    <label className="flex items-center gap-2 font-medium text-foreground">
                                        <BrainCircuit className="h-4 w-4 text-neon-blue" />
                                        Mental stress
                                    </label>
                                    <span className="font-bold text-neon-blue">
                                        {form.data.stress_level}/10
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={10}
                                    step={1}
                                    value={form.data.stress_level}
                                    onChange={(event) =>
                                        form.setData(
                                            'stress_level',
                                            Number(event.target.value),
                                        )
                                    }
                                    className="range-input"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-neon-pink to-fuchsia-600 py-3.5 text-base font-bold text-white shadow-[0_0_20px_rgba(217,70,239,0.4)] transition hover:from-fuchsia-500 hover:to-purple-500 disabled:opacity-60"
                            >
                                {form.processing ? (
                                    <>
                                        <LoaderCircle className="h-5 w-5 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        Analyze with backend
                                        <Cpu className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </article>

                    <CheckInResultCard
                        status={status}
                        result={result}
                        circumference={circumference}
                        strokeOffset={strokeOffset}
                        onAcceptReducedLoad={acceptReducedLoad}
                        isAcceptingReducedLoad={reduceLoadForm.processing}
                    />
                </section>

                <CheckInNextStepLinks />
            </div>
    );
}
