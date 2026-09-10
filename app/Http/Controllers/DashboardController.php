<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentDisbursement;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalOrders = Order::count();
        $completedOrders = Order::where('status', 'selesai')->count();
        $totalBruto = (float)Order::sum('total_bruto');
        $totalCost = (float)Order::sum('total_cost');
        $grossProfit = (float)Order::sum('gross_profit');
        $marginPercentage = $totalBruto > 0 ? round(($grossProfit / $totalBruto) * 100, 2) : 0;

        $totalDisbursed = (float)PaymentDisbursement::where('status', 'cair')->sum('amount');
        $totalPendingDisbursement = (float)Order::whereIn('status', ['diproses', 'menunggu_pencairan'])
            ->sum('total_bruto');

        $totalPph22 = (float)Transaction::sum('tax_pph22');
        $totalPpn = (float)Transaction::sum('tax_ppn');

        // Monthly trends for current year
        $monthlyTrends = [];
        for ($m = 1; $m <= 12; $m++) {
            $monthDate = Carbon::create(Carbon::now()->year, $m, 1);
            $monthName = $monthDate->translatedFormat('M');

            $mBruto = (float)Order::whereYear('order_date', $monthDate->year)
                ->whereMonth('order_date', $m)
                ->sum('total_bruto');

            $mCost = (float)Order::whereYear('order_date', $monthDate->year)
                ->whereMonth('order_date', $m)
                ->sum('total_cost');

            $mProfit = (float)Order::whereYear('order_date', $monthDate->year)
                ->whereMonth('order_date', $m)
                ->sum('gross_profit');

            $monthlyTrends[] = [
                'month' => $monthName,
                'bruto' => $mBruto,
                'cost' => $mCost,
                'profit' => $mProfit,
            ];
        }

        // Top 5 Schools by Gross Volume
        $topSchools = Customer::withCount('orders')
            ->withSum('orders', 'total_bruto')
            ->orderBy('orders_sum_total_bruto', 'desc')
            ->take(5)
            ->get()
            ->map(function ($cust) {
                return [
                    'id' => $cust->id,
                    'name' => $cust->name,
                    'npsn' => $cust->npsn,
                    'orders_count' => $cust->orders_count,
                    'total_revenue' => (float)($cust->orders_sum_total_bruto ?? 0),
                ];
            });

        // Category distribution
        $categories = OrderItem::selectRaw('category, SUM(subtotal_bruto) as total_amount, COUNT(*) as items_count')
            ->groupBy('category')
            ->get()
            ->map(function ($item) {
                return [
                    'category' => $item->category,
                    'amount' => (float)$item->total_amount,
                    'count' => (int)$item->items_count,
                ];
            });

        // Recent Orders
        $recentOrders = Order::with(['customer', 'transaction', 'disbursement'])
            ->orderBy('order_date', 'desc')
            ->take(6)
            ->get();

        return Inertia::render('Dashboard/Index', [
            'metrics' => [
                'totalRevenue' => $totalBruto,
                'totalCost' => $totalCost,
                'grossProfit' => $grossProfit,
                'marginPercentage' => $marginPercentage,
                'totalDisbursed' => $totalDisbursed,
                'totalPendingDisbursement' => $totalPendingDisbursement,
                'totalPph22' => $totalPph22,
                'totalPpn' => $totalPpn,
                'totalOrders' => $totalOrders,
                'completedOrders' => $completedOrders,
            ],
            'monthlyTrends' => $monthlyTrends,
            'topSchools' => $topSchools,
            'categoryDistribution' => $categories,
            'recentOrders' => $recentOrders,
        ]);
    }
}
