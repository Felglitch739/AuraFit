import { Head } from '@inertiajs/react';
import {
    WeeklyPlanView,
    type WeeklyPlan,
} from '@/components/fitness/weekly-plan';

type WeeklyPlanPageProps = {
    weeklyPlan?: WeeklyPlan | null;
    generationError?: string | null;
};

export default function WeeklyPlanPage({
    weeklyPlan,
    generationError,
}: WeeklyPlanPageProps) {
    return (
        <>
            <Head title="Weekly Plan" />
            <WeeklyPlanView
                plan={weeklyPlan ?? undefined}
                generationError={generationError}
            />
        </>
    );
}

WeeklyPlanPage.layout = {
    breadcrumbs: [
        {
            title: 'Weekly Plan',
            href: '/weekly-plan-preview',
        },
    ],
};
