import { Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    Bell,
    MessageCircle,
    Settings,
    PieChart,
    LayoutDashboard,
    LogOut,
    SlidersHorizontal,
    Utensils,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import PlanGenerationBanner, {
    type PlanGenerationBannerState,
} from '@/components/fitness/shared/PlanGenerationBanner';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { edit } from '@/routes/profile';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs: _breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { isCurrentUrl } = useCurrentUrl();
    const { auth } = usePage<{
        auth: {
            user?: {
                is_admin?: boolean;
                generation_status?: PlanGenerationBannerState['status'];
                generation_kind?: string | null;
                generation_message?: string | null;
                generation_started_at?: string | null;
                generation_failed_at?: string | null;
            } | null;
        };
    }>().props;
    const isAdmin = Boolean(auth?.user?.is_admin);
    const generationState: PlanGenerationBannerState | null = auth?.user
        ? {
              status: auth.user.generation_status ?? 'idle',
              kind: auth.user.generation_kind ?? null,
              message: auth.user.generation_message ?? null,
              startedAt: auth.user.generation_started_at ?? null,
              failedAt: auth.user.generation_failed_at ?? null,
          }
        : null;
    const [notificationsEnabled, setNotificationsEnabled] =
        useState<boolean>(false);
    const [notificationsLoading, setNotificationsLoading] =
        useState<boolean>(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            return;
        }

        setNotificationsEnabled(Notification.permission === 'granted');
    }, []);

    const handleEnableNotifications = async (): Promise<void> => {
        if (typeof window === 'undefined') {
            return;
        }

        setNotificationsLoading(true);

        try {
            const enabled = await window.aurafitEnablePushNotifications?.();
            setNotificationsEnabled(Boolean(enabled));
        } finally {
            setNotificationsLoading(false);
        }
    };

    const desktopPrimaryNavItems = [
        {
            href: '/dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
        },
        {
            href: '/check-in',
            label: 'Check-in',
            icon: Activity,
        },
        {
            href: '/nutrition',
            label: 'Nutrition',
            icon: Utensils,
        },
    ] as const;

    const desktopTrackingNavItems = [
        {
            href: '/macros',
            label: 'Macros',
            icon: PieChart,
        },
        {
            href: '/progress',
            label: 'Progress',
            icon: BarChart3,
        },
    ] as const;

    const desktopSupportNavItems = [
        {
            href: '/onboarding',
            label: 'Setup',
            icon: SlidersHorizontal,
        },
        {
            href: '/chat',
            label: 'Chat',
            icon: MessageCircle,
        },
        ...(isAdmin
            ? [
                  {
                      href: '/admin',
                      label: 'Admin',
                      icon: BarChart3,
                  },
              ]
            : []),
    ] as const;

    const mobileNavItems = [
        {
            key: 'macros',
            label: 'Macros',
            icon: PieChart,
            href: '/macros',
            soon: false,
        },
        {
            key: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: '/dashboard',
            soon: false,
        },
        {
            key: 'chat',
            label: 'Chat',
            icon: MessageCircle,
            href: '/chat',
            soon: false,
        },
        ...(isAdmin
            ? [
                  {
                      key: 'admin',
                      label: 'Admin',
                      icon: BarChart3,
                      href: '/admin',
                      soon: false,
                  },
              ]
            : []),
    ] as const;

    return (
        <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--color-neon-pink),transparent_18%),radial-gradient(circle_at_top_right,var(--color-neon-blue),transparent_18%),linear-gradient(180deg,var(--color-background)_0%,transparent_40%,var(--color-background)_100%)] opacity-12 sm:bg-[radial-gradient(circle_at_top_left,var(--color-neon-pink),transparent_30%),radial-gradient(circle_at_top_right,var(--color-neon-blue),transparent_26%),linear-gradient(180deg,var(--color-background)_0%,transparent_45%,var(--color-background)_100%)] sm:opacity-20" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(var(--color-foreground)_1px,transparent_1px)] bg-size-[44px_44px] opacity-[0.02] sm:bg-size-[56px_56px] sm:opacity-[0.03]" />

            <nav className="glass-panel fixed inset-x-0 bottom-0 z-50 flex h-18 items-center justify-around border-t border-glass-border bg-glass-panel px-4 backdrop-blur-xl md:inset-y-0 md:right-auto md:left-0 md:h-screen md:w-24 md:flex-col md:justify-center md:gap-8 md:border-t-0 md:border-r">
                {mobileNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = isCurrentUrl(item.href);

                    return (
                        <Link
                            key={item.key}
                            href={item.href}
                            className={[
                                'group flex flex-col items-center gap-1 transition md:hidden',
                                active
                                    ? 'text-neon-pink'
                                    : 'text-muted-foreground hover:text-neon-pink',
                            ].join(' ')}
                        >
                            <Icon
                                className={[
                                    'h-6 w-6 transition',
                                    active
                                        ? 'drop-shadow-[0_0_8px_var(--color-neon-pink)]'
                                        : 'group-hover:drop-shadow-[0_0_8px_var(--color-neon-pink)]',
                                ].join(' ')}
                            />
                            <span className="text-[10px] uppercase">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}

                <div className="hidden md:flex md:flex-col md:items-center md:gap-7">
                    {desktopPrimaryNavItems.map((item) => {
                        const Icon = item.icon;
                        const active = isCurrentUrl(item.href);

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={[
                                    'group flex flex-col items-center gap-1 transition',
                                    active
                                        ? 'text-neon-pink'
                                        : 'text-muted-foreground hover:text-neon-pink',
                                ].join(' ')}
                            >
                                <Icon
                                    className={[
                                        'h-6 w-6 transition',
                                        active
                                            ? 'drop-shadow-[0_0_8px_var(--color-neon-pink)]'
                                            : 'group-hover:drop-shadow-[0_0_8px_var(--color-neon-pink)]',
                                    ].join(' ')}
                                />
                                <span className="text-[10px] tracking-[0.22em] uppercase">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}

                    <div className="h-px w-10 bg-glass-border" />

                    {desktopTrackingNavItems.map((item) => {
                        const Icon = item.icon;
                        const active = isCurrentUrl(item.href);

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={[
                                    'group flex flex-col items-center gap-1 transition',
                                    active
                                        ? 'text-neon-pink'
                                        : 'text-muted-foreground hover:text-neon-pink',
                                ].join(' ')}
                            >
                                <Icon
                                    className={[
                                        'h-6 w-6 transition',
                                        active
                                            ? 'drop-shadow-[0_0_8px_var(--color-neon-pink)]'
                                            : 'group-hover:drop-shadow-[0_0_8px_var(--color-neon-pink)]',
                                    ].join(' ')}
                                />
                                <span className="text-[10px] tracking-[0.22em] uppercase">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}

                    <div className="h-px w-10 bg-glass-border" />

                    {desktopSupportNavItems.map((item) => {
                        const Icon = item.icon;
                        const active = isCurrentUrl(item.href);

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={[
                                    'group flex flex-col items-center gap-1 transition',
                                    active
                                        ? 'text-neon-pink'
                                        : 'text-muted-foreground hover:text-neon-pink',
                                ].join(' ')}
                            >
                                <Icon
                                    className={[
                                        'h-6 w-6 transition',
                                        active
                                            ? 'drop-shadow-[0_0_8px_var(--color-neon-pink)]'
                                            : 'group-hover:drop-shadow-[0_0_8px_var(--color-neon-pink)]',
                                    ].join(' ')}
                                />
                                <span className="text-[10px] tracking-[0.22em] uppercase">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <div className="relative z-10 min-h-screen pb-22 md:pb-0 md:pl-24">
                <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-3 py-4 md:px-8 md:py-8">
                    <header className="glass-panel mb-4 flex flex-col items-stretch gap-3 rounded-2xl border border-glass-border bg-glass-panel px-3 py-2.5 shadow-[0_0_30px_var(--color-neon-pink)/10] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between md:mb-6 md:px-4 md:py-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neon-pink/30 bg-linear-to-br from-neon-pink/25 via-neon-blue/20 to-background shadow-[0_0_20px_var(--color-neon-pink)/20]">
                                <Zap className="h-4 w-4 text-neon-pink" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-['Orbitron',sans-serif] text-xs tracking-[0.3em] text-neon-blue/80 uppercase">
                                    AuraFit
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Social good fitness intelligence
                                </p>
                            </div>
                        </div>

                        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                            <Link
                                href={edit()}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-glass-border bg-background/40 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-neon-blue hover:text-neon-blue sm:flex-none"
                            >
                                <Settings className="h-4 w-4" />
                                Settings
                            </Link>

                            <button
                                type="button"
                                onClick={handleEnableNotifications}
                                disabled={
                                    notificationsEnabled || notificationsLoading
                                }
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-glass-border bg-background/40 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-neon-blue hover:text-neon-blue disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                            >
                                <Bell className="h-4 w-4" />
                                {notificationsEnabled
                                    ? 'Alerts on'
                                    : notificationsLoading
                                      ? 'Enabling...'
                                      : 'Enable alerts'}
                            </button>

                            <button
                                type="button"
                                onClick={() => router.post('/logout')}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-glass-border bg-background/40 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-neon-pink hover:text-neon-pink sm:w-auto"
                            >
                                <LogOut className="h-4 w-4" />
                                Log out
                            </button>
                        </div>
                    </header>

                    <PlanGenerationBanner state={generationState} />

                    <main className="flex-1">{children}</main>
                </div>
            </div>
        </div>
    );
}
