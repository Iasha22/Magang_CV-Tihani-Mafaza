import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Scale,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Filter,
    ArrowRight,
    Edit3,
    X,
    FileSpreadsheet,
    HelpCircle
} from 'lucide-react';
import { router } from '@inertiajs/react';

interface ReconRecord {
    id: number;
    siplah_order_id: string;
    order_date: string;
    disbursement_date?: string;
    school_name: string;
    bruto: number;
    tax_pph22: number;
    tax_ppn: number;
    fees: number;
    expected_net: number;
    actual_disbursement: number;
    difference: number;
    status: 'matched' | 'discrepancy' | 'pending';
}

interface ReconciliationProps {
    reconciliationData: {
        summary: {
            total_records: number;
            matched: number;
            discrepancy: number;
            pending: number;
        };
        records: ReconRecord[];
    };
    filters: {
        start_date?: string;
        end_date?: string;
    };
}

export default function Reconciliation({ reconciliationData, filters }: ReconciliationProps) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    // Modal state for resolving discrepancy
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<ReconRecord | null>(null);
    const [actualAmount, setActualAmount] = useState<number>(0);
    const [disbDate, setDisbDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    const formatRp = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/reconciliation', {
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        }, { preserveState: true });
    };

    const handleOpenModal = (rec: ReconRecord) => {
        setSelectedRecord(rec);
        setActualAmount(rec.actual_disbursement || rec.expected_net);
        setDisbDate(rec.disbursement_date || new Date().toISOString().split('T')[0]);
        setNotes('');
        setModalOpen(true);
    };

    const handleResolve = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRecord) return;

        setSubmitting(true);
        router.post(
            '/reconciliation/resolve',
            {
                order_id: selectedRecord.id,
                actual_amount: actualAmount,
                disbursement_date: disbDate,
                notes: notes,
            },
            {
                onSuccess: () => setModalOpen(false),
                onFinish: () => setSubmitting(false),
            }
        );
    };

    return (
        <AppLayout
            title="Modul Rekonsiliasi Finansial SIPLah"
            subtitle="Pencocokan invoice tagihan SIPLah vs mutasi realisasi pencairan rekening bank"
        >
            {/* Status Summary KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Total Transaksi</span>
                    <span className="text-2xl font-bold font-mono text-white mt-1 block">
                        {reconciliationData.summary.total_records}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">Pesanan Terdaftar</span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Cocok (Matched)</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                        {reconciliationData.summary.matched}
                    </span>
                    <span className="text-[11px] text-emerald-300 mt-1 block">Dana Sesuai 100%</span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Selisih (Discrepancy)</span>
                    <span className="text-2xl font-bold font-mono text-rose-400 mt-1 block">
                        {reconciliationData.summary.discrepancy}
                    </span>
                    <span className="text-[11px] text-rose-300 mt-1 block">Perlu Penyesuaian</span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Menunggu Cair</span>
                    <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
                        {reconciliationData.summary.pending}
                    </span>
                    <span className="text-[11px] text-amber-300 mt-1 block">Piutang Berjalan</span>
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

            {/* Reconciliation Table Card */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                        <h3 className="text-base font-bold text-white">Lembar Kerja Rekonsiliasi</h3>
                        <p className="text-xs text-slate-400">
                            Membandingkan Nilai Bruto - Potongan Pajak & Biaya terhadap Dana Cair di Bank
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="pb-3">No Pesanan</th>
                                <th className="pb-3">Tanggal</th>
                                <th className="pb-3">Sekolah</th>
                                <th className="pb-3 text-right">Nilai Bruto</th>
                                <th className="pb-3 text-right">Potongan (Pajak+Fee)</th>
                                <th className="pb-3 text-right">Target Net Cair</th>
                                <th className="pb-3 text-right">Realisasi Bank</th>
                                <th className="pb-3 text-right">Selisih (Rp)</th>
                                <th className="pb-3 text-center">Status</th>
                                <th className="pb-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                            {reconciliationData.records.map((rec) => (
                                <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="py-3 font-mono font-semibold text-indigo-300">
                                        {rec.siplah_order_id}
                                    </td>
                                    <td className="py-3 text-slate-300 font-mono">
                                        {rec.order_date}
                                    </td>
                                    <td className="py-3 font-medium text-white max-w-[170px] truncate">
                                        {rec.school_name}
                                    </td>
                                    <td className="py-3 text-right font-mono font-semibold text-white">
                                        {formatRp(rec.bruto)}
                                    </td>
                                    <td className="py-3 text-right font-mono text-amber-400">
                                        {formatRp(rec.tax_pph22 + rec.tax_ppn + rec.fees)}
                                    </td>
                                    <td className="py-3 text-right font-mono font-bold text-sky-400">
                                        {formatRp(rec.expected_net)}
                                    </td>
                                    <td className="py-3 text-right font-mono font-bold text-emerald-400">
                                        {rec.actual_disbursement > 0 ? formatRp(rec.actual_disbursement) : '-'}
                                    </td>
                                    <td className={`py-3 text-right font-mono font-bold ${
                                        rec.status === 'discrepancy'
                                            ? 'text-rose-400'
                                            : rec.status === 'matched'
                                            ? 'text-emerald-400'
                                            : 'text-slate-400'
                                    }`}>
                                        {rec.actual_disbursement > 0 ? formatRp(rec.difference) : '-'}
                                    </td>
                                    <td className="py-3 text-center">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                                rec.status === 'matched'
                                                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                                    : rec.status === 'discrepancy'
                                                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                            }`}
                                        >
                                            {rec.status === 'matched'
                                                ? 'Cocok'
                                                : rec.status === 'discrepancy'
                                                ? 'Selisih'
                                                : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="py-3 text-center">
                                        <button
                                            onClick={() => handleOpenModal(rec)}
                                            className="inline-flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 text-[11px] font-semibold border border-slate-700 transition-all"
                                        >
                                            <Edit3 className="w-3 h-3" />
                                            <span>Rekonsiliasi</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reconciliation Adjustment Modal */}
            {modalOpen && selectedRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <h4 className="text-base font-bold text-white">
                                Penyesuaian Rekonsiliasi Bank
                            </h4>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                            <div className="flex justify-between text-slate-400">
                                <span>No Pesanan:</span>
                                <span className="font-mono text-indigo-300 font-bold">
                                    {selectedRecord.siplah_order_id}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Sekolah:</span>
                                <span className="text-white font-medium">{selectedRecord.school_name}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Target Bersih (Invoice):</span>
                                <span className="font-mono text-sky-400 font-semibold">
                                    {formatRp(selectedRecord.expected_net)}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleResolve} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-300 mb-1.5 font-medium">Realisasi Dana Masuk Rekening (Rp) *</label>
                                <input
                                    type="number"
                                    value={actualAmount}
                                    onChange={(e) => setActualAmount(Number(e.target.value))}
                                    required
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-white focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-300 mb-1.5 font-medium">Tanggal Masuk Rekening *</label>
                                <input
                                    type="date"
                                    value={disbDate}
                                    onChange={(e) => setDisbDate(e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-300 mb-1.5 font-medium">Catatan / Keterangan Penyesuaian</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    placeholder="Contoh: Terdapat potongan selisih biaya transfer bank BJB Rp 2.500"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-slate-300 hover:bg-slate-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
                                >
                                    {submitting ? 'Menyimpan...' : 'Simpan Rekonsiliasi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
