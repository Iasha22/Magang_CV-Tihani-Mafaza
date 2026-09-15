import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import {
    TrendingUp,
    FileSpreadsheet,
    FileText,
    Calendar,
    School,
    Layers,
    Filter,
    ArrowUpRight,
    Coins,
    DollarSign
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { Order, Customer } from '@/types';

interface SalesReportProps {
    reportData: {
        summary: {
            total_orders: number;
            total_revenue: number;
            total_cost: number;
            avg_order_value: number;
        };
        orders: Order[];
    };
    customers: Customer[];
    filters: {
        start_date?: string;
        end_date?: string;
        customer_id?: string;
        category?: string;
    };
}

export default function SalesReport({ reportData, customers, filters }: SalesReportProps) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [customerId, setCustomerId] = useState(filters.customer_id || '');
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
        router.get('/reports/sales', {
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            customer_id: customerId || undefined,
            category: category || undefined,
        }, { preserveState: true });
    };

    const getExportUrl = (format: 'excel' | 'pdf') => {
        const params = new URLSearchParams({
            type: 'sales',
            start_date: startDate,
            end_date: endDate,
            customer_id: customerId,
            category: category,
        });
        return `/reports/export/${format}?${params.toString()}`;
    };

    return (
        <AppLayout
            title="Laporan Penjualan Pengadaan SIPLah"
            subtitle="Rekapitulasi omset penjualan barang ke sekolah mitra CV Tihani Mafaza"
        >
            {/* Filter Bar */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-xl">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
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
                        <label className="block text-slate-400 mb-1">Sekolah</label>
                        <select
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                        >
                            <option value="">Semua Sekolah</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
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
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Total Pesanan</span>
                    <span className="text-2xl font-bold font-mono text-white mt-1 block">
                        {reportData.summary.total_orders}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">Transaksi SIPLah</span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Total Penjualan Bruto</span>
                    <span className="text-2xl font-bold font-mono text-indigo-400 mt-1 block">
                        {formatRp(reportData.summary.total_revenue)}
                    </span>
                    <span className="text-[11px] text-emerald-400 mt-1 block">Omset Tercatat</span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Total HPP / Modal</span>
                    <span className="text-2xl font-bold font-mono text-rose-400 mt-1 block">
                        {formatRp(reportData.summary.total_cost)}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">Belanja Modal</span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Rata-rata per Pesanan</span>
                    <span className="text-2xl font-bold font-mono text-white mt-1 block">
                        {formatRp(reportData.summary.avg_order_value)}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">Nilai Transaksi Rata-rata</span>
                </div>
            </div>

            {/* Sales Table Card */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                    <div>
                        <h3 className="text-base font-bold text-white">Rincian Buku Penjualan</h3>
                        <p className="text-xs text-slate-400">Daftar transaksi pengadaan belanja dana BOS</p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <a
                            href={getExportUrl('excel')}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-slate-700 transition-all"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Export Excel</span>
                        </a>
                        <a
                            href={getExportUrl('pdf')}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-slate-700 transition-all"
                        >
                            <FileText className="w-3.5 h-3.5 text-rose-400" />
                            <span>Cetak PDF</span>
                        </a>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="pb-3 text-center">No</th>
                                <th className="pb-3">No Pesanan</th>
                                <th className="pb-3">Tanggal</th>
                                <th className="pb-3">Sekolah Pembeli</th>
                                <th className="pb-3">Rincian Barang</th>
                                <th className="pb-3 text-right">Nilai Bruto</th>
                                <th className="pb-3 text-right">Belanja Modal</th>
                                <th className="pb-3 text-right">Laba Kotor</th>
                                <th className="pb-3 text-center">Margin</th>
                                <th className="pb-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                            {reportData.orders.map((order, idx) => (
                                <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="py-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                                    <td className="py-3 font-mono font-semibold text-indigo-300">
                                        {order.siplah_order_id}
                                    </td>
                                    <td className="py-3 text-slate-300 font-mono">
                                        {order.order_date as string}
                                    </td>
                                    <td className="py-3 font-medium text-white max-w-[170px] truncate">
                                        {order.customer?.name}
                                    </td>
                                    <td className="py-3 text-slate-300 max-w-[200px] truncate">
                                        {order.items && order.items.length > 0
                                            ? order.items.map((it) => it.product_name).join(', ')
                                            : 'Pengadaan SIPLah'}
                                    </td>
                                    <td className="py-3 text-right font-mono font-bold text-white">
                                        {formatRp(order.total_bruto)}
                                    </td>
                                    <td className="py-3 text-right font-mono text-rose-400">
                                        {formatRp(order.total_cost)}
                                    </td>
                                    <td className="py-3 text-right font-mono font-semibold text-emerald-400">
                                        {formatRp(order.gross_profit)}
                                    </td>
                                    <td className="py-3 text-center font-mono text-slate-300">
                                        {order.margin_percentage}%
                                    </td>
                                    <td className="py-3 text-center">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${order.status === 'selesai'
                                                    ? 'bg-emerald-500/15 text-emerald-300'
                                                    : 'bg-amber-500/15 text-amber-300'
                                                }`}
                                        >
                                            {order.status === 'selesai' ? 'Cair' : 'Pending'}
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
