import { Head } from '@inertiajs/react';
import WeeklyPlanView, {
    mockPlan,
    type WeeklyPlan,
} from '@/components/fitness/WeeklyPlan';

type WeeklyPlanPageProps = {
    weeklyPlan?: WeeklyPlan | null;
};

export default function WeeklyPlanPage({ weeklyPlan }: WeeklyPlanPageProps) {
    return (
        <>
            <Head title="Weekly Plan" />
            <WeeklyPlanView plan={weeklyPlan ?? mockPlan} />
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
