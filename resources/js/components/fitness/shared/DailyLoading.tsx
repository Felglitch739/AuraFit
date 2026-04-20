import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const loadingSteps = [
    'Analyzing current biometrics...',
    'Processing stress and fatigue scores...',
    'Adapting planned training load...',
    'Optimizing dynamic recovery flow...',
] as const;

type DailyLoadingProps = {
    title?: string;
    steps?: readonly string[];
};

export default function DailyLoading({
    title = "Generating Today's Plan",
    steps = loadingSteps,
}: DailyLoadingProps) {
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        if (steps.length === 0) {
            return;
        }

        const interval = window.setInterval(() => {
            setStepIndex((prev) => (prev + 1) % steps.length);
        }, 2500);

        return () => {
            window.clearInterval(interval);
        };
    }, [steps]);

    return (
        <section className="glass-panel animate-in rounded-2xl border border-glass-border bg-gray-950 p-8 duration-300 zoom-in-95 fade-in md:p-10">
            <div className="flex min-h-96 flex-col items-center justify-center text-center">
                <div className="relative mb-6 animate-in duration-500 zoom-in-95 fade-in">
                    <div className="absolute inset-0 rounded-full bg-neon-pink/30 blur-2xl" />
                    <div className="relative rounded-full border border-neon-pink/40 bg-neon-pink/10 p-5 shadow-[0_0_35px_rgba(217,70,239,0.45)]">
                        <LoaderCircle
                            className="h-12 w-12 animate-spin text-neon-pink"
                            style={{ animationDuration: '1.7s' }}
                        />
                    </div>
                </div>

                <h2 className="font-['Orbitron',sans-serif] text-2xl font-bold text-foreground md:text-3xl">
                    {title}
                </h2>
                <p
                    key={stepIndex}
                    className="mt-4 max-w-2xl animate-in text-sm text-muted-foreground duration-300 fade-in slide-in-from-bottom-1 md:text-base"
                >
                    {steps[stepIndex] ?? 'Preparing your plan...'}
                </p>
            </div>
        </section>
    );
}
