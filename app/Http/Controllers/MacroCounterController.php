<?php

namespace App\Http\Controllers;

use App\Models\FoodEntry;
use App\Services\Nutrition\FoodPhotoAnalyzerService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class MacroCounterController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();

        $entriesToday = FoodEntry::query()
            ->where('user_id', $user->id)
            ->whereDate('logged_on', $today)
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('macros', [
            'analysis' => $request->session()->get('macro_analysis'),
            'entriesToday' => $entriesToday->map(fn(FoodEntry $entry) => [
                'id' => $entry->id,
                'mealName' => $entry->meal_name,
                'mealLabel' => $entry->meal_label,
                'calories' => $entry->calories,
                'proteinGrams' => $entry->protein_grams,
                'carbsGrams' => $entry->carbs_grams,
                'fatGrams' => $entry->fat_grams,
            ])->values()->all(),
        ]);
    }

    public function analyze(Request $request, FoodPhotoAnalyzerService $foodPhotoAnalyzerService): RedirectResponse
    {
        $validated = $request->validate([
            'photo' => ['required', 'image', 'max:5120'],
            'meal_label' => ['nullable', 'string', 'max:80'],
        ]);

        $mealLabel = isset($validated['meal_label']) ? trim((string) $validated['meal_label']) : null;
        $photoPath = $request->file('photo')->store('meal-photos', 'public');

        try {
            $analysis = $foodPhotoAnalyzerService->analyzeFromImage(
                Storage::disk('public')->path($photoPath),
                $mealLabel,
            );

            $analysis['imagePath'] = $photoPath;
            $request->session()->put('macro_analysis', $analysis);
        } catch (Throwable) {
            Storage::disk('public')->delete($photoPath);

            return back()->withErrors([
                'macro_counter' => 'We could not analyze that food photo right now. No fallback content was created.',
            ]);
        }

        return redirect()->route('macros.index')->with('success', 'Photo analyzed. Review the chatbot recommendation and save if it looks correct.');
    }

    public function save(Request $request): RedirectResponse
    {
        $analysis = $request->session()->get('macro_analysis');

        if (!is_array($analysis)) {
            return redirect()->route('macros.index')->withErrors([
                'macro_counter' => 'There is no analyzed meal to save yet.',
            ]);
        }

        $user = $request->user();

        DB::transaction(function () use ($user, $analysis): void {
            FoodEntry::query()->create([
                'user_id' => $user->id,
                'logged_on' => Carbon::today()->toDateString(),
                'meal_name' => (string) $analysis['mealName'],
                'meal_label' => $analysis['mealLabel'] ?? null,
                'summary' => (string) $analysis['summary'],
                'calories' => (int) $analysis['calories'],
                'protein_grams' => (int) $analysis['proteinGrams'],
                'carbs_grams' => (int) $analysis['carbsGrams'],
                'fat_grams' => (int) $analysis['fatGrams'],
                'fiber_grams' => isset($analysis['fiberGrams']) ? (int) $analysis['fiberGrams'] : null,
                'sugar_grams' => isset($analysis['sugarGrams']) ? (int) $analysis['sugarGrams'] : null,
                'sodium_mg' => isset($analysis['sodiumMg']) ? (int) $analysis['sodiumMg'] : null,
                'nutrition_json' => $analysis,
                'image_path' => isset($analysis['imagePath']) ? (string) $analysis['imagePath'] : null,
            ]);
        });

        $request->session()->forget('macro_analysis');

        return redirect()->route('progress.index')->with('success', 'Meal saved to daily progress.');
    }

    public function progress(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();

        $entries = FoodEntry::query()
            ->where('user_id', $user->id)
            ->whereDate('logged_on', $today)
            ->latest()
            ->get();

        $totals = [
            'calories' => (int) $entries->sum('calories'),
            'proteinGrams' => (int) $entries->sum('protein_grams'),
            'carbsGrams' => (int) $entries->sum('carbs_grams'),
            'fatGrams' => (int) $entries->sum('fat_grams'),
        ];

        $nutrition = $user->nutritionPlan?->nutrition_json;

        $targets = [
            'calories' => (int) ($nutrition['targetCalories'] ?? 2200),
            'proteinGrams' => (int) ($nutrition['macroTargets']['proteinGrams'] ?? 140),
            'carbsGrams' => (int) ($nutrition['macroTargets']['carbsGrams'] ?? 250),
            'fatGrams' => (int) ($nutrition['macroTargets']['fatGrams'] ?? 70),
        ];

        return Inertia::render('progress', [
            'dateLabel' => Carbon::today()->isoFormat('dddd, D MMM YYYY'),
            'totals' => $totals,
            'targets' => $targets,
            'entries' => $entries->map(fn(FoodEntry $entry) => [
                'id' => $entry->id,
                'mealName' => $entry->meal_name,
                'mealLabel' => $entry->meal_label,
                'summary' => $entry->summary,
                'calories' => $entry->calories,
                'proteinGrams' => $entry->protein_grams,
                'carbsGrams' => $entry->carbs_grams,
                'fatGrams' => $entry->fat_grams,
                'fiberGrams' => $entry->fiber_grams,
                'sugarGrams' => $entry->sugar_grams,
                'sodiumMg' => $entry->sodium_mg,
                'createdAt' => $entry->created_at?->format('H:i'),
            ])->values()->all(),
        ]);
    }
}
