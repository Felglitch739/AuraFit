import { useEffect, useMemo, useState } from 'react';
import {
    CheckCircle2,
    Clock3,
    Dumbbell,
    ShieldCheck,
    Sparkles,
    Target,
} from 'lucide-react';

export type IntensityLevel = 'low' | 'moderate' | 'high';

export interface Exercise {
    name: string;
    sets: number | string;
    reps: number | string;
    rest: string;
    muscleGroup?: string;
    description?: string;
    purpose?: string;
    technique_points?: string[];
    techniquePoints?: string[];
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
    goal: 'Lean Bulk phase focused on strength progression and quality muscle gain.',
    notes: [
        'Prioritize 7 to 9 hours of sleep and hydration after every high-intensity day.',
        'Keep your average effort around RPE 7 unless a day is clearly marked as high intensity.',
    ],
    days: [
        {
            day: 'Monday',
            focus: 'Upper-body strength and pressing power',
            durationMinutes: 68,
            intensity: 'high',
            exercises: [
                {
                    name: 'Bench Press',
                    sets: 4,
                    reps: 6,
                    rest: '120 sec',
                    muscleGroup: 'Chest',
                    description:
                        'Bench Press is a cornerstone movement for upper-body bulk because it overloads the chest, triceps, and front delts at once. It also builds pressing strength that carries over to accessory hypertrophy work. Keep bar speed controlled and progressive through the week.',
                    techniquePoints: [
                        'Set shoulders down and back before unracking the bar.',
                        'Keep your feet planted and create full-body tension.',
                        'Lower the bar to the mid-chest with stacked wrists.',
                        'Press up in a slight arc while keeping glutes on the bench.',
                    ],
                },
                {
                    name: 'Incline Dumbbell Press',
                    sets: 4,
                    reps: 10,
                    rest: '75 sec',
                    muscleGroup: 'Upper Chest',
                    description:
                        'This variation targets the clavicular fibers of the chest to create a fuller upper torso profile during your bulk phase. The dumbbells improve unilateral control and shoulder stability. Use a smooth eccentric to maximize time under tension.',
                    techniquePoints: [
                        'Keep elbows slightly tucked, not flared to 90 degrees.',
                        'Control the lowering phase for at least two seconds.',
                        'Drive through the palm and finish with chest contraction.',
                    ],
                },
                {
                    name: 'Cable Fly',
                    sets: 3,
                    reps: 12,
                    rest: '60 sec',
                    muscleGroup: 'Chest',
                    description:
                        'Cable Fly reinforces chest isolation after heavy pressing and improves fiber recruitment through a long range of motion. It is ideal for accumulating quality hypertrophy volume without excessive joint stress. Focus on controlled squeeze and tempo.',
                    techniquePoints: [
                        'Keep a soft bend in the elbows throughout the set.',
                        'Bring handles together in front of the sternum.',
                        'Pause briefly at peak contraction before returning.',
                    ],
                },
            ],
            notes: [
                'Keep rest periods strict to sustain quality output.',
                'Finish with 5 minutes of shoulder mobility and breathing reset.',
            ],
        },
        {
            day: 'Tuesday',
            focus: 'Lower-body compound strength',
            durationMinutes: 65,
            intensity: 'moderate',
            exercises: [
                {
                    name: 'Back Squat',
                    sets: 5,
                    reps: 5,
                    rest: '150 sec',
                    muscleGroup: 'Quadriceps',
                    description:
                        'Back Squats are essential for lower-body size and total-body force production during a lean bulk. They stimulate quads, glutes, and trunk stability under load. Consistent progression here drives visible leg development and stronger athletic output.',
                    techniquePoints: [
                        'Brace your core before each rep and keep chest tall.',
                        'Track knees over toes while maintaining foot tripod.',
                        'Descend to a controlled depth without losing lumbar position.',
                        'Drive up through mid-foot with hips and chest rising together.',
                    ],
                },
                {
                    name: 'Romanian Deadlift',
                    sets: 4,
                    reps: 8,
                    rest: '90 sec',
                    muscleGroup: 'Hamstrings',
                    description:
                        'Romanian Deadlifts build posterior-chain mass while improving hinge mechanics and hamstring resilience. This keeps your lower body balanced as squat volume increases. The movement also reinforces spinal stability and glute recruitment.',
                    techniquePoints: [
                        'Push hips back while maintaining neutral spine.',
                        'Keep bar close to thighs and shins throughout.',
                        'Stop descent when hamstrings are fully loaded, not rounded.',
                    ],
                },
                {
                    name: 'Walking Lunges',
                    sets: 3,
                    reps: '12 each leg',
                    rest: '60 sec',
                    muscleGroup: 'Glutes',
                    description:
                        'Walking Lunges improve unilateral control and reduce side-to-side strength asymmetries, which is key for long-term progression. They also add high-quality hypertrophy work with less spinal compression than extra squat sets. Stay controlled and balanced on every step.',
                    techniquePoints: [
                        'Take a long enough step to keep front knee stable.',
                        'Keep torso upright and avoid collapsing forward.',
                        'Push through full foot contact as you stand.',
                    ],
                },
            ],
            notes: [
                'Warm up with 6 to 8 minutes of hip and ankle mobility.',
                'Use your first set as a technical primer, not a max effort.',
            ],
        },
        {
            day: 'Wednesday',
            focus: 'Active recovery and mobility quality',
            durationMinutes: 42,
            intensity: 'low',
            exercises: [
                {
                    name: 'Mobility Flow (Hips and T-Spine)',
                    sets: 2,
                    reps: '10 min flow',
                    rest: '2 min',
                    muscleGroup: 'Mobility',
                    description:
                        'This flow restores joint range of motion and improves movement quality before your next heavy sessions. Better mobility helps maintain lifting mechanics and reduce compensations. Keep the transitions smooth and controlled.',
                    techniquePoints: [
                        'Breathe through your nose during each mobility pattern.',
                        'Do not rush transitions between positions.',
                        'Pause where you feel restriction and release tension slowly.',
                    ],
                },
                {
                    name: 'Zone 2 bike',
                    sets: 1,
                    reps: '20 min steady',
                    rest: 'N/A',
                    muscleGroup: 'Cardio Base',
                    description:
                        'Zone 2 work supports recovery, boosts aerobic capacity, and improves nutrient delivery between hard training days. It keeps fatigue low while maintaining conditioning quality. Stay conversational for the full block.',
                    techniquePoints: [
                        'Keep cadence steady and posture relaxed.',
                        'Maintain a pace where nasal breathing is sustainable.',
                        'Avoid intensity spikes during the session.',
                    ],
                },
                {
                    name: 'Breathing reset',
                    sets: 1,
                    reps: '5 min',
                    rest: 'N/A',
                    muscleGroup: 'Recovery',
                    description:
                        'Intentional breathing lowers stress tone and helps restore recovery readiness for high-output training days. It also improves trunk control and bracing quality under load. Use this as your final cooldown anchor.',
                    techniquePoints: [
                        'Inhale through nose for four seconds.',
                        'Exhale slowly for six to eight seconds.',
                        'Keep ribcage stacked over pelvis in relaxed posture.',
                    ],
                },
            ],
            notes: [
                'Keep recovery day intensity truly low for adaptation.',
                'Finish with light soft-tissue work if stiffness remains.',
            ],
        },
        {
            day: 'Thursday',
            focus: 'Posterior chain and speed support',
            durationMinutes: 60,
            intensity: 'high',
            exercises: [
                {
                    name: 'Deadlift',
                    sets: 4,
                    reps: 4,
                    rest: '150 sec',
                    muscleGroup: 'Posterior Chain',
                    description:
                        'Deadlifts build high-threshold force production across glutes, hamstrings, back, and grip. In a lean bulk, this movement supports global strength and improves your ability to move heavy loads safely. Quality reps are more important than grinding to failure.',
                    techniquePoints: [
                        'Set lats down and back before the pull.',
                        'Keep bar path close to the body from floor to lockout.',
                        'Push the floor away and avoid yanking from the hips.',
                        'Lock out with glutes, not lower-back overextension.',
                    ],
                },
                {
                    name: 'Barbell Hip Thrust',
                    sets: 4,
                    reps: 8,
                    rest: '75 sec',
                    muscleGroup: 'Glutes',
                    description:
                        'Hip Thrusts isolate and overload glute output with low spinal stress, improving both hypertrophy and athletic extension power. They complement your deadlift volume without excessive fatigue. Hold the top position for full contraction quality.',
                    techniquePoints: [
                        'Keep chin tucked and ribs down through each rep.',
                        'Drive through heels while keeping knees stable.',
                        'Pause at lockout for one second before lowering.',
                    ],
                },
                {
                    name: 'Hanging Knee Raise',
                    sets: 3,
                    reps: 12,
                    rest: '60 sec',
                    muscleGroup: 'Core',
                    description:
                        'Hanging Knee Raises strengthen trunk control and pelvic positioning, both key for force transfer in heavy compound lifts. They improve spinal stability under fatigue and reduce energy leaks. Use strict tempo and avoid momentum.',
                    techniquePoints: [
                        'Depress shoulders and stabilize before each rep.',
                        'Lift knees with abdominal control, not swinging.',
                        'Lower slowly to maintain tension between reps.',
                    ],
                },
            ],
            notes: [
                'Treat your first deadlift set as a movement check.',
                'If bar speed drops sharply, reduce load by 5 to 7 percent.',
            ],
        },
        {
            day: 'Friday',
            focus: 'Back width and pulling mechanics',
            durationMinutes: 58,
            intensity: 'moderate',
            exercises: [
                {
                    name: 'Pull-ups',
                    sets: 4,
                    reps: 6,
                    rest: '90 sec',
                    muscleGroup: 'Lats',
                    description:
                        'Pull-ups are a premium builder for lat width and upper-back density, giving your physique a stronger V-taper during a bulk phase. They also reinforce scapular control and shoulder health when performed strictly. Prioritize clean range over forced reps.',
                    techniquePoints: [
                        'Start from a dead hang with active shoulders.',
                        'Drive elbows down toward the ribcage as you pull.',
                        'Reach chest up to the bar without craning your neck.',
                        'Lower under control to full elbow extension.',
                    ],
                },
                {
                    name: 'Chest Supported Row',
                    sets: 4,
                    reps: 10,
                    rest: '75 sec',
                    muscleGroup: 'Mid Back',
                    description:
                        'This row variation adds upper-back volume while minimizing lower-back loading, making it ideal after high-output posterior sessions. It improves scapular retraction strength and postural balance. Keep each rep deliberate and symmetrical.',
                    techniquePoints: [
                        'Keep chest glued to the support pad throughout.',
                        'Pull elbows slightly behind the torso with control.',
                        'Pause briefly at peak squeeze before lowering.',
                    ],
                },
                {
                    name: 'Face Pull',
                    sets: 3,
                    reps: 15,
                    rest: '60 sec',
                    muscleGroup: 'Rear Delts',
                    description:
                        'Face Pulls support shoulder integrity and rear-delt development, helping you keep pressing-heavy weeks balanced. They improve scapular upward rotation and reduce anterior shoulder stress. Use strict form and high-quality contractions.',
                    techniquePoints: [
                        'Pull rope toward eye level with elbows high.',
                        'Externally rotate at the end position.',
                        'Control return phase to avoid momentum.',
                    ],
                },
            ],
            notes: [
                'Aim for full range on every pull-up repetition.',
                'Use straps only if grip becomes the limiting factor too early.',
            ],
        },
        {
            day: 'Saturday',
            focus: 'Hybrid conditioning and core integrity',
            durationMinutes: 62,
            intensity: 'high',
            exercises: [
                {
                    name: 'Sled Push',
                    sets: 6,
                    reps: '20 m',
                    rest: '75 sec',
                    muscleGroup: 'Leg Drive',
                    description:
                        'Sled Push work builds work capacity and leg drive without large eccentric stress, making it ideal for metabolic conditioning. It reinforces forward force production while preserving joint quality. Stay low and keep every step forceful.',
                    techniquePoints: [
                        'Maintain a neutral spine with strong torso brace.',
                        'Take short powerful steps and keep continuous pressure.',
                        'Drive through forefoot while controlling breathing rhythm.',
                    ],
                },
                {
                    name: 'Battle Ropes',
                    sets: 5,
                    reps: '35 sec',
                    rest: '90 sec',
                    muscleGroup: 'Shoulder Endurance',
                    description:
                        'Battle Ropes improve upper-body conditioning and trunk stiffness under fatigue, helping maintain output late in sessions. They are effective for high heart-rate work with low technical complexity. Keep waves rhythmic and aggressive.',
                    techniquePoints: [
                        'Keep knees soft and torso braced throughout.',
                        'Generate movement from shoulders and core, not lower back.',
                        'Maintain consistent wave height for the full interval.',
                    ],
                },
                {
                    name: 'Farmer Carry',
                    sets: 4,
                    reps: '30 m',
                    rest: '60 sec',
                    muscleGroup: 'Grip and Core',
                    description:
                        'Farmer Carries tie together grip strength, trunk stiffness, and postural control under load. They build practical strength that supports all major barbell lifts. Focus on stable gait and controlled breathing.',
                    techniquePoints: [
                        'Pack shoulders down and keep neck relaxed.',
                        'Walk with short controlled steps and tall posture.',
                        'Avoid trunk sway by bracing abs and glutes.',
                    ],
                },
            ],
            notes: [
                'Keep transitions efficient to maintain training density.',
                'Refuel with carbs and protein within 60 minutes after training.',
            ],
        },
        {
            day: 'Sunday',
            focus: 'Active recovery and readiness reset',
            durationMinutes: 35,
            intensity: 'low',
            exercises: [
                {
                    name: 'Brisk walk',
                    sets: 1,
                    reps: '25 min',
                    rest: 'N/A',
                    muscleGroup: 'Recovery',
                    description:
                        'A brisk walk promotes blood flow and improves recovery without adding meaningful training stress. It helps reduce stiffness while supporting your weekly energy balance. Keep pace steady and posture upright.',
                    techniquePoints: [
                        'Keep a moderate pace and rhythmic breathing.',
                        'Maintain tall posture with relaxed shoulders.',
                        'Focus on smooth heel-to-toe stride mechanics.',
                    ],
                },
                {
                    name: 'Full-body stretch',
                    sets: 1,
                    reps: '10 min',
                    rest: 'N/A',
                    muscleGroup: 'Mobility',
                    description:
                        'This stretch block restores range and reduces residual tightness from compound lifting days. Better flexibility supports cleaner movement patterns next week. Stay relaxed and avoid forcing end ranges.',
                    techniquePoints: [
                        'Hold each stretch 30 to 45 seconds without bouncing.',
                        'Exhale slowly to deepen range safely.',
                        'Prioritize hips, chest, and thoracic spine mobility.',
                    ],
                },
                {
                    name: 'Breathwork',
                    sets: 1,
                    reps: '5 min',
                    rest: 'N/A',
                    muscleGroup: 'Nervous System',
                    description:
                        'Breathwork helps downregulate your nervous system and improves sleep readiness, both essential for growth and adaptation in a bulk block. It also sharpens mental focus for upcoming sessions. Keep the pace calm and controlled.',
                    techniquePoints: [
                        'Inhale for four seconds and exhale for six seconds.',
                        'Keep jaw and shoulders relaxed while breathing.',
                        'Maintain consistent tempo across all rounds.',
                    ],
                },
            ],
            notes: [
                'Keep today low effort to maximize Monday performance.',
                'Review next week targets and prepare meal timing in advance.',
            ],
        },
    ],
};

