import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import {
    PieChart,
    FileSpreadsheet,
    FileText,
    Filter,
    Percent,
    TrendingUp,
    Layers,
    DollarSign
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { Order } from '@/types';

interface CategoryMargin {
    category: string;
    total_qty: number;
    total_bruto: number;
    total_cost: number;
    gross_profit: number;
    margin_percentage: number;
}

interface MarginReportProps {
    reportData: {
        summary: {
            total_bruto: number;
            total_cost: number;
            total_gross_profit: number;
            avg_margin_percentage: number;
        };
        category_breakdown: CategoryMargin[];
        orders: Order[];
    };
    filters: {
        start_date?: string;
        end_date?: string;
        category?: string;
    };
}

export default function MarginReport({ reportData, filters }: MarginReportProps) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [category, setCategory] = useState(filters.category || '');

    const formatRp = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/reports/margin', {
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            category: category || undefined,
        }, { preserveState: true });
    };

    const getExportUrl = (format: 'excel' | 'pdf') => {
        const params = new URLSearchParams({
            type: 'margin',
            start_date: startDate,
            end_date: endDate,
            category: category,
        });
        return `/reports/export/${format}?${params.toString()}`;
    };

    return (
        <AppLayout
            title="Laporan Margin & Profitabilitas (HPP)"
            subtitle="Analisis perbandingan Belanja Modal vs Harga Jual dan Laba Kotor CV Tihani Mafaza"
        >
            {/* Filter Bar */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-xl">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                        <label className="block text-slate-400 mb-1">Tanggal Mulai</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-slate-400 mb-1">Tanggal Akhir</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-slate-400 mb-1">Kategori Produk</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                        >
                            <option value="">Semua Kategori</option>
                            <option value="ATK">ATK</option>
                            <option value="Elektronik">Elektronik</option>
                            <option value="Furniture">Furniture</option>
                            <option value="Buku">Buku</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="w-full rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 transition-all flex items-center justify-center gap-1.5"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>Terapkan Filter</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Summary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Harga Jual Bruto</span>
                    <span className="text-2xl font-bold font-mono text-indigo-400 mt-1 block">
                        {formatRp(reportData.summary.total_bruto)}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">Omset Kotor</span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Belanja Modal (HPP)</span>
                    <span className="text-2xl font-bold font-mono text-rose-400 mt-1 block">
                        {formatRp(reportData.summary.total_cost)}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">Biaya Pengadaan Barang</span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Laba Kotor Bersih</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                        {formatRp(reportData.summary.total_gross_profit)}
                    </span>
                    <span className="text-[11px] text-emerald-300 mt-1 block">Bruto - Belanja Modal</span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Rasio Margin Rata-rata</span>
                    <span className="text-2xl font-bold font-mono text-white mt-1 block">
                        {reportData.summary.avg_margin_percentage}%
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">(Laba Kotor / Bruto)</span>
                </div>
            </div>

            {/* Category Breakdown Table */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                        <h3 className="text-base font-bold text-white">Profitabilitas per Kategori Produk</h3>
                        <p className="text-xs text-slate-400">Efisiensi margin belanja modal pada tiap lini komoditas</p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <a
                            href={getExportUrl('excel')}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-slate-700"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Export Excel</span>
                        </a>
                        <a
                            href={getExportUrl('pdf')}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-slate-700"
                        >
                            <FileText className="w-3.5 h-3.5 text-rose-400" />
                            <span>Cetak PDF</span>
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                    {reportData.category_breakdown.map((cat) => (
                        <div
                            key={cat.category}
                            className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                                    {cat.category}
                                </span>
                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                    {cat.margin_percentage}%
                                </span>
                            </div>

                            <div className="space-y-1 text-xs pt-1">
                                <div className="flex justify-between text-slate-400">
                                    <span>Penjualan:</span>
                                    <span className="font-mono text-white font-medium">{formatRp(cat.total_bruto)}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Modal (HPP):</span>
                                    <span className="font-mono text-rose-400">{formatRp(cat.total_cost)}</span>
                                </div>
                                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                                    <span>Laba Kotor:</span>
                                    <span className="font-mono text-emerald-400 font-bold">{formatRp(cat.gross_profit)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Itemized Order Margin Table */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-base font-bold text-white">Rincian Margin per Transaksi</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="pb-3">No Pesanan</th>
                                <th className="pb-3">Sekolah</th>
                                <th className="pb-3 text-right">Harga Jual Bruto</th>
                                <th className="pb-3 text-right">Belanja Modal (HPP)</th>
                                <th className="pb-3 text-right">Laba Kotor (Rp)</th>
                                <th className="pb-3 text-center">Margin (%)</th>
                                <th className="pb-3 text-center">Status Keuntungan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                            {reportData.orders.map((o) => (
                                <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="py-3 font-mono font-semibold text-indigo-300">
                                        {o.siplah_order_id}
                                    </td>
                                    <td className="py-3 font-medium text-white max-w-[200px] truncate">
                                        {o.customer?.name}
                                    </td>
                                    <td className="py-3 text-right font-mono font-semibold text-white">
                                        {formatRp(o.total_bruto)}
                                    </td>
                                    <td className="py-3 text-right font-mono text-rose-400">
                                        {formatRp(o.total_cost)}
                                    </td>
                                    <td className="py-3 text-right font-mono font-bold text-emerald-400">
                                        {formatRp(o.gross_profit)}
                                    </td>
                                    <td className="py-3 text-center font-mono font-semibold text-white">
                                        {o.margin_percentage}%
                                    </td>
                                    <td className="py-3 text-center">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${o.margin_percentage >= 20
                                                    ? 'bg-emerald-500/15 text-emerald-300'
                                                    : o.margin_percentage >= 10
                                                        ? 'bg-sky-500/15 text-sky-300'
                                                        : 'bg-amber-500/15 text-amber-300'
                                                }`}
                                        >
                                            {o.margin_percentage >= 20
                                                ? 'Sangat Baik'
                                                : o.margin_percentage >= 10
                                                    ? 'Standar'
                                                    : 'Rendah'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
