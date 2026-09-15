import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import Navbar from '@/Components/Navbar';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { PageProps } from '@/types';

interface AppLayoutProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}

export default function AppLayout({ title, subtitle, children }: AppLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { flash } = usePage<PageProps>().props;
    const [dismissedFlash, setDismissedFlash] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
            <Head title={title} />

            {/* Sidebar (width: w-64) */}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Main Content Area: exactly matches lg:pl-64 */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
                <Navbar
                    title={title}
                    subtitle={subtitle}
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8 leading-relaxed">
                    {/* Flash Notifications */}
                    {!dismissedFlash && (flash?.success || flash?.error || flash?.info) && (
                        <div className="space-y-3">
                            {flash.success && (
                                <div className="flex items-center justify-between rounded-2xl bg-emerald-500/15 border border-emerald-500/30 px-5 py-4 text-sm text-emerald-200 shadow-lg shadow-emerald-500/5">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                                        <span className="leading-relaxed">{flash.success}</span>
                                    </div>
                                    <button
                                        onClick={() => setDismissedFlash(true)}
                                        className="text-emerald-400 hover:text-emerald-200 p-1 rounded-lg"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            {flash.error && (
                                <div className="flex items-center justify-between rounded-2xl bg-rose-500/15 border border-rose-500/30 px-5 py-4 text-sm text-rose-200 shadow-lg shadow-rose-500/5">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                                        <span className="leading-relaxed">{flash.error}</span>
                                    </div>
                                    <button
                                        onClick={() => setDismissedFlash(true)}
                                        className="text-rose-400 hover:text-rose-200 p-1 rounded-lg"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            {flash.info && (
                                <div className="flex items-center justify-between rounded-2xl bg-sky-500/15 border border-sky-500/30 px-5 py-4 text-sm text-sky-200 shadow-lg shadow-sky-500/5">
                                    <div className="flex items-center gap-3">
                                        <Info className="h-5 w-5 text-sky-400 shrink-0" />
                                        <span className="leading-relaxed">{flash.info}</span>
                                    </div>
                                    <button
                                        onClick={() => setDismissedFlash(true)}
                                        className="text-sky-400 hover:text-sky-200 p-1 rounded-lg"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </div>
    );
}