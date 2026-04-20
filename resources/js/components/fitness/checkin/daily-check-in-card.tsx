import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DailyCheckInValues } from '@/types/fitness';

type DailyCheckInCardProps = {
    values?: DailyCheckInValues | null;
    sleepLabel?: string;
    stressLabel?: string;
    sorenessLabel?: string;
};

export default function DailyCheckInCard({
    values,
    sleepLabel = 'Sleep hours',
    stressLabel = 'Stress level',
    sorenessLabel = 'Muscle soreness',
}: DailyCheckInCardProps) {
    return (
        <Card className="h-full bg-glass-panel border border-glass-border backdrop-blur-xl shadow-[0_0_20px_var(--color-neon-pink)/10] relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 transition-colors bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_30%,transparent_70%,rgba(255,255,255,0.04))]" />
            <CardHeader className="relative z-10">
                <CardDescription className="text-xs tracking-[0.3em] uppercase">
                    Daily check-in
                </CardDescription>
                <CardTitle className="text-2xl">Recovery snapshot</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Frontend is prepared to receive the user input model without
                    wiring any submit logic yet.
                </p>
            </CardHeader>
            <CardContent className="grid gap-4 relative z-10">
                <div className="grid gap-2">
                    <Label htmlFor="sleep-hours">{sleepLabel}</Label>
                    <Input
                        id="sleep-hours"
                        placeholder="7.5"
                        defaultValue={values?.sleepHours ?? ''}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="stress-level">{stressLabel}</Label>
                    <Input
                        id="stress-level"
                        placeholder="1-10"
                        defaultValue={values?.stressLevel ?? ''}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="soreness">{sorenessLabel}</Label>
                    <Input
                        id="soreness"
                        placeholder="1-10"
                        defaultValue={values?.soreness ?? ''}
                    />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="secondary">
                        Sleep: {values?.sleepHours ?? '—'}
                    </Badge>
                    <Badge variant="secondary">
                        Stress: {values?.stressLevel ?? '—'}
                    </Badge>
                    <Badge variant="secondary">
                        Soreness: {values?.soreness ?? '—'}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
