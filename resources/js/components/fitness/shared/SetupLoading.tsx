import { useEffect, useMemo, useState } from 'react';

const setupSteps = [
    'Initializing personal database...',
    'Integrating primary objectives...',
    'Structuring 7-day training skeleton...',
    'Synchronizing adaptive algorithms...',
    'Your empathetic coach is almost ready.',
] as const;

type SetupLoadingProps = {
    title?: string;
    steps?: readonly string[];
};

export default function SetupLoading({
    title = 'Building Your AuraFit Core',
    steps = setupSteps,
}: SetupLoadingProps = {}) {
    const [stepIndex, setStepIndex] = useState(0);
    const [isStepVisible, setIsStepVisible] = useState(true);
    const [progress, setProgress] = useState(20);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setIsStepVisible(false);

            window.setTimeout(() => {
                setStepIndex((prev) => (prev + 1) % setupSteps.length);
                setIsStepVisible(true);
            }, 220);
        }, 2500);

        return () => {
            window.clearInterval(interval);
        };
    }, []);

    const targetProgress = useMemo(() => {
        const totalSteps = steps.length || 1;

        return ((stepIndex + 1) / totalSteps) * 100;
    }, [stepIndex, steps]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setProgress((prev) => {
                const next = prev + (targetProgress - prev) * 0.16;

                if (Math.abs(targetProgress - next) < 0.2) {
                    return targetProgress;
                }

                return next;
            });
        }, 40);

        return () => {
            window.clearInterval(interval);
        };
    }, [targetProgress]);

    return (
        <section className="relative flex min-h-screen animate-in items-center justify-center overflow-hidden bg-gray-950 px-4 py-10 duration-300 fade-in">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--color-neon-blue),transparent_35%),radial-gradient(circle_at_bottom_right,var(--color-neon-pink),transparent_30%)] opacity-25" />

            <div className="relative w-full max-w-3xl animate-in rounded-3xl border border-glass-border bg-background/35 p-6 text-center backdrop-blur-xl duration-500 zoom-in-95 fade-in md:p-10">
                <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-neon-blue/50 to-transparent" />

                <h1 className="font-['Orbitron',sans-serif] text-3xl font-bold text-foreground md:text-5xl">
                    Building Your AuraFit Core
                </h1>

                <div className="mt-8">
                    <div className="h-3 w-full overflow-hidden rounded-full border border-glass-border bg-background/60">
                        <div
                            className="h-full bg-linear-to-r from-neon-blue to-purple-600 transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-neon-blue">
                        {Math.round(progress)}%
                    </p>
                </div>

                <p
                    className={[
                        'mt-6 text-sm text-muted-foreground transition-all duration-300 md:text-base',
                        isStepVisible
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-1 opacity-0',
                    ].join(' ')}
                >
                    {steps[stepIndex] ?? steps[0] ?? 'Preparing your plan...'}
                </p>
            </div>
        </section>
    );
}
