import React, { useState, useEffect } from 'react';
import { X, Upload, Calculator, AlertTriangle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { Product } from '@/types';
import { router } from '@inertiajs/react';

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    categories: string[];
}

export default function ProductFormModal({ isOpen, onClose, product, categories }: ProductFormModalProps) {
    if (!isOpen) return null;

    const isEdit = !!product;

    const [form, setForm] = useState({
        name: '',
        sku: '',
        category: 'ATK',
        unit: 'pcs',
        reference_price: 0,
        reference_cost: 0,
        description: '',
        initial_stock: 0,
        min_stock: 5,
    });

    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (product) {
            setForm({
                name: product.name,
                sku: product.sku || '',
                category: product.category,
                unit: product.unit,
                reference_price: Number(product.reference_price) || 0,
                reference_cost: Number(product.reference_cost) || 0,
                description: product.description || '',
                initial_stock: 0,
                min_stock: product.min_stock ?? 5,
            });
        } else {
            setForm({
                name: '',
                sku: '',
                category: 'ATK',
                unit: 'pcs',
                reference_price: 0,
                reference_cost: 0,
                description: '',
                initial_stock: 10,
                min_stock: 5,
            });
        }
        setSelectedImages([]);
        setImagePreviews([]);
        setErrors({});
    }, [product, isOpen]);

    // Live margin calculation
    const sellingPrice = Number(form.reference_price) || 0;
    const costPrice = Number(form.reference_cost) || 0;
    const marginAmount = sellingPrice - costPrice;
    const marginPercent = sellingPrice > 0 ? ((marginAmount / sellingPrice) * 100) : 0;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedImages(files);

            const previews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(previews);
        }
    };

    const formatRp = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('sku', form.sku);
        formData.append('category', form.category);
        formData.append('unit', form.unit);
        formData.append('reference_price', String(form.reference_price));
        formData.append('reference_cost', String(form.reference_cost));
        formData.append('description', form.description);
        formData.append('min_stock', String(form.min_stock));

        if (!isEdit) {
            formData.append('initial_stock', String(form.initial_stock));
        }

        selectedImages.forEach((img) => {
            formData.append('images[]', img);
        });

        if (isEdit) {
            formData.append('_method', 'PUT');
            router.post(`/products/${product.id}`, formData, {
                onSuccess: () => {
                    setIsSubmitting(false);
                    onClose();
                },
                onError: (errs) => {
                    setErrors(errs);
                    setIsSubmitting(false);
                },
            });
        } else {
            router.post('/products', formData, {
                onSuccess: () => {
                    setIsSubmitting(false);
                    onClose();
                },
                onError: (errs) => {
                    setErrors(errs);
                    setIsSubmitting(false);
                },
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60">
                    <div>
                        <h3 className="text-lg font-bold text-white">
                            {isEdit ? 'Edit Data Master Produk' : 'Tambah Master Produk Baru'}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {isEdit ? 'Perbarui spesifikasi, harga acuan, dan parameter produk' : 'Daftarkan SKU baru dengan spesifikasi, harga beli/jual, dan saldo stok awal'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(85vh-130px)] overflow-y-auto">
                    {/* Section 1: Master Data Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-1 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                            <span>1. Informasi Master Data Produk</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                    Nama Produk <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Kertas HVS A4 75gr Sinar Dunia"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                    Kode SKU <span className="text-slate-500 font-normal">(Opsional)</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Auto generate"
                                    value={form.sku}
                                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-indigo-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                                />
                                {errors.sku && <p className="text-xs text-rose-400 mt-1">{errors.sku}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                    Kategori Pengadaan SIPLah <span className="text-rose-400">*</span>
                                </label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                    Satuan Unit <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Misal: pcs, box, rim, set, paket, unit"
                                    value={form.unit}
                                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                Deskripsi & Spesifikasi Produk
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Tuliskan spesifikasi detail barang, merek, ukuran, tipe, atau catatan khusus pengadaan sekolah..."
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                            />
                        </div>
                    </div>

                    {/* Section 2: Financial & Price Tracking */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2 pb-1 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                            <Calculator className="w-4 h-4" />
                            <span>2. Penetapan Harga & Kalkulator Margin Laba</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                    Harga Beli / HPP (Modal Supplier) <span className="text-rose-400">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-medium">Rp</span>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={form.reference_cost || ''}
                                        onChange={(e) => setForm({ ...form, reference_cost: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                                        placeholder="0"
                                    />
                                </div>
                                <span className="text-[11px] text-slate-400 mt-1 block">Belanja modal ke pihak rekanan/distributor</span>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                    Harga Jual SIPLah (Katalog Resmi) <span className="text-rose-400">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-medium">Rp</span>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={form.reference_price || ''}
                                        onChange={(e) => setForm({ ...form, reference_price: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                                        placeholder="0"
                                    />
                                </div>
                                <span className="text-[11px] text-slate-400 mt-1 block">Harga tayang bruto untuk pesanan sekolah</span>
                            </div>
                        </div>

                        {/* Interactive Realtime Margin Display */}
                        <div className={`p-4 rounded-xl border transition-all ${
                            marginAmount < 0
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                                : marginPercent >= 20
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                        }`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    {marginAmount < 0 ? (
                                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                                    ) : (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                    )}
                                    <div>
                                        <div className="text-xs font-semibold">
                                            {marginAmount < 0 ? 'Peringatan: Margin Defisit / Rugi' : 'Proyeksi Margin Laba Kotor Unit'}
                                        </div>
                                        <div className="text-[11px] text-slate-400">
                                            Laba Kotor = Harga Jual ({formatRp(sellingPrice)}) - HPP ({formatRp(costPrice)})
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right sm:text-right">
                                    <div className="text-base font-bold">
                                        {formatRp(marginAmount)}
                                    </div>
                                    <div className="text-xs font-semibold">
                                        Persentase: {marginPercent.toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Stock Management */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2 pb-1 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-sky-400">
                            <span>3. Manajemen Batas & Saldo Stok</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {!isEdit && (
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                        Saldo Stok Awal Masuk ({form.unit || 'unit'})
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.initial_stock}
                                        onChange={(e) => setForm({ ...form, initial_stock: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                                    />
                                    <span className="text-[11px] text-slate-400 mt-1 block">
                                        Akan otomatis dicatat sebagai mutasi masuk saldo awal
                                    </span>
                                </div>
                            )}

                            <div className={isEdit ? 'md:col-span-2' : ''}>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                    Peringatan Stok Minimum (Alert Threshold)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.min_stock}
                                    onChange={(e) => setForm({ ...form, min_stock: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                                />
                                <span className="text-[11px] text-slate-400 mt-1 block">
                                    Sistem akan memberi status "Stok Menipis" jika saldo &le; batas ini
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Product Image / Photo Upload */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2 pb-1 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-amber-400">
                            <ImageIcon className="w-4 h-4" />
                            <span>4. Foto / Gambar Produk</span>
                        </div>

                        <div className="border-2 border-dashed border-slate-700/80 rounded-xl p-5 text-center hover:border-indigo-500 transition-colors bg-slate-950/40">
                            <Upload className="w-7 h-7 mx-auto text-slate-400 mb-2" />
                            <label className="cursor-pointer text-sm font-semibold text-indigo-400 hover:text-indigo-300">
                                Pilih File Foto
                                <input
                                    type="file"
                                    multiple
                                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-xs text-slate-500 mt-1">
                                Format didukung: JPG, PNG, WebP, SVG. Maks 5MB per file.
                            </p>

                            {/* Preview Grid */}
                            {imagePreviews.length > 0 && (
                                <div className="mt-4 grid grid-cols-4 gap-2 pt-3 border-t border-slate-800">
                                    {imagePreviews.map((src, i) => (
                                        <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                                            <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                            {i === 0 && (
                                                <span className="absolute bottom-1 left-1 bg-indigo-600 text-white text-[9px] px-1 rounded font-bold">
                                                    Utama
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
                            disabled={isSubmitting}
                            className="px-6 py-2.5 text-sm rounded-xl font-medium bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
                        >
                            {isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
