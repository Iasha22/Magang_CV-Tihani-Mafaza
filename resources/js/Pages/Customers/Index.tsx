import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import {
    School,
    Plus,
    Search,
    Edit2,
    Trash2,
    Phone,
    MapPin,
    FileText,
    X,
    Building2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { router, Link } from '@inertiajs/react';
import { Customer } from '@/types';

interface CustomersProps {
    customers: {
        data: Customer[];
        current_page: number;
        last_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: { search?: string };
}

export default function Customers({ customers, filters }: CustomersProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const [form, setForm] = useState({
        name: '',
        npsn: '',
        address: '',
        contact_person: '',
        phone: '',
        npwp: '',
    });

    const formatRp = (val?: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/customers', { search }, { preserveState: true });
    };

    const handleOpenAdd = () => {
        setEditingCustomer(null);
        setForm({
            name: '',
            npsn: '',
            address: '',
            contact_person: '',
            phone: '',
            npwp: '',
        });
        setModalOpen(true);
    };

    const handleOpenEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setForm({
            name: customer.name,
            npsn: customer.npsn || '',
            address: customer.address || '',
            contact_person: customer.contact_person || '',
            phone: customer.phone || '',
            npwp: customer.npwp || '',
        });
        setModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCustomer) {
            router.put(`/customers/${editingCustomer.id}`, form, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            router.post('/customers', form, {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const handleDelete = (customer: Customer) => {
        if (confirm(`Hapus data sekolah "${customer.name}"? Semua riwayat pesanan akan terpengaruh.`)) {
            router.delete(`/customers/${customer.id}`);
        }
    };

    return (
        <AppLayout
            title="Direktori Sekolah (Pelanggan SIPLah)"
            subtitle="Master data instansi pendidikan mitra pengadaan CV Tihani Mafaza"
        >
            {/* Action & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <form onSubmit={handleSearch} className="w-full sm:w-96 relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                        <Search className="h-4 w-4" />
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama sekolah, NPSN, atau bendahara..."
                        className="block w-full rounded-xl border border-slate-700 bg-slate-900/80 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                    />
                </form>

                <button
                    onClick={handleOpenAdd}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-indigo-400 transition-all shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Sekolah Baru</span>
                </button>
            </div>

            {/* Customers Table Card */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                        <h3 className="text-base font-bold text-white">Daftar Sekolah Mitra SIPLah</h3>
                        <p className="text-xs text-slate-400">Total {customers.total} sekolah terdaftar</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="pb-3">NPSN / Identitas</th>
                                <th className="pb-3">Nama Sekolah</th>
                                <th className="pb-3">Alamat</th>
                                <th className="pb-3">Bendahara / Kontak</th>
                                <th className="pb-3">NPWP</th>
                                <th className="pb-3 text-center">Jumlah Pesanan</th>
                                <th className="pb-3 text-right">Total Transaksi</th>
                                <th className="pb-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                            {customers.data.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="py-3 font-mono text-indigo-400 font-semibold">
                                        {c.npsn || '-'}
                                    </td>
                                    <td className="py-3 font-bold text-white">
                                        {c.name}
                                    </td>
                                    <td className="py-3 text-slate-300 max-w-[200px] truncate">
                                        {c.address || '-'}
                                    </td>
                                    <td className="py-3 text-slate-300">
                                        <span>{c.contact_person || 'Bendahara BOS'}</span>
                                        {c.phone && (
                                            <span className="block text-[11px] text-slate-400 font-mono">
                                                {c.phone}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 font-mono text-slate-300 text-[11px]">
                                        {c.npwp || '-'}
                                    </td>
                                    <td className="py-3 text-center font-mono text-white font-semibold">
                                        {c.orders_count || 0}
                                    </td>
                                    <td className="py-3 text-right font-mono font-bold text-emerald-400">
                                        {formatRp(c.total_revenue)}
                                    </td>
                                    <td className="py-3 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button
                                                onClick={() => handleOpenEdit(c)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                                                title="Ubah Data"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(c)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
                    <span>
                        Halaman {customers.current_page} dari {customers.last_page}
                    </span>
                    <div className="flex items-center gap-2">
                        {customers.prev_page_url && (
                            <Link
                                href={customers.prev_page_url}
                                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 hover:bg-slate-800 text-slate-200"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                            </Link>
                        )}
                        {customers.next_page_url && (
                            <Link
                                href={customers.next_page_url}
                                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 hover:bg-slate-800 text-slate-200"
                            >
                                Selanjutnya <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Add / Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <h4 className="text-base font-bold text-white">
                                {editingCustomer ? 'Ubah Data Sekolah' : 'Tambah Sekolah Mitra'}
                            </h4>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-300 mb-1.5 font-medium">Nama Sekolah / Instansi *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                    placeholder="Contoh: SDN 01 Sukajadi Bandung"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-300 mb-1.5 font-medium">NPSN</label>
                                    <input
                                        type="text"
                                        value={form.npsn}
                                        onChange={(e) => setForm({ ...form, npsn: e.target.value })}
                                        placeholder="Nomor Pokok Sekolah"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-white focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 mb-1.5 font-medium">NPWP Sekolah</label>
                                    <input
                                        type="text"
                                        value={form.npwp}
                                        onChange={(e) => setForm({ ...form, npwp: e.target.value })}
                                        placeholder="00.000.000.0-000.000"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-white focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-300 mb-1.5 font-medium">Alamat Lengkap</label>
                                <textarea
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    rows={2}
                                    placeholder="Alamat sekolah di Bandung..."
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-300 mb-1.5 font-medium">Kontak Person</label>
                                    <input
                                        type="text"
                                        value={form.contact_person}
                                        onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                                        placeholder="Nama Kepala Sekolah / Bendahara"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 mb-1.5 font-medium">No. Telepon / WhatsApp</label>
                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        placeholder="08..."
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-white focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>
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
                                    className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white hover:bg-indigo-500"
                                >
                                    Simpan Data
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
