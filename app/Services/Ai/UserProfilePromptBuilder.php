<?php

namespace App\Services\Ai;

use App\Models\User;

class UserProfilePromptBuilder
{
    public function __construct(
        private readonly \App\Services\Ai\PromptTemplateService $promptTemplateService,
    ) {
    }

    public function build(User $user): string
    {
        $goal = $this->normalizeGoal($user->goal);
        $fitnessGoal = $user->fitness_goal ?? 'unspecified';
        $activityLevel = $user->activity_level ?? 'unspecified';
        $workoutMode = $user->workout_mode ?? 'generate';
        $trainingEnvironment = $this->normalizeTrainingEnvironment($user->training_environment);
        $trainingStyle = $this->deriveTrainingStyle($goal, $fitnessGoal, $workoutMode, $trainingEnvironment);

        $profile = [
            'goal' => $goal,
            'activity_level' => $activityLevel,
            'fitness_goal' => $fitnessGoal,
            'workout_mode' => $workoutMode,
            'training_environment' => $trainingEnvironment,
            'training_style' => $trainingStyle,
            'age' => $user->age ?? 'unspecified',
            'weight_kg' => $user->weight_kg ?? 'unspecified',
            'height_cm' => $user->height_cm ?? 'unspecified',
            'sports_practiced' => $this->formatSportsPracticed($user->sports_practiced),
            'sports_schedule' => $this->formatSportsSchedule($user->sports_schedule),
            'sports_intensity' => $this->formatSportsIntensity($user->sports_intensity),
            'sports_other' => $user->sports_other ?: 'none',
            'onboarding_completed' => $user->onboarding_completed_at?->toDateString() ?? 'no',
            'custom_routine' => $this->formatCustomRoutine($user->onboarding_custom_routine),
        ];

        return $this->promptTemplateService->render('ai/profile-context.txt', [
            'goal' => $profile['goal'],
            'fitness_goal' => $profile['fitness_goal'],
            'activity_level' => $profile['activity_level'],
            'workout_mode' => $profile['workout_mode'],
            'training_environment' => $profile['training_environment'],
            'training_style' => $profile['training_style'],
            'age' => $profile['age'],
            'weight_kg' => $profile['weight_kg'],
            'height_cm' => $profile['height_cm'],
            'sports_practiced' => $profile['sports_practiced'],
            'sports_schedule' => $profile['sports_schedule'],
            'sports_intensity' => $profile['sports_intensity'],
            'sports_other' => $profile['sports_other'],
            'onboarding_completed' => $profile['onboarding_completed'],
            'custom_routine' => $profile['custom_routine'],
        ]);
    }

    private function normalizeGoal(?string $goal): string
    {
        if (is_string($goal) && in_array($goal, ['bulk', 'cut', 'maintain'], true)) {
            return $goal;
        }

        return 'maintain';
    }

    private function deriveTrainingStyle(string $goal, string $fitnessGoal, string $workoutMode, string $trainingEnvironment): string
    {
        $style = match ($goal) {
            'bulk' => 'hypertrophy-focused progression with compound lifts',
            'cut' => 'fat-loss friendly training with conditioning and volume control',
            default => 'balanced maintenance with recovery-aware volume',
        };

        if ($workoutMode === 'custom') {
            $style .= '; preserve user-defined structure before adding adaptations';
        }

        if ($trainingEnvironment === 'bodyweight') {
            $style .= '; prioritize bodyweight, mobility, and minimal-equipment substitutions';
        } else {
            $style .= '; gym access allows barbells, dumbbells, cables, and machines';
        }

        if ($fitnessGoal === 'recomposition') {
            $style .= '; bias toward balanced strength and moderate conditioning';
        }

        if ($fitnessGoal === 'strength') {
            $style .= '; emphasize heavy compounds and longer rest periods';
        }

        return $style;
    }

    private function normalizeTrainingEnvironment(mixed $trainingEnvironment): string
    {
        if (is_string($trainingEnvironment) && in_array($trainingEnvironment, ['gym', 'bodyweight'], true)) {
            return $trainingEnvironment;
        }

        return 'gym';
    }

    private function formatSportsSchedule(mixed $sportsSchedule): string
    {
        if (!is_array($sportsSchedule) || $sportsSchedule === []) {
            return 'none';
        }

        $pairs = [];

        foreach ($sportsSchedule as $day => $sportOrSession) {
            if (!is_string($day) || trim($day) === '') {
                continue;
            }

            if (is_array($sportOrSession)) {
                $items = array_filter(array_map(
                    static fn($item) => is_string($item) ? trim($item) : '',
                    $sportOrSession,
                ));

                if ($items === []) {
                    continue;
                }

                $pairs[] = $day . ': ' . implode(', ', $items);
                continue;
            }

            if (!is_string($sportOrSession) || trim($sportOrSession) === '') {
                continue;
            }

            $pairs[] = $day . ': ' . $sportOrSession;
        }

        return $pairs !== [] ? implode('; ', $pairs) : 'none';
    }

    private function formatSportsPracticed(mixed $sportsPracticed): string
    {
        if (!is_array($sportsPracticed) || $sportsPracticed === []) {
            return 'none';
        }

        return implode(', ', array_map(
            static fn($sport) => is_string($sport) ? $sport : (string) $sport,
            $sportsPracticed,
        ));
    }

    private function formatSportsIntensity(mixed $sportsIntensity): string
    {
        if (!is_array($sportsIntensity) || $sportsIntensity === []) {
            return 'none';
        }

        $sportEntries = [];

        foreach ($sportsIntensity as $sport => $dayMap) {
            if (!is_string($sport) || trim($sport) === '' || !is_array($dayMap)) {
                continue;
            }

            $dayEntries = [];

            foreach ($dayMap as $day => $level) {
                if (!is_string($day) || trim($day) === '') {
                    continue;
                }

                $numericLevel = is_int($level) ? $level : (is_numeric($level) ? (int) $level : null);

                if (!in_array($numericLevel, [1, 2, 3], true)) {
                    continue;
                }

                $dayEntries[] = sprintf('%s=%d', $day, $numericLevel);
            }

            if ($dayEntries === []) {
                continue;
            }

            $sportEntries[] = $sport . ': ' . implode(', ', $dayEntries);
        }

        return $sportEntries !== [] ? implode('; ', $sportEntries) : 'none';
    }

    private function formatCustomRoutine(mixed $customRoutine): string
    {
        if (!is_array($customRoutine) || $customRoutine === []) {
            return 'none';
        }

        $pairs = [];

        foreach ($customRoutine as $day => $focus) {
            if (!is_string($day) || !is_string($focus) || trim($focus) === '') {
                continue;
            }

            $pairs[] = $day . ': ' . $focus;
        }

        return $pairs !== [] ? implode('; ', $pairs) : 'none';
    }
}
