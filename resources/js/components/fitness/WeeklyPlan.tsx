import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock3, Dumbbell, Target } from 'lucide-react';

export type IntensityLevel = 'low' | 'moderate' | 'high';

export interface Exercise {
    name: string;
    sets: number | string;
    reps: number | string;
    rest: string;
    notes?: string;
}

export interface DailyWorkout {
    day: string;
    focus: string;
    durationMinutes: number;
    intensity: IntensityLevel;
    exercises: Exercise[];
    notes: [string, string];
}

export interface WeeklyPlan {
    goal: string;
    days: DailyWorkout[];
    notes: [string, string];
}

export const mockPlan: WeeklyPlan = {
    goal: 'Build conditioning while improving movement quality and on-field power.',
    notes: [
        'Prioritize sleep quality and hydration after high-intensity days.',
        'Keep RPE around 7/10 unless the session is marked as high intensity.',
    ],
    days: [
        {
            day: 'Monday',
            focus: 'Acceleration technique + lower-body power',
            durationMinutes: 70,
            intensity: 'high',
            exercises: [
                {
                    name: 'Sprint starts (10-15 m)',
                    sets: 6,
                    reps: 2,
                    rest: '90 sec',
                    notes: 'Explosive first three steps, full intent.',
                },
                {
                    name: 'Trap bar deadlift',
                    sets: 4,
                    reps: 5,
                    rest: '2 min',
                },
                {
                    name: 'Box jumps',
                    sets: 4,
                    reps: 4,
                    rest: '75 sec',
                },
            ],
            notes: [
                'Warm up hips and ankles for 10 minutes before sprint work.',
                'Finish with 8 minutes of posterior-chain mobility.',
            ],
        },
        {
            day: 'Tuesday',
            focus: 'Aerobic intervals + trunk stability',
            durationMinutes: 55,
            intensity: 'moderate',
            exercises: [
                {
                    name: 'Tempo run intervals',
                    sets: 8,
                    reps: '1 min on / 1 min off',
                    rest: 'As programmed',
                },
                {
                    name: 'Dead bug + side plank circuit',
                    sets: 3,
                    reps: '40 sec each',
                    rest: '30 sec',
                },
                {
                    name: 'Assault bike flush',
                    sets: 1,
                    reps: '8 min easy',
                    rest: 'N/A',
                },
            ],
            notes: [
                'Nasal breathing for the first 4 intervals to control pace.',
                'Maintain smooth cadence, avoid early lactate spikes.',
            ],
        },
        {
            day: 'Wednesday',
            focus: 'Recovery mobility + tissue quality',
            durationMinutes: 40,
            intensity: 'low',
            exercises: [
                {
                    name: 'Mobility flow (hips, T-spine, ankles)',
                    sets: 2,
                    reps: '12 min flow',
                    rest: '2 min',
                },
                {
                    name: 'Zone 2 bike',
                    sets: 1,
                    reps: '20 min steady',
                    rest: 'N/A',
                },
                {
                    name: 'Breathing reset',
                    sets: 1,
                    reps: '5 min',
                    rest: 'N/A',
                },
            ],
            notes: [
                'Keep effort conversational for the entire session.',
                'Use this day to restore range of motion and reduce soreness.',
            ],
        },
        {
            day: 'Thursday',
            focus: 'Change of direction + unilateral strength',
            durationMinutes: 65,
            intensity: 'high',
            exercises: [
                {
                    name: '5-10-5 shuttle',
                    sets: 5,
                    reps: 2,
                    rest: '90 sec',
                },
                {
                    name: 'Rear-foot elevated split squat',
                    sets: 4,
                    reps: 6,
                    rest: '90 sec',
                },
                {
                    name: 'Lateral bounds',
                    sets: 4,
                    reps: 5,
                    rest: '60 sec',
                },
            ],
            notes: [
                'Stay low through direction changes; focus on deceleration control.',
                'Prioritize clean reps over adding extra volume.',
            ],
        },
        {
            day: 'Friday',
            focus: 'Upper-body support + conditioning finisher',
            durationMinutes: 60,
            intensity: 'moderate',
            exercises: [
                {
                    name: 'Pull-up progression',
                    sets: 4,
                    reps: 6,
                    rest: '75 sec',
                },
                {
                    name: 'Landmine press',
                    sets: 4,
                    reps: 8,
                    rest: '75 sec',
                },
                {
                    name: 'Sled push intervals',
                    sets: 6,
                    reps: '20 m',
                    rest: '60 sec',
                    notes: 'Heavy but maintain sprint posture.',
                },
            ],
            notes: [
                'Control shoulder mechanics on all pressing patterns.',
                'Cool down with easy walk and calf mobility.',
            ],
        },
        {
            day: 'Saturday',
            focus: 'Sport-specific session + tactical conditioning',
            durationMinutes: 80,
            intensity: 'high',
            exercises: [
                {
                    name: 'Technical drills',
                    sets: 5,
                    reps: '6 min blocks',
                    rest: '2 min',
                },
                {
                    name: 'Small-sided game intervals',
                    sets: 6,
                    reps: '3 min on',
                    rest: '90 sec',
                },
                {
                    name: 'Cooldown mobility',
                    sets: 1,
                    reps: '10 min',
                    rest: 'N/A',
                },
            ],
            notes: [
                'Session quality depends on decision speed, not random intensity.',
                'Refuel within 45 minutes post training.',
            ],
        },
        {
            day: 'Sunday',
            focus: 'Active recovery + mindset reset',
            durationMinutes: 35,
            intensity: 'low',
            exercises: [
                {
                    name: 'Brisk walk',
                    sets: 1,
                    reps: '25 min',
                    rest: 'N/A',
                },
                {
                    name: 'Full-body stretch',
                    sets: 1,
                    reps: '10 min',
                    rest: 'N/A',
                },
                {
                    name: 'Breathwork',
                    sets: 1,
                    reps: '5 min',
                    rest: 'N/A',
                },
            ],
            notes: [
                'Keep movement easy and rhythmic to reduce fatigue.',
                'Set your top 3 priorities for next training week.',
            ],
        },
    ],
};

