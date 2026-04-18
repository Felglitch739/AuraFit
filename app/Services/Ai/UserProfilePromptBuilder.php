<?php

namespace App\Services\Ai;

use App\Models\User;

class UserProfilePromptBuilder
{
    public function build(User $user): string
    {
        $goal = $this->normalizeGoal($user->goal);
        $fitnessGoal = $user->fitness_goal ?? 'unspecified';
        $activityLevel = $user->activity_level ?? 'unspecified';
        $workoutMode = $user->workout_mode ?? 'generate';
        $trainingStyle = $this->deriveTrainingStyle($goal, $fitnessGoal, $workoutMode);

        $profile = [
            'goal' => $goal,
            'activity_level' => $activityLevel,
            'fitness_goal' => $fitnessGoal,
            'workout_mode' => $workoutMode,
            'training_style' => $trainingStyle,
            'age' => $user->age ?? 'unspecified',
            'weight_kg' => $user->weight_kg ?? 'unspecified',
            'height_cm' => $user->height_cm ?? 'unspecified',
            'sports_practiced' => $this->formatSportsPracticed($user->sports_practiced),
            'sports_other' => $user->sports_other ?: 'none',
            'onboarding_completed' => $user->onboarding_completed_at?->toDateString() ?? 'no',
            'custom_routine' => $this->formatCustomRoutine($user->onboarding_custom_routine),
        ];

        return implode("\n", [
            'User profile context:',
            '- Primary goal: ' . $profile['goal'],
            '- Fitness goal: ' . $profile['fitness_goal'],
            '- Activity level: ' . $profile['activity_level'],
            '- Workout mode: ' . $profile['workout_mode'],
            '- Training style: ' . $profile['training_style'],
            '- Age: ' . $profile['age'],
            '- Weight (kg): ' . $profile['weight_kg'],
            '- Height (cm): ' . $profile['height_cm'],
            '- Sports practiced: ' . $profile['sports_practiced'],
            '- Other sports: ' . $profile['sports_other'],
            '- Onboarding completed: ' . $profile['onboarding_completed'],
            '- Custom routine / weekly preference: ' . $profile['custom_routine'],
        ]);
    }

    private function normalizeGoal(?string $goal): string
    {
        if (is_string($goal) && in_array($goal, ['bulk', 'cut', 'maintain'], true)) {
            return $goal;
        }

        return 'maintain';
    }

    private function deriveTrainingStyle(string $goal, string $fitnessGoal, string $workoutMode): string
    {
        $style = match ($goal) {
            'bulk' => 'hypertrophy-focused progression with compound lifts',
            'cut' => 'fat-loss friendly training with conditioning and volume control',
            default => 'balanced maintenance with recovery-aware volume',
        };

        if ($workoutMode === 'custom') {
            $style .= '; preserve user-defined structure before adding adaptations';
        }

        if ($fitnessGoal === 'recomposition') {
            $style .= '; bias toward balanced strength and moderate conditioning';
        }

        if ($fitnessGoal === 'strength') {
            $style .= '; emphasize heavy compounds and longer rest periods';
        }

        return $style;
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
