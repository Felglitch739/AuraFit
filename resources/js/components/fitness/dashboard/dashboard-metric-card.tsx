import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type DashboardMetricCardProps = {
    title: string;
    value: string | number;
    description?: string;
    accent?: 'default' | 'success' | 'warning' | 'destructive';
    className?: string;
};

const accentStyles: Record<
    NonNullable<DashboardMetricCardProps['accent']>,
    string
> = {
    default: 'border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]',
    success:
        'border-neon-blue/30 shadow-[0_0_20px_var(--color-neon-blue)/20] from-neon-blue/10 to-transparent bg-gradient-to-br',
    warning:
        'border-neon-pink/30 shadow-[0_0_20px_var(--color-neon-pink)/20] from-neon-pink/10 to-transparent bg-gradient-to-br',
    destructive:
        'border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)] from-red-500/10 to-transparent bg-gradient-to-br',
};

export default function DashboardMetricCard({
    title,
    value,
    description,
    accent = 'default',
    className,
}: DashboardMetricCardProps) {
    return (
        <Card
            className={cn(
                'border-glass-border bg-glass-panel shadow-[0_0_20px_var(--color-neon-pink)/5] backdrop-blur-xl',
                accentStyles[accent],
                className,
            )}
        >
            <CardHeader className="space-y-2">
                <CardDescription className="text-xs tracking-[0.28em] text-muted-foreground uppercase">
                    {title}
                </CardDescription>
                <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">
                    {value}
                </CardTitle>
            </CardHeader>
            {description && (
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </CardContent>
            )}
        </Card>
    );
}
