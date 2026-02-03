"use client";

import { CheckCircle2, AlertCircle, Info, ChevronRight } from "lucide-react";

interface DetailItemProps {
    label: string;
    value: string | number;
    status: 'success' | 'warning' | 'error' | 'info';
    description?: string;
    onClick?: () => void;
}

export function AuditDetailItem({ label, value, status, description, onClick }: DetailItemProps) {
    const getStatusIcon = () => {
        switch (status) {
            case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
            case 'warning': return <AlertCircle className="w-5 h-5 text-amber-400" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-rose-400" />;
            default: return <Info className="w-5 h-5 text-slate-400" />;
        }
    };

    const getStatusBg = () => {
        switch (status) {
            case 'success': return 'border-emerald-500/20 bg-emerald-500/5';
            case 'warning': return 'border-amber-500/20 bg-amber-500/5';
            case 'error': return 'border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40 hover:bg-rose-500/10 cursor-pointer';
            default: return 'border-slate-500/20 bg-slate-500/5';
        }
    };

    return (
        <div
            onClick={onClick}
            className={`p-4 rounded-xl border ${getStatusBg()} flex flex-col gap-1 transition-all hover:scale-[1.02] relative group`}
        >
            <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400 font-medium">{label}</span>
                {getStatusIcon()}
            </div>
            <div className="text-lg font-semibold text-slate-200 truncate">{value}</div>
            {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}

            {status === 'error' && onClick && (
                <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4 text-rose-400" />
                </div>
            )}
        </div>
    );
}
