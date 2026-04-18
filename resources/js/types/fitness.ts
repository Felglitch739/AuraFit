export type FitnessGoal = 'bulk' | 'cut' | 'maintain';

export type WorkoutExercise = {
    name: string;
    sets?: string | number;
    reps?: string;
    rest?: string;
    notes?: string;
};

export type WeeklyPlanDay = {
    day: string;
    focus: string;
    durationMinutes?: number;
    intensity?: 'low' | 'moderate' | 'high';
    exercises?: WorkoutExercise[];
    notes?: string;
};

export type WeeklyPlanData = {
    goal: FitnessGoal;
    days: WeeklyPlanDay[];
    notes?: string[];
};

export type DailyCheckInValues = {
    sleepHours: number | '';
    stressLevel: number | '';
    soreness: number | '';
};

export type RecommendationData = {
    readinessScore: number;
    planned: string;
    adjusted: string;
    workoutJson: {
        title?: string;
        summary?: string;
        exercises?: WorkoutExercise[];
        notes?: string[];
    };
    nutritionTip: string;
    message?: string;
};

export type NutritionMeal = {
    time: string;
    name: string;
    description: string;
    calories: number;
};

export type NutritionDay = {
    day: string;
    focus: string;
    meals: NutritionMeal[];
    notes: string[];
};

export type NutritionPlanData = {
    goal: FitnessGoal;
    title: string;
    summary: string;
    targetCalories: number;
    macroTargets: {
        proteinGrams: number;
        carbsGrams: number;
        fatGrams: number;
    };
    hydrationLiters: number;
    days: NutritionDay[];
    notes: string[];
    nutritionTip: string;
};

export type DashboardViewModel = {
    weeklyPlan?: WeeklyPlanData | null;
    dailyCheckIn?: DailyCheckInValues | null;
    recommendation?: RecommendationData | null;
    nutritionPlan?: NutritionPlanData | null;
    currentDayLabel?: string;
    dashboardSummary?: {
        headline: string;
        description: string;
        status: 'ready' | 'building' | 'recovery';
        cards: Array<{
            label: string;
            value: string;
            detail: string;
        }>;
    };
};

export type NutritionViewModel = {
    goal?: FitnessGoal | null;
    nutritionPlan?: NutritionPlanData | null;
    nutritionTip?: string | null;
    hasNutritionPlan?: boolean;
    currentDayLabel?: string;
    nutritionFormDefaults?: {
        goal: FitnessGoal;
        use_mock: boolean;
    };
};
