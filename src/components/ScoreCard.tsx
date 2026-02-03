"use client";

import { motion } from "framer-motion";
import { ScoreCheck } from "@/lib/analyzer";
import { Locale } from "@/lib/translations";

interface ScoreCardProps {
    score: number;
    label: string;
    icon: React.ReactNode;
    color: string; // hex color or tailwind class
    description?: string;
    breakdown?: ScoreCheck[];
    lang?: Locale;
}

export function ScoreCard({ score, label, icon, color, description, breakdown, lang = "pl" }: ScoreCardProps) {
    return (
        <div className="glass-morphism p-8 rounded-2xl relative overflow-hidden group">
            <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`p-3 rounded-xl bg-slate-800/50 mb-4 ${color}`}>
                    {icon}
                </div>
                <div className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-2">{label}</div>
                <div className="text-6xl font-black text-white tabular-nums">
                    {score}<span className="text-2xl text-slate-500 ml-1">%</span>
                </div>

                {description && (
                    <p className="mt-4 text-xs text-slate-500 leading-relaxed max-w-[200px]">
                        {description}
                    </p>
                )}

                {/* Checklist Breakdown */}
                {breakdown && (
                    <div className="mt-8 w-full space-y-3 text-left">
                        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 border-b border-slate-800/50 pb-2 flex justify-between">
                            <span>{lang === 'pl' ? 'Lista Kontrolna' : 'Checklist'}</span>
                            <span>Status</span>
                        </div>
                        {breakdown.map((check, i) => (
                            <div key={i} className="flex items-center justify-between gap-3 group/item">
                                <span className={`text-[11px] ${check.passed ? 'text-slate-400' : 'text-slate-500 font-medium'} transition-colors`}>
                                    {check.label}
                                </span>
                                <div className="flex items-center gap-2">
                                    {!check.passed && (
                                        <span className="text-[10px] font-bold text-rose-500/80">-{check.impact}%</span>
                                    )}
                                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${check.passed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                                        {check.passed ? (
                                            <svg className="w-2 h-2 fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z" /></svg>
                                        ) : (
                                            <svg className="w-1.5 h-1.5 fill-current" viewBox="0 0 20 20"><path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" /></svg>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-6 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        className={`h-full rounded-full ${color.includes('text-cyan') ? 'bg-cyan-500' : 'bg-purple-500'}`}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </div>
            </div>

            {/* Decorative gradient */}
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 blur-3xl opacity-20 pointer-events-none ${color.includes('text-cyan') ? 'bg-cyan-500' : 'bg-purple-500'}`} />
        </div>
    );
}
