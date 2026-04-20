import { Head } from '@inertiajs/react';
import { CheckInView, type CheckInViewProps } from '@/components/fitness/checkin';

export default function CheckInPage(props: CheckInViewProps) {
    return (
        <>
            <Head title="Check-in" />
            <CheckInView {...props} />
        </>
    );
}

CheckInPage.layout = {
    breadcrumbs: [
        {
            title: 'Check-in',
            href: '/check-in',
        },
    ],
};
