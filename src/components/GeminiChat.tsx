"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Bot, User, Loader2, MessageSquare, Sparkles } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { isDesktop } from "@/lib/env";
import { GoogleGenerativeAI } from "@google/generative-ai";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface GeminiChatProps {
    context: any;
    isOpen: boolean;
    onClose: () => void;
}

export function GeminiChat({ context, isOpen, onClose }: GeminiChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [localApiKey, setLocalApiKey] = useState<string>("");
    const [showSettings, setShowSettings] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isDesktop) {
            const saved = localStorage.getItem("gemini_api_key");
            if (saved) setLocalApiKey(saved);
        }
    }, []);

    const saveApiKey = (key: string) => {
        setLocalApiKey(key);
        localStorage.setItem("gemini_api_key", key);
        setShowSettings(false);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            if (isDesktop && localApiKey) {
                // Direct call for Desktop
                const genAI = new GoogleGenerativeAI(localApiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const systemInstruction = `Jesteś ekspertem ds. SEO oraz AI Readiness (SGE). Twoim zadaniem jest pomóc użytkownikowi zrozumieć wyniki audytu jego strony internetowej i doradzić, jak może poprawić parametry analizowane przez aplikację.
        
        Kontekst audytu:
        ${JSON.stringify(context, null, 2)}
        
        Odpowiadaj konkretnie, profesjonalnie i w języku polskim. Skup się na danych zawartych w kontekście. Jeśli użytkownik pyta o coś poza zakresem audytu, dyplomatycznie skieruj go z powrotem na tematy związane z SEO i optymalizacją pod modele AI.`;

                const chat = model.startChat({
                    history: [
                        { role: 'user', parts: [{ text: systemInstruction }] },
                        { role: 'model', parts: [{ text: "Rozumiem mój cel. Jestem ekspertem SEO/SGE i pomogę Ci zinterpretować wyniki audytu dla tej strony. O co chciałbyś zapytać?" }] },
                        ...messages.map(m => ({
                            role: m.role === 'user' ? 'user' : 'model',
                            parts: [{ text: m.content }]
                        }))
                    ]
                });

                const result = await chat.sendMessage(input);
                const text = result.response.text();
                setMessages([...newMessages, { role: 'assistant', content: text }]);
            } else {
                // Default API call for Web
                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        messages: newMessages,
                        context: context
                    }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || "Wystąpił błąd podczas komunikacji z Gemini.");
                }

                const assistantMessage = await response.json();
                setMessages([...newMessages, assistantMessage]);
            }
        } catch (error: any) {
            setMessages([...newMessages, { role: 'assistant', content: `Błąd: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = (content: string) => {
        const lines = content.split('\n');
        return lines.map((line, index) => {
            let processedLine = line;
            const boldRegex = /\*\*(.*?)\*\*/g;
            const parts = [];
            let lastIndex = 0;
            let match;

            while ((match = boldRegex.exec(processedLine)) !== null) {
                if (match.index > lastIndex) {
                    parts.push(processedLine.substring(lastIndex, match.index));
                }
                parts.push(<strong key={match.index} className="font-bold text-white">{match[1]}</strong>);
                lastIndex = boldRegex.lastIndex;
            }
            parts.push(processedLine.substring(lastIndex));

            const isBullet = processedLine.trim().startsWith('* ') || processedLine.trim().startsWith('- ');

            return (
                <p key={index} className={cn(
                    "min-h-[1.25rem]",
                    isBullet ? "pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-cyan-500" : ""
                )}>
                    {isBullet ? parts.map((p, i) => typeof p === 'string' ? p.replace(/^[* -]\s+/, '') : p) : parts}
                </p>
            );
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed bottom-6 right-6 w-[400px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-100px)] z-50 flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl glass-morphism overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                                <Sparkles className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Konsultant Gemini AI</h3>
                                <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-black">Ekspert SEO</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {isDesktop && (
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className={cn(
                                        "p-2 rounded-full transition",
                                        showSettings ? "bg-cyan-500/20 text-cyan-400" : "hover:bg-slate-700 text-slate-400 hover:text-white"
                                    )}
                                    title="Ustawienia klucza API"
                                >
                                    <Send className="w-5 h-5 rotate-90" /> {/* Simulating settings icon with send rotated */}
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Settings Overlay */}
                    {showSettings && (
                        <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur-sm p-6 flex flex-col justify-center gap-4">
                            <div className="text-center mb-4">
                                <h4 className="text-lg font-bold text-white mb-2">Twój Klucz Gemini API</h4>
                                <p className="text-xs text-slate-400">
                                    W wersji Desktop używasz własnego klucza, aby nie mieć limitów zapytań.
                                </p>
                            </div>
                            <input
                                type="password"
                                value={localApiKey}
                                onChange={(e) => setLocalApiKey(e.target.value)}
                                placeholder="Wklej klucz API (AIza...)"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => saveApiKey(localApiKey)}
                                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-cyan-900/20"
                                >
                                    Zapisz Klucz
                                </button>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl transition"
                                >
                                    Anuluj
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-500 text-center mt-4 uppercase">
                                Klucz jest zapisywany lokalnie na Twoim komputerze.
                            </p>
                        </div>
                    ) || (isDesktop && !localApiKey && !messages.length) && (
                        <div className="absolute inset-x-4 top-20 z-10 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-center">
                            <p className="text-xs text-cyan-200 mb-3">Wymagany klucz API do działania w wersji Desktop.</p>
                            <button
                                onClick={() => setShowSettings(true)}
                                className="text-[10px] font-black uppercase tracking-widest text-white bg-cyan-600 px-4 py-2 rounded-full hover:bg-cyan-500 transition"
                            >
                                Skonfiguruj Klucz
                            </button>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                                <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-sm">Zadaj mi pytanie na temat wyników tej podstrony. Chętnie doradzę, jak poprawić parametry!</p>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} className={cn(
                                "flex items-start gap-3",
                                m.role === 'user' ? "flex-row-reverse" : ""
                            )}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                    m.role === 'user' ? "bg-slate-700" : "bg-cyan-500/20 text-cyan-400"
                                )}>
                                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div className={cn(
                                    "p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] space-y-2",
                                    m.role === 'user' ? "bg-slate-800 text-white rounded-tr-none" : "bg-slate-800/40 border border-slate-800 text-slate-200 rounded-tl-none shadow-inner"
                                )}>
                                    {renderContent(m.content)}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                </div>
                                <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 text-slate-400 text-sm">
                                    Gemini myśli...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex items-center gap-2"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Zadaj pytanie..."
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white placeholder-slate-500"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="p-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 text-white rounded-xl transition shadow-lg shadow-cyan-900/20"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
