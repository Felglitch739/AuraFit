import { Head } from '@inertiajs/react';
import { DashboardView, type DashboardViewProps } from '@/components/fitness/dashboard';
import { dashboard } from '@/routes';

export default function DashboardPage(props: DashboardViewProps) {
    return (
        <>
            <Head title="Dashboard" />
            <DashboardView {...props} />
        </>
    );
}

DashboardPage.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
