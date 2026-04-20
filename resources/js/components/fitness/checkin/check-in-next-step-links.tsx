import { Link } from '@inertiajs/react';

export default function CheckInNextStepLinks() {
    return (
        <section className="glass-panel rounded-2xl p-6">
            <h3 className="text-sm tracking-[0.24em] text-muted-foreground uppercase">
                Next step
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
                After your check-in, continue with one of these pages to
                complete your daily flow.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Link
                    href="/dashboard"
                    className="rounded-xl border border-glass-border bg-background/40 px-4 py-3 text-center text-sm font-semibold text-foreground transition hover:border-neon-pink hover:text-neon-pink"
                >
                    Go to Dashboard
                </Link>
                <Link
                    href="/nutrition"
                    className="rounded-xl border border-glass-border bg-background/40 px-4 py-3 text-center text-sm font-semibold text-foreground transition hover:border-neon-blue hover:text-neon-blue"
                >
                    Open Nutrition
                </Link>
                <Link
                    href="/onboarding"
                    className="rounded-xl border border-glass-border bg-background/40 px-4 py-3 text-center text-sm font-semibold text-foreground transition hover:border-neon-blue hover:text-neon-blue"
                >
                    Edit Setup
                </Link>
            </div>
        </section>
    );
}