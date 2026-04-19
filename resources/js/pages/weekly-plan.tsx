import { Head } from '@inertiajs/react';
import WeeklyPlanView, {
    type WeeklyPlan,
} from '@/components/fitness/WeeklyPlan';

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
                plan={weeklyPlan}
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
