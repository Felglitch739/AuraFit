import { Head, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    MacroAnalysisCard,
    MacroCaptureCard,
    MacroQuickLog,
    type MacroAnalysis,
} from '@/components/fitness/macros';
import { NutritionLoading } from '@/components/fitness/shared';

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
                <MacroCaptureCard
                    progressHref="/progress"
                    mealLabel={analyzeForm.data.meal_label}
                    photoName={analyzeForm.data.photo?.name ?? null}
                    isAnalyzing={analyzeForm.processing}
                    onMealLabelChange={(value) =>
                        analyzeForm.setData('meal_label', value)
                    }
                    onPhotoSelected={handlePhotoSelected}
                    onSubmit={submitAnalyze}
                />

                {analysis ? (
                    <MacroAnalysisCard
                        analysis={analysis}
                        isSaving={saveForm.processing}
                        onSaveMeal={saveMeal}
                    />
                ) : (
                    <section className="glass-panel rounded-2xl p-6 text-sm text-muted-foreground">
                        Upload a meal photo to get nutrition facts and chatbot
                        recommendations before saving.
                    </section>
                )}

                <MacroQuickLog entries={entriesToday} />
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
