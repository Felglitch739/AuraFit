import { CheckCircle2 } from 'lucide-react';

type RecommendationState = {
    score: number;
    message: string;
    focusBlocks: string[];
    nutritionTip?: string;
};

type CheckInResultCardProps = {
    status: {
        title: string;
        stroke: string;
    };
    result: RecommendationState | null;
    circumference: number;
    strokeOffset: number;
    onAcceptReducedLoad: () => void;
    isAcceptingReducedLoad: boolean;
};

export default function CheckInResultCard({
    status,
    result,
    circumference,
    strokeOffset,
    onAcceptReducedLoad,
    isAcceptingReducedLoad,
}: CheckInResultCardProps) {
    return (
        <article className="glass-panel rounded-2xl p-6 md:p-8">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-neon-pink" />
                Readiness result
            </h2>

            <div className="flex flex-col items-center gap-6 md:flex-row">
                <div className="relative flex h-32 w-32 items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="oklch(0.35 0 0)"
                            strokeWidth="8"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke={status.stroke}
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeOffset}
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute text-center">
                        <p className="font-['Orbitron',sans-serif] text-4xl font-bold text-foreground">
                            {result?.score ?? '--'}
                        </p>
                        <p className="text-xs text-muted-foreground">%</p>
                    </div>
                </div>

                <div>
                    <p className="text-lg font-semibold text-foreground">
                        {status.title}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {result?.message ??
                            'Submit your check-in to get a recommendation from backend data.'}
                    </p>
                </div>
            </div>

            <div className="mt-6 space-y-2">
                {(result?.focusBlocks ?? []).map((item) => (
                    <div
                        key={item}
                        className="flex items-center gap-2 rounded-lg border border-glass-border bg-background/50 p-2 text-sm text-foreground"
                    >
                        <CheckCircle2 className="h-4 w-4 text-neon-pink" />
                        {item}
                    </div>
                ))}
            </div>

            {result?.nutritionTip ? (
                <div className="mt-6 rounded-xl border border-green-400/30 bg-green-500/10 p-4">
                    <p className="text-sm font-semibold text-green-100">
                        Nutrition adjustment
                    </p>
                    <p className="mt-1 text-sm text-green-100/80">
                        {result.nutritionTip}
                    </p>
                </div>
            ) : null}

            {result && result.score < 50 ? (
                <div className="mt-6 rounded-xl border border-orange-400/30 bg-orange-500/10 p-4">
                    <p className="text-sm font-semibold text-orange-100">
                        You are not at 100% today.
                    </p>
                    <p className="mt-1 text-sm text-orange-100/80">
                        If you accept a lower load, we will regenerate today&apos;s
                        training and nutrition guidance with a lighter
                        recovery-first plan.
                    </p>
                    <button
                        type="button"
                        onClick={onAcceptReducedLoad}
                        disabled={isAcceptingReducedLoad}
                        className="mt-4 inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:opacity-60"
                    >
                        {isAcceptingReducedLoad
                            ? 'Regenerating...'
                            : 'Accept lower load today'}
                    </button>
                </div>
            ) : null}
        </article>
    );
}
