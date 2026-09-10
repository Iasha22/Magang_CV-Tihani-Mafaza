import React from 'react';
import { Menu, FileDown, UploadCloud, Calendar, Shield } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface NavbarProps {
    title: string;
    subtitle?: string;
    onToggleSidebar: () => void;
}

export default function Navbar({ title, subtitle, onToggleSidebar }: NavbarProps) {
    const todayFormatted = new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'full',
    }).format(new Date());

    return (
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 lg:hidden"
                >
                    <Menu className="h-6 w-6" />
                </button>

                <div>
                    <h1 className="text-xl font-extrabold text-white tracking-tight">{title}</h1>
                    {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 rounded-xl bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 text-xs text-slate-300">
                    <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="capitalize">{todayFormatted}</span>
                </div>

                <a
                    href="/import/template"
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-700 transition-all shadow-sm"
                >
                    <FileDown className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Template Excel</span>
                </a>

                <Link
                    href="/import"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-xs font-semibold text-white hover:from-indigo-500 hover:to-indigo-400 transition-all shadow-lg shadow-indigo-600/25"
                >
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>Impor SIPLah</span>
                </Link>
            </div>
        </header>
    );
}
