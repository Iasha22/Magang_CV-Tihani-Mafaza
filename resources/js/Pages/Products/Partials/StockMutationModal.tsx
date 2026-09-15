import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Product } from '@/types';
import { router } from '@inertiajs/react';

interface StockMutationModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

export default function StockMutationModal({ isOpen, onClose, product }: StockMutationModalProps) {
    if (!isOpen || !product) return null;

    const [type, setType] = useState<'incoming' | 'outgoing' | 'adjustment'>('incoming');
    const [quantity, setQuantity] = useState<number>(1);
    const [referenceType, setReferenceType] = useState<string>('supplier_purchase');
    const [referenceNumber, setReferenceNumber] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const currentStock = product.current_stock ?? 0;

    // Calculate preview balance
    let newBalance = currentStock;
    if (type === 'incoming') {
        newBalance = currentStock + (Number(quantity) || 0);
    } else if (type === 'outgoing') {
        newBalance = currentStock - (Number(quantity) || 0);
    } else if (type === 'adjustment') {
        newBalance = Number(quantity) || 0;
    }

    const isInvalidOutgoing = type === 'outgoing' && (Number(quantity) || 0) > currentStock;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (isInvalidOutgoing) {
            setErrorMessage(`Pengeluaran melebihi stok yang tersedia (${currentStock} ${product.unit}).`);
            return;
        }

        if (type === 'adjustment' && (Number(quantity) || 0) < 0) {
            setErrorMessage('Stok penyesuaian tidak boleh bernilai negatif.');
            return;
        }

        setIsSubmitting(true);

        router.post(`/products/${product.id}/stock`, {
            type,
            quantity: Number(quantity) || 0,
            reference_type: referenceType,
            reference_number: referenceNumber,
            notes,
        }, {
            onSuccess: () => {
                setIsSubmitting(false);
                onClose();
            },
            onError: (errs) => {
                setIsSubmitting(false);
                setErrorMessage(Object.values(errs)[0] as string || 'Gagal menyimpan mutasi stok.');
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span>Catat Mutasi Stok</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Pencatatan kartu stok: barang masuk, keluar, atau rekonsiliasi opname
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Target Product Badge */}
                <div className="px-6 py-3.5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {product.sku || 'SKU'}
                        </span>
                        <h4 className="text-sm font-semibold text-white mt-1">{product.name}</h4>
                    </div>
                    <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">Saldo Saat Ini</span>
                        <span className="text-base font-bold text-emerald-400 font-mono">
                            {currentStock} <span className="text-xs font-normal text-slate-400">{product.unit}</span>
                        </span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errorMessage && (
                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* Mutation Type Selector */}
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                            Jenis Mutasi Stok <span className="text-rose-400">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setType('incoming');
                                    setReferenceType('supplier_purchase');
                                }}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition ${
                                    type === 'incoming'
                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 shadow-sm'
                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <ArrowDownRight className="w-5 h-5 mb-1 text-emerald-400" />
                                <span>Stok Masuk (+)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setType('outgoing');
                                    setReferenceType('siplah_order');
                                }}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition ${
                                    type === 'outgoing'
                                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-200 shadow-sm'
                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <ArrowUpRight className="w-5 h-5 mb-1 text-rose-400" />
                                <span>Stok Keluar (-)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setType('adjustment');
                                    setReferenceType('stock_opname');
                                }}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition ${
                                    type === 'adjustment'
                                        ? 'bg-sky-500/20 border-sky-500/50 text-sky-200 shadow-sm'
                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <RefreshCw className="w-5 h-5 mb-1 text-sky-400" />
                                <span>Penyesuaian</span>
                            </button>
                        </div>
                    </div>

                    {/* Quantity & Reference */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                {type === 'adjustment' ? 'Stok Fisik Baru (Opname)' : 'Jumlah Unit'} <span className="text-rose-400">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min={type === 'adjustment' ? '0' : '1'}
                                    required
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
                                />
                                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400">
                                    {product.unit}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                Kategori Acuan Dokumen <span className="text-rose-400">*</span>
                            </label>
                            <select
                                value={referenceType}
                                onChange={(e) => setReferenceType(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                            >
                                {type === 'incoming' && (
                                    <>
                                        <option value="supplier_purchase">Penerimaan dari Supplier (PO)</option>
                                        <option value="customer_return">Retur dari Sekolah</option>
                                        <option value="initial_stock">Saldo Awal / Tambahan Modal</option>
                                    </>
                                )}
                                {type === 'outgoing' && (
                                    <>
                                        <option value="siplah_order">Pengiriman Pesanan SIPLah</option>
                                        <option value="damaged">Barang Rusak / Cacat</option>
                                        <option value="sample_promo">Sampel Uji / Display Sekolah</option>
                                    </>
                                )}
                                {type === 'adjustment' && (
                                    <>
                                        <option value="stock_opname">Stock Opname Bulanan</option>
                                        <option value="audit_correction">Koreksi Selisih Audit</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    {/* Reference Number */}
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                            Nomor Dokumen / Surat Jalan / No. Faktur
                        </label>
                        <input
                            type="text"
                            placeholder="Contoh: SJ-2026/09/120 atau SPL-2026-BOS1234"
                            value={referenceNumber}
                            onChange={(e) => setReferenceNumber(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                            Catatan / Keterangan Tambahan
                        </label>
                        <textarea
                            rows={2}
                            placeholder="Contoh: Diterima oleh staf logistik dalam kondisi kardus bersegel..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                        />
                    </div>

                    {/* Balance Preview Card */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                            <span className="text-slate-400 block">Kalkulasi Saldo Akhir:</span>
                            <span className="font-semibold text-slate-300">
                                {currentStock} {product.unit} {type === 'incoming' ? `+ ${quantity}` : type === 'outgoing' ? `- ${quantity}` : `-> ${quantity}`}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-slate-400 block">Saldo Setelah Mutasi:</span>
                            <span className={`text-sm font-bold font-mono ${
                                isInvalidOutgoing ? 'text-rose-400' : 'text-emerald-400'
                            }`}>
                                {newBalance} {product.unit}
                            </span>
                        </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm rounded-xl font-medium text-slate-300 hover:bg-slate-800 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || isInvalidOutgoing}
                            className="px-6 py-2.5 text-sm rounded-xl font-medium bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Konfirmasi Mutasi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
