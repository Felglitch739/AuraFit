type MacroProgressBarProps = {
    label: string;
    current: number;
    target: number;
    accent: string;
};

function percent(current: number, target: number): number {
    if (target <= 0) {
        return 0;
    }

    return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

export default function MacroProgressBar({
    label,
    current,
    target,
    accent,
}: MacroProgressBarProps) {
    const value = percent(current, target);

    return (
        <div className="rounded-xl border border-glass-border bg-background/40 p-4">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                    {label}
                </p>
                <p className="text-sm font-semibold text-foreground">
                    {current} / {target}
                    {label === 'Calories' ? '' : 'g'}
                </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-background/70">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${value}%`,
                        backgroundColor: accent,
                    }}
                />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
                {value}% of target
            </p>
        </div>
    );
}