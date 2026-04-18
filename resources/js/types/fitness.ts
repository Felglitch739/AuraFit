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
    planned_workout?: {
        day?: string | null;
        summary?: string | null;
        focus?: string | null;
        adjusted?: string | null;
        durationMinutes?: number | null;
        intensity?: 'low' | 'moderate' | 'high' | null;
        exercises?: WorkoutExercise[];
        notes?: string[];
    } | null;
    planned_nutrition?: {
        summary?: string | null;
        calories?: number | null;
        proteinGrams?: number | null;
        carbsGrams?: number | null;
        fatGrams?: number | null;
        hydrationLiters?: number | null;
        notes?: string[];
    } | null;
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
    examples?: string[];
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
    macroSummary?: {
        entriesCount: number;
        latestMealName?: string | null;
        totals: {
            calories: number;
            proteinGrams: number;
            carbsGrams: number;
            fatGrams: number;
        };
        targets: {
            calories: number;
            proteinGrams: number;
            carbsGrams: number;
            fatGrams: number;
        };
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

export type ChatContextViewModel = {
    userName: string;
    goal: string;
    fitnessGoal: string;
    activityLevel: string;
    today: {
        day: string;
        plannedSession: string;
        adjustedSession?: string | null;
        readinessScore?: number | null;
        sleepHours?: number | null;
        stressLevel?: number | null;
        soreness?: number | null;
    };
    nutrition: {
        targetCalories?: number | null;
        hydrationLiters?: number | null;
        proteinGrams?: number | null;
        carbsGrams?: number | null;
        fatGrams?: number | null;
        nutritionTip?: string | null;
    };
    mentalWellbeing: {
        coachingFocus: string;
        recoveryReminder: string;
    };
};

export type ChatProposalType = 'nutrition' | 'workout';

export type ChatProposal = {
    type: ChatProposalType;
    data: Record<string, unknown>;
};

export type ChatReplyPayload = {
    text?: string;
    proposal?: ChatProposal | null;
    context?: ChatContextViewModel;
    reply?: string;
    focusAreas?: string[];
};
