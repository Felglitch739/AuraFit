import { router } from '@inertiajs/react';
import { AlertTriangle, LoaderCircle, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

export type PlanGenerationBannerState = {
    status: 'idle' | 'queued' | 'processing' | 'failed';
    kind?: string | null;
    message?: string | null;
    startedAt?: string | null;
    failedAt?: string | null;
};

type PlanGenerationBannerProps = {
    state?: PlanGenerationBannerState | null;
};

const kindLabels: Record<string, string> = {
    onboarding: 'Onboarding plans',
    weekly_plan: 'Weekly plan',
    nutrition_plan: 'Nutrition plan',
    check_in: 'Training recommendation',
    recovery_plan: 'Recovery update',
};

export default function PlanGenerationBanner({
    state,
}: PlanGenerationBannerProps) {
    const isPending =
        state?.status === 'queued' || state?.status === 'processing';
    const isFailed = state?.status === 'failed';

    useEffect(() => {
        if (!isPending) {
            return;
        }

        const interval = window.setInterval(() => {
            router.reload({
                preserveScroll: true,
                preserveState: true,
            });
        }, 4000);

        return () => {
            window.clearInterval(interval);
        };
    }, [isPending]);

    if (!isPending && !isFailed) {
        return null;
    }

    const kindLabel = state?.kind
        ? (kindLabels[state.kind] ?? state.kind)
        : 'Plan';
    const message =
        state?.message ??
        (isFailed
            ? 'Generation failed. Try again from the page where you started it.'
            : 'Your plan is generating in the background. This page will refresh when it is ready.');

    return (
        <section
            className={[
                'mb-4 flex items-start gap-3 rounded-2xl border px-4 py-3 backdrop-blur-xl md:mb-6',
                isFailed
                    ? 'border-red-500/30 bg-red-500/10 text-red-100'
                    : 'border-neon-blue/25 bg-neon-blue/10 text-foreground',
            ].join(' ')}
        >
            <div
                className={[
                    'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
                    isFailed
                        ? 'border-red-400/30 bg-red-500/20 text-red-200'
                        : 'border-neon-blue/30 bg-background/60 text-neon-blue',
                ].join(' ')}
            >
                {isFailed ? (
                    <AlertTriangle className="h-5 w-5" />
                ) : (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="h-4 w-4 text-neon-pink" />
                    {kindLabel}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{message}</p>
            </div>
        </section>
    );
}
