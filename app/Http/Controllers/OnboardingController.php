<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class OnboardingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $heightCm = (float) ($user->height_cm ?? 0);
        $heightInches = $heightCm > 0 ? (int) round($heightCm / 2.54) : 0;

        return Inertia::render('onboarding', [
            'initialData' => [
                'activity_level' => $user->activity_level ?? 'moderate',
                'fitness_goal' => $user->fitness_goal ?? 'recomposition',
                'workout_mode' => $user->workout_mode ?? 'generate',
                'age' => $user->age,
                'weight_value' => $user->weight_kg,
                'weight_unit' => 'kg',
                'height_unit' => 'cm',
                'height_cm' => $user->height_cm,
                'height_ft' => $heightInches > 0 ? intdiv($heightInches, 12) : null,
                'height_in' => $heightInches > 0 ? $heightInches % 12 : null,
                'sports_practiced' => is_array($user->sports_practiced) && count($user->sports_practiced) > 0
                    ? $user->sports_practiced
                    : ['None'],
                'sports_schedule' => is_array($user->sports_schedule)
                    ? $user->sports_schedule
                    : [],
                'sports_intensity' => is_array($user->sports_intensity)
                    ? $user->sports_intensity
                    : [],
                'sports_other' => $user->sports_other ?? '',
                'custom_routine' => is_array($user->onboarding_custom_routine)
                    ? $user->onboarding_custom_routine
                    : [
                        'Monday' => '',
                        'Tuesday' => '',
                        'Wednesday' => '',
                        'Thursday' => '',
                        'Friday' => '',
                        'Saturday' => '',
                        'Sunday' => '',
                    ],
            ],
        ]);
    }

    /**
     * Store the onboarding data for the authenticated user.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'activity_level' => ['required', 'in:sedentary,light,moderate,advanced'],
            'fitness_goal' => ['required', 'in:strength,definition,recomposition,maintenance'],
            'workout_mode' => ['required', 'in:generate,custom'],
            'age' => ['required', 'integer', 'min:12', 'max:100'],
            'weight_value' => ['required', 'numeric', 'min:20', 'max:400'],
            'weight_unit' => ['required', 'in:kg,lb'],
            'height_unit' => ['required', 'in:cm,ft-in'],
            'height_cm' => ['nullable', 'numeric', 'min:100', 'max:250', 'required_if:height_unit,cm'],
            'height_ft' => ['nullable', 'integer', 'min:3', 'max:8', 'required_if:height_unit,ft-in'],
            'height_in' => ['nullable', 'integer', 'min:0', 'max:11', 'required_if:height_unit,ft-in'],
            'sports_practiced' => ['required', 'array', 'min:1'],
            'sports_practiced.*' => ['string', 'in:None,Soccer,Basketball,Volleyball,Tennis,Swimming,Running,Cycling,CrossFit,Gym,Martial Arts,Others'],
            'sports_schedule' => ['nullable', 'array'],
            'sports_schedule.*' => ['array'],
            'sports_schedule.*.*' => ['string', 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'],
            'sports_intensity' => ['nullable', 'array'],
            'sports_intensity.*' => ['array'],
            'sports_intensity.*.*' => ['integer', 'in:1,2,3'],
            'sports_other' => ['nullable', 'string', 'max:255'],
            'custom_routine' => ['nullable', 'array'],
            'custom_routine.*' => ['nullable', 'string', 'max:255'],
        ]);

        $sportsData = $this->normalizeSports(
            $validated['sports_practiced'] ?? [],
            $validated['sports_other'] ?? null,
        );
        $sportsIntensity = $this->normalizeSportsIntensity(
            $validated['sports_intensity'] ?? [],
            $sportsData['sports_practiced'],
        );
        $sportsSchedule = $this->normalizeSportsSchedule(
            $sportsIntensity,
            $sportsData['sports_practiced'],
        );
        $weightKg = $this->toKg(
            (float) $validated['weight_value'],
            (string) $validated['weight_unit'],
        );
        $heightCm = $this->toCm(
            (string) $validated['height_unit'],
            isset($validated['height_cm']) ? (float) $validated['height_cm'] : null,
            isset($validated['height_ft']) ? (int) $validated['height_ft'] : null,
            isset($validated['height_in']) ? (int) $validated['height_in'] : null,
        );

        if (in_array('Others', $sportsData['sports_practiced'], true) && $sportsData['sports_other'] === null) {
            return back()
                ->withErrors(['sports_other' => 'Please specify your sport(s) in Others.'])
                ->withInput();
        }

        $user = $request->user();
        $customRoutine = $validated['workout_mode'] === 'custom'
            ? $this->normalizeCustomRoutine($validated['custom_routine'] ?? [])
            : null;

        $user->update([
            'goal' => $this->mapFitnessGoalToGoal($validated['fitness_goal']),
            'activity_level' => $validated['activity_level'],
            'fitness_goal' => $validated['fitness_goal'],
            'workout_mode' => $validated['workout_mode'],
            'age' => (int) $validated['age'],
            'weight_kg' => $weightKg,
            'height_cm' => $heightCm,
            'sports_practiced' => $sportsData['sports_practiced'],
            'sports_schedule' => $sportsSchedule,
            'sports_intensity' => $sportsIntensity,
            'sports_other' => $sportsData['sports_other'],
            'onboarding_custom_routine' => $customRoutine,
            'onboarding_completed_at' => Carbon::now(),
        ]);

        // If AI-generated mode, trigger plan generation
        if ($validated['workout_mode'] === 'generate') {
            // TODO: Trigger AI plan generation service here
            // $weeklyPlanService->generateUsingAiOrFallback($mappedGoal);
        }

        // Redirect to dashboard after onboarding
        return redirect()->route('dashboard')->with('success', 'Onboarding completed successfully!');
    }

    /**
     * Map fitness goal to user goal field (bulk, cut, maintain).
     */
    private function mapFitnessGoalToGoal(string $fitnessGoal): string
    {
        return match ($fitnessGoal) {
            'strength' => 'bulk',
            'definition' => 'cut',
            'recomposition' => 'maintain',
            'maintenance' => 'maintain',
            default => 'maintain',
        };
    }

    /**
     * @param  array<string, mixed>  $customRoutine
     * @return array<string, string>
     */
    private function normalizeCustomRoutine(array $customRoutine): array
    {
        $normalized = [];

        foreach ($customRoutine as $day => $focus) {
            if (!is_string($day) || !is_string($focus)) {
                continue;
            }

            $trimmedFocus = trim($focus);

            if ($trimmedFocus !== '') {
                $normalized[$day] = $trimmedFocus;
            }
        }

        return $normalized;
    }

    /**
     * @param  array<int, mixed>  $sports
     * @return array{sports_practiced: array<int, string>, sports_other: ?string}
     */
    private function normalizeSports(array $sports, ?string $sportsOther): array
    {
        $uniqueSports = [];

        foreach ($sports as $sport) {
            if (!is_string($sport)) {
                continue;
            }

            $trimmedSport = trim($sport);

            if ($trimmedSport === '' || in_array($trimmedSport, $uniqueSports, true)) {
                continue;
            }

            $uniqueSports[] = $trimmedSport;
        }

        if (in_array('None', $uniqueSports, true) && count($uniqueSports) > 1) {
            $uniqueSports = array_values(array_filter($uniqueSports, fn(string $item) => $item !== 'None'));
        }

        if ($uniqueSports === []) {
            $uniqueSports = ['None'];
        }

        $normalizedOther = null;

        if (in_array('Others', $uniqueSports, true) && $sportsOther !== null) {
            $trimmedOther = trim($sportsOther);
            $normalizedOther = $trimmedOther === '' ? null : $trimmedOther;
        }

        return [
            'sports_practiced' => $uniqueSports,
            'sports_other' => $normalizedOther,
        ];
    }

    private function toKg(float $value, string $unit): float
    {
        $kg = $unit === 'lb' ? $value * 0.45359237 : $value;

        return round($kg, 2);
    }

    private function toCm(string $heightUnit, ?float $heightCm, ?int $heightFt, ?int $heightIn): float
    {
        if ($heightUnit === 'cm') {
            return round((float) $heightCm, 2);
        }

        $totalInches = ((int) $heightFt * 12) + (int) $heightIn;

        return round($totalInches * 2.54, 2);
    }

    /**
     * @param  array<string, mixed>  $intensity
     * @param  array<int, string>  $selectedSports
     * @return array<string, array<int, string>>
     */
    private function normalizeSportsSchedule(array $intensity, array $selectedSports): array
    {
        $normalized = [];

        foreach ($this->normalizeSportsIntensity($intensity, $selectedSports) as $sport => $dayMap) {
            $normalized[$sport] = array_keys($dayMap);
        }

        return $normalized;
    }

    /**
     * @param  array<string, mixed>  $intensity
     * @param  array<int, string>  $selectedSports
     * @return array<string, array<string, int>>
     */
    private function normalizeSportsIntensity(array $intensity, array $selectedSports): array
    {
        $allowedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        $selectedMap = array_flip($selectedSports);
        $normalized = [];

        foreach ($intensity as $sport => $dayMap) {
            if (!is_string($sport) || !isset($selectedMap[$sport])) {
                continue;
            }

            if ($sport === 'None' || $sport === 'Others') {
                continue;
            }

            if (!is_array($dayMap)) {
                continue;
            }

            $cleanDayMap = [];

            foreach ($dayMap as $day => $level) {
                if (!is_string($day) || !in_array($day, $allowedDays, true)) {
                    continue;
                }

                $numericLevel = is_int($level) ? $level : (is_numeric($level) ? (int) $level : null);

                if (!in_array($numericLevel, [1, 2, 3], true)) {
                    continue;
                }

                $cleanDayMap[$day] = $numericLevel;
            }

            if ($cleanDayMap !== []) {
                $normalized[$sport] = $cleanDayMap;
            }
        }

        return $normalized;
    }
}
