import { Send, Sparkles, User } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';

type Sender = 'user' | 'ai';

type ChatMessage = {
    id: string;
    text: string;
    sender: Sender;
};

const initialMessage: ChatMessage = {
    id: 'ai-welcome',
    text: "Hi! I'm Aura, your empathetic coach. How can I help you today with your training or recovery?",
    sender: 'ai',
};

export default function Chat() {
    const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const bottomRef = useRef<HTMLDivElement | null>(null);
    const typingTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current !== null) {
                window.clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        typingTimeoutRef.current = window.setTimeout(() => {
            const aiReply: ChatMessage = {
                id: crypto.randomUUID(),
                text: "I hear you. Let's adjust your plan to prioritize recovery for those muscle groups while keeping your momentum.",
                sender: 'ai',
            };

            setMessages((prev) => [...prev, aiReply]);
            setIsTyping(false);
            typingTimeoutRef.current = null;
        }, 2000);
    };

    return (
        <section className="flex h-screen flex-col bg-gray-950 text-gray-100">
            <header className="sticky top-0 z-10 border-b border-gray-800 bg-gray-900/80 px-4 py-3 backdrop-blur-md md:px-6">
                <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-neon-blue/30 bg-gray-900 p-2">
                            <Sparkles className="h-5 w-5 text-neon-blue" />
                        </div>
                        <div>
                            <h1 className="bg-linear-to-r from-neon-pink to-neon-blue bg-clip-text font-['Orbitron',sans-serif] text-xl font-bold text-transparent md:text-2xl">
                                Aura Coach
                            </h1>
                            <p className="text-xs text-gray-400">
                                Real-time guidance for training and recovery
                            </p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                        Online
                    </div>
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden px-3 pb-3 md:px-6 md:pb-6">
                <div className="mt-3 flex-1 overflow-y-auto rounded-2xl border border-gray-800/80 bg-gray-950/80 p-3 md:mt-6 md:p-5">
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
                    <div className="flex items-center gap-2 rounded-2xl border border-gray-800 bg-gray-900/60 p-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            placeholder="Ask Aura about your workout, fatigue, or recovery..."
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
