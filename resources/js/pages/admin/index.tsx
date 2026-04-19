import { Head } from '@inertiajs/react';

type AdminUser = {
    id: number;
    name: string;
    email: string;
    isAdmin: boolean;
    createdAt: string | null;
};

type UsageRow = {
    userId: number | null;
    name: string;
    email: string;
    requestsCount: number;
    totalTokens: number;
    totalCostUsd: number;
    lastRequestAt: string | null;
};

type AdminPageProps = {
    users: AdminUser[];
    usage: {
        totals: {
            requestsCount: number;
            totalTokens: number;
            totalCostUsd: number;
        };
        byUser: UsageRow[];
    };
};

const usd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
});

export default function AdminIndex({ users, usage }: AdminPageProps) {
    return (
        <>
            <Head title="Admin" />

            <div className="space-y-6">
                <section className="glass-panel rounded-2xl p-4 md:p-6">
                    <h1 className="text-2xl font-semibold text-foreground">
                        Admin dashboard
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Track user base and API usage costs.
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                                API Requests
                            </p>
                            <p className="mt-1 text-xl font-bold text-foreground">
                                {usage.totals.requestsCount.toLocaleString()}
                            </p>
                        </div>
                        <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                                Total tokens
                            </p>
                            <p className="mt-1 text-xl font-bold text-foreground">
                                {usage.totals.totalTokens.toLocaleString()}
                            </p>
                        </div>
                        <div className="rounded-xl border border-glass-border bg-background/40 p-4">
                            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                                Estimated cost
                            </p>
                            <p className="mt-1 text-xl font-bold text-foreground">
                                {usd.format(usage.totals.totalCostUsd)}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="glass-panel rounded-2xl p-4 md:p-6">
                    <h2 className="text-lg font-semibold text-foreground">
                        Users
                    </h2>

                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-glass-border text-xs tracking-[0.2em] text-muted-foreground uppercase">
                                    <th className="px-3 py-2">ID</th>
                                    <th className="px-3 py-2">Name</th>
                                    <th className="px-3 py-2">Email</th>
                                    <th className="px-3 py-2">Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-glass-border/60"
                                    >
                                        <td className="px-3 py-2 text-foreground">
                                            {user.id}
                                        </td>
                                        <td className="px-3 py-2 text-foreground">
                                            {user.name}
                                        </td>
                                        <td className="px-3 py-2 text-muted-foreground">
                                            {user.email}
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className="rounded-full border border-glass-border bg-background/40 px-2 py-1 text-xs text-foreground">
                                                {user.isAdmin
                                                    ? 'Admin'
                                                    : 'User'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="glass-panel rounded-2xl p-4 md:p-6">
                    <h2 className="text-lg font-semibold text-foreground">
                        API usage by user
                    </h2>

                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-glass-border text-xs tracking-[0.2em] text-muted-foreground uppercase">
                                    <th className="px-3 py-2">User</th>
                                    <th className="px-3 py-2">Requests</th>
                                    <th className="px-3 py-2">Tokens</th>
                                    <th className="px-3 py-2">
                                        Estimated cost
                                    </th>
                                    <th className="px-3 py-2">Last request</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usage.byUser.map((row, index) => (
                                    <tr
                                        key={`${row.userId ?? 'unknown'}-${index}`}
                                        className="border-b border-glass-border/60"
                                    >
                                        <td className="px-3 py-2">
                                            <p className="font-medium text-foreground">
                                                {row.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {row.email}
                                            </p>
                                        </td>
                                        <td className="px-3 py-2 text-foreground">
                                            {row.requestsCount.toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2 text-foreground">
                                            {row.totalTokens.toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2 text-foreground">
                                            {usd.format(row.totalCostUsd)}
                                        </td>
                                        <td className="px-3 py-2 text-muted-foreground">
                                            {row.lastRequestAt
                                                ? new Date(
                                                      row.lastRequestAt,
                                                  ).toLocaleString()
                                                : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </>
    );
}
