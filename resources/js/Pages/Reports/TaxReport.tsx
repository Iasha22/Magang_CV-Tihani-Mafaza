import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Receipt,
    FileSpreadsheet,
    FileText,
    Filter,
    ShieldCheck,
    Coins,
    Calendar,
    Scale,
    Building2,
    CheckCircle2
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { Transaction } from '@/types';

interface MonthlyTax {
    month: string;
    month_name: string;
    total_orders: number;
    dpp: number;
    pph22: number;
    ppn: number;
    total_tax: number;
}

interface TaxReportProps {
    reportData: {
        summary: {
            total_dpp: number;
            total_pph22: number;
            total_ppn: number;
            total_taxes: number;
            transactions_count: number;
        };
        monthly: MonthlyTax[];
        transactions: (Transaction & {
            order?: {
                siplah_order_id: string;
                customer?: { name: string; npwp?: string };
            };
        })[];
    };
    filters: {
        start_date?: string;
        end_date?: string;
    };
}

export default function TaxReport({ reportData, filters }: TaxReportProps) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const formatRp = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/reports/tax', {
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        }, { preserveState: true });
    };

    const getExportUrl = (format: 'excel' | 'pdf') => {
        const params = new URLSearchParams({
            type: 'tax',
            start_date: startDate,
            end_date: endDate,
        });
        return `/reports/export/${format}?${params.toString()}`;
    };

    return (
        <AppLayout
            title="Laporan Perpajakan Terintegrasi SIPLah"
            subtitle="Rekapitulasi pemotongan PPh Pasal 22 (1.5%) dan PPN (11%) pengadaan dana BOS"
        >
            {/* Regulatory Tax Notice Banner */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3.5 backdrop-blur-xl">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                    <h4 className="font-bold text-white">Dasar Hukum Pemungutan Pajak SIPLah (PMK No. 58 / PMK No. 59)</h4>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">
                        Atas transaksi pengadaan barang melalui SIPLah dengan dana BOS/APBN di atas Rp 2.000.000, pemungutan PPh Pasal 22 (1.5%) dan PPN (11%) dilakukan langsung oleh sistem marketplace SIPLah sebagai pihak pemungut resmi rekanan belanja pemerintah. CV Tihani Mafaza mencatat nilai potongan sebagai kredit pajak / bukti potong resmi.
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-xl">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
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

            {/* Tax KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Dasar Pengenaan Pajak (DPP)</span>
                    <span className="text-2xl font-bold font-mono text-white mt-1 block">
                        {formatRp(reportData.summary.total_dpp)}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">Total Bruto Kena Pajak</span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">PPh Pasal 22 (1.5%)</span>
                    <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
                        {formatRp(reportData.summary.total_pph22)}
                    </span>
                    <span className="text-[11px] text-amber-300 mt-1 block">Dipotong Pihak Ketiga</span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">PPN (11%)</span>
                    <span className="text-2xl font-bold font-mono text-sky-400 mt-1 block">
                        {formatRp(reportData.summary.total_ppn)}
                    </span>
                    <span className="text-[11px] text-sky-300 mt-1 block">Dipungut SIPLah</span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Total Pajak Terpotong</span>
                    <span className="text-2xl font-bold font-mono text-indigo-400 mt-1 block">
                        {formatRp(reportData.summary.total_taxes)}
                    </span>
                    <span className="text-[11px] text-emerald-400 mt-1 block">Rekapitulasi Pajak CV</span>
                </div>
            </div>

            {/* Monthly Tax Breakdown */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                        <h3 className="text-base font-bold text-white">Rekapitulasi Pajak Bulanan</h3>
                        <p className="text-xs text-slate-400">Ringkasan masa pajak untuk pelaporan SPT Masa / Tahunan</p>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {reportData.monthly.map((m) => (
                        <div
                            key={m.month}
                            className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white uppercase">{m.month_name}</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400">
                                    {m.total_orders} Transaksi
                                </span>
                            </div>

                            <div className="space-y-1 text-xs pt-1">
                                <div className="flex justify-between text-slate-400">
                                    <span>DPP Bruto:</span>
                                    <span className="font-mono text-white font-medium">{formatRp(m.dpp)}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>PPh 22 (1.5%):</span>
                                    <span className="font-mono text-amber-400">{formatRp(m.pph22)}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>PPN (11%):</span>
                                    <span className="font-mono text-sky-400">{formatRp(m.ppn)}</span>
                                </div>
                                <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800 font-bold">
                                    <span>Total Pajak:</span>
                                    <span className="font-mono text-indigo-400">{formatRp(m.total_tax)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Itemized Transactions Tax Table */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-base font-bold text-white">Daftar Pemotongan Pajak per Transaksi</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="pb-3">No Pesanan</th>
                                <th className="pb-3">Tanggal</th>
                                <th className="pb-3">Sekolah Pemungut</th>
                                <th className="pb-3">NPWP Sekolah</th>
                                <th className="pb-3 text-right">DPP Bruto (Rp)</th>
                                <th className="pb-3 text-right">PPh 22 (1.5%)</th>
                                <th className="pb-3 text-right">PPN (11%)</th>
                                <th className="pb-3 text-right">Total Pajak</th>
                                <th className="pb-3 text-center">Status Pungut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                            {reportData.transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="py-3 font-mono font-semibold text-indigo-300">
                                        {tx.order?.siplah_order_id}
                                    </td>
                                    <td className="py-3 text-slate-300 font-mono">
                                        {tx.transaction_date as string}
                                    </td>
                                    <td className="py-3 font-medium text-white max-w-[170px] truncate">
                                        {tx.order?.customer?.name}
                                    </td>
                                    <td className="py-3 text-slate-400 font-mono text-[11px]">
                                        {tx.order?.customer?.npwp || '00.000.000.0-000.000'}
                                    </td>
                                    <td className="py-3 text-right font-mono font-semibold text-white">
                                        {formatRp(tx.bruto)}
                                    </td>
                                    <td className="py-3 text-right font-mono text-amber-400">
                                        {formatRp(tx.tax_pph22)}
                                    </td>
                                    <td className="py-3 text-right font-mono text-sky-400">
                                        {formatRp(tx.tax_ppn)}
                                    </td>
                                    <td className="py-3 text-right font-mono font-bold text-white">
                                        {formatRp(Number(tx.tax_pph22) + Number(tx.tax_ppn))}
                                    </td>
                                    <td className="py-3 text-center">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                            Dipungut SIPLah
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
