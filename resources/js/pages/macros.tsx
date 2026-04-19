import { Head, Link, useForm } from '@inertiajs/react';
import {
    Camera,
    MessageCircle,
    Save,
    Sparkles,
    Upload,
    Utensils,
} from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';
import NutritionLoading from '@/components/fitness/NutritionLoading';

type MacroAnalysis = {
    mealName: string;
    mealLabel?: string | null;
    summary: string;
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    fiberGrams?: number | null;
    sugarGrams?: number | null;
    sodiumMg?: number | null;
    recommendation: string;
    detectedItems?: string[];
    confidence?: number | null;
};

type MacrosPageProps = {
    analysis?: MacroAnalysis | null;
    entriesToday?: Array<{
        id: number;
        mealName: string;
        mealLabel?: string | null;
        calories: number;
        proteinGrams: number;
        carbsGrams: number;
        fatGrams: number;
    }>;
};

export default function MacrosPage({
    analysis,
    entriesToday = [],
}: MacrosPageProps) {
    const cameraInputRef = useRef<HTMLInputElement | null>(null);
    const galleryInputRef = useRef<HTMLInputElement | null>(null);

    const analyzeForm = useForm<{
        photo: File | null;
        meal_label: string;
    }>({
        photo: null,
        meal_label: '',
    });

    const saveForm = useForm({});

    const handlePhotoSelected = async (file: File | null) => {
        if (!file) {
            analyzeForm.setData('photo', null);
            return;
        }

        try {
            const compressed = await compressImage(file);
            analyzeForm.setData('photo', compressed);

            if (compressed.size < file.size) {
                const savedKb = Math.round(
                    (file.size - compressed.size) / 1024,
                );
                toast.success(`Image optimized (${savedKb} KB saved).`);
            }
        } catch {
            analyzeForm.setData('photo', file);
        }
    };

    const compressImage = async (file: File): Promise<File> => {
        const MAX_DIMENSION = 1280;
        const QUALITY = 0.72;

        if (!file.type.startsWith('image/')) {
            return file;
        }

        const originalUrl = URL.createObjectURL(file);

        try {
            const image = await new Promise<HTMLImageElement>(
                (resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = () =>
                        reject(new Error('Could not load image'));
                    img.src = originalUrl;
                },
            );

            const ratio = Math.min(
                1,
                MAX_DIMENSION / Math.max(image.width, image.height),
            );
            const width = Math.max(1, Math.round(image.width * ratio));
            const height = Math.max(1, Math.round(image.height * ratio));

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');

            if (!ctx) {
                return file;
            }

            ctx.drawImage(image, 0, 0, width, height);

            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(resolve, 'image/jpeg', QUALITY);
            });

            if (!blob) {
                return file;
            }

            if (blob.size >= file.size) {
                return file;
            }

            return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now(),
            });
        } finally {
            URL.revokeObjectURL(originalUrl);
        }
    };

    if (analyzeForm.processing) {
        return (
            <>
                <Head title="Macro Counter" />

                <div className="space-y-6">
                    <NutritionLoading />
                </div>
            </>
        );
    }

    const submitAnalyze = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        analyzeForm.post('/macros/analyze', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    'Photo analyzed. Review and save if it looks correct.',
                );
            },
            onError: () => {
                toast.error('Could not analyze that photo right now.');
            },
        });
    };

    const saveMeal = () => {
        saveForm.post('/macros/save', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Meal saved. Opening your daily progress.');
            },
            onError: () => {
                toast.error('Could not save this meal.');
            },
        });
    };

    return (
        <>
            <Head title="Macro Counter" />

            <div className="space-y-6">
                <section className="glass-panel rounded-2xl p-6 md:p-8">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="font-['Orbitron',sans-serif] text-2xl font-bold text-foreground md:text-3xl">
                                Macro Counter
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Take a food photo, get chatbot recommendations,
                                and save it to daily progress.
                            </p>
                        </div>
                        <Link
                            href="/progress"
                            className="rounded-lg border border-glass-border bg-background/40 px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-neon-blue hover:text-neon-blue"
                        >
                            Open daily progress
                        </Link>
                    </div>

                    <form className="mt-6 space-y-4" onSubmit={submitAnalyze}>
                        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                            <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                                <label className="mb-2 block text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                    Meal label (optional)
                                </label>
                                <input
                                    type="text"
                                    value={analyzeForm.data.meal_label}
                                    onChange={(event) =>
                                        analyzeForm.setData(
                                            'meal_label',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Breakfast, Lunch, Snack..."
                                    className="w-full rounded-lg border border-glass-border bg-background/60 px-3 py-2 text-sm text-foreground"
                                />
                            </div>

                            <div className="grid gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        cameraInputRef.current?.click()
                                    }
                                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-neon-pink/60 bg-neon-pink/10 px-4 py-3 text-sm font-semibold text-neon-pink transition hover:bg-neon-pink/20"
                                >
                                    <Camera className="h-4 w-4" />
                                    Take photo
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        galleryInputRef.current?.click()
                                    }
                                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-neon-blue/60 bg-neon-blue/10 px-4 py-3 text-sm font-semibold text-neon-blue transition hover:bg-neon-blue/20"
                                >
                                    <Upload className="h-4 w-4" />
                                    Select photo
                                </button>

                                {analyzeForm.data.photo ? (
                                    <p className="text-center text-xs text-muted-foreground">
                                        {analyzeForm.data.photo.name}
                                    </p>
                                ) : null}

                                <input
                                    ref={cameraInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={async (event) => {
                                        await handlePhotoSelected(
                                            event.target.files?.[0] ?? null,
                                        );
                                        event.currentTarget.value = '';
                                    }}
                                />

                                <input
                                    ref={galleryInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (event) => {
                                        await handlePhotoSelected(
                                            event.target.files?.[0] ?? null,
                                        );
                                        event.currentTarget.value = '';
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={
                                analyzeForm.processing ||
                                !analyzeForm.data.photo
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-neon-blue to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] transition hover:from-cyan-400 hover:to-teal-400 disabled:opacity-60"
                        >
                            <Camera className="h-4 w-4" />
                            {analyzeForm.processing
                                ? 'Analyzing photo...'
                                : 'Analyze meal photo'}
                        </button>
                    </form>
                </section>

                {analysis ? (
                    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                        <article className="glass-panel rounded-2xl p-6">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                                <MessageCircle className="h-5 w-5 text-neon-pink" />
                                Chatbot recommendation
                            </h2>

                            <div className="space-y-3">
                                <div className="rounded-xl border border-glass-border bg-background/40 p-4 text-sm text-muted-foreground">
                                    <p className="text-xs tracking-[0.22em] uppercase">
                                        Detected meal
                                    </p>
                                    <p className="mt-1 text-base font-semibold text-foreground">
                                        {analysis.mealName}
                                    </p>
                                    {analysis.mealLabel ? (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Label: {analysis.mealLabel}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="rounded-xl border border-neon-pink/35 bg-neon-pink/10 p-4">
                                    <p className="text-sm text-foreground">
                                        {analysis.recommendation}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-glass-border bg-background/40 p-4 text-sm text-muted-foreground">
                                    {analysis.summary}
                                </div>

                                {analysis.detectedItems?.length ? (
                                    <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                                        <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                            Detected items
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {analysis.detectedItems.map(
                                                (item) => (
                                                    <span
                                                        key={item}
                                                        className="rounded-full border border-glass-border bg-background/60 px-2.5 py-1 text-xs text-foreground"
                                                    >
                                                        {item}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </article>

                        <article className="glass-panel rounded-2xl p-6">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                                <Sparkles className="h-5 w-5 text-neon-blue" />
                                Nutrition facts (summary)
                            </h2>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                                    <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                        Calories
                                    </p>
                                    <p className="mt-2 text-xl font-bold text-foreground">
                                        {analysis.calories}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                                    <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                        Protein
                                    </p>
                                    <p className="mt-2 text-xl font-bold text-foreground">
                                        {analysis.proteinGrams}g
                                    </p>
                                </div>
                                <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                                    <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                        Carbs
                                    </p>
                                    <p className="mt-2 text-xl font-bold text-foreground">
                                        {analysis.carbsGrams}g
                                    </p>
                                </div>
                                <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                                    <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                        Fats
                                    </p>
                                    <p className="mt-2 text-xl font-bold text-foreground">
                                        {analysis.fatGrams}g
                                    </p>
                                </div>
                                <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                                    <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                        Fiber
                                    </p>
                                    <p className="mt-2 text-xl font-bold text-foreground">
                                        {analysis.fiberGrams ?? '--'}
                                        {analysis.fiberGrams !== null &&
                                        analysis.fiberGrams !== undefined
                                            ? 'g'
                                            : ''}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                                    <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                        Sodium
                                    </p>
                                    <p className="mt-2 text-xl font-bold text-foreground">
                                        {analysis.sodiumMg ?? '--'}
                                        {analysis.sodiumMg !== null &&
                                        analysis.sodiumMg !== undefined
                                            ? 'mg'
                                            : ''}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={saveMeal}
                                disabled={saveForm.processing}
                                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-neon-pink to-fuchsia-600 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(217,70,239,0.35)] transition hover:from-fuchsia-500 hover:to-purple-500 disabled:opacity-60"
                            >
                                <Save className="h-4 w-4" />
                                {saveForm.processing
                                    ? 'Saving...'
                                    : 'Save to daily progress'}
                            </button>
                        </article>
                    </section>
                ) : (
                    <section className="glass-panel rounded-2xl p-6 text-sm text-muted-foreground">
                        Upload a meal photo to get nutrition facts and chatbot
                        recommendations before saving.
                    </section>
                )}

                <section className="glass-panel rounded-2xl p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                        <Utensils className="h-5 w-5 text-neon-blue" />
                        Today quick log
                    </h3>

                    {entriesToday.length ? (
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {entriesToday.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="rounded-xl border border-glass-border bg-background/40 p-4"
                                >
                                    <p className="text-sm font-semibold text-foreground">
                                        {entry.mealName}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {entry.mealLabel ?? 'Unlabeled meal'}
                                    </p>
                                    <p className="mt-3 text-xs text-muted-foreground">
                                        {entry.calories} kcal · P{' '}
                                        {entry.proteinGrams}g · C{' '}
                                        {entry.carbsGrams}g · F {entry.fatGrams}
                                        g
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No meals saved yet today.
                        </p>
                    )}
                </section>
            </div>
        </>
    );
}

MacrosPage.layout = {
    breadcrumbs: [
        {
            title: 'Macros',
            href: '/macros',
        },
    ],
};
