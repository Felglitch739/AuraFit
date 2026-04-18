import { Head, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Bike,
    CheckCircle2,
    Circle,
    Dumbbell,
    Footprints,
    Goal,
    Medal,
    PersonStanding,
    Target,
    Shield,
    Swords,
    Trophy,
    LoaderCircle,
    Sparkles,
    Wand2,
    Waves,
    Zap,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'advanced';
type FitnessGoal = 'strength' | 'definition' | 'recomposition' | 'maintenance';
type WorkoutMode = 'generate' | 'custom';

type OnboardingData = {
    activity_level: ActivityLevel;
    fitness_goal: FitnessGoal;
    workout_mode: WorkoutMode;
    age: number | '';
    weight_value: number | '';
    weight_unit: 'kg' | 'lb';
    height_unit: 'cm' | 'ft-in';
    height_cm: number | '';
    height_ft: number | '';
    height_in: number | '';
    sports_practiced: string[];
    sports_other: string;
    custom_routine?: {
        [day: string]: string;
    };
};

type OnboardingPageProps = {
    initialData?: Partial<OnboardingData>;
};

const activityLevels: {
    value: ActivityLevel;
    label: string;
    description: string;
}[] = [
    {
        value: 'sedentary',
        label: 'Sedentary',
        description: 'Little to no exercise',
    },
    {
        value: 'light',
        label: 'Light',
        description: '1-3 days per week',
    },
    {
        value: 'moderate',
        label: 'Moderate',
        description: '3-5 days per week',
    },
    {
        value: 'advanced',
        label: 'Advanced Athlete',
        description: '5+ days per week',
    },
];

const fitnessGoals: {
    value: FitnessGoal;
    label: string;
    description: string;
}[] = [
    {
        value: 'strength',
        label: 'Gain Strength & Volume',
        description: 'Build muscle mass and power',
    },
    {
        value: 'definition',
        label: 'Definition',
        description: 'Get leaner and more defined',
    },
    {
        value: 'recomposition',
        label: 'Recomposition',
        description: 'Lose fat while building muscle',
    },
    {
        value: 'maintenance',
        label: 'Maintenance',
        description: 'Stay fit and healthy',
    },
];

const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

const sportsOptions = [
    'None',
    'Soccer',
    'Basketball',
    'Volleyball',
    'Tennis',
    'Swimming',
    'Running',
    'Cycling',
    'CrossFit',
    'Martial Arts',
    'Others',
] as const;

const sportIcons: Record<
    (typeof sportsOptions)[number],
    React.ComponentType<{ className?: string }>
> = {
    None: CheckCircle2,
    Soccer: Goal,
    Basketball: Circle,
    Volleyball: Target,
    Tennis: Trophy,
    Swimming: Waves,
    Running: Footprints,
    Cycling: Bike,
    CrossFit: Dumbbell,
    'Martial Arts': Swords,
    Others: Medal,
};

const sportIconColors: Record<(typeof sportsOptions)[number], string> = {
    None: 'bg-slate-500/20 text-slate-300',
    Soccer: 'bg-emerald-500/20 text-emerald-300',
    Basketball: 'bg-orange-500/20 text-orange-300',
    Volleyball: 'bg-yellow-500/20 text-yellow-300',
    Tennis: 'bg-lime-500/20 text-lime-300',
    Swimming: 'bg-cyan-500/20 text-cyan-300',
    Running: 'bg-fuchsia-500/20 text-fuchsia-300',
    Cycling: 'bg-blue-500/20 text-blue-300',
    CrossFit: 'bg-red-500/20 text-red-300',
    'Martial Arts': 'bg-violet-500/20 text-violet-300',
    Others: 'bg-pink-500/20 text-pink-300',
};

export default function OnboardingPage({ initialData }: OnboardingPageProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [data, setData] = useState<OnboardingData>({
        activity_level: initialData?.activity_level ?? 'moderate',
        fitness_goal: initialData?.fitness_goal ?? 'recomposition',
        workout_mode: initialData?.workout_mode ?? 'generate',
        age: initialData?.age ?? '',
        weight_value: initialData?.weight_value ?? '',
        weight_unit: initialData?.weight_unit ?? 'kg',
        height_unit: initialData?.height_unit ?? 'cm',
        height_cm: initialData?.height_cm ?? '',
        height_ft: initialData?.height_ft ?? '',
        height_in: initialData?.height_in ?? '',
        sports_practiced: initialData?.sports_practiced ?? ['None'],
        sports_other: initialData?.sports_other ?? '',
        custom_routine: {
            Monday: initialData?.custom_routine?.Monday ?? '',
            Tuesday: initialData?.custom_routine?.Tuesday ?? '',
            Wednesday: initialData?.custom_routine?.Wednesday ?? '',
            Thursday: initialData?.custom_routine?.Thursday ?? '',
            Friday: initialData?.custom_routine?.Friday ?? '',
            Saturday: initialData?.custom_routine?.Saturday ?? '',
            Sunday: initialData?.custom_routine?.Sunday ?? '',
        },
    });

    const form = useForm({
        activity_level: data.activity_level,
        fitness_goal: data.fitness_goal,
        workout_mode: data.workout_mode,
        age: data.age,
        weight_value: data.weight_value,
        weight_unit: data.weight_unit,
        height_unit: data.height_unit,
        height_cm: data.height_cm,
        height_ft: data.height_ft,
        height_in: data.height_in,
        sports_practiced: data.sports_practiced,
        sports_other: data.sports_other,
        custom_routine: data.custom_routine,
    });

    const handleActivityLevelChange = (level: ActivityLevel) => {
        setData((prev) => ({ ...prev, activity_level: level }));
    };

    const handleFitnessGoalChange = (goal: FitnessGoal) => {
        setData((prev) => ({ ...prev, fitness_goal: goal }));
    };

    const handleWorkoutModeChange = (mode: WorkoutMode) => {
        setData((prev) => ({ ...prev, workout_mode: mode }));
    };

    const handleCustomRoutineChange = (day: string, value: string) => {
        setData((prev) => ({
            ...prev,
            custom_routine: {
                ...(prev.custom_routine ?? {}),
                [day]: value,
            },
        }));
    };

    const handleSportToggle = (sport: (typeof sportsOptions)[number]) => {
        setData((prev) => {
            const alreadySelected = prev.sports_practiced.includes(sport);

            if (sport === 'None') {
                return {
                    ...prev,
                    sports_practiced: alreadySelected ? [] : ['None'],
                    sports_other: '',
                };
            }

            let nextSports = prev.sports_practiced.filter(
                (item) => item !== 'None',
            );

            if (alreadySelected) {
                nextSports = nextSports.filter((item) => item !== sport);
            } else {
                nextSports = [...nextSports, sport];
            }

            return {
                ...prev,
                sports_practiced: nextSports,
                sports_other: nextSports.includes('Others')
                    ? prev.sports_other
                    : '',
            };
        });
    };

    const handleNextStep = () => {
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleFinalize = () => {
        form.post('/onboarding', {
            onSuccess: () => {
                toast.success('Onboarding completed successfully!');
            },
            onError: () => {
                toast.error('Failed to complete onboarding. Please try again.');
            },
        });
    };

    // Update form data when data state changes
    useEffect(() => {
        form.setData({
            activity_level: data.activity_level,
            fitness_goal: data.fitness_goal,
            workout_mode: data.workout_mode,
            age: data.age,
            weight_value: data.weight_value,
            weight_unit: data.weight_unit,
            height_unit: data.height_unit,
            height_cm: data.height_cm,
            height_ft: data.height_ft,
            height_in: data.height_in,
            sports_practiced: data.sports_practiced,
            sports_other: data.sports_other,
            custom_routine: data.custom_routine,
        });
    }, [data]);

    const progressPercentage = (currentStep / 5) * 100;

    return (
        <>
            <Head title="Onboarding" />

            <div className="min-h-screen bg-background text-foreground">
                {/* Background gradients */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--color-neon-pink),transparent_30%),radial-gradient(circle_at_top_right,var(--color-neon-blue),transparent_26%),linear-gradient(180deg,var(--color-background)_0%,transparent_45%,var(--color-background)_100%)] opacity-20" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(var(--color-foreground)_1px,transparent_1px)] bg-size-[56px_56px] opacity-[0.03]" />

                {/* Main content */}
                <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-2 py-6 sm:px-4 sm:py-8">
                    <div className="w-full max-w-none md:max-w-3xl">
                        {/* Header */}
                        <div className="mb-8 text-center">
                            <div className="mb-4 flex items-center justify-center gap-2">
                                <Zap className="h-8 w-8 text-neon-pink" />
                                <h1 className="font-['Orbitron',sans-serif] text-3xl font-bold text-foreground">
                                    AuraFit
                                </h1>
                            </div>
                            <p className="text-muted-foreground">
                                Let's set up your fitness journey
                            </p>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-8">
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Step {currentStep} of 5
                                </span>
                                <span className="font-semibold text-neon-pink">
                                    {Math.round(progressPercentage)}%
                                </span>
                            </div>
                            <div className="relative h-2 overflow-hidden rounded-full border border-glass-border bg-background/50">
                                <div
                                    className="absolute inset-y-0 left-0 bg-linear-to-r from-neon-pink to-neon-blue transition-all duration-500 ease-out"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="glass-panel rounded-2xl border border-glass-border bg-glass-panel p-4 backdrop-blur-xl sm:p-6 md:p-8">
                            {/* Step 1: Lifestyle */}
                            {currentStep === 1 && (
                                <div className="animate-in space-y-6 duration-300 fade-in">
                                    <div>
                                        <h2 className="mb-2 font-['Orbitron',sans-serif] text-2xl font-bold text-foreground">
                                            Your Activity Level
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            How often do you exercise?
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {activityLevels.map((level) => (
                                            <button
                                                key={level.value}
                                                onClick={() =>
                                                    handleActivityLevelChange(
                                                        level.value,
                                                    )
                                                }
                                                className={[
                                                    'w-full rounded-xl border-2 p-4 text-left transition-all duration-200',
                                                    data.activity_level ===
                                                    level.value
                                                        ? 'border-neon-pink bg-neon-pink/10 shadow-[0_0_20px_rgba(217,70,239,0.3)]'
                                                        : 'border-glass-border bg-background/40 hover:border-neon-pink/50',
                                                ].join(' ')}
                                            >
                                                <div className="font-semibold text-foreground">
                                                    {level.label}
                                                </div>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {level.description}
                                                </p>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="mb-2 font-['Orbitron',sans-serif] text-xl font-bold text-foreground">
                                            Your Main Goal
                                        </h3>
                                        <p className="mb-4 text-sm text-muted-foreground">
                                            What's your primary fitness
                                            objective?
                                        </p>

                                        <div className="space-y-3">
                                            {fitnessGoals.map((goal) => (
                                                <button
                                                    key={goal.value}
                                                    onClick={() =>
                                                        handleFitnessGoalChange(
                                                            goal.value,
                                                        )
                                                    }
                                                    className={[
                                                        'w-full rounded-xl border-2 p-4 text-left transition-all duration-200',
                                                        data.fitness_goal ===
                                                        goal.value
                                                            ? 'border-neon-blue bg-neon-blue/10 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                                            : 'border-glass-border bg-background/40 hover:border-neon-blue/50',
                                                    ].join(' ')}
                                                >
                                                    <div className="font-semibold text-foreground">
                                                        {goal.label}
                                                    </div>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {goal.description}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-xl border border-glass-border bg-background/40 p-3 text-xs text-muted-foreground">
                                        Next: body profile (age, weight, height)
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Body Profile */}
                            {currentStep === 2 && (
                                <div className="animate-in space-y-6 duration-300 fade-in">
                                    <div>
                                        <h2 className="mb-2 font-['Orbitron',sans-serif] text-2xl font-bold text-foreground">
                                            Body Profile
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            This helps us personalize load,
                                            recovery, and nutrition guidance.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-1 block text-sm font-semibold text-foreground">
                                                Age
                                            </label>
                                            <input
                                                type="number"
                                                min={12}
                                                max={100}
                                                value={data.age}
                                                onChange={(e) =>
                                                    setData((prev) => ({
                                                        ...prev,
                                                        age: e.target.value
                                                            ? Number(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : '',
                                                    }))
                                                }
                                                placeholder="e.g., 25"
                                                className="w-full rounded-lg border border-glass-border bg-background/60 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/20"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-semibold text-foreground">
                                                Weight
                                            </label>
                                            <div className="grid grid-cols-[1fr_auto] gap-2">
                                                <input
                                                    type="number"
                                                    min={20}
                                                    step={0.1}
                                                    value={data.weight_value}
                                                    onChange={(e) =>
                                                        setData((prev) => ({
                                                            ...prev,
                                                            weight_value: e
                                                                .target.value
                                                                ? Number(
                                                                      e.target
                                                                          .value,
                                                                  )
                                                                : '',
                                                        }))
                                                    }
                                                    placeholder="e.g., 70"
                                                    className="w-full rounded-lg border border-glass-border bg-background/60 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/20"
                                                />
                                                <select
                                                    value={data.weight_unit}
                                                    onChange={(e) =>
                                                        setData((prev) => ({
                                                            ...prev,
                                                            weight_unit: e
                                                                .target
                                                                .value as
                                                                | 'kg'
                                                                | 'lb',
                                                        }))
                                                    }
                                                    className="rounded-lg border border-glass-border bg-background/60 px-3 py-2 text-sm text-foreground outline-none focus:border-neon-pink"
                                                >
                                                    <option value="kg">
                                                        kg
                                                    </option>
                                                    <option value="lb">
                                                        lb
                                                    </option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="mb-1 block text-sm font-semibold text-foreground">
                                                Height
                                            </label>
                                            <div className="mb-2">
                                                <select
                                                    value={data.height_unit}
                                                    onChange={(e) =>
                                                        setData((prev) => ({
                                                            ...prev,
                                                            height_unit: e
                                                                .target
                                                                .value as
                                                                | 'cm'
                                                                | 'ft-in',
                                                        }))
                                                    }
                                                    className="rounded-lg border border-glass-border bg-background/60 px-3 py-2 text-sm text-foreground outline-none focus:border-neon-pink"
                                                >
                                                    <option value="cm">
                                                        cm
                                                    </option>
                                                    <option value="ft-in">
                                                        ft/in
                                                    </option>
                                                </select>
                                            </div>

                                            {data.height_unit === 'cm' ? (
                                                <input
                                                    type="number"
                                                    min={100}
                                                    max={250}
                                                    step={0.1}
                                                    value={data.height_cm}
                                                    onChange={(e) =>
                                                        setData((prev) => ({
                                                            ...prev,
                                                            height_cm: e.target
                                                                .value
                                                                ? Number(
                                                                      e.target
                                                                          .value,
                                                                  )
                                                                : '',
                                                        }))
                                                    }
                                                    placeholder="e.g., 175"
                                                    className="w-full rounded-lg border border-glass-border bg-background/60 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/20"
                                                />
                                            ) : (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        type="number"
                                                        min={3}
                                                        max={8}
                                                        value={data.height_ft}
                                                        onChange={(e) =>
                                                            setData((prev) => ({
                                                                ...prev,
                                                                height_ft: e
                                                                    .target
                                                                    .value
                                                                    ? Number(
                                                                          e
                                                                              .target
                                                                              .value,
                                                                      )
                                                                    : '',
                                                            }))
                                                        }
                                                        placeholder="ft"
                                                        className="w-full rounded-lg border border-glass-border bg-background/60 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/20"
                                                    />
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={11}
                                                        value={data.height_in}
                                                        onChange={(e) =>
                                                            setData((prev) => ({
                                                                ...prev,
                                                                height_in: e
                                                                    .target
                                                                    .value
                                                                    ? Number(
                                                                          e
                                                                              .target
                                                                              .value,
                                                                      )
                                                                    : '',
                                                            }))
                                                        }
                                                        placeholder="in"
                                                        className="w-full rounded-lg border border-glass-border bg-background/60 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/20"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Sports Profile */}
                            {currentStep === 3 && (
                                <div className="animate-in space-y-6 duration-300 fade-in">
                                    <div>
                                        <h2 className="mb-2 font-['Orbitron',sans-serif] text-2xl font-bold text-foreground">
                                            Sports Background
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Select all that apply. This gives
                                            better context for AI-personalized
                                            training and nutrition.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                        {sportsOptions.map((sport) => {
                                            const selected =
                                                data.sports_practiced.includes(
                                                    sport,
                                                );
                                            const SportIcon = sportIcons[sport];
                                            const iconColor =
                                                sportIconColors[sport];

                                            return (
                                                <button
                                                    key={sport}
                                                    type="button"
                                                    onClick={() =>
                                                        handleSportToggle(sport)
                                                    }
                                                    className={[
                                                        'group aspect-square rounded-2xl border p-3 text-center transition active:scale-[0.98]',
                                                        selected
                                                            ? 'border-neon-pink bg-neon-pink/15 text-foreground shadow-[0_0_18px_rgba(217,70,239,0.28)]'
                                                            : 'border-glass-border bg-background/40 text-muted-foreground hover:border-neon-pink/50 hover:text-foreground',
                                                    ].join(' ')}
                                                >
                                                    <span className="flex h-full flex-col items-center justify-center gap-2">
                                                        <span
                                                            className={[
                                                                'inline-flex h-12 w-12 items-center justify-center rounded-2xl transition group-hover:scale-105',
                                                                iconColor,
                                                            ].join(' ')}
                                                        >
                                                            <SportIcon className="h-7 w-7" />
                                                        </span>
                                                        <span className="text-xs leading-tight font-semibold">
                                                            {sport}
                                                        </span>
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {data.sports_practiced.includes(
                                        'Others',
                                    ) ? (
                                        <div>
                                            <label className="mb-1 block text-sm font-semibold text-foreground">
                                                Others: which sport(s)?
                                            </label>
                                            <input
                                                type="text"
                                                value={data.sports_other}
                                                onChange={(e) =>
                                                    setData((prev) => ({
                                                        ...prev,
                                                        sports_other:
                                                            e.target.value,
                                                    }))
                                                }
                                                placeholder="e.g., Climbing, Rowing"
                                                className="w-full rounded-lg border border-glass-border bg-background/60 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/20"
                                            />
                                        </div>
                                    ) : null}
                                </div>
                            )}

                            {/* Step 4: Workout Mode */}
                            {currentStep === 4 && (
                                <div className="animate-in space-y-6 duration-300 fade-in">
                                    <div>
                                        <h2 className="mb-2 font-['Orbitron',sans-serif] text-2xl font-bold text-foreground">
                                            How Do You Want to Train?
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Choose how you'd like to set up your
                                            weekly routine
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {/* AI Generate Option */}
                                        <button
                                            onClick={() =>
                                                handleWorkoutModeChange(
                                                    'generate',
                                                )
                                            }
                                            className={[
                                                'group relative w-full overflow-hidden rounded-xl border-2 p-6 text-left transition-all duration-200',
                                                data.workout_mode === 'generate'
                                                    ? 'border-neon-pink bg-neon-pink/10 shadow-[0_0_25px_rgba(217,70,239,0.4)]'
                                                    : 'border-glass-border bg-background/40 hover:border-neon-pink/50',
                                            ].join(' ')}
                                        >
                                            <div className="pointer-events-none absolute -top-4 -right-4 h-20 w-20 rounded-full bg-neon-pink/20 blur-2xl transition-all group-hover:bg-neon-pink/30" />

                                            <div className="relative flex items-start gap-4">
                                                <div className="mt-1 rounded-lg bg-neon-pink/20 p-3">
                                                    <Wand2 className="h-6 w-6 text-neon-pink" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-foreground">
                                                        AI-Powered Training
                                                    </h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Our AI will create a
                                                        personalized weekly plan
                                                        tailored to your goals,
                                                        activity level, and
                                                        preferences.
                                                    </p>
                                                </div>
                                                {data.workout_mode ===
                                                    'generate' && (
                                                    <div className="mt-1 rounded-full bg-neon-pink p-1">
                                                        <Sparkles className="h-4 w-4 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </button>

                                        {/* Custom Routine Option */}
                                        <button
                                            onClick={() =>
                                                handleWorkoutModeChange(
                                                    'custom',
                                                )
                                            }
                                            className={[
                                                'group relative w-full overflow-hidden rounded-xl border-2 p-6 text-left transition-all duration-200',
                                                data.workout_mode === 'custom'
                                                    ? 'border-neon-blue bg-neon-blue/10 shadow-[0_0_25px_rgba(59,130,246,0.4)]'
                                                    : 'border-glass-border bg-background/40 hover:border-neon-blue/50',
                                            ].join(' ')}
                                        >
                                            <div className="pointer-events-none absolute -top-4 -right-4 h-20 w-20 rounded-full bg-neon-blue/20 blur-2xl transition-all group-hover:bg-neon-blue/30" />

                                            <div className="relative flex items-start gap-4">
                                                <div className="mt-1 rounded-lg bg-neon-blue/20 p-3">
                                                    <Dumbbell className="h-6 w-6 text-neon-blue" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-foreground">
                                                        My Own Muscle Split
                                                    </h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        You already know your
                                                        weekly approach. Set the
                                                        daily muscle-group focus
                                                        and we will adapt load
                                                        and intensity.
                                                    </p>
                                                </div>
                                                {data.workout_mode ===
                                                    'custom' && (
                                                    <div className="mt-1 rounded-full bg-neon-blue p-1">
                                                        <Dumbbell className="h-4 w-4 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Custom Split Builder */}
                            {currentStep === 5 &&
                                data.workout_mode === 'custom' && (
                                    <div className="animate-in space-y-6 duration-300 fade-in">
                                        <div>
                                            <h2 className="mb-2 font-['Orbitron',sans-serif] text-2xl font-bold text-foreground">
                                                Your Weekly Muscle Split
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                Define your daily focus by
                                                muscle groups (e.g., "Push:
                                                chest, shoulders, triceps",
                                                "Back + biceps", "Legs").
                                            </p>
                                        </div>

                                        <div className="max-h-96 space-y-3 overflow-y-auto pr-2">
                                            {daysOfWeek.map((day) => (
                                                <div key={day}>
                                                    <label className="text-sm font-semibold text-foreground">
                                                        {day}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder={
                                                            day === 'Monday'
                                                                ? 'e.g., Push: chest, shoulders, triceps (light load)'
                                                                : day ===
                                                                    'Tuesday'
                                                                  ? 'e.g., Back + biceps (moderate load)'
                                                                  : 'e.g., Legs or recovery / mobility'
                                                        }
                                                        value={
                                                            data
                                                                .custom_routine?.[
                                                                day
                                                            ] ?? ''
                                                        }
                                                        onChange={(e) =>
                                                            handleCustomRoutineChange(
                                                                day,
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="mt-1 w-full rounded-lg border border-glass-border bg-background/60 px-3 py-2 text-sm text-foreground transition outline-none placeholder:text-muted-foreground focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/20"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            {/* Step 5: AI Confirmation (if generate mode) */}
                            {currentStep === 5 &&
                                data.workout_mode === 'generate' && (
                                    <div className="animate-in space-y-6 duration-300 fade-in">
                                        <div className="text-center">
                                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neon-pink/20">
                                                <Wand2 className="h-8 w-8 text-neon-pink" />
                                            </div>
                                            <h2 className="mb-2 font-['Orbitron',sans-serif] text-2xl font-bold text-foreground">
                                                AI Is Ready to Build Your Split
                                            </h2>
                                            <p className="text-muted-foreground">
                                                Based on your activity level (
                                                {data.activity_level}) and goal
                                                ({data.fitness_goal}), our AI
                                                will generate a weekly
                                                muscle-group split with
                                                intensity guidance for your
                                                current readiness.
                                            </p>
                                        </div>

                                        <div className="space-y-3 rounded-xl border border-glass-border bg-background/40 p-4">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="h-5 w-5 text-neon-pink" />
                                                <span className="font-semibold text-foreground">
                                                    What we'll generate:
                                                </span>
                                            </div>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-neon-pink" />
                                                    Weekly muscle-group split
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-neon-pink" />
                                                    Daily load/intensity hints
                                                    (light, moderate, hard)
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-neon-pink" />
                                                    Recovery & nutrition tips
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-neon-pink" />
                                                    Daily readiness adaptation
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="rounded-xl border border-neon-blue/30 bg-neon-blue/10 p-4 text-sm text-foreground">
                                            <p className="mb-2 font-semibold text-neon-blue">
                                                Profile Summary
                                            </p>
                                            <p>
                                                Activity: {data.activity_level}
                                                {' | '}Goal: {data.fitness_goal}
                                            </p>
                                            <p>
                                                Sports:{' '}
                                                {data.sports_practiced.join(
                                                    ', ',
                                                ) || 'None'}
                                                {data.sports_practiced.includes(
                                                    'Others',
                                                ) &&
                                                data.sports_other.trim() !== ''
                                                    ? ` (${data.sports_other.trim()})`
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>
                                )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="mt-6 flex items-center justify-between gap-3">
                            <button
                                onClick={handlePreviousStep}
                                disabled={currentStep === 1}
                                className="flex items-center gap-2 rounded-lg border border-glass-border px-4 py-2.5 font-semibold text-muted-foreground transition hover:border-neon-blue hover:text-neon-blue disabled:opacity-40"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Previous
                            </button>

                            {currentStep < 5 ? (
                                <button
                                    onClick={handleNextStep}
                                    className="flex items-center gap-2 rounded-lg bg-linear-to-r from-neon-pink to-fuchsia-600 px-6 py-2.5 font-semibold text-white shadow-[0_0_20px_rgba(217,70,239,0.4)] transition hover:from-fuchsia-500 hover:to-purple-500"
                                >
                                    Next
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleFinalize}
                                    disabled={form.processing}
                                    className="flex items-center gap-2 rounded-lg bg-linear-to-r from-neon-blue to-cyan-600 px-6 py-2.5 font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] transition hover:from-blue-500 hover:to-blue-600 disabled:opacity-70"
                                >
                                    {form.processing ? (
                                        <>
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                            Finalizing...
                                        </>
                                    ) : (
                                        <>
                                            Finalize Setup
                                            <Zap className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Step indicator */}
                        <div className="mt-4 text-center text-xs text-muted-foreground">
                            Step {currentStep} of 5
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

OnboardingPage.layout = {
    breadcrumbs: [
        {
            title: 'Setup',
            href: '/onboarding',
        },
    ],
};
