import React, { useState, useRef } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import {
    UploadCloud,
    FileSpreadsheet,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Download,
    ArrowRight,
    RefreshCw,
    Clock,
    FileCheck,
    Coins,
    Building,
    Check,
    Layers
} from 'lucide-react';
import { router } from '@inertiajs/react';
import axios from 'axios';

interface ImportLog {
    id: number;
    filename: string;
    file_type: string;
    total_rows: number;
    success_count: number;
    error_count: number;
    total_bruto: number;
    notes?: string;
    created_at: string;
    user?: { name: string };
}

interface PreviewRow {
    row_number: number;
    siplah_order_id: string;
    order_date: string;
    disbursement_date?: string;
    school_name: string;
    item_description: string;
    category: string;
    bruto: number;
    belanja_modal: number;
    pph22: number;
    ppn: number;
    admin_fee: number;
    va_fee: number;
    net_disbursement: number;
    gross_profit: number;
    margin_percentage: number;
    is_duplicate: boolean;
    is_valid: boolean;
    validation_message: string;
}

interface PreviewResult {
    total_rows: number;
    valid_count: number;
    duplicate_count: number;
    total_bruto: number;
    total_belanja_modal: number;
    rows: PreviewRow[];
}

interface ImportProps {
    importLogs: ImportLog[];
}

