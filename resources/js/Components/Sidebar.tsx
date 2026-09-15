import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    FileSpreadsheet,
    ShoppingCart,
    School,
    TrendingUp,
    Receipt,
    Wallet,
    Scale,
    PieChart,
    LogOut,
    Building2,
    Package
} from 'lucide-react';
import { PageProps } from '@/types';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const { url, props } = usePage<PageProps>();
    const user = props.auth?.user;

    const navItems = [
        {
            group: 'Utama',
            items: [
                { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
                { name: 'Integrasi SIPLah', href: '/import', icon: FileSpreadsheet, badge: 'Parser' },
                { name: 'Pesanan SIPLah', href: '/orders', icon: ShoppingCart },
                { name: 'Katalog & Stok', href: '/products', icon: Package },
                { name: 'Data Sekolah', href: '/customers', icon: School },
            ],
        },
        {
            group: 'Laporan Akuntansi',
            items: [
                { name: 'Laporan Penjualan', href: '/reports/sales', icon: TrendingUp },
                { name: 'Laporan Margin / HPP', href: '/reports/margin', icon: PieChart },
                { name: 'Laporan Arus Kas', href: '/reports/cash-flow', icon: Wallet },
                { name: 'Laporan Perpajakan', href: '/reports/tax', icon: Receipt },
            ],
        },
        {
            group: 'Pemeriksaan & Kontrol',
            items: [
                { name: 'Rekonsiliasi Bank', href: '/reconciliation', icon: Scale },
            ],
        },
    ];

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`fixed top-0 left-0 z-50 h-screen w-64 flex flex-col justify-between border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand Header */}
                <div>
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/80">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-md shadow-indigo-500/25">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-bold text-white tracking-wide truncate">CV TIHANI</span>
                                <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-300 border border-indigo-500/30">
                                    SIPLah
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">Sistem Info Akuntansi</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="px-3 py-3 space-y-4 overflow-y-auto max-h-[calc(100vh-170px)]">
                        {navItems.map((group) => (
                            <div key={group.group}>
                                <h4 className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                    {group.group}
                                </h4>
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = url === item.href || url.startsWith(item.href + '?');
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                                                    isActive
                                                        ? 'bg-gradient-to-r from-indigo-600/90 to-indigo-700/80 text-white shadow-md shadow-indigo-600/20 border border-indigo-500/30'
                                                        : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-100'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <Icon
                                                        className={`h-4 w-4 shrink-0 transition-colors ${
                                                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                                                        }`}
                                                    />
                                                    <span className="truncate">{item.name}</span>
                                                </div>
                                                {item.badge && (
                                                    <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-300">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Card & Logout Footer */}
                <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-indigo-400 font-bold text-xs border border-slate-700">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'I'}
                            </div>
                            <div className="overflow-hidden min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Iasha Tsamrotul F.'}</p>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                                    <span className="capitalize truncate">{user?.role || 'Admin Akuntansi'}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            title="Keluar dari Sistem"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[9px] text-slate-400 flex items-center justify-between">
                        <span>KP STMIK Mardira</span>
                        <span className="font-mono">v1.0</span>
                    </div>
                </div>
            </aside>
        </>
    );
}
