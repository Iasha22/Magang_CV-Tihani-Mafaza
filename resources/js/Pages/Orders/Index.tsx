import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Search,
    Filter,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Layers,
    Receipt,
    School,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { router, Link } from '@inertiajs/react';
import { Order, Customer } from '@/types';

interface OrdersProps {
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    customers: Customer[];
    filters: {
        search?: string;
        status?: string;
        customer_id?: string;
    };
}

export default function Orders({ orders, customers, filters }: OrdersProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [customerId, setCustomerId] = useState(filters.customer_id || '');

    // Disbursement Modal State
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [disbDate, setDisbDate] = useState(new Date().toISOString().split('T')[0]);
    const [disbAmount, setDisbAmount] = useState<number>(0);
    const [bankName, setBankName] = useState('BJB (CV Tihani Mafaza)');
    const [refNumber, setRefNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [modalSubmitting, setModalSubmitting] = useState(false);

    const formatRp = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get('/orders', {
            search: search || undefined,
            status: status || undefined,
            customer_id: customerId || undefined,
        }, { preserveState: true });
    };

    const handleOpenDisburseModal = (order: Order) => {
        setSelectedOrder(order);
        const netAmt = order.transaction
            ? Number(order.transaction.net_disbursement)
            : Number(order.total_bruto);
        setDisbAmount(netAmt);
        setRefNumber('CAIR-' + order.siplah_order_id);
    };

    const handleSaveDisbursement = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder) return;

        setModalSubmitting(true);
        router.post(
            `/orders/${selectedOrder.id}/disbursement`,
            {
                disbursement_date: disbDate,
                amount: disbAmount,
                bank_name: bankName,
                reference_number: refNumber,
                notes: notes,
            },
            {
                onSuccess: () => {
                    setSelectedOrder(null);
                },
                onFinish: () => {
                    setModalSubmitting(false);
                },
            }
        );
    };

    return (
        <AppLayout
            title="Daftar Pesanan SIPLah"
            subtitle="Manajemen status pesanan pengadaan sekolah dan serah terima dana BOS"
        >
            {/* Search & Filter Bar */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-xl">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="relative sm:col-span-2">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                            <Search className="h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari ID Pesanan SIPLah atau nama sekolah..."
                            className="block w-full rounded-xl border border-slate-700 bg-slate-950/60 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="block w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                        >
                            <option value="">Semua Status</option>
                            <option value="selesai">Selesai / Cair</option>
                            <option value="menunggu_pencairan">Menunggu Pencairan</option>
                            <option value="diproses">Sedang Diproses</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            className="block w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                        >
                            <option value="">Semua Sekolah</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-all shrink-0"
                        >
                            Filter
                        </button>
                    </div>
                </form>
            </div>

            {/* Orders Table Card */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                        <h3 className="text-base font-bold text-white">Data Transaksi Pengadaan Sekolah</h3>
                        <p className="text-xs text-slate-400">Total {orders.total} pesanan tercatat di buku kas</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/import"
                            className="rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
                        >
                            + Impor Data Baru
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="pb-3">No Pesanan</th>
                                <th className="pb-3">Tanggal Pesan</th>
                                <th className="pb-3">Sekolah</th>
                                <th className="pb-3 text-right">Bruto (Rp)</th>
                                <th className="pb-3 text-right">Modal / HPP</th>
                                <th className="pb-3 text-right">Laba Kotor</th>
                                <th className="pb-3 text-right">Pajak (PPh+PPN)</th>
                                <th className="pb-3 text-right">Net Cair</th>
                                <th className="pb-3 text-center">Status</th>
                                <th className="pb-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                            {orders.data.map((order) => {
                                const totTax = order.transaction
                                    ? Number(order.transaction.tax_pph22) + Number(order.transaction.tax_ppn)
                                    : 0;
                                const netExpected = order.transaction
                                    ? Number(order.transaction.net_disbursement)
                                    : Number(order.total_bruto);

                                return (
                                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 font-mono font-semibold text-indigo-300">
                                            {order.siplah_order_id}
                                        </td>
                                        <td className="py-3 text-slate-300 font-mono">
                                            {order.order_date as string}
                                        </td>
                                        <td className="py-3 font-medium text-white max-w-[180px] truncate">
                                            {order.customer?.name}
                                        </td>
                                        <td className="py-3 text-right font-mono font-semibold text-white">
                                            {formatRp(order.total_bruto)}
                                        </td>
                                        <td className="py-3 text-right font-mono text-rose-400">
                                            {formatRp(order.total_cost)}
                                        </td>
                                        <td className="py-3 text-right font-mono font-semibold text-emerald-400">
                                            {formatRp(order.gross_profit)}
                                            <span className="block text-[10px] text-slate-400">
                                                {order.margin_percentage}%
                                            </span>
                                        </td>
                                        <td className="py-3 text-right font-mono text-amber-400 text-[11px]">
                                            {formatRp(totTax)}
                                        </td>
                                        <td className="py-3 text-right font-mono font-bold text-sky-400">
                                            {formatRp(netExpected)}
                                        </td>
                                        <td className="py-3 text-center">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                                                    order.status === 'selesai'
                                                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                                        : order.status === 'menunggu_pencairan'
                                                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                                        : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                                                }`}
                                            >
                                                {order.status === 'selesai'
                                                    ? 'Cair'
                                                    : order.status === 'menunggu_pencairan'
                                                    ? 'Menunggu Cair'
                                                    : 'Diproses'}
                                            </span>
                                        </td>
                                        <td className="py-3 text-center">
                                            {order.status !== 'selesai' ? (
                                                <button
                                                    onClick={() => handleOpenDisburseModal(order)}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white px-2.5 py-1 text-[11px] font-semibold border border-emerald-500/30 transition-all"
                                                >
                                                    <CreditCard className="w-3 h-3" />
                                                    <span>Tandai Cair</span>
                                                </button>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                    {order.disbursement_date ? `Cair: ${order.disbursement_date}` : 'Lunas'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
                    <span>
                        Menampilkan halaman {orders.current_page} dari {orders.last_page}
                    </span>
                    <div className="flex items-center gap-2">
                        {orders.prev_page_url && (
                            <Link
                                href={orders.prev_page_url}
                                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 hover:bg-slate-800 text-slate-200"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                            </Link>
                        )}
                        {orders.next_page_url && (
                            <Link
                                href={orders.next_page_url}
                                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 hover:bg-slate-800 text-slate-200"
                            >
                                Selanjutnya <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Disbursement Confirmation Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-emerald-400" />
                                <h4 className="text-base font-bold text-white">
                                    Catat Realisasi Pencairan Dana BOS
                                </h4>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-slate-400">No Pesanan SIPLah:</span>
                                <span className="font-mono font-bold text-indigo-300">
                                    {selectedOrder.siplah_order_id}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Sekolah:</span>
                                <span className="text-white font-medium">{selectedOrder.customer?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Nilai Bruto Pesanan:</span>
                                <span className="font-mono font-semibold text-white">
                                    {formatRp(selectedOrder.total_bruto)}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSaveDisbursement} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-300 mb-1.5 font-medium">Tanggal Dana Masuk Rekening</label>
                                <input
                                    type="date"
                                    value={disbDate}
                                    onChange={(e) => setDisbDate(e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-300 mb-1.5 font-medium">Jumlah Bersih Masuk (Rp)</label>
                                <input
                                    type="number"
                                    value={disbAmount}
                                    onChange={(e) => setDisbAmount(Number(e.target.value))}
                                    required
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-white focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-300 mb-1.5 font-medium">Rekening Bank Tujuan</label>
                                <input
                                    type="text"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-300 mb-1.5 font-medium">Nomor Referensi Transfer / Rekap</label>
                                <input
                                    type="text"
                                    value={refNumber}
                                    onChange={(e) => setRefNumber(e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setSelectedOrder(null)}
                                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-slate-300 hover:bg-slate-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={modalSubmitting}
                                    className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                                >
                                    {modalSubmitting ? 'Menyimpan...' : 'Konfirmasi Pencairan Kas'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
