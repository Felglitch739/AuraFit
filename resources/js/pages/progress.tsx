import { Head } from '@inertiajs/react';
import { ProgressView, type ProgressViewProps } from '@/components/fitness/progress';

export default function ProgressPage(props: ProgressViewProps) {
    return (
        <>
            <Head title="Daily Progress" />
            <ProgressView {...props} />
        </>
    );
}

ProgressPage.layout = {
    breadcrumbs: [
        {
            title: 'Progress',
            href: '/progress',
        },
    ],
};