type WeeklyPlanProps = {
    plan?: WeeklyPlan;
    generationError?: string | null;
};

const intensityStyles: Record<IntensityLevel, string> = {
    low: 'border-neon-blue/45 text-neon-blue bg-neon-blue/10',
    moderate: 'border-neon-blue/35 text-neon-blue bg-neon-blue/8',
    high: 'border-neon-pink/45 text-neon-pink bg-neon-pink/10',
};

export default function WeeklyPlanView({
    plan,
    generationError,
}: WeeklyPlanProps) {
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [selectedExercise, setSelectedExercise] = useState<string | null>(
        null,
    );
    const [mobileView, setMobileView] = useState<'overview' | 'deep-dive'>(
        'overview',
    );
    const weeklyPlan = plan ?? null;

    if (!weeklyPlan && !generationError) {
        return (
            <section className="relative min-h-screen overflow-hidden px-4 py-8 md:px-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(59,130,246,0.12),transparent_42%),radial-gradient(circle_at_85%_20%,rgba(217,70,239,0.1),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(15,23,42,0.1),transparent_45%)]" />

                <div className="relative mx-auto w-full max-w-7xl animate-in space-y-6 duration-500 fade-in">
                    <header className="space-y-3">
                        <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
                            Weekly training
                        </p>
                        <h1 className="bg-linear-to-r from-neon-pink to-neon-blue bg-clip-text font-['Orbitron',sans-serif] text-3xl font-bold text-transparent md:text-5xl">
                            Building Your Aura Plan
                        </h1>
                        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                            Estamos estructurando tu rutina con split,
                            intensidad y progresion coherente para toda la
                            semana.
                        </p>
                    </header>

                    <article className="glass-panel rounded-2xl p-5 md:p-6">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-background/60">
                            <div className="h-full w-2/3 animate-pulse bg-linear-to-r from-neon-blue to-neon-pink" />
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">
                            Generando ejercicios, tecnica y notas de recovery...
                        </p>
                    </article>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <article
                                key={`loading-day-${index}`}
                                className="rounded-2xl border border-glass-border bg-background/35 p-4 backdrop-blur-xl"
                            >
                                <div className="h-5 w-24 animate-pulse rounded bg-background/80" />
                                <div className="mt-3 h-4 w-full animate-pulse rounded bg-background/80" />
                                <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-background/80" />
                                <div className="mt-4 h-8 w-40 animate-pulse rounded bg-background/80" />
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!weeklyPlan) {
        return (
            <section className="min-h-screen px-4 py-8 md:px-8">
                <div className="glass-panel mx-auto w-full max-w-3xl space-y-4 rounded-2xl p-6 text-foreground">
                    <h1 className="font-['Orbitron',sans-serif] text-2xl font-bold text-foreground">
                        Weekly Plan
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Your weekly routine is not available yet.
                    </p>
                    {generationError ? (
                        <p className="rounded-lg border border-neon-pink/35 bg-neon-pink/10 p-3 text-sm text-neon-pink">
                            {generationError}
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Generate your plan from Dashboard and come back to
                            review the full deep-dive routine.
                        </p>
                    )}
                </div>
            </section>
        );
    }

    const goalType = useMemo<'Bulk' | 'Cut' | 'Maintain'>(() => {
        const label = weeklyPlan.goal.toLowerCase();

        if (label.includes('cut')) {
            return 'Cut';
        }

        if (label.includes('maintain')) {
            return 'Maintain';
        }

        return 'Bulk';
    }, [weeklyPlan.goal]);

    const goalGuide = [
        {
            key: 'Bulk',
            label: 'Bulk',
            description:
                'Subir masa muscular con superavit calorico y progresion de carga.',
        },
        {
            key: 'Cut',
            label: 'Cut',
            description:
                'Bajar grasa manteniendo la mayor cantidad posible de masa muscular.',
        },
        {
            key: 'Maintain',
            label: 'Maintain',
            description:
                'Mantener composicion y rendimiento con volumen e intensidad balanceados.',
        },
    ] as const;

    const activeDay = useMemo(
        () => weeklyPlan.days.find((day) => day.day === selectedDay) ?? null,
        [selectedDay, weeklyPlan.days],
    );

    const toggleDay = (day: string) => {
        setSelectedDay((current) => {
            const next = current === day ? null : day;

            if (next) {
                setMobileView('deep-dive');
            } else {
                setMobileView('overview');
            }

            return next;
        });
    };

    useEffect(() => {
        if (!activeDay) {
            setSelectedExercise(null);
            return;
        }

        setSelectedExercise(activeDay.exercises[0]?.name ?? null);
    }, [activeDay]);

    useEffect(() => {
        if (!activeDay && mobileView === 'deep-dive') {
            setMobileView('overview');
        }
    }, [activeDay, mobileView]);

    const fallbackDescription = (exerciseName: string) => {
        if (goalType === 'Cut') {
            return `${exerciseName} keeps training output high while preserving lean tissue during your Cut phase. It helps maintain strength quality with efficient effort and controlled fatigue. Focus on crisp reps and tempo discipline.`;
        }

        if (goalType === 'Maintain') {
            return `${exerciseName} helps maintain strength and movement quality with enough stimulus to preserve muscle without adding unnecessary fatigue. Keep execution clean and consistent across all sets.`;
        }

        return `${exerciseName} is a high-value movement for your Bulk phase because it combines mechanical tension and quality volume. It supports progressive overload while reinforcing stable movement patterns. Stay strict with form to maximize muscle recruitment.`;
    };

    const fallbackTechniquePoints = (exerciseName: string) => [
        `Set up with stable posture and brace before each ${exerciseName} rep.`,
        'Control the eccentric phase and avoid rushing transitions.',
        'Keep range of motion consistent from first rep to last rep.',
    ];

    const resolveMuscleGroup = (exercise: Exercise) => {
        if (exercise.muscleGroup) {
            return exercise.muscleGroup;
        }

        const label = exercise.name.toLowerCase();
        if (label.includes('bench') || label.includes('press')) return 'Chest';
        if (label.includes('squat') || label.includes('lunge'))
            return 'Quadriceps';
        if (label.includes('pull') || label.includes('row')) return 'Back';
        if (label.includes('deadlift') || label.includes('hinge'))
            return 'Posterior Chain';
        return 'Primary Target';
    };

    const buildDayImpactSummary = (day: DailyWorkout): string => {
        const distribution = new Map<string, number>();

        for (const exercise of day.exercises) {
            const group = resolveMuscleGroup(exercise);
            distribution.set(group, (distribution.get(group) ?? 0) + 1);
        }

        const topGroups = Array.from(distribution.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([group]) => group.toLowerCase());

        const focusText =
            topGroups.length > 0
                ? topGroups.join(', ')
                : 'movement quality and consistent execution';

        const intensityText =
            day.intensity === 'high'
                ? 'This is a high-output day, so quality sets and recovery habits matter more than chasing extra volume.'
                : day.intensity === 'moderate'
                  ? 'This is a moderate day designed to build quality volume without accumulating unnecessary fatigue.'
                  : 'This is a low-intensity day focused on restoring readiness while maintaining technical quality.';

        const goalText =
            goalType === 'Cut'
                ? 'For your cut context, this session helps preserve muscle while keeping energy expenditure productive.'
                                : goalType === 'Maintain'
                                    ? 'For your maintain context, this session balances performance, recovery, and consistency across the week.'
                                    : 'For your bulk context, this session supports progressive overload and better weekly hypertrophy distribution.';

        return `${day.day} emphasizes ${focusText}. ${intensityText} ${goalText}`;
    };

    return (
        <section className="min-h-screen px-4 py-8 md:px-8">
            <div className="mx-auto w-full max-w-7xl space-y-6">
                <header className="space-y-3">
                    <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
                        Weekly training
                    </p>
                    <h1 className="bg-linear-to-r from-neon-pink to-neon-blue bg-clip-text font-['Orbitron',sans-serif] text-3xl font-bold text-transparent md:text-5xl">
                        Your Aura Plan
                    </h1>
                </header>

                <article className="glass-panel rounded-2xl p-5 md:p-6">
                    <div className="grid gap-5 md:grid-cols-[2fr_1fr] md:items-start">
                        <div>
                            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                                Goal
                            </p>
                            <p className="mt-2 text-base font-semibold text-foreground md:text-lg">
                                {goalType}
                            </p>

                            <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                {goalGuide.map((goal) => {
                                    const isActive = goal.key === goalType;

                                    return (
                                        <article
                                            key={goal.key}
                                            className={[
                                                'rounded-lg border px-3 py-2 text-sm',
                                                isActive
                                                    ? 'border-neon-blue/45 bg-neon-blue/10'
                                                    : 'border-glass-border bg-background/45',
                                            ].join(' ')}
                                        >
                                            <p className="font-semibold text-foreground">
                                                {goal.label}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {goal.description}
                                            </p>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                                Weekly notes
                            </p>
                            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                                {weeklyPlan.notes.map((note) => (
                                    <li
                                        key={note}
                                        className="rounded-lg border border-glass-border bg-background/45 px-3 py-2"
                                    >
                                        {note}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </article>

                <div className="sticky top-2 z-20 rounded-xl border border-glass-border bg-background/75 p-1 backdrop-blur-xl md:hidden">
                    <div className="grid grid-cols-2 gap-1">
                        <button
                            type="button"
                            onClick={() => setMobileView('overview')}
                            className={[
                                'rounded-lg px-3 py-2 text-xs font-semibold tracking-[0.14em] uppercase transition',
                                mobileView === 'overview'
                                    ? 'bg-neon-blue/15 text-neon-blue shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                                    : 'text-muted-foreground hover:text-foreground',
                            ].join(' ')}
                        >
                            Overview
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                if (activeDay) {
                                    setMobileView('deep-dive');
                                }
                            }}
                            disabled={!activeDay}
                            className={[
                                'rounded-lg px-3 py-2 text-xs font-semibold tracking-[0.14em] uppercase transition',
                                mobileView === 'deep-dive'
                                    ? 'bg-neon-pink/15 text-neon-pink shadow-[0_0_10px_rgba(217,70,239,0.2)]'
                                    : 'text-muted-foreground hover:text-foreground',
                                !activeDay
                                    ? 'cursor-not-allowed opacity-50'
                                    : '',
                            ].join(' ')}
                        >
                            Deep-Dive
                        </button>
                    </div>
                </div>

                <div
                    className={[
                        'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3',
                        mobileView === 'overview' ? 'grid' : 'hidden md:grid',
                    ].join(' ')}
                >
                    {weeklyPlan.days.map((day) => {
                        const isOpen = selectedDay === day.day;

                        return (
                            <button
                                key={day.day}
                                type="button"
                                onClick={() => toggleDay(day.day)}
                                className={[
                                    'w-full rounded-2xl border bg-background/35 p-4 text-left transition-all',
                                    isOpen
                                        ? 'border-neon-blue/40 shadow-[0_0_16px_rgba(59,130,246,0.16)]'
                                        : 'border-glass-border hover:border-neon-blue/30',
                                ].join(' ')}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-semibold text-foreground">
                                            {day.day}
                                        </h2>
                                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                            <Target className="h-4 w-4 text-neon-blue" />
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

                                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock3 className="h-4 w-4 text-neon-blue" />
                                    <span>{day.durationMinutes} min</span>
                                </div>

                                <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-glass-border bg-background/45 px-3 py-2 text-sm font-medium text-foreground">
                                    {isOpen
                                        ? 'Deep-Dive Open'
                                        : 'Open Exercise Deep-Dive'}
                                    <Sparkles className="h-4 w-4 text-neon-pink" />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {activeDay ? (
                    <section
                        className={[
                            'space-y-4 rounded-2xl border border-glass-border bg-background/35 p-5 md:p-6',
                            mobileView === 'deep-dive'
                                ? 'block'
                                : 'hidden md:block',
                        ].join(' ')}
                    >
                        <div className="flex items-center justify-between md:hidden">
                            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                                Active day: {activeDay.day}
                            </p>
                            <button
                                type="button"
                                onClick={() => setMobileView('overview')}
                                className="rounded-lg border border-glass-border px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-foreground uppercase"
                            >
                                Back to days
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
                                    Exercise Deep-Dive
                                </p>
                                <h2 className="mt-1 font-['Orbitron',sans-serif] text-2xl font-bold text-foreground">
                                    {activeDay.day} Performance Breakdown
                                </h2>
                            </div>

                            <span
                                className={[
                                    'rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase',
                                    intensityStyles[activeDay.intensity],
                                ].join(' ')}
                            >
                                {activeDay.intensity} day
                            </span>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {activeDay.focus}
                        </p>

                        <div className="rounded-xl border border-neon-blue/45 bg-neon-blue/12 p-4 shadow-[0_0_14px_rgba(59,130,246,0.14)]">
                            <p className="text-[11px] font-semibold tracking-[0.2em] text-neon-blue uppercase">
                                Impact summary
                            </p>
                            <p className="mt-2 text-sm leading-6 text-foreground">
                                {buildDayImpactSummary(activeDay)}
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {activeDay.exercises.map((exercise, index) => {
                                const isActive =
                                    selectedExercise === exercise.name;
                                const points = exercise.technique_points?.length
                                    ? exercise.technique_points
                                    : exercise.techniquePoints?.length
                                      ? exercise.techniquePoints
                                      : [];
                                const resolvedPoints = points.length
                                    ? points
                                    : fallbackTechniquePoints(exercise.name);
                                const description =
                                    exercise.purpose ??
                                    exercise.description ??
                                    fallbackDescription(exercise.name);

                                return (
                                    <article
                                        key={`${activeDay.day}-${exercise.name}`}
                                        className={[
                                            'animate-in rounded-2xl border bg-background/45 p-5 backdrop-blur-md duration-500 fade-in slide-in-from-bottom-4',
                                            isActive
                                                ? 'border-neon-blue/40 shadow-[0_0_14px_rgba(59,130,246,0.16)]'
                                                : 'border-glass-border hover:border-neon-pink/30 hover:shadow-[0_0_12px_rgba(217,70,239,0.12)]',
                                        ].join(' ')}
                                        style={{
                                            animationDelay: `${index * 70}ms`,
                                        }}
                                        onClick={() =>
                                            setSelectedExercise(exercise.name)
                                        }
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === 'Enter' ||
                                                event.key === ' '
                                            ) {
                                                event.preventDefault();
                                                setSelectedExercise(
                                                    exercise.name,
                                                );
                                            }
                                        }}
                                    >
                                        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-xl font-semibold text-foreground">
                                                    {exercise.name}
                                                </h3>
                                                {exercise.notes ? (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {exercise.notes}
                                                    </p>
                                                ) : null}
                                            </div>

                                            <span className="rounded-full border border-neon-blue/40 bg-neon-blue/10 px-2.5 py-1 text-xs font-semibold tracking-wide text-neon-blue uppercase">
                                                {resolveMuscleGroup(exercise)}{' '}
                                                Focus
                                            </span>
                                        </header>

                                        <div className="grid gap-2 rounded-xl border border-glass-border bg-background/60 p-3 font-mono text-sm text-foreground sm:grid-cols-3">
                                            <p>
                                                <span className="text-muted-foreground">
                                                    Sets:
                                                </span>{' '}
                                                {exercise.sets}
                                            </p>
                                            <p>
                                                <span className="text-muted-foreground">
                                                    Reps:
                                                </span>{' '}
                                                {exercise.reps}
                                            </p>
                                            <p>
                                                <span className="text-muted-foreground">
                                                    Rest:
                                                </span>{' '}
                                                {exercise.rest}
                                            </p>
                                        </div>

                                        <p className="mt-4 text-sm leading-6 text-foreground">
                                            {description}
                                        </p>

                                        <div className="mt-4 rounded-xl border border-glass-border bg-background/55 p-4">
                                            <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                                                <Dumbbell className="h-4 w-4 text-neon-pink" />
                                                Key Points for Performance
                                            </p>

                                            <ul className="space-y-2">
                                                {resolvedPoints
                                                    .slice(0, 3)
                                                    .map(
                                                        (point, pointIndex) => (
                                                            <li
                                                                key={`${exercise.name}-${point}`}
                                                                className="flex items-start gap-2 text-sm text-foreground"
                                                            >
                                                                {pointIndex %
                                                                    2 ===
                                                                0 ? (
                                                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-neon-blue" />
                                                                ) : (
                                                                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-neon-pink" />
                                                                )}
                                                                <span>
                                                                    {point}
                                                                </span>
                                                            </li>
                                                        ),
                                                    )}
                                            </ul>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        <div>
                            <p className="mb-2 text-xs tracking-[0.2em] text-muted-foreground uppercase">
                                Day notes
                            </p>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                {activeDay.notes.map((note) => (
                                    <li key={`${activeDay.day}-${note}`}>
                                        • {note}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                ) : null}

                {!activeDay && mobileView === 'deep-dive' ? (
                    <section className="rounded-2xl border border-glass-border bg-background/40 p-5 text-sm text-muted-foreground md:hidden">
                        Select a day from Overview to open your Exercise
                        Deep-Dive.
                    </section>
                ) : null}
            </div>
        </section>
    );
}
