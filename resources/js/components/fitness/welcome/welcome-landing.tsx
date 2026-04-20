import { Link } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    BrainCircuit,
    Dumbbell,
    LayoutDashboard,
    Sparkles,
    Zap,
} from 'lucide-react';
import { dashboard, login, register } from '@/routes';

type WelcomeLandingProps = {
    userName: string;
    canRegister: boolean;
    isAuthenticated: boolean;
};

const pillars = [
    {
        icon: Sparkles,
        title: 'Empathetic AI',
        description:
            'Recommendations that prioritize recovery, consistency, and wellness.',
    },
    {
        icon: Activity,
        title: 'Daily check-in',
        description:
            'Adjust your day based on sleep, fatigue, and mental stress.',
    },
    {
        icon: Dumbbell,
        title: 'Guided routines',
        description:
            'Concrete suggestions to train without overloading your body.',
    },
];

export default function WelcomeLanding({
    userName,
    canRegister,
    isAuthenticated,
}: WelcomeLandingProps) {
    const primaryAction = isAuthenticated ? dashboard() : login();
    const primaryLabel = isAuthenticated ? 'Go to dashboard' : 'Log in';

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground transition-colors duration-300">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--color-neon-pink),transparent_30%),radial-gradient(circle_at_top_right,var(--color-neon-blue),transparent_26%),linear-gradient(180deg,var(--color-background)_0%,transparent_45%,var(--color-background)_100%)] opacity-20" />
            <div className="absolute inset-0 bg-[linear-gradient(var(--color-foreground)_1px,transparent_1px)] bg-size-[56px_56px] opacity-[0.03]" />

            <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-3 py-3 sm:px-6 sm:py-6 lg:px-10">
                <header className="glass-panel mb-4 flex flex-col items-start gap-3 rounded-2xl border border-glass-border bg-glass-panel px-3 py-3 shadow-[0_0_40px_var(--color-neon-pink)/10] backdrop-blur-xl sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neon-pink/30 bg-linear-to-br from-neon-pink/25 via-neon-blue/15 to-background shadow-[0_0_24px_var(--color-neon-pink)/10]">
                            <Zap className="h-5 w-5 text-neon-pink" />
                        </div>
                        <div>
                            <p className="font-['Orbitron',sans-serif] text-xs tracking-[0.35em] text-neon-blue/80 uppercase">
                                AuraFit
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Social good fitness intelligence
                            </p>
                        </div>
                    </div>

                    <nav className="flex w-full flex-wrap items-center justify-end gap-2 text-sm sm:w-auto sm:gap-3">
                        {isAuthenticated ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center gap-2 rounded-full border border-neon-blue/25 bg-neon-blue/10 px-3 py-1.5 font-semibold text-neon-blue/80 transition hover:border-neon-blue/50 hover:bg-neon-blue/15 sm:px-4 sm:py-2"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1.5 font-semibold text-foreground transition hover:border-neon-pink/30 hover:bg-accent/50 sm:px-4 sm:py-2"
                                >
                                    Log in
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center gap-2 rounded-full border border-neon-pink/30 bg-linear-to-r from-neon-pink to-neon-blue px-3 py-1.5 font-semibold text-foreground shadow-[0_0_24px_var(--color-neon-pink)/10] transition hover:scale-[1.02] sm:px-4 sm:py-2"
                                    >
                                        Create account
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                <main className="grid flex-1 items-center gap-7 pb-5 sm:gap-9 sm:pb-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
                    <section className="space-y-6 sm:space-y-8">
                        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-xs font-semibold tracking-[0.28em] text-muted-foreground uppercase backdrop-blur-md">
                            <Sparkles className="h-4 w-4 text-neon-pink" />
                            Technology at the service of your wellbeing
                        </div>

                        <div className="space-y-5">
                            <p className="text-sm font-medium text-neon-blue/80">
                                Hello, {userName}
                            </p>
                            <h1 className="max-w-2xl bg-linear-to-r from-neon-pink via-foreground to-neon-blue bg-clip-text font-['Orbitron',sans-serif] text-3xl font-black tracking-widest text-transparent uppercase sm:text-4xl md:text-6xl">
                                Train with data, rest with intention.
                            </h1>
                            <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                                A visual dashboard experience to evaluate your
                                energy, adjust your routine, and sustain
                                progress without losing sight of mental and
                                physical health.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link
                                href={primaryAction}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-neon-pink to-neon-blue px-6 py-3.5 font-semibold text-foreground shadow-[0_0_30px_var(--color-neon-pink)/25] transition hover:scale-[1.01]"
                            >
                                {primaryLabel}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            {!isAuthenticated && canRegister && (
                                <Link
                                    href={register()}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card/50 px-6 py-3.5 font-semibold text-foreground backdrop-blur-md transition hover:border-neon-blue/30 hover:bg-accent/50"
                                >
                                    Open account
                                </Link>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            {pillars.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <article
                                        key={item.title}
                                        className="rounded-3xl border border-border bg-card/50 p-4 shadow-sm backdrop-blur-xl"
                                    >
                                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-neon-pink/20 bg-neon-pink/10 text-neon-pink">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <h2 className="text-sm font-semibold text-foreground">
                                            {item.title}
                                        </h2>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    <section className="relative">
                        <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-neon-pink/20 blur-3xl" />
                        <div className="absolute -right-10 bottom-6 h-36 w-36 rounded-full bg-neon-blue/20 blur-3xl" />

                        <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/40 p-4 shadow-[0_0_50px_rgba(59,130,246,0.12)] backdrop-blur-xl sm:p-6 lg:p-8">
                            <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.07),transparent_33%,transparent_65%,rgba(255,255,255,0.05))]" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(239,68,68,0.14),transparent_40%)]" />

                            <div className="relative z-10">
                                <div className="mb-6 flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs tracking-[0.3em] text-neon-blue/80 uppercase">
                                            Dynamic AI Macro-Sync
                                        </p>
                                        <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">
                                            Recovery Nutrition Engine
                                        </h2>
                                    </div>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-neon-blue/30 bg-neon-blue/10 px-3 py-1 text-xs font-semibold text-neon-blue">
                                        <BrainCircuit className="h-4 w-4" />
                                        Aura Core
                                    </div>
                                </div>

                                <div className="mx-auto mb-7 flex w-full max-w-70 items-center justify-center sm:max-w-80">
                                    <div className="relative h-56 w-56 sm:h-64 sm:w-64">
                                        <svg
                                            className="h-full w-full -rotate-90 drop-shadow-[0_0_26px_rgba(217,70,239,0.35)]"
                                            viewBox="0 0 220 220"
                                            fill="none"
                                            role="img"
                                            aria-label="Calorie target ring"
                                        >
                                            <defs>
                                                <linearGradient
                                                    id="calorieRing"
                                                    x1="0"
                                                    y1="0"
                                                    x2="1"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="0%"
                                                        stopColor="rgb(217 70 239)"
                                                    />
                                                    <stop
                                                        offset="100%"
                                                        stopColor="rgb(59 130 246)"
                                                    />
                                                </linearGradient>
                                            </defs>

                                            <circle
                                                cx="110"
                                                cy="110"
                                                r="88"
                                                stroke="rgba(148,163,184,0.25)"
                                                strokeWidth="16"
                                            />
                                            <circle
                                                cx="110"
                                                cy="110"
                                                r="88"
                                                stroke="url(#calorieRing)"
                                                strokeWidth="16"
                                                strokeLinecap="round"
                                                strokeDasharray="553"
                                                strokeDashoffset="94"
                                            />
                                        </svg>

                                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                                            <p className="font-mono text-4xl font-black tracking-tight text-foreground drop-shadow-[0_0_16px_rgba(217,70,239,0.25)] sm:text-5xl">
                                                1,850
                                            </p>
                                            <p className="mt-1 text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                                Target kCal
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase">
                                            <span className="text-foreground">
                                                Protein
                                            </span>
                                            <span className="text-neon-blue">
                                                150g / 180g
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                            <div className="h-full w-[83%] rounded-full bg-linear-to-r from-neon-pink to-neon-blue" />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase">
                                            <span className="text-foreground">
                                                Carbs
                                            </span>
                                            <span className="text-neon-blue">
                                                210g / 260g
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                            <div className="h-full w-[81%] rounded-full bg-linear-to-r from-cyan-400 to-neon-blue" />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase">
                                            <span className="text-foreground">
                                                Hydration
                                            </span>
                                            <span className="text-neon-blue">
                                                2.2L / 3.0L
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                            <div className="h-full w-[73%] rounded-full bg-linear-to-r from-neon-blue to-emerald-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