export default function Import({ importLogs }: ImportProps) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [commitLoading, setCommitLoading] = useState(false);
    const [previewData, setPreviewData] = useState<PreviewResult | null>(null);
    const [tempFile, setTempFile] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatRp = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handleFileSelect = async (file: File) => {
        setSelectedFile(file);
        setErrorMsg(null);
        setPreviewLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('/import/preview', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.success) {
                setPreviewData(res.data.data);
                setTempFile(res.data.temp_file);
            } else {
                setErrorMsg(res.data.message || 'Gagal memproses pratinjau file.');
            }
        } catch (err: any) {
            setErrorMsg(
                err.response?.data?.message || 'Format file tidak sesuai atau file rusak. Pastikan file berformat Excel (.xlsx, .xls) atau .csv.'
            );
            setPreviewData(null);
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleCommit = () => {
        if (!tempFile && !selectedFile) return;

        setCommitLoading(true);
        router.post(
            '/import/commit',
            { temp_file: tempFile },
            {
                onFinish: () => {
                    setCommitLoading(false);
                },
            }
        );
    };

    const handleReset = () => {
        setSelectedFile(null);
        setPreviewData(null);
        setTempFile(null);
        setErrorMsg(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <AppLayout
            title="Integrasi & Parser SIPLah"
            subtitle="Unggah otomatis file Excel dari SIPLah & 6 Sheet Rekap CV Tihani Mafaza"
        >
            {/* Value Proposition Banner */}
            <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/50 via-slate-900/60 to-slate-900/80 p-6 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
                            <FileCheck className="w-4 h-4" />
                            <span>Otomasi Akuntansi Pengadaan Sekolah</span>
                        </div>
                        <h3 className="text-xl font-bold text-white">
                            Transformasi Data Manual ke Pembukuan Otomatis
                        </h3>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                            Menggantikan proses input manual 6 lembar kerja Excel yang memakan waktu 4-6 jam menjadi kurang dari 30 detik. Sistem mengekstrak data pesanan, sekolah, belanja modal (HPP), serta menghitung otomatis potongan pajak PPh Pasal 22 (1.5%) dan PPN (11%).
                        </p>
                    </div>

                    <a
                        href="/import/template"
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-800/90 border border-slate-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 hover:border-slate-600 transition-all shrink-0 shadow-md"
                    >
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span>Unduh Format Template Excel</span>
                    </a>
                </div>
            </div>

            {/* Main Upload Dropzone (When not in preview mode) */}
            {!previewData && (
                <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-xl">
                    <div
                        onDragEnter={() => setDragActive(true)}
                        onDragLeave={() => setDragActive(false)}
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                            dragActive
                                ? 'border-indigo-500 bg-indigo-500/10'
                                : 'border-slate-700/80 bg-slate-950/40 hover:border-indigo-500/60 hover:bg-slate-900/40'
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    handleFileSelect(e.target.files[0]);
                                }
                            }}
                            className="hidden"
                        />

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-400 mb-4 border border-indigo-500/20">
                            {previewLoading ? (
                                <RefreshCw className="h-8 w-8 animate-spin text-indigo-400" />
                            ) : (
                                <UploadCloud className="h-8 w-8 text-indigo-400" />
                            )}
                        </div>

                        <h4 className="text-base font-bold text-white">
                            {previewLoading
                                ? 'Sedang Membaca & Memvalidasi File...'
                                : 'Pilih atau Tarik File Excel SIPLah ke Sini'}
                        </h4>
                        <p className="mt-1.5 text-xs text-slate-400 max-w-md mx-auto">
                            Mendukung file ekspor SIPLah resmi (.xlsx, .csv) atau format sheet "Belanja Modal" CV Tihani Mafaza.
                        </p>

                        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400 font-mono">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Auto-Detect Kolom
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Kalkulasi Pajak Otomatis
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Validasi Duplikasi
                            </span>
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-xs text-rose-300 flex items-center gap-3">
                            <XCircle className="w-5 h-5 shrink-0 text-rose-400" />
                            <span>{errorMsg}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Preview Section Once Parsed */}
            {previewData && (
                <div className="space-y-6">
                    {/* Metrics Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                            <span className="text-xs text-slate-400 uppercase tracking-wider block">Total Baris</span>
                            <span className="text-xl font-bold font-mono text-white mt-1 block">
                                {previewData.total_rows} Transaksi
                            </span>
                            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                                <Check className="w-3 h-3" /> {previewData.valid_count} Valid Siap Impor
                            </span>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                            <span className="text-xs text-slate-400 uppercase tracking-wider block">Estimasi Bruto</span>
                            <span className="text-xl font-bold font-mono text-indigo-400 mt-1 block">
                                {formatRp(previewData.total_bruto)}
                            </span>
                            <span className="text-[11px] text-slate-400 mt-1 block">Omset Pesanan</span>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                            <span className="text-xs text-slate-400 uppercase tracking-wider block">Belanja Modal (HPP)</span>
                            <span className="text-xl font-bold font-mono text-rose-400 mt-1 block">
                                {formatRp(previewData.total_belanja_modal)}
                            </span>
                            <span className="text-[11px] text-slate-400 mt-1 block">Modal Pengadaan</span>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                            <span className="text-xs text-slate-400 uppercase tracking-wider block">Estimasi Laba Kotor</span>
                            <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                                {formatRp(previewData.total_bruto - previewData.total_belanja_modal)}
                            </span>
                            <span className="text-[11px] text-slate-400 mt-1 block">Margin Bruto</span>
                        </div>
                    </div>

                    {/* Preview Table Card */}
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                                    <h4 className="text-base font-bold text-white">
                                        Pratinjau Hasil Pembacaan File Excel
                                    </h4>
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                                    File: {selectedFile?.name} &bull; {previewData.valid_count} dari {previewData.total_rows} baris siap dimasukkan ke buku besar
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleReset}
                                    disabled={commitLoading}
                                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
                                >
                                    Batal / Pilih File Lain
                                </button>
                                <button
                                    onClick={handleCommit}
                                    disabled={commitLoading || previewData.valid_count === 0}
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-500 hover:to-emerald-400 transition-all disabled:opacity-50"
                                >
                                    {commitLoading ? (
                                        <>
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            <span>Memproses ke Buku Kas...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Simpan & Proses ke Database ({previewData.valid_count})</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                                    <tr>
                                        <th className="pb-3 text-center">No</th>
                                        <th className="pb-3">No Pesanan SIPLah</th>
                                        <th className="pb-3">Tgl Pesan / Cair</th>
                                        <th className="pb-3">Sekolah</th>
                                        <th className="pb-3">Uraian Barang</th>
                                        <th className="pb-3 text-right">Bruto (Rp)</th>
                                        <th className="pb-3 text-right">Modal (Rp)</th>
                                        <th className="pb-3 text-right">PPh 22</th>
                                        <th className="pb-3 text-right">PPN</th>
                                        <th className="pb-3 text-right">Net Cair</th>
                                        <th className="pb-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 font-sans">
                                    {previewData.rows.map((row) => (
                                        <tr
                                            key={row.row_number}
                                            className={`hover:bg-slate-800/30 transition-colors ${
                                                !row.is_valid ? 'bg-rose-500/5' : ''
                                            }`}
                                        >
                                            <td className="py-3 text-center text-slate-400 font-mono">
                                                {row.row_number}
                                            </td>
                                            <td className="py-3 font-mono font-semibold text-indigo-300">
                                                {row.siplah_order_id}
                                            </td>
                                            <td className="py-3 text-slate-300">
                                                <span>{row.order_date}</span>
                                                {row.disbursement_date && (
                                                    <span className="block text-[10px] text-emerald-400">
                                                        Cair: {row.disbursement_date}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 font-medium text-white max-w-[160px] truncate">
                                                {row.school_name}
                                            </td>
                                            <td className="py-3 text-slate-300 max-w-[180px] truncate">
                                                {row.item_description}
                                                <span className="block text-[10px] text-indigo-400">
                                                    [{row.category}]
                                                </span>
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
                                            <td className="py-3 text-right font-mono font-bold text-emerald-400">
                                                {formatRp(row.net_disbursement)}
                                            </td>
                                            <td className="py-3 text-center">
                                                {row.is_duplicate ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                                        Perbarui
                                                    </span>
                                                ) : row.is_valid ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                                        Siap
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                                                        Error
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Import History Table */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h4 className="text-base font-bold text-white">Riwayat Impor File Terakhir</h4>
                        <p className="text-xs text-slate-400">Audit trail sinkronisasi file ke sistem pembukuan</p>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                        Total {importLogs.length} Berkas
                    </span>
                </div>

                {importLogs.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                        Belum ada riwayat impor file. Silakan unggah file SIPLah di atas.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="pb-3">Nama Berkas</th>
                                    <th className="pb-3">Tanggal Impor</th>
                                    <th className="pb-3">Diimpor Oleh</th>
                                    <th className="pb-3 text-center">Jumlah Baris</th>
                                    <th className="pb-3 text-right">Total Bruto Masuk</th>
                                    <th className="pb-3">Catatan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 font-sans">
                                {importLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 font-mono font-medium text-white flex items-center gap-2">
                                            <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span>{log.filename}</span>
                                        </td>
                                        <td className="py-3 text-slate-300 font-mono">
                                            {new Date(log.created_at).toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-3 text-slate-300">
                                            {log.user?.name || 'Staf Akuntansi'}
                                        </td>
                                        <td className="py-3 text-center font-mono">
                                            <span className="text-emerald-400 font-bold">{log.success_count}</span>
                                            <span className="text-slate-400"> / {log.total_rows}</span>
                                        </td>
                                        <td className="py-3 text-right font-mono font-semibold text-indigo-300">
                                            {formatRp(log.total_bruto)}
                                        </td>
                                        <td className="py-3 text-slate-400 text-[11px]">
                                            {log.notes || 'Berhasil'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