type WeeklyPlanProps = {
    plan?: WeeklyPlan;
};

const intensityStyles: Record<IntensityLevel, string> = {
    low: 'border-emerald-400/70 text-emerald-300 bg-emerald-500/10',
    moderate: 'border-amber-400/70 text-amber-300 bg-amber-500/10',
    high: 'border-rose-400/70 text-rose-300 bg-rose-500/10',
};

export default function WeeklyPlanView({ plan }: WeeklyPlanProps) {
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const weeklyPlan = plan ?? mockPlan;

    const toggleDay = (day: string) => {
        setSelectedDay((current) => (current === day ? null : day));
    };

    return (
        <section className="min-h-screen bg-gray-950 px-4 py-8 md:px-8">
            <div className="mx-auto w-full max-w-7xl space-y-6">
                <header className="space-y-3">
                    <p className="text-xs tracking-[0.25em] text-gray-400 uppercase">
                        Weekly training
                    </p>
                    <h1 className="bg-linear-to-r from-neon-pink to-neon-blue bg-clip-text font-['Orbitron',sans-serif] text-3xl font-bold text-transparent md:text-5xl">
                        Your Aura Plan
                    </h1>
                </header>

                <article className="rounded-2xl border border-gray-700/60 bg-white/5 p-5 shadow-[0_0_35px_rgba(236,72,153,0.14)] backdrop-blur-xl md:p-6">
                    <div className="grid gap-5 md:grid-cols-[2fr_1fr] md:items-start">
                        <div>
                            <p className="text-xs tracking-[0.2em] text-gray-400 uppercase">
                                Goal
                            </p>
                            <p className="mt-2 text-base text-gray-100 md:text-lg">
                                {weeklyPlan.goal}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs tracking-[0.2em] text-gray-400 uppercase">
                                Weekly notes
                            </p>
                            <ul className="mt-2 space-y-2 text-sm text-gray-200">
                                {weeklyPlan.notes.map((note) => (
                                    <li
                                        key={note}
                                        className="rounded-lg border border-gray-800 bg-gray-900/40 px-3 py-2"
                                    >
                                        {note}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </article>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {weeklyPlan.days.map((day) => {
                        const isOpen = selectedDay === day.day;

                        return (
                            <article
                                key={day.day}
                                className="rounded-2xl border border-gray-800 bg-gray-900/40 p-4 shadow-[0_0_20px_rgba(17,24,39,0.6)] transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">
                                            {day.day}
                                        </h2>
                                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-300">
                                            <Target className="h-4 w-4 text-cyan-300" />
                                            <span>{day.focus}</span>
                                        </div>
                                    </div>

                                    <span
                                        className={[
                                            'rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide uppercase',
                                            intensityStyles[day.intensity],
                                        ].join(' ')}
                                    >
                                        {day.intensity}
                                    </span>
                                </div>

                                <div className="mt-3 flex items-center gap-2 text-sm text-gray-300">
                                    <Clock3 className="h-4 w-4 text-cyan-300" />
                                    <span>{day.durationMinutes} min</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => toggleDay(day.day)}
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm font-medium text-gray-100 transition hover:border-cyan-300 hover:text-cyan-200"
                                >
                                    {isOpen ? 'Hide Workout' : 'View Workout'}
                                    {isOpen ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </button>

                                {isOpen ? (
                                    <div className="mt-4 space-y-4 border-t border-gray-800 pt-4">
                                        <div>
                                            <p className="mb-2 flex items-center gap-2 text-xs tracking-[0.2em] text-gray-400 uppercase">
                                                <Dumbbell className="h-4 w-4" />
                                                Exercises
                                            </p>
                                            <ul className="space-y-2">
                                                {day.exercises.map(
                                                    (exercise) => (
                                                        <li
                                                            key={`${day.day}-${exercise.name}`}
                                                            className="rounded-lg border border-gray-800 bg-gray-950/70 px-3 py-2"
                                                        >
                                                            <p className="text-sm font-semibold text-gray-100">
                                                                {exercise.name}
                                                            </p>
                                                            <p className="mt-1 text-xs text-gray-300">
                                                                {exercise.sets}{' '}
                                                                sets x{' '}
                                                                {exercise.reps}{' '}
                                                                reps · Rest{' '}
                                                                {exercise.rest}
                                                            </p>
                                                            {exercise.notes ? (
                                                                <p className="mt-1 text-xs text-gray-400">
                                                                    {
                                                                        exercise.notes
                                                                    }
                                                                </p>
                                                            ) : null}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>

                                        <div>
                                            <p className="mb-2 text-xs tracking-[0.2em] text-gray-400 uppercase">
                                                Day notes
                                            </p>
                                            <ul className="space-y-1 text-sm text-gray-300">
                                                {day.notes.map((note) => (
                                                    <li
                                                        key={`${day.day}-${note}`}
                                                    >
                                                        • {note}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ) : null}
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
