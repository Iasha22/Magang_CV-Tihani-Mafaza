import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import KpiCard from '@/Components/KpiCard';
import {
    DollarSign,
    TrendingUp,
    Percent,
    Building2,
    Clock,
    FileSpreadsheet,
    ArrowUpRight,
    School,
    Layers,
    ReceiptText,
    CheckCircle2,
    Calendar,
    ChevronRight,
    Wallet
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { DashboardMetrics, Order } from '@/types';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

interface TopSchool {
    id: number;
    name: string;
    npsn?: string;
    orders_count: number;
    total_revenue: number;
}

interface CategoryDist {
    category: string;
    amount: number;
    count: number;
}

interface MonthlyTrend {
    month: string;
    bruto: number;
    cost: number;
    profit: number;
}

interface DashboardProps {
    metrics: DashboardMetrics;
    monthlyTrends: MonthlyTrend[];
    topSchools: TopSchool[];
    categoryDistribution: CategoryDist[];
    recentOrders: Order[];
}

export default function Dashboard({
    metrics,
    monthlyTrends,
    topSchools,
    categoryDistribution,
    recentOrders,
}: DashboardProps) {
    const formatRp = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    // Monthly Bar Chart Data
    const barChartData = {
        labels: monthlyTrends.map((t) => t.month),
        datasets: [
            {
                label: 'Pendapatan Bruto',
                data: monthlyTrends.map((t) => t.bruto),
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderRadius: 6,
            },
            {
                label: 'Belanja Modal (HPP)',
                data: monthlyTrends.map((t) => t.cost),
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderRadius: 6,
            },
            {
                label: 'Laba Kotor',
                data: monthlyTrends.map((t) => t.profit),
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderRadius: 6,
            },
        ],
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#94a3b8',
                    font: { family: 'Plus Jakarta Sans', size: 12 },
                    boxWidth: 12,
                    usePointStyle: true,
                },
            },
            tooltip: {
                backgroundColor: '#0f172a',
                titleColor: '#ffffff',
                bodyColor: '#e2e8f0',
                borderColor: '#334155',
                borderWidth: 1,
                callbacks: {
                    label: function (context: any) {
                        return `${context.dataset.label}: ${formatRp(context.raw)}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: { color: 'rgba(51, 65, 85, 0.3)' },
                ticks: { color: '#64748b' },
            },
            y: {
                grid: { color: 'rgba(51, 65, 85, 0.3)' },
                ticks: {
                    color: '#64748b',
                    callback: (value: any) => 'Rp ' + (value / 1000000) + ' Jt',
                },
            },
        },
    };

    // Category Doughnut Data
    const doughnutData = {
        labels: categoryDistribution.map((c) => c.category),
        datasets: [
            {
                data: categoryDistribution.map((c) => c.amount),
                backgroundColor: [
                    'rgba(99, 102, 241, 0.85)',
                    'rgba(14, 165, 233, 0.85)',
                    'rgba(245, 158, 11, 0.85)',
                    'rgba(16, 185, 129, 0.85)',
                ],
                borderColor: '#0f172a',
                borderWidth: 2,
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: '#94a3b8',
                    font: { family: 'Plus Jakarta Sans', size: 11 },
                    boxWidth: 10,
                },
            },
            tooltip: {
                backgroundColor: '#0f172a',
                titleColor: '#ffffff',
                callbacks: {
                    label: function (context: any) {
                        return `${context.label}: ${formatRp(context.raw)}`;
                    },
                },
            },
        },
    };

    return (
        <AppLayout
            title="Dashboard Overview"
            subtitle="Ringkasan Kinerja Keuangan & Transaksi SIPLah CV Tihani Mafaza"
        >
            {/* Primary KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <KpiCard
                    title="Total Pendapatan Bruto"
                    value={formatRp(metrics.totalRevenue)}
                    subtitle={`${metrics.totalOrders} Pesanan Terdaftar`}
                    icon={DollarSign}
                    color="indigo"
                    badgeText="SIPLah Kemdikbud"
                    badgePositive={true}
                />
                <KpiCard
                    title="Belanja Modal (HPP)"
                    value={formatRp(metrics.totalCost)}
                    subtitle="Pengadaan Barang Rekanan"
                    icon={Layers}
                    color="rose"
                    badgeText="Modal Kerja"
                />
                <KpiCard
                    title="Laba Kotor Perusahaan"
                    value={formatRp(metrics.grossProfit)}
                    subtitle={`Margin Rata-rata ${metrics.marginPercentage}%`}
                    icon={TrendingUp}
                    color="emerald"
                    badgeText={`${metrics.marginPercentage}% Margin`}
                    badgePositive={metrics.marginPercentage >= 15}
                />
                <KpiCard
                    title="Realisasi Dana Cair"
                    value={formatRp(metrics.totalDisbursed)}
                    subtitle={`Piutang BOS: ${formatRp(metrics.totalPendingDisbursement)}`}
                    icon={Wallet}
                    color="sky"
                    badgeText="Rekening BJB"
                    badgePositive={true}
                />
            </div>

            {/* Secondary Tax & Operational Metrics Banner */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <ReceiptText className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white">Ringkasan Kewajiban & Potongan Pajak SIPLah</h4>
                        <p className="text-xs text-slate-400">
                            Pajak otomatis dipungut oleh pihak SIPLah / Sekolah Pemungut BOS
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                    <div>
                        <span className="text-xs text-slate-400 block">PPh Pasal 22 (1.5%)</span>
                        <span className="font-bold font-mono text-amber-400">{formatRp(metrics.totalPph22)}</span>
                    </div>
                    <div className="h-8 w-px bg-slate-800" />
                    <div>
                        <span className="text-xs text-slate-400 block">PPN (11%)</span>
                        <span className="font-bold font-mono text-sky-400">{formatRp(metrics.totalPpn)}</span>
                    </div>
                    <div className="h-8 w-px bg-slate-800" />
                    <div>
                        <span className="text-xs text-slate-400 block">Total Potongan Pajak</span>
                        <span className="font-bold font-mono text-white">
                            {formatRp(metrics.totalPph22 + metrics.totalPpn)}
                        </span>
                    </div>
                    <Link
                        href="/reports/tax"
                        className="rounded-xl bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all flex items-center gap-1.5"
                    >
                        <span>Lihat Buku Pajak</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Trend Chart */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-bold text-white">Tren Pendapatan & Profit Bulanan</h3>
                            <p className="text-xs text-slate-400">Distribusi puncak pengadaan dana BOS (Tahun Berjalan)</p>
                        </div>
                        <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                            Jan - Des
                        </span>
                    </div>
                    <div className="h-72 w-full">
                        <Bar data={barChartData} options={barChartOptions} />
                    </div>
                </div>

                {/* Category Doughnut Chart */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-bold text-white">Distribusi Kategori Produk</h3>
                        <p className="text-xs text-slate-400">Komposisi pengadaan barang SIPLah</p>
                    </div>
                    <div className="h-60 w-full my-3 flex items-center justify-center">
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                    <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Kategori Aktif: {categoryDistribution.length}</span>
                        <Link href="/reports/margin" className="text-indigo-400 hover:underline">
                            Rincian Margin &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Top Schools & Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Schools */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <School className="w-4 h-4 text-indigo-400" />
                            <h3 className="text-base font-bold text-white">Sekolah Pelanggan Terbesar</h3>
                        </div>
                        <Link href="/customers" className="text-xs text-indigo-400 hover:underline">
                            Lihat Semua
                        </Link>
                    </div>

                    <div className="space-y-3.5">
                        {topSchools.map((school, index) => (
                            <div
                                key={school.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 hover:border-slate-700 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold font-mono">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <h5 className="text-xs font-bold text-white truncate max-w-[170px]">
                                            {school.name}
                                        </h5>
                                        <p className="text-[11px] text-slate-400">{school.orders_count} Transaksi Pesanan</p>
                                    </div>
                                </div>
                                <span className="text-xs font-mono font-semibold text-emerald-400">
                                    {formatRp(school.total_revenue)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Orders Table */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-bold text-white">Pesanan SIPLah Terbaru</h3>
                            <p className="text-xs text-slate-400">Status pencairan dana BOS dan transaksi terkini</p>
                        </div>
                        <Link
                            href="/orders"
                            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300"
                        >
                            <span>Kelola Pesanan</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="pb-3">No Pesanan</th>
                                    <th className="pb-3">Sekolah</th>
                                    <th className="pb-3 text-right">Nilai Bruto</th>
                                    <th className="pb-3 text-right">Net Cair</th>
                                    <th className="pb-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="py-3 font-mono font-semibold text-indigo-300">
                                            {order.siplah_order_id}
                                            <span className="block text-[10px] text-slate-400 font-sans">
                                                {order.order_date as string}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <p className="font-semibold text-white">{order.customer?.name}</p>
                                        </td>
                                        <td className="py-3 text-right font-mono font-medium text-slate-200">
                                            {formatRp(order.total_bruto)}
                                        </td>
                                        <td className="py-3 text-right font-mono font-bold text-emerald-400">
                                            {order.transaction
                                                ? formatRp(order.transaction.net_disbursement)
                                                : formatRp(order.total_bruto)}
                                        </td>
                                        <td className="py-3 text-center">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${order.status === 'selesai'
                                                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                                        : order.status === 'menunggu_pencairan'
                                                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                                            : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                                                    }`}
                                            >
                                                {order.status === 'selesai'
                                                    ? 'Cair / Selesai'
                                                    : order.status === 'menunggu_pencairan'
                                                        ? 'Menunggu Cair'
                                                        : 'Diproses'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}