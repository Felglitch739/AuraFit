import { Link } from '@inertiajs/react';
import { Camera, Upload } from 'lucide-react';
import { useRef } from 'react';

type MacroCaptureCardProps = {
    progressHref: string;
    mealLabel: string;
    photoName?: string | null;
    isAnalyzing: boolean;
    onMealLabelChange: (value: string) => void;
    onPhotoSelected: (file: File | null) => void | Promise<void>;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function MacroCaptureCard({
    progressHref,
    mealLabel,
    photoName,
    isAnalyzing,
    onMealLabelChange,
    onPhotoSelected,
    onSubmit,
}: MacroCaptureCardProps) {
    const cameraInputRef = useRef<HTMLInputElement | null>(null);
    const galleryInputRef = useRef<HTMLInputElement | null>(null);

    return (
        <section className="glass-panel rounded-2xl p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="font-['Orbitron',sans-serif] text-2xl font-bold text-foreground md:text-3xl">
                        Macro Counter
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Take a food photo, get chatbot recommendations, and
                        save it to daily progress.
                    </p>
                </div>
                <Link
                    href={progressHref}
                    className="rounded-lg border border-glass-border bg-background/40 px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-neon-blue hover:text-neon-blue"
                >
                    Open daily progress
                </Link>
            </div>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                    <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                        <label className="mb-2 block text-xs tracking-[0.22em] text-muted-foreground uppercase">
                            Meal label (optional)
                        </label>
                        <input
                            type="text"
                            value={mealLabel}
                            onChange={(event) =>
                                onMealLabelChange(event.target.value)
                            }
                            placeholder="Breakfast, Lunch, Snack..."
                            className="w-full rounded-lg border border-glass-border bg-background/60 px-3 py-2 text-sm text-foreground"
                        />
                    </div>

                    <div className="grid gap-2">
                        <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-neon-pink/60 bg-neon-pink/10 px-4 py-3 text-sm font-semibold text-neon-pink transition hover:bg-neon-pink/20"
                        >
                            <Camera className="h-4 w-4" />
                            Take photo
                        </button>

                        <button
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-neon-blue/60 bg-neon-blue/10 px-4 py-3 text-sm font-semibold text-neon-blue transition hover:bg-neon-blue/20"
                        >
                            <Upload className="h-4 w-4" />
                            Select photo
                        </button>

                        {photoName ? (
                            <p className="text-center text-xs text-muted-foreground">
                                {photoName}
                            </p>
                        ) : null}

                        <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={async (event) => {
                                await onPhotoSelected(
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
                                await onPhotoSelected(
                                    event.target.files?.[0] ?? null,
                                );
                                event.currentTarget.value = '';
                            }}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isAnalyzing || !photoName}
                    className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-neon-blue to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] transition hover:from-cyan-400 hover:to-teal-400 disabled:opacity-60"
                >
                    <Camera className="h-4 w-4" />
                    {isAnalyzing ? 'Analyzing photo...' : 'Analyze meal photo'}
                </button>
            </form>
        </section>
    );
}