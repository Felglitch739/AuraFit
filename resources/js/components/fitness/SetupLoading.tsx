import { useEffect, useMemo, useState } from 'react';

const setupSteps = [
    'Initializing personal database...',
    'Integrating primary objectives...',
    'Structuring 7-day training skeleton...',
    'Synchronizing adaptive algorithms...',
    'Your empathetic coach is almost ready.',
] as const;

export default function SetupLoading() {
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setStepIndex((prev) => (prev + 1) % setupSteps.length);
        }, 2500);

        return () => {
            window.clearInterval(interval);
        };
    }, []);

    const progress = useMemo(
        () => ((stepIndex + 1) / setupSteps.length) * 100,
        [stepIndex],
    );

    return (
        <section className="relative flex min-h-screen animate-in items-center justify-center overflow-hidden bg-gray-950 px-4 py-10 duration-300 fade-in">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--color-neon-blue),transparent_35%),radial-gradient(circle_at_bottom_right,var(--color-neon-pink),transparent_30%)] opacity-25" />

            <div className="relative w-full max-w-3xl animate-in rounded-3xl border border-glass-border bg-background/35 p-6 text-center backdrop-blur-xl duration-500 zoom-in-95 fade-in md:p-10">
                <h1 className="font-['Orbitron',sans-serif] text-3xl font-bold text-foreground md:text-5xl">
                    Building Your AuraFit Core
                </h1>

                <div className="mt-8">
                    <div className="h-3 w-full overflow-hidden rounded-full border border-glass-border bg-background/60">
                        <div
                            className="h-full bg-linear-to-r from-neon-blue to-purple-600 transition-all duration-700 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-neon-blue">
                        {Math.round(progress)}%
                    </p>
                </div>

                <p
                    key={stepIndex}
                    className="mt-6 animate-in text-sm text-muted-foreground duration-300 fade-in slide-in-from-bottom-1 md:text-base"
                >
                    {setupSteps[stepIndex]}
                </p>
            </div>
        </section>
    );
}
