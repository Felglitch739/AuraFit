import { Send, Sparkles, User } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import type { ChatContextViewModel, ChatReplyPayload } from '@/types/fitness';

type Sender = 'user' | 'ai';

type ChatMessage = {
    id: string;
    text: string;
    sender: Sender;
};

type ChatProps = {
    context: ChatContextViewModel;
    replyEndpoint?: string;
};

function buildWelcomeMessage(context: ChatContextViewModel): ChatMessage {
    return {
        id: 'ai-welcome',
        sender: 'ai',
        text: `Hi ${context.userName}, I am Aura. I am here to coach your training, nutrition, and mental recovery with care. Tell me how you feel today and we will adapt your plan together.`,
    };
}

export default function Chat({
    context,
    replyEndpoint = '/chat/reply',
}: ChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>(() => [
        buildWelcomeMessage(context),
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [chatContext, setChatContext] =
        useState<ChatContextViewModel>(context);

    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const readinessScore = chatContext.today.readinessScore;
    const macroSummary =
        chatContext.nutrition.targetCalories !== null &&
        chatContext.nutrition.targetCalories !== undefined
            ? `${chatContext.nutrition.targetCalories} kcal`
            : 'Pending nutrition plan';

    const nutritionHint =
        chatContext.nutrition.nutritionTip ??
        'Keep balanced meals and hydration around your session.';

    const parseReplyPayload = (payload: unknown): Partial<ChatReplyPayload> => {
        if (!payload || typeof payload !== 'object') {
            return {};
        }

        return payload as Partial<ChatReplyPayload>;
    };

    const sendMessage = async (
        trimmedInput: string,
        history: ChatMessage[],
    ) => {
        const csrf = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');

        const response = await fetch(replyEndpoint, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
            },
            body: JSON.stringify({
                message: trimmedInput,
                history: history.slice(-8).map((item) => ({
                    sender: item.sender,
                    text: item.text,
                })),
            }),
        });

        if (!response.ok) {
            throw new Error('Chat response failed.');
        }

        const payload = parseReplyPayload(await response.json());

        const replyText =
            typeof payload.reply === 'string' && payload.reply.trim() !== ''
                ? payload.reply
                : 'I am with you. Lets adjust todays load and protect your recovery while keeping your momentum.';

        if (payload.context) {
            setChatContext(payload.context);
        }

        return replyText;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedInput = input.trim();

        if (!trimmedInput || isTyping) {
            return;
        }

        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            text: trimmedInput,
            sender: 'user',
        };

        const nextMessages = [...messages, userMessage];

        setMessages(nextMessages);
        setInput('');
        setIsTyping(true);

        try {
            const replyText = await sendMessage(trimmedInput, nextMessages);
            const aiReply: ChatMessage = {
                id: crypto.randomUUID(),
                text: replyText,
                sender: 'ai',
            };

            setMessages((prev) => [...prev, aiReply]);
        } catch {
            const fallbackReply: ChatMessage = {
                id: crypto.randomUUID(),
                text: 'I could not reach the coach service right now. I still want you to protect your recovery today: train with controlled volume, hydrate well, and take a 5-minute reset for your mind after your session.',
                sender: 'ai',
            };

            setMessages((prev) => [...prev, fallbackReply]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <section className="space-y-6 text-gray-100">
            <header className="glass-panel rounded-2xl border border-glass-border bg-background/50 px-5 py-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-neon-blue/30 bg-gray-900 p-2">
                            <Sparkles className="h-5 w-5 text-neon-blue" />
                        </div>
                        <div>
                            <h1 className="bg-linear-to-r from-neon-pink to-neon-blue bg-clip-text font-['Orbitron',sans-serif] text-xl font-bold text-transparent md:text-2xl">
                                Aura Coach
                            </h1>
                            <p className="text-xs text-gray-400">
                                Personalized coach with training, nutrition, and
                                mental recovery context
                            </p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 md:self-auto">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                        Coach online
                    </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <article className="rounded-xl border border-glass-border bg-background/40 p-3">
                        <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                            Today focus
                        </p>
                        <p className="mt-2 text-sm font-semibold text-foreground">
                            {chatContext.today.plannedSession}
                        </p>
                    </article>

                    <article className="rounded-xl border border-glass-border bg-background/40 p-3">
                        <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                            Readiness
                        </p>
                        <p className="mt-2 text-sm font-semibold text-foreground">
                            {readinessScore ?? '--'}
                        </p>
                    </article>

                    <article className="rounded-xl border border-glass-border bg-background/40 p-3">
                        <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                            Nutrition target
                        </p>
                        <p className="mt-2 text-sm font-semibold text-foreground">
                            {macroSummary}
                        </p>
                    </article>

                    <article className="rounded-xl border border-glass-border bg-background/40 p-3">
                        <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                            Mental focus
                        </p>
                        <p className="mt-2 text-sm font-semibold text-foreground">
                            {chatContext.mentalWellbeing.coachingFocus}
                        </p>
                    </article>
                </div>
            </header>

            <main className="flex h-[calc(100vh-18rem)] min-h-120 flex-col overflow-hidden rounded-2xl border border-gray-800/80 bg-gray-950/70 p-3 md:p-5">
                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-4">
                        {messages.map((message) => {
                            const isUser = message.sender === 'user';

                            return (
                                <div
                                    key={message.id}
                                    className={[
                                        'flex items-end gap-2',
                                        isUser
                                            ? 'justify-end'
                                            : 'justify-start',
                                    ].join(' ')}
                                >
                                    {!isUser ? (
                                        <div className="mb-1 rounded-full border border-neon-blue/30 bg-gray-900 p-2">
                                            <Sparkles className="h-4 w-4 text-neon-blue" />
                                        </div>
                                    ) : null}

                                    <div
                                        className={[
                                            'max-w-[85%] rounded-2xl border px-4 py-3 text-sm leading-relaxed md:max-w-[70%]',
                                            isUser
                                                ? 'border-gray-700 bg-gray-800 text-gray-100'
                                                : 'border-neon-blue/30 bg-gray-900 text-gray-100',
                                        ].join(' ')}
                                    >
                                        {message.text}
                                    </div>

                                    {isUser ? (
                                        <div className="mb-1 rounded-full border border-gray-700 bg-gray-800 p-2">
                                            <User className="h-4 w-4 text-gray-200" />
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}

                        {isTyping ? (
                            <div className="flex items-end gap-2">
                                <div className="mb-1 rounded-full border border-neon-blue/30 bg-gray-900 p-2">
                                    <Sparkles className="h-4 w-4 text-neon-blue" />
                                </div>

                                <div className="rounded-2xl border border-neon-blue/30 bg-gray-900 px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-neon-blue [animation-delay:-0.3s]" />
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-neon-blue [animation-delay:-0.15s]" />
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-neon-blue" />
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <div ref={bottomRef} />
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mt-3 border-t border-gray-800 bg-gray-950/90 pt-3 md:mt-4 md:pt-4"
                >
                    <p className="mb-2 text-xs text-gray-400">
                        {nutritionHint}
                    </p>
                    <div className="flex items-center gap-2 rounded-2xl border border-gray-800 bg-gray-900/60 p-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            placeholder="Ask Aura about training load, meals, stress, or recovery..."
                            className="h-11 flex-1 rounded-xl border border-gray-700 bg-gray-950 px-4 text-sm text-gray-100 outline-none placeholder:text-gray-500 focus:border-neon-blue"
                        />

                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="inline-flex h-11 items-center gap-2 rounded-xl bg-linear-to-r from-neon-pink to-neon-blue px-4 text-sm font-semibold text-white transition hover:from-fuchsia-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Send
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </form>
            </main>
        </section>
    );
}
