import { Head, useForm } from '@inertiajs/react';
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
import DailyLoading from '@/components/fitness/DailyLoading';
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

type CheckInPageProps = {
    checkinResult?: CheckinResult | null;
    checkinFormDefaults?: {
        sleep_hours: number;
        soreness: number;
        stress_level: number;
    };
};

export default function CheckInPage({
    checkinResult,
    checkinFormDefaults,
}: CheckInPageProps) {
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
            <>
                <Head title="Check-in" />

                <div className="space-y-6">
                    <DailyLoading />
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Check-in" />

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

                    <article className="glass-panel rounded-2xl p-6 md:p-8">
                        <h2 className="mb-4 flex items-center gap-2 font-semibold text-muted-foreground">
                            <BatteryCharging className="h-5 w-5 text-neon-pink" />
                            Readiness result
                        </h2>

                        <div className="flex flex-col items-center gap-6 md:flex-row">
                            <div className="relative flex h-32 w-32 items-center justify-center">
                                <svg
                                    className="h-full w-full -rotate-90"
                                    viewBox="0 0 100 100"
                                >
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="oklch(0.35 0 0)"
                                        strokeWidth="8"
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke={status.stroke}
                                        strokeWidth="8"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeOffset}
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute text-center">
                                    <p className="font-['Orbitron',sans-serif] text-4xl font-bold text-foreground">
                                        {result?.score ?? '--'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        %
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-lg font-semibold text-foreground">
                                    {status.title}
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {result?.message ??
                                        'Submit your check-in to get a recommendation from backend data.'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-2">
                            {(result?.focusBlocks ?? []).map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-2 rounded-lg border border-glass-border bg-background/50 p-2 text-sm text-foreground"
                                >
                                    <CheckCircle2 className="h-4 w-4 text-neon-pink" />
                                    {item}
                                </div>
                            ))}
                        </div>

                        {result?.nutritionTip ? (
                            <div className="mt-6 rounded-xl border border-green-400/30 bg-green-500/10 p-4">
                                <p className="text-sm font-semibold text-green-100">
                                    Nutrition adjustment
                                </p>
                                <p className="mt-1 text-sm text-green-100/80">
                                    {result.nutritionTip}
                                </p>
                            </div>
                        ) : null}

                        {result && result.score < 50 ? (
                            <div className="mt-6 rounded-xl border border-orange-400/30 bg-orange-500/10 p-4">
                                <p className="text-sm font-semibold text-orange-100">
                                    You are not at 100% today.
                                </p>
                                <p className="mt-1 text-sm text-orange-100/80">
                                    If you accept a lower load, we will
                                    regenerate today&apos;s training and
                                    nutrition guidance with a lighter
                                    recovery-first plan.
                                </p>
                                <button
                                    type="button"
                                    onClick={acceptReducedLoad}
                                    disabled={reduceLoadForm.processing}
                                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:opacity-60"
                                >
                                    {reduceLoadForm.processing
                                        ? 'Regenerating...'
                                        : 'Accept lower load today'}
                                </button>
                            </div>
                        ) : null}
                    </article>
                </section>
            </div>
        </>
    );
}

CheckInPage.layout = {
    breadcrumbs: [
        {
            title: 'Check-in',
            href: '/check-in',
        },
    ],
};
