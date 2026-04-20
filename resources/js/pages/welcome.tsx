import { Head, usePage } from '@inertiajs/react';
import { WelcomeLanding } from '@/components/fitness/welcome';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<{ auth: { user?: { name?: string } | null } }>()
        .props;
    const userName = auth.user?.name ?? 'Athlete';

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Orbitron:wght@500;700;900&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <WelcomeLanding
                userName={userName}
                canRegister={canRegister}
                isAuthenticated={Boolean(auth.user)}
            />
        </>
    );
}
