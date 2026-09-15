import React, { useState, useEffect } from 'react';
import {
    X,
    Package,
    History,
    FileText,
    ShieldAlert,
    ArrowDownRight,
    ArrowUpRight,
    RefreshCw,
    User as UserIcon,
    Clock,
    Upload,
    Trash2,
    CheckCircle2,
    Calendar,
    Tag,
    DollarSign,
    Layers,
    Image as ImageIcon
} from 'lucide-react';
import { Product, ProductImage, StockMutation, AuditTrail } from '@/types';
import { router } from '@inertiajs/react';

interface ProductDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onOpenStockMutation: (product: Product) => void;
    onOpenEdit: (product: Product) => void;
}

export default function ProductDetailModal({
    isOpen,
    onClose,
    product,
    onOpenStockMutation,
    onOpenEdit,
}: ProductDetailModalProps) {
    if (!isOpen || !product) return null;

    const [activeTab, setActiveTab] = useState<'overview' | 'stock' | 'audit'>('overview');
    const [fullDetail, setFullDetail] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);

    const fetchProductDetails = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/products/${product.id}`, {
                headers: {
                    Accept: 'application/json',
                },
            });
            if (res.ok) {
                const data = await res.json();
                setFullDetail(data.product);
            }
        } catch (e) {
            console.error('Failed to fetch full product details', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && product) {
            fetchProductDetails();
            setActiveTab('overview');
            setSelectedImage(product.primary_image_url || null);
        }
    }, [isOpen, product]);

    const formatRp = (val?: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(dateString));
    };

    const handleUploadMoreImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setIsUploadingPhoto(true);
        const formData = new FormData();
        Array.from(e.target.files).forEach((file) => {
            formData.append('images[]', file);
        });

        router.post(`/products/${product.id}/images`, formData, {
            onSuccess: () => {
                setIsUploadingPhoto(false);
                fetchProductDetails();
            },
            onError: () => {
                setIsUploadingPhoto(false);
            },
        });
    };

    const handleDeleteImage = (imgId: number) => {
        if (!confirm('Hapus foto ini dari galeri produk?')) return;

        router.delete(`/products/images/${imgId}`, {
            onSuccess: () => {
                fetchProductDetails();
            },
        });
    };

    const displayProduct = fullDetail || product;
    const images = displayProduct.images || [];
    const mutations = displayProduct.stock_mutations || [];
    const audits = displayProduct.audit_trails || [];

    const isOutOfStock = displayProduct.stock_status === 'out_of_stock';
    const isLowStock = displayProduct.stock_status === 'low_stock';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
            <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            <Package className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    {displayProduct.sku || 'SKU'}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                    {displayProduct.category}
                                </span>
                                {isOutOfStock ? (
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                        Habis (0 {displayProduct.unit})
                                    </span>
                                ) : isLowStock ? (
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        Menipis ({displayProduct.current_stock} {displayProduct.unit})
                                    </span>
                                ) : (
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                        Tersedia ({displayProduct.current_stock} {displayProduct.unit})
                                    </span>
                                )}
                            </div>
                            <h3 className="text-base font-bold text-white truncate mt-1">
                                {displayProduct.name}
                            </h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onOpenStockMutation(displayProduct)}
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition"
                        >
                            <ArrowDownRight className="w-4 h-4" />
                            <span>Mutasi Stok</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-slate-800 bg-slate-950/40 px-6">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
                            activeTab === 'overview'
                                ? 'border-indigo-500 text-indigo-400'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span>Ringkasan & Galeri Foto</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('stock')}
                        className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
                            activeTab === 'stock'
                                ? 'border-indigo-500 text-indigo-400'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <History className="w-4 h-4" />
                        <span>Kartu Stok ({mutations.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('audit')}
                        className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
                            activeTab === 'audit'
                                ? 'border-indigo-500 text-indigo-400'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Audit Trail Log ({audits.length})</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                    {/* TAB 1: OVERVIEW & PHOTOS */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* KPI Highlights */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                                    <span className="text-[11px] font-medium text-slate-400 block">Harga Beli (HPP)</span>
                                    <span className="text-sm sm:text-base font-bold text-slate-200 mt-1 block">
                                        {formatRp(displayProduct.reference_cost)}
                                    </span>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                                    <span className="text-[11px] font-medium text-slate-400 block">Harga Jual SIPLah</span>
                                    <span className="text-sm sm:text-base font-bold text-indigo-400 mt-1 block">
                                        {formatRp(displayProduct.reference_price)}
                                    </span>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                                    <span className="text-[11px] font-medium text-slate-400 block">Margin Kotor / Unit</span>
                                    <span className="text-sm sm:text-base font-bold text-emerald-400 mt-1 block">
                                        {formatRp(displayProduct.margin_amount)}
                                        <span className="text-xs font-normal text-slate-400 ml-1.5">
                                            ({displayProduct.margin_percentage}%)
                                        </span>
                                    </span>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                                    <span className="text-[11px] font-medium text-slate-400 block">Saldo Stok Fisik</span>
                                    <span className="text-sm sm:text-base font-bold text-white mt-1 block font-mono">
                                        {displayProduct.current_stock} <span className="text-xs font-normal text-slate-400">{displayProduct.unit}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Main Body Grid: Photo on Left, Details on Right */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                {/* Photo & Gallery Area */}
                                <div className="md:col-span-5 space-y-3">
                                    <div className="relative aspect-video sm:aspect-square w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                                        {selectedImage ? (
                                            <img
                                                src={selectedImage}
                                                alt={displayProduct.name}
                                                className="w-full h-full object-contain p-2"
                                            />
                                        ) : (
                                            <div className="text-center p-4">
                                                <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                                                <p className="text-xs text-slate-400">Belum ada foto produk</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Thumbnail gallery */}
                                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                        {images.map((img) => (
                                            <div
                                                key={img.id}
                                                onClick={() => setSelectedImage(img.url)}
                                                className={`group relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border cursor-pointer transition ${
                                                    selectedImage === img.url
                                                        ? 'border-indigo-500 ring-2 ring-indigo-500/40'
                                                        : 'border-slate-800 hover:border-slate-700'
                                                }`}
                                            >
                                                <img src={img.url} alt="Thumb" className="h-full w-full object-cover" />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteImage(img.id);
                                                    }}
                                                    title="Hapus foto"
                                                    className="absolute top-0.5 right-0.5 p-0.5 rounded bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Add Photo Button */}
                                        <label className="h-14 w-14 shrink-0 rounded-lg border-2 border-dashed border-slate-700 hover:border-indigo-500 flex flex-col items-center justify-center cursor-pointer transition text-slate-400 hover:text-indigo-400">
                                            <Upload className="w-4 h-4" />
                                            <span className="text-[9px] mt-0.5 font-medium">Tambah</span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                disabled={isUploadingPhoto}
                                                onChange={handleUploadMoreImages}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Product Specifications */}
                                <div className="md:col-span-7 space-y-4">
                                    <div>
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                            Deskripsi & Spesifikasi
                                        </h4>
                                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                                            {displayProduct.description || 'Belum ada deskripsi spesifikasi untuk produk ini.'}
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2.5 text-xs">
                                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                                            <span className="text-slate-400">Kategori Katalog</span>
                                            <span className="font-semibold text-slate-200">{displayProduct.category}</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                                            <span className="text-slate-400">Satuan Pembelian</span>
                                            <span className="font-semibold text-slate-200">{displayProduct.unit}</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                                            <span className="text-slate-400">Batas Stok Minimum Alert</span>
                                            <span className="font-semibold text-amber-400">{displayProduct.min_stock} {displayProduct.unit}</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                                            <span className="text-slate-400">Total Nilai Persediaan (HPP)</span>
                                            <span className="font-semibold text-emerald-400">
                                                {formatRp(displayProduct.current_stock * displayProduct.reference_cost)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-1">
                                            <span className="text-slate-400">Tanggal Didaftarkan</span>
                                            <span className="font-semibold text-slate-300">{formatDate(displayProduct.created_at)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-2">
                                        <button
                                            onClick={() => onOpenEdit(displayProduct)}
                                            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                                        >
                                            Edit Data Master & Harga
                                        </button>
                                        <button
                                            onClick={() => onOpenStockMutation(displayProduct)}
                                            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition"
                                        >
                                            Tambah / Kurang Stok
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: KARTU STOK (MUTATION LEDGER) */}
                    {activeTab === 'stock' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-white">Buku Pembantu Kartu Stok (Stock Ledger)</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Rekam jejak setiap pergerakan barang masuk (incoming), keluar (outgoing), dan penyesuaian fisik
                                    </p>
                                </div>
                                <button
                                    onClick={() => onOpenStockMutation(displayProduct)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition"
                                >
                                    <ArrowDownRight className="w-4 h-4" />
                                    <span>Catat Mutasi Baru</span>
                                </button>
                            </div>

                            {mutations.length === 0 ? (
                                <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-slate-400 text-xs">
                                    Belum ada riwayat mutasi stok untuk produk ini.
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                                            <tr>
                                                <th className="py-3 px-4">Waktu</th>
                                                <th className="py-3 px-3">Jenis Mutasi</th>
                                                <th className="py-3 px-3 text-right">Qty</th>
                                                <th className="py-3 px-3 text-right">Saldo Akhir</th>
                                                <th className="py-3 px-4">No. Ref & Catatan</th>
                                                <th className="py-3 px-3">Petugas</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60">
                                            {mutations.map((m) => {
                                                const isIncoming = m.type === 'incoming';
                                                const isOutgoing = m.type === 'outgoing';
                                                return (
                                                    <tr key={m.id} className="hover:bg-slate-900/40 transition">
                                                        <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">
                                                            {formatDate(m.created_at)}
                                                        </td>
                                                        <td className="py-3 px-3 whitespace-nowrap">
                                                            {isIncoming && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/20">
                                                                    <ArrowDownRight className="w-3 h-3 text-emerald-400" />
                                                                    <span>Masuk</span>
                                                                </span>
                                                            )}
                                                            {isOutgoing && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 font-medium border border-rose-500/20">
                                                                    <ArrowUpRight className="w-3 h-3 text-rose-400" />
                                                                    <span>Keluar</span>
                                                                </span>
                                                            )}
                                                            {!isIncoming && !isOutgoing && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300 font-medium border border-sky-500/20">
                                                                    <RefreshCw className="w-3 h-3 text-sky-400" />
                                                                    <span>Penyesuaian</span>
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-3 text-right font-mono font-bold whitespace-nowrap">
                                                            <span className={isIncoming ? 'text-emerald-400' : isOutgoing ? 'text-rose-400' : 'text-sky-400'}>
                                                                {isIncoming ? `+${m.quantity}` : isOutgoing ? `-${m.quantity}` : m.quantity} {displayProduct.unit}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-3 text-right font-mono font-bold text-white whitespace-nowrap">
                                                            {m.balance_after} {displayProduct.unit}
                                                        </td>
                                                        <td className="py-3 px-4 max-w-xs">
                                                            {m.reference_number && (
                                                                <span className="font-mono font-medium text-indigo-300 block">
                                                                    {m.reference_number}
                                                                </span>
                                                            )}
                                                            <span className="text-slate-400 truncate block">
                                                                {m.notes || '-'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                                                            {m.user?.name || 'Staf Logistik'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: AUDIT TRAIL LOG */}
                    {activeTab === 'audit' && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-bold text-white">Log Audit Trail Aktivitas Produk</h4>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Catatan otentik transparansi kepatuhan: siapa yang membuat/mengubah, kapan, dan perbandingan perubahan nilai
                                </p>
                            </div>

                            {audits.length === 0 ? (
                                <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-slate-400 text-xs">
                                    Belum ada log audit trail untuk produk ini.
                                </div>
                            ) : (
                                <div className="relative pl-6 border-l border-slate-800 space-y-6">
                                    {audits.map((a) => (
                                        <div key={a.id} className="relative group">
                                            {/* Dot indicator */}
                                            <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-slate-900 bg-indigo-500 group-hover:scale-125 transition" />

                                            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition space-y-2">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-white px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                                            {a.formatted_event || a.event}
                                                        </span>
                                                        <span className="text-xs font-semibold text-slate-200">
                                                            oleh {a.user_name || a.user?.name || 'Sistem'}
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(a.created_at)}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-slate-300">
                                                    {a.summary}
                                                </p>

                                                {/* Detailed Old vs New Values Diff */}
                                                {(a.old_values || a.new_values) && (
                                                    <div className="mt-2 pt-2 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                                        {a.old_values && (
                                                            <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300">
                                                                <span className="font-bold block mb-1">Nilai Sebelum:</span>
                                                                <pre className="font-mono text-[10px] overflow-x-auto whitespace-pre-wrap">
                                                                    {JSON.stringify(a.old_values, null, 2)}
                                                                </pre>
                                                            </div>
                                                        )}
                                                        {a.new_values && (
                                                            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                                                                <span className="font-bold block mb-1">Nilai Sesudah:</span>
                                                                <pre className="font-mono text-[10px] overflow-x-auto whitespace-pre-wrap">
                                                                    {JSON.stringify(a.new_values, null, 2)}
                                                                </pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-xs rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
