import { ChefHat } from 'lucide-react';
import { useEffect, useState } from 'react';

const nutritionSteps = [
    'Optimizing macro ratios...',
    'Synchronizing workout fuel...',
    'Calculating metabolic demand...',
    'Structuring nutrient timing flow...',
] as const;

export default function NutritionLoading() {
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setStepIndex((prev) => (prev + 1) % nutritionSteps.length);
        }, 2500);

        return () => {
            window.clearInterval(interval);
        };
    }, []);

    return (
        <section className="relative animate-in overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/40 p-8 backdrop-blur-xl duration-300 zoom-in-95 fade-in">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-neon-blue),transparent_35%)] opacity-20" />

            <div className="relative grid gap-4">
                <div className="h-24 animate-pulse rounded-2xl border border-gray-800 bg-gray-800/60" />
                <div className="h-24 animate-pulse rounded-2xl border border-gray-800 bg-gray-800/60" />
                <div className="h-24 animate-pulse rounded-2xl border border-gray-800 bg-gray-800/60" />
            </div>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <div className="animate-in rounded-full border border-neon-blue/50 bg-neon-blue/10 p-4 shadow-[0_0_30px_rgba(59,130,246,0.45)] duration-500 zoom-in-95 fade-in">
                    <ChefHat className="h-9 w-9 animate-[spin_5s_linear_infinite] text-neon-blue" />
                </div>
                <p
                    key={stepIndex}
                    className="mt-4 animate-in text-sm font-semibold text-neon-blue duration-300 fade-in slide-in-from-bottom-1 md:text-base"
                >
                    {nutritionSteps[stepIndex]}
                </p>
            </div>
        </section>
    );
}
