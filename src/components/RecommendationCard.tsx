"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Info, CheckCircle, ArrowUpRight } from "lucide-react";
import { Recommendation } from "@/lib/analyzer";
import { Locale } from "@/lib/translations";

interface RecommendationCardProps {
    recommendation: Recommendation;
    index: number;
    lang?: Locale;
}

export function RecommendationCard({ recommendation, index, lang = "pl" }: RecommendationCardProps) {
    const getPriorityColor = () => {
        switch (recommendation.priority) {
            case 'high': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    const getPriorityLabel = () => {
        switch (recommendation.priority) {
            case 'high': return lang === "pl" ? 'Wysoki' : 'High';
            case 'medium': return lang === "pl" ? 'Średni' : 'Medium';
            case 'low': return lang === "pl" ? 'Niski' : 'Low';
            default: return recommendation.priority;
        }
    };

    const getIcon = () => {
        switch (recommendation.priority) {
            case 'high': return <AlertTriangle className="w-5 h-5" />;
            case 'medium': return <Info className="w-5 h-5" />;
            case 'low': return <CheckCircle className="w-5 h-5" />;
            default: return <ArrowUpRight className="w-5 h-5" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 transition-all group"
        >
            <div className="flex items-start gap-4">
                <div className={`mt-1 p-2 rounded-lg ${getPriorityColor()}`}>
                    {getIcon()}
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-100">{recommendation.title}</h4>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getPriorityColor()}`}>
                            {getPriorityLabel()}
                        </span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{recommendation.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                        <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5 bg-slate-800 rounded-md">
                            {recommendation.category}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
