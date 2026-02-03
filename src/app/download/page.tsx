"use client";

import { motion } from "framer-motion";
import { Download, Monitor, Shield, Zap, Sparkles, CheckCircle2, ChevronRight, Apple, Globe } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { translations, Locale } from "@/lib/translations";

export default function DownloadPage() {
    const [lang, setLang] = useState<Locale>("pl");

    useEffect(() => {
        const saved = localStorage.getItem("preferred_lang") as Locale;
        if (saved) setLang(saved);
    }, []);

    const toggleLang = () => {
        const newLang = lang === "pl" ? "en" : "pl";
        setLang(newLang);
        localStorage.setItem("preferred_lang", newLang);
    };

    const t = translations[lang];

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
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-110 transition-transform p-1.5">
                            <img src="/icon.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">{t.title}</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={toggleLang}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-800 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all shadow-lg"
                        >
                            <Globe className="w-3.5 h-3.5" />
                            {lang === "pl" ? "EN" : "PL"}
                        </button>
                        <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                            {t.backToAudit} <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="max-w-4xl mx-auto text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-400 mb-6 uppercase tracking-widest">
                            {t.dlHeroBadge}
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-gradient">
                            {t.dlHeroTitle}
                        </h1>
                        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                            {t.dlHeroDesc}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="https://github.com/jtomeczek-dev/Audit-SEO-SGE/releases/latest"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative px-8 py-4 bg-white text-slate-950 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-white/5 overflow-hidden"
                            >
                                <Apple className="w-6 h-6" />
                                <span>{t.dlButton}</span>
                                <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                            </a>
                            <p className="text-sm text-slate-500 italic">{t.dlUpdateInfo}</p>
                        </div>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-32">
                    {[
                        {
                            icon: <Zap className="text-amber-400" />,
                            title: t.dlFeature1Title,
                            desc: t.dlFeature1Desc
                        },
                        {
                            icon: <Shield className="text-emerald-400" />,
                            title: t.dlFeature2Title,
                            desc: t.dlFeature2Desc
                        },
                        {
                            icon: <Monitor className="text-blue-400" />,
                            title: t.dlFeature3Title,
                            desc: t.dlFeature3Desc
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
                    <h2 className="text-2xl font-bold text-white mb-6">{t.dlInfoTitle}</h2>
                    <ul className="text-left space-y-4 mb-8">
                        {[
                            t.dlInfo1,
                            t.dlInfo2,
                            t.dlInfo3,
                            t.dlInfo4
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-400 text-sm">
                                <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                        {t.dlStableVersion}
                    </p>
                </div>

                {/* Footer */}
                <footer className="mt-32 py-8 border-t border-slate-900 text-center">
                    <p className="text-slate-500 text-sm">
                        Juliusz Tomeczek &copy; {new Date().getFullYear()} • {lang === "pl" ? "w ramach projektu" : "as part of the project"}{" "}
                        <a
                            href="https://aiforeveryone.blog"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-500 hover:text-cyan-400 font-medium transition-colors"
                        >
                            AIforEveryone.blog
                        </a>
                    </p>
                </footer>
            </div>
        </main>
    );
}
