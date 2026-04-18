import { Head } from '@inertiajs/react';
import Chat from '@/components/fitness/Chat';
import type { ChatContextViewModel } from '@/types/fitness';

type ChatPageProps = {
    chatContext: ChatContextViewModel;
};

export default function ChatPage({ chatContext }: ChatPageProps) {
    return (
        <>
            <Head title="Chat" />
            <Chat context={chatContext} />
        </>
    );
}
