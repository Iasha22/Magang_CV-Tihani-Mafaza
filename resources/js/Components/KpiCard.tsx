import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple';
    badgeText?: string;
    badgePositive?: boolean;
}

const colorMap = {
    indigo: {
        bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
        glow: 'group-hover:border-indigo-500/40',
        iconBg: 'bg-indigo-500/20 text-indigo-400',
    },
    emerald: {
        bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        glow: 'group-hover:border-emerald-500/40',
        iconBg: 'bg-emerald-500/20 text-emerald-400',
    },
    amber: {
        bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        glow: 'group-hover:border-amber-500/40',
        iconBg: 'bg-amber-500/20 text-amber-400',
    },
    rose: {
        bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
        glow: 'group-hover:border-rose-500/40',
        iconBg: 'bg-rose-500/20 text-rose-400',
    },
    sky: {
        bg: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
        glow: 'group-hover:border-sky-500/40',
        iconBg: 'bg-sky-500/20 text-sky-400',
    },
    purple: {
        bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
        glow: 'group-hover:border-purple-500/40',
        iconBg: 'bg-purple-500/20 text-purple-400',
    },
};

export default function KpiCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color = 'indigo',
    badgeText,
    badgePositive,
}: KpiCardProps) {
    const scheme = colorMap[color] || colorMap.indigo;

    return (
        <div className={`group relative rounded-2xl border p-4 lg:p-5 transition-all duration-300 bg-slate-900/70 backdrop-blur-xl border-slate-800 ${scheme.glow} hover:shadow-xl hover:shadow-indigo-500/5`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-white font-mono">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${scheme.iconBg}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>

            {(subtitle || badgeText) && (
                <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-800/80 text-xs">
                    {badgeText && (
                        <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold ${badgePositive
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                        >
                            {badgeText}
                        </span>
                    )}
                    {subtitle && <span className="text-slate-400 truncate">{subtitle}</span>}
                </div>
            )}
        </div>
    );
}