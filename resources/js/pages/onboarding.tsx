import { Head } from '@inertiajs/react';
import {
    OnboardingView,
    type OnboardingViewProps,
} from '@/components/fitness/onboarding';

export default function OnboardingPage({ initialData }: OnboardingViewProps) {
    return (
        <>
            <Head title="Onboarding" />
            <OnboardingView initialData={initialData} />
        </>
    );
}

OnboardingPage.layout = {
    breadcrumbs: [
        {
            title: 'Setup',
            href: '/onboarding',
        },
    ],
};
