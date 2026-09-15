import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Package,
    Plus,
    Search,
    Edit2,
    Trash2,
    ArrowDownRight,
    ArrowUpRight,
    Eye,
    TrendingUp,
    AlertTriangle,
    Boxes,
    DollarSign,
    LayoutGrid,
    List,
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon
} from 'lucide-react';
import { router, Link } from '@inertiajs/react';
import { Product, ProductMetrics } from '@/types';
import ProductFormModal from './Partials/ProductFormModal';
import StockMutationModal from './Partials/StockMutationModal';
import ProductDetailModal from './Partials/ProductDetailModal';

interface ProductsIndexProps {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    metrics: ProductMetrics;
    categories: string[];
    filters: {
        search?: string;
        category?: string;
        stock_status?: string;
        sort?: string;
    };
}

export default function ProductsIndex({ products, metrics, categories, filters }: ProductsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');
    const [stockStatus, setStockStatus] = useState(filters.stock_status || 'all');
    const [sort, setSort] = useState(filters.sort || 'latest');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    // Modals state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [isMutationOpen, setIsMutationOpen] = useState(false);
    const [mutationProduct, setMutationProduct] = useState<Product | null>(null);

    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const formatRp = (val?: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const handleFilterChange = (newFilters: {
        search?: string;
        category?: string;
        stock_status?: string;
        sort?: string;
    }) => {
        const queryParams: Record<string, string> = {};
        const s = newFilters.search !== undefined ? newFilters.search : search;
        const c = newFilters.category !== undefined ? newFilters.category : category;
        const st = newFilters.stock_status !== undefined ? newFilters.stock_status : stockStatus;
        const so = newFilters.sort !== undefined ? newFilters.sort : sort;

        if (s) queryParams.search = s;
        if (c && c !== 'all') queryParams.category = c;
        if (st && st !== 'all') queryParams.stock_status = st;
        if (so && so !== 'latest') queryParams.sort = so;

        router.get('/products', queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange({ search });
    };

    const handleOpenAdd = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (p: Product) => {
        setEditingProduct(p);
        setIsFormOpen(true);
    };

    const handleOpenMutation = (p: Product) => {
        setMutationProduct(p);
        setIsMutationOpen(true);
    };

    const handleOpenDetail = (p: Product) => {
        setSelectedProduct(p);
        setIsDetailOpen(true);
    };

    const handleDelete = (p: Product) => {
        if (confirm(`Hapus master produk "${p.name}" (SKU: ${p.sku})? Tindakan ini tidak dapat dibatalkan.`)) {
            router.delete(`/products/${p.id}`);
        }
    };

    return (
        <AppLayout
            title="Katalog & Database Produk"
            subtitle="Master data pengadaan sekolah SIPLah, kontrol persediaan stok fisik, tracking harga & margin, dan jejak audit"
        >
            <div className="space-y-6 sm:space-y-8">
                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
                    <div className="space-y-1">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                                <Boxes className="h-6 w-6" />
                            </div>
                            <span>Database Produk & Persediaan</span>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                            Katalog master barang SIPLah, kontrol mutasi kartu stok, analisis margin laba, dan transparansi audit trail
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            onClick={handleOpenAdd}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/25 transition"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Produk Baru</span>
                        </button>
                    </div>
                </div>

                {/* 4 Rich KPI Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* KPI 1: Total SKU */}
                    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-lg relative overflow-hidden space-y-3">
                        <div className="flex items-start justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Katalog SKU</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                <Package className="h-5 w-5" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">{metrics.total_products}</h3>
                            <p className="text-xs text-indigo-400 mt-1.5 font-medium leading-relaxed">
                                {categories.length} Kategori Terdaftar
                            </p>
                        </div>
                    </div>

                    {/* KPI 2: Total Inventory Asset Value */}
                    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-lg relative overflow-hidden space-y-3">
                        <div className="flex items-start justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nilai Persediaan (Modal HPP)</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                <DollarSign className="h-5 w-5" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">{formatRp(metrics.total_inventory_value)}</h3>
                            <p className="text-xs text-emerald-400 mt-1.5 font-medium leading-relaxed">
                                Nilai Jual: {formatRp(metrics.total_selling_value)}
                            </p>
                        </div>
                    </div>

                    {/* KPI 3: Average Margin */}
                    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-lg relative overflow-hidden space-y-3">
                        <div className="flex items-start justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rata-rata Margin Laba</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">{metrics.average_margin_percentage}%</h3>
                            <p className="text-xs text-sky-400 mt-1.5 font-medium leading-relaxed">
                                Rata-rata margin kotor katalog
                            </p>
                        </div>
                    </div>

                    {/* KPI 4: Stock Alerts */}
                    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-lg relative overflow-hidden space-y-3">
                        <div className="flex items-start justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Peringatan Stok</span>
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                                metrics.out_of_stock_count > 0 || metrics.low_stock_count > 0
                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
                                    {metrics.low_stock_count}
                                </span>
                                <span className="text-xs text-slate-400">Menipis</span>
                                <span className="text-slate-600 font-bold">/</span>
                                <span className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono tracking-tight">
                                    {metrics.out_of_stock_count}
                                </span>
                                <span className="text-xs text-slate-400">Habis</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1.5 font-medium leading-relaxed">
                                Butuh pengadaan dari rekanan
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filter Toolbar & View Switcher */}
                <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                        {/* Search Input */}
                        <form onSubmit={handleSearchSubmit} className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                            <input
                                type="text"
                                placeholder="Cari nama produk, kode SKU, atau spesifikasi barang..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                            />
                        </form>

                        {/* Dropdown Filters */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                            {/* Category Filter */}
                            <select
                                value={category}
                                onChange={(e) => {
                                    setCategory(e.target.value);
                                    handleFilterChange({ category: e.target.value });
                                }}
                                className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                            >
                                <option value="all">Semua Kategori</option>
                                {categories.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>

                            {/* Stock Status Filter */}
                            <select
                                value={stockStatus}
                                onChange={(e) => {
                                    setStockStatus(e.target.value);
                                    handleFilterChange({ stock_status: e.target.value });
                                }}
                                className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                            >
                                <option value="all">Semua Status Stok</option>
                                <option value="in_stock">Stok Aman (&gt; Min)</option>
                                <option value="low_stock">Stok Menipis (&le; Min)</option>
                                <option value="out_of_stock">Stok Habis (0)</option>
                            </select>

                            {/* Sort Filter */}
                            <select
                                value={sort}
                                onChange={(e) => {
                                    setSort(e.target.value);
                                    handleFilterChange({ sort: e.target.value });
                                }}
                                className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                            >
                                <option value="latest">Terbaru</option>
                                <option value="name_asc">Nama (A-Z)</option>
                                <option value="price_high">Harga Jual Tertinggi</option>
                                <option value="price_low">Harga Jual Terendah</option>
                                <option value="stock_low">Stok Terkecil</option>
                                <option value="stock_high">Stok Terbanyak</option>
                            </select>

                            {/* View Mode Toggle */}
                            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`p-2 rounded-lg transition ${
                                        viewMode === 'table'
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                    title="Tampilan Tabel"
                                >
                                    <List className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition ${
                                        viewMode === 'grid'
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                    title="Tampilan Grid Galeri"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product List Content (Table or Grid) */}
                {products.data.length === 0 ? (
                    <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-12 text-center space-y-3">
                        <Package className="w-12 h-12 text-slate-600 mx-auto" />
                        <h4 className="text-base font-semibold text-white">Tidak ada data produk ditemukan</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                            Coba sesuaikan kata kunci pencarian atau ubah filter kategori dan status stok.
                        </p>
                        <button
                            onClick={handleOpenAdd}
                            className="mt-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition"
                        >
                            Tambah Produk Baru
                        </button>
                    </div>
                ) : viewMode === 'table' ? (
                    /* Table View */
                    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-xs border-b border-slate-800">
                                    <tr>
                                        <th className="py-4 px-4 w-20 text-center">Foto</th>
                                        <th className="py-4 px-4">SKU</th>
                                        <th className="py-4 px-5">Nama Produk & Spesifikasi</th>
                                        <th className="py-4 px-4">Kategori</th>
                                        <th className="py-4 px-4 text-right">Harga Beli (HPP)</th>
                                        <th className="py-4 px-4 text-right">Harga Jual</th>
                                        <th className="py-4 px-4 text-right">Margin Laba</th>
                                        <th className="py-4 px-5 text-center">Saldo Stok</th>
                                        <th className="py-4 px-5 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {products.data.map((p) => {
                                        const isOutOfStock = p.stock_status === 'out_of_stock';
                                        const isLowStock = p.stock_status === 'low_stock';

                                        return (
                                            <tr key={p.id} className="hover:bg-slate-950/40 transition">
                                                {/* Image Thumbnail */}
                                                <td className="py-4 px-4 text-center">
                                                    <div
                                                        onClick={() => handleOpenDetail(p)}
                                                        className="h-12 w-12 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 mx-auto cursor-pointer hover:border-indigo-500 transition flex items-center justify-center shadow-sm"
                                                    >
                                                        {p.primary_image_url ? (
                                                            <img
                                                                src={p.primary_image_url}
                                                                alt={p.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <ImageIcon className="w-5 h-5 text-slate-600" />
                                                        )}
                                                    </div>
                                                </td>

                                                {/* SKU */}
                                                <td className="py-4 px-4 font-mono font-bold text-xs whitespace-nowrap">
                                                    <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                                        {p.sku || '-'}
                                                    </span>
                                                </td>

                                                {/* Product Name & Description */}
                                                <td className="py-4 px-5 max-w-sm space-y-1">
                                                    <button
                                                        onClick={() => handleOpenDetail(p)}
                                                        className="font-semibold text-slate-100 hover:text-indigo-400 text-left transition block leading-snug"
                                                    >
                                                        {p.name}
                                                    </button>
                                                    <p className="text-xs text-slate-400 truncate leading-relaxed">
                                                        {p.description || 'Tidak ada deskripsi'}
                                                    </p>
                                                </td>

                                                {/* Category & Unit */}
                                                <td className="py-4 px-4 whitespace-nowrap space-y-1">
                                                    <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium text-xs block w-fit">
                                                        {p.category}
                                                    </span>
                                                    <span className="text-xs text-slate-400 block">
                                                        {p.unit}
                                                    </span>
                                                </td>

                                                {/* Cost (HPP) */}
                                                <td className="py-4 px-4 text-right font-mono text-slate-300 whitespace-nowrap">
                                                    {formatRp(p.reference_cost)}
                                                </td>

                                                {/* Selling Price */}
                                                <td className="py-4 px-4 text-right font-mono font-bold text-white whitespace-nowrap">
                                                    {formatRp(p.reference_price)}
                                                </td>

                                                {/* Margin */}
                                                <td className="py-4 px-4 text-right whitespace-nowrap space-y-1">
                                                    <span className="font-mono font-bold text-emerald-400 block">
                                                        {formatRp(p.margin_amount)}
                                                    </span>
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 inline-block">
                                                        +{p.margin_percentage}%
                                                    </span>
                                                </td>

                                                {/* Stock Status Badge */}
                                                <td className="py-4 px-5 text-center whitespace-nowrap space-y-1">
                                                    <span className="font-mono font-extrabold text-base block text-white">
                                                        {p.current_stock} <span className="text-xs font-normal text-slate-400">{p.unit}</span>
                                                    </span>
                                                    {isOutOfStock ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                                                            Habis
                                                        </span>
                                                    ) : isLowStock ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                                            Menipis (&le;{p.min_stock})
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                                            Aman
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="py-4 px-5 text-center whitespace-nowrap">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleOpenMutation(p)}
                                                            title="Catat Mutasi Stok Masuk/Keluar"
                                                            className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition"
                                                        >
                                                            <ArrowDownRight className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenDetail(p)}
                                                            title="Lihat Detail, Foto, Kartu Stok & Audit Trail"
                                                            className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenEdit(p)}
                                                            title="Edit Master Data & Harga"
                                                            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(p)}
                                                            title="Hapus Produk"
                                                            className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* Grid Gallery Cards View */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.data.map((p) => {
                            const isOutOfStock = p.stock_status === 'out_of_stock';
                            const isLowStock = p.stock_status === 'low_stock';

                            return (
                                <div
                                    key={p.id}
                                    className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-lg hover:border-slate-700 transition flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Product Photo Box */}
                                        <div
                                            onClick={() => handleOpenDetail(p)}
                                            className="relative aspect-video w-full bg-slate-950 cursor-pointer overflow-hidden border-b border-slate-800 group"
                                        >
                                            {p.primary_image_url ? (
                                                <img
                                                    src={p.primary_image_url}
                                                    alt={p.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-600">
                                                    <ImageIcon className="w-10 h-10" />
                                                </div>
                                            )}

                                            {/* SKU Badge Top Left */}
                                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-sm text-xs font-mono font-bold text-indigo-300 border border-slate-700">
                                                {p.sku || 'SKU'}
                                            </span>

                                            {/* Stock Status Top Right */}
                                            <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-md text-xs font-bold backdrop-blur-sm border ${
                                                isOutOfStock
                                                    ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                                                    : isLowStock
                                                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                                                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                            }`}>
                                                {p.current_stock} {p.unit}
                                            </span>
                                        </div>

                                        {/* Card Info Body */}
                                        <div className="p-5 space-y-4">
                                            <div className="space-y-1">
                                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                                                    {p.category}
                                                </span>
                                                <h4
                                                    onClick={() => handleOpenDetail(p)}
                                                    className="text-sm font-bold text-white hover:text-indigo-400 cursor-pointer line-clamp-2 leading-snug"
                                                >
                                                    {p.name}
                                                </h4>
                                            </div>

                                            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
                                                <div className="flex justify-between items-center text-slate-400">
                                                    <span>Harga Beli (HPP)</span>
                                                    <span className="font-mono text-slate-300">{formatRp(p.reference_cost)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-slate-400">
                                                    <span>Harga Jual SIPLah</span>
                                                    <span className="font-mono font-bold text-white">{formatRp(p.reference_price)}</span>
                                                </div>
                                                <div className="flex justify-between items-center pt-2 border-t border-slate-800/60">
                                                    <span className="text-emerald-400 font-medium">Margin Laba</span>
                                                    <span className="font-mono font-bold text-emerald-400">
                                                        +{p.margin_percentage}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer Actions */}
                                    <div className="p-5 pt-0 flex items-center justify-between gap-2.5 border-t border-slate-800/60 mt-3">
                                        <button
                                            onClick={() => handleOpenMutation(p)}
                                            className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 flex items-center justify-center gap-1.5 transition"
                                        >
                                            <ArrowDownRight className="w-4 h-4" />
                                            <span>Mutasi Stok</span>
                                        </button>
                                        <button
                                            onClick={() => handleOpenDetail(p)}
                                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                                            title="Detail Lengkap & Audit"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleOpenEdit(p)}
                                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 transition"
                                            title="Edit Produk"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination Controls */}
                {products.total > products.per_page && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 text-xs sm:text-sm text-slate-400 pt-2">
                        <div>
                            Menampilkan halaman <span className="font-semibold text-white">{products.current_page}</span> dari <span className="font-semibold text-white">{products.last_page}</span> (Total <span className="font-semibold text-white">{products.total}</span> produk)
                        </div>
                        <div className="flex items-center gap-2">
                            {products.prev_page_url ? (
                                <Link
                                    href={products.prev_page_url}
                                    preserveScroll
                                    className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-medium"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span>Sebelumnya</span>
                                </Link>
                            ) : (
                                <span className="px-3.5 py-2 rounded-xl border border-slate-800/40 bg-slate-950/40 text-slate-600 cursor-not-allowed flex items-center gap-1.5 text-xs font-medium">
                                    <ChevronLeft className="w-4 h-4" />
                                    <span>Sebelumnya</span>
                                </span>
                            )}

                            {products.next_page_url ? (
                                <Link
                                    href={products.next_page_url}
                                    preserveScroll
                                    className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-medium"
                                >
                                    <span>Berikutnya</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            ) : (
                                <span className="px-3.5 py-2 rounded-xl border border-slate-800/40 bg-slate-950/40 text-slate-600 cursor-not-allowed flex items-center gap-1.5 text-xs font-medium">
                                    <span>Berikutnya</span>
                                    <ChevronRight className="w-4 h-4" />
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Integrated Modals */}
                <ProductFormModal
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    product={editingProduct}
                    categories={categories}
                />

                <StockMutationModal
                    isOpen={isMutationOpen}
                    onClose={() => setIsMutationOpen(false)}
                    product={mutationProduct}
                />

                <ProductDetailModal
                    isOpen={isDetailOpen}
                    onClose={() => setIsDetailOpen(false)}
                    product={selectedProduct}
                    onOpenStockMutation={(p) => {
                        setIsDetailOpen(false);
                        handleOpenMutation(p);
                    }}
                    onOpenEdit={(p) => {
                        setIsDetailOpen(false);
                        handleOpenEdit(p);
                    }}
                />
            </div>
        </AppLayout>
    );
}
