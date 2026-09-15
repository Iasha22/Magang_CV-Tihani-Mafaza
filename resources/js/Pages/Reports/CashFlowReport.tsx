import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Wallet,
    FileSpreadsheet,
    FileText,
    Filter,
    ArrowDownRight,
    ArrowUpRight,
    Coins,
    CheckCircle2,
    Clock,
    Scale
} from 'lucide-react';
import { router } from '@inertiajs/react';

interface CashFlowRow {
    order_id: number;
    siplah_order_id: string;
    order_date: string;
    disbursement_date?: string;
    school_name: string;
    bruto: number;
    belanja_modal: number;
    pph22: number;
    ppn: number;
    fees: number;
    net_expected: number;
    actual_cair: number;
    is_cair: boolean;
}

interface CashFlowReportProps {
    reportData: {
        summary: {
            total_disbursed: number;
            total_pending_receivable: number;
            total_belanja_modal: number;
            net_cash_flow: number;
            total_pph22: number;
            total_ppn: number;
            total_fees: number;
        };
        rows: CashFlowRow[];
    };
    filters: {
        start_date?: string;
        end_date?: string;
    };
}

export default function CashFlowReport({ reportData, filters }: CashFlowReportProps) {
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
        router.get('/reports/cash-flow', {
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        }, { preserveState: true });
    };

    const getExportUrl = (format: 'excel' | 'pdf') => {
        const params = new URLSearchParams({
            type: 'cash_flow',
            start_date: startDate,
            end_date: endDate,
        });
        return `/reports/export/${format}?${params.toString()}`;
    };

    return (
        <AppLayout
            title="Laporan Arus Kas & Serah Terima Dana"
            subtitle="Pelacakan pencairan kas dana BOS dari rekening SIPLah ke rekening CV Tihani Mafaza"
        >
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

            {/* Summary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Kas Masuk Cair</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                        {formatRp(reportData.summary.total_disbursed)}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">Realisasi Rekening BJB</span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Pengeluaran Belanja Modal</span>
                    <span className="text-2xl font-bold font-mono text-rose-400 mt-1 block">
                        {formatRp(reportData.summary.total_belanja_modal)}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">Kas Keluar Pengadaan</span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Posisi Arus Kas Bersih</span>
                    <span className="text-2xl font-bold font-mono text-indigo-400 mt-1 block">
                        {formatRp(reportData.summary.net_cash_flow)}
                    </span>
                    <span className="text-[11px] text-emerald-400 mt-1 block">Kas Masuk - Modal</span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Piutang Dana BOS Tertunda</span>
                    <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
                        {formatRp(reportData.summary.total_pending_receivable)}
                    </span>
                    <span className="text-[11px] text-amber-300 mt-1 block">Menunggu Pencairan</span>
                </div>
            </div>

            {/* Deductions Breakdown Banner */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                <span className="text-slate-400">Total Potongan Selama Periode:</span>
                <div className="flex items-center gap-6">
                    <div>
                        <span className="text-slate-400 block text-[10px]">PPh 22 (1.5%):</span>
                        <span className="font-mono font-bold text-amber-400">
                            {formatRp(reportData.summary.total_pph22)}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-400 block text-[10px]">PPN (11%):</span>
                        <span className="font-mono font-bold text-sky-400">
                            {formatRp(reportData.summary.total_ppn)}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-400 block text-[10px]">Fee Admin & VA SIPLah:</span>
                        <span className="font-mono font-bold text-slate-300">
                            {formatRp(reportData.summary.total_fees)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Cash Flow Detailed Table */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                    <div>
                        <h3 className="text-base font-bold text-white">Buku Serah Terima & Mutasi Kas Masuk</h3>
                        <p className="text-xs text-slate-400">Pencocokan nilai bruto, potongan biaya/pajak, dan dana bersih</p>
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

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="pb-3">No Pesanan</th>
                                <th className="pb-3">Tgl Pesan / Cair</th>
                                <th className="pb-3">Sekolah</th>
                                <th className="pb-3 text-right">Nilai Bruto</th>
                                <th className="pb-3 text-right">Belanja Modal</th>
                                <th className="pb-3 text-right">PPh 22</th>
                                <th className="pb-3 text-right">PPN</th>
                                <th className="pb-3 text-right">Biaya Admin/VA</th>
                                <th className="pb-3 text-right">Net Cair Diterima</th>
                                <th className="pb-3 text-center">Status Kas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                            {reportData.rows.map((row) => (
                                <tr key={row.order_id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="py-3 font-mono font-semibold text-indigo-300">
                                        {row.siplah_order_id}
                                    </td>
                                    <td className="py-3 text-slate-300 font-mono">
                                        <span>{row.order_date}</span>
                                        {row.disbursement_date && (
                                            <span className="block text-[10px] text-emerald-400">
                                                Cair: {row.disbursement_date}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 font-medium text-white max-w-[170px] truncate">
                                        {row.school_name}
                                    </td>
                                    <td className="py-3 text-right font-mono font-semibold text-white">
                                        {formatRp(row.bruto)}
                                    </td>
                                    <td className="py-3 text-right font-mono text-rose-400">
                                        {formatRp(row.belanja_modal)}
                                    </td>
                                    <td className="py-3 text-right font-mono text-amber-400 text-[11px]">
                                        {formatRp(row.pph22)}
                                    </td>
                                    <td className="py-3 text-right font-mono text-sky-400 text-[11px]">
                                        {formatRp(row.ppn)}
                                    </td>
                                    <td className="py-3 text-right font-mono text-slate-300 text-[11px]">
                                        {formatRp(row.fees)}
                                    </td>
                                    <td className="py-3 text-right font-mono font-bold text-emerald-400">
                                        {formatRp(row.is_cair ? row.actual_cair : row.net_expected)}
                                    </td>
                                    <td className="py-3 text-center">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${row.is_cair
                                                    ? 'bg-emerald-500/15 text-emerald-300'
                                                    : 'bg-amber-500/15 text-amber-300'
                                                }`}
                                        >
                                            {row.is_cair ? 'Cair (BJB)' : 'Piutang'}
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
