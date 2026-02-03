"use client";

import { motion } from "framer-motion";
import { Download, Monitor, Shield, Zap, Sparkles, CheckCircle2, ChevronRight, Apple } from "lucide-react";
import Link from "next/link";

export default function DownloadPage() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-20">
                {/* Header */}
                <div className="flex justify-between items-center mb-16">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Sparkles className="text-white w-4 h-4" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">Audyt SEO i SGE</span>
                    </Link>
                    <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                        Wróć do analizy online <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Hero Section */}
                <div className="max-w-4xl mx-auto text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-400 mb-6 uppercase tracking-widest">
                            Wersja Profesjonalna dla macOS
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-gradient">
                            Analizuj bez limitów na swoim Macu
                        </h1>
                        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                            Pobierz natywną aplikację Audyt SEO i SGE. Szybsza analiza, brak limitów zapytań i pełna prywatność danych dzięki pracy z własnym kluczem API.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="https://github.com/jtomeczek-dev/Audit-SEO-SGE/releases/latest"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative px-8 py-4 bg-white text-slate-950 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-white/5 overflow-hidden"
                            >
                                <Apple className="w-6 h-6" />
                                <span>Pobierz dla macOS (.dmg)</span>
                                <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                            </a>
                            <p className="text-sm text-slate-500 italic">Bezpłatna aktualizacja do v1.0.0</p>
                        </div>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-32">
                    {[
                        {
                            icon: <Zap className="text-amber-400" />,
                            title: "Brak Limitów",
                            desc: "Wersja desktopowa pozwala na nielimitowaną liczbę audytów dzięki użyciu własnego klucza Gemini."
                        },
                        {
                            icon: <Shield className="text-emerald-400" />,
                            title: "Prywatność",
                            desc: "Twoje analizy i klucze API nie opuszczają Twojego komputera. Pełne bezpieczeństwo biznesowe."
                        },
                        {
                            icon: <Monitor className="text-blue-400" />,
                            title: "Natywna Wydajność",
                            desc: "Szybsze przetwarzanie dużych witryn i lepsza stabilność niż w wersji przeglądarkowej."
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 glass-morphism hover:border-slate-700 transition-colors"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Requirements & Info */}
                <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-center">
                    <h2 className="text-2xl font-bold text-white mb-6">Informacje o instalacji</h2>
                    <ul className="text-left space-y-4 mb-8">
                        {[
                            "Wymagany macOS 11.0 Big Sur lub nowszy",
                            "Wsparcie dla procesorów Apple Silicon (M1/M2/M3)",
                            "Wymaga własnego klucza Gemini API (dostępny bezpłatnie w Google AI Studio)",
                            "Aplikacja sama powiadomi Cię o dostępności nowych aktualizacji"
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-400 text-sm">
                                <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                        Aktualna wersja stabilna: v1.0.0
                    </p>
                </div>

                {/* Footer */}
                <footer className="mt-32 py-8 border-t border-slate-900 text-center">
                    <p className="text-slate-600 text-sm">
                        Juliusz Tomeczek &copy; {new Date().getFullYear()} • Audyt SEO i SGE jest projektem Open Source
                    </p>
                </footer>
            </div>
        </main>
    );
}
