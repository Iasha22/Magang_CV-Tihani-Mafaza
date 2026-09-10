<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentDisbursement;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class AccountingReportService
{
    /**
     * 1. Laporan Penjualan (Sales Report)
     */
    public function getSalesReport(array $filters = []): array
    {
        $query = Order::with(['customer', 'items', 'transaction']);

        if (!empty($filters['start_date'])) {
            $query->whereDate('order_date', '>=', $filters['start_date']);
        }
        if (!empty($filters['end_date'])) {
            $query->whereDate('order_date', '<=', $filters['end_date']);
        }
        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['category'])) {
            $query->whereHas('items', function (Builder $q) use ($filters) {
                $q->where('category', $filters['category']);
            });
        }

        $orders = $query->orderBy('order_date', 'desc')->get();

        $totalRevenue = (float)$orders->sum('total_bruto');
        $totalCost = (float)$orders->sum('total_cost');
        $totalOrders = $orders->count();
        $avgOrderValue = $totalOrders > 0 ? round($totalRevenue / $totalOrders, 2) : 0;

        return [
            'filters' => $filters,
            'summary' => [
                'total_orders' => $totalOrders,
                'total_revenue' => $totalRevenue,
                'total_cost' => $totalCost,
                'avg_order_value' => $avgOrderValue,
            ],
            'orders' => $orders,
        ];
    }

    /**
     * 2. Laporan Margin & Profitabilitas (Margin Report)
     */
    public function getMarginReport(array $filters = []): array
    {
        $salesData = $this->getSalesReport($filters);
        $orders = $salesData['orders'];

        $totalBruto = (float)$orders->sum('total_bruto');
        $totalCost = (float)$orders->sum('total_cost');
        $totalGrossProfit = (float)$orders->sum('gross_profit');
        $avgMarginPct = $totalBruto > 0 ? round(($totalGrossProfit / $totalBruto) * 100, 2) : 0;

        // Group by product category
        $categoryBreakdown = [];
        $itemsQuery = OrderItem::with('order');
        if (!empty($filters['start_date']) || !empty($filters['end_date'])) {
            $itemsQuery->whereHas('order', function ($q) use ($filters) {
                if (!empty($filters['start_date'])) $q->whereDate('order_date', '>=', $filters['start_date']);
                if (!empty($filters['end_date'])) $q->whereDate('order_date', '<=', $filters['end_date']);
            });
        }

        $items = $itemsQuery->get();
        foreach ($items->groupBy('category') as $category => $group) {
            $catBruto = (float)$group->sum('subtotal_bruto');
            $catCost = (float)$group->sum('subtotal_cost');
            $catProfit = (float)$group->sum('gross_profit');
            $catMargin = $catBruto > 0 ? round(($catProfit / $catBruto) * 100, 2) : 0;

            $categoryBreakdown[] = [
                'category' => $category,
                'total_qty' => $group->sum('qty'),
                'total_bruto' => $catBruto,
                'total_cost' => $catCost,
                'gross_profit' => $catProfit,
                'margin_percentage' => $catMargin,
            ];
        }

        return [
            'filters' => $filters,
            'summary' => [
                'total_bruto' => $totalBruto,
                'total_cost' => $totalCost,
                'total_gross_profit' => $totalGrossProfit,
                'avg_margin_percentage' => $avgMarginPct,
            ],
            'category_breakdown' => $categoryBreakdown,
            'orders' => $orders,
        ];
    }

    /**
     * 3. Laporan Arus Kas & Serah Terima Dana (Cash Flow Report)
     */
    public function getCashFlowReport(array $filters = []): array
    {
        $ordersQuery = Order::with(['customer', 'transaction', 'disbursement']);

        if (!empty($filters['start_date'])) {
            $ordersQuery->whereDate('order_date', '>=', $filters['start_date']);
        }
        if (!empty($filters['end_date'])) {
            $ordersQuery->whereDate('order_date', '<=', $filters['end_date']);
        }

        $orders = $ordersQuery->get();

        $totalDisbursed = 0;
        $totalPendingReceivable = 0;
        $totalPph22 = 0;
        $totalPpn = 0;
        $totalAdminFee = 0;
        $totalVaFee = 0;
        $totalBelanjaModal = 0;

        $rows = [];

        foreach ($orders as $order) {
            $tx = $order->transaction;
            $disb = $order->disbursement;

            $bruto = (float)$order->total_bruto;
            $modal = (float)$order->total_cost;
            $pph = $tx ? (float)$tx->tax_pph22 : 0;
            $ppn = $tx ? (float)$tx->tax_ppn : 0;
            $admin = $tx ? (float)$tx->admin_fee : 0;
            $va = $tx ? (float)$tx->va_fee : 0;
            $netExpected = $tx ? (float)$tx->net_disbursement : ($bruto - ($pph + $ppn + $admin + $va));
            $actualDisbursed = $disb ? (float)$disb->amount : 0;

            if ($disb && $disb->status === 'cair') {
                $totalDisbursed += $actualDisbursed;
            } else {
                $totalPendingReceivable += $netExpected;
            }

            $totalPph22 += $pph;
            $totalPpn += $ppn;
            $totalAdminFee += $admin;
            $totalVaFee += $va;
            $totalBelanjaModal += $modal;

            $rows[] = [
                'order_id' => $order->id,
                'siplah_order_id' => $order->siplah_order_id,
                'order_date' => $order->order_date->format('Y-m-d'),
                'disbursement_date' => $order->disbursement_date ? $order->disbursement_date->format('Y-m-d') : null,
                'school_name' => $order->customer?->name,
                'bruto' => $bruto,
                'belanja_modal' => $modal,
                'pph22' => $pph,
                'ppn' => $ppn,
                'fees' => $admin + $va,
                'net_expected' => $netExpected,
                'actual_cair' => $actualDisbursed,
                'is_cair' => $disb && $disb->status === 'cair',
            ];
        }

        $netCashFlow = $totalDisbursed - $totalBelanjaModal;

        return [
            'filters' => $filters,
            'summary' => [
                'total_disbursed' => $totalDisbursed,
                'total_pending_receivable' => $totalPendingReceivable,
                'total_belanja_modal' => $totalBelanjaModal,
                'net_cash_flow' => $netCashFlow,
                'total_pph22' => $totalPph22,
                'total_ppn' => $totalPpn,
                'total_fees' => $totalAdminFee + $totalVaFee,
            ],
            'rows' => $rows,
        ];
    }

    /**
     * 4. Laporan Perpajakan (Tax Report - PPh 22 & PPN)
     */
    public function getTaxReport(array $filters = []): array
    {
        $txQuery = Transaction::with(['order.customer']);

        if (!empty($filters['start_date'])) {
            $txQuery->whereDate('transaction_date', '>=', $filters['start_date']);
        }
        if (!empty($filters['end_date'])) {
            $txQuery->whereDate('transaction_date', '<=', $filters['end_date']);
        }

        $transactions = $txQuery->orderBy('transaction_date', 'desc')->get();

        $totalDpp = (float)$transactions->sum('bruto');
        $totalPph22 = (float)$transactions->sum('tax_pph22');
        $totalPpn = (float)$transactions->sum('tax_ppn');
        $totalTaxes = $totalPph22 + $totalPpn;

        // Group by month
        $monthlyBreakdown = [];
        foreach ($transactions->groupBy(fn ($t) => Carbon::parse($t->transaction_date)->format('Y-m')) as $month => $group) {
            $monthlyBreakdown[] = [
                'month' => $month,
                'month_name' => Carbon::createFromFormat('Y-m', $month)->translatedFormat('F Y'),
                'total_orders' => $group->count(),
                'dpp' => (float)$group->sum('bruto'),
                'pph22' => (float)$group->sum('tax_pph22'),
                'ppn' => (float)$group->sum('tax_ppn'),
                'total_tax' => (float)$group->sum('tax_pph22') + (float)$group->sum('tax_ppn'),
            ];
        }

        return [
            'filters' => $filters,
            'summary' => [
                'total_dpp' => $totalDpp,
                'total_pph22' => $totalPph22,
                'total_ppn' => $totalPpn,
                'total_taxes' => $totalTaxes,
                'transactions_count' => $transactions->count(),
            ],
            'monthly' => $monthlyBreakdown,
            'transactions' => $transactions,
        ];
    }

    /**
     * 5. Laporan Rekonsiliasi Finansial (Reconciliation Report)
     */
    public function getReconciliationReport(array $filters = []): array
    {
        $ordersQuery = Order::with(['customer', 'transaction', 'disbursement']);

        if (!empty($filters['start_date'])) {
            $ordersQuery->whereDate('order_date', '>=', $filters['start_date']);
        }
        if (!empty($filters['end_date'])) {
            $ordersQuery->whereDate('order_date', '<=', $filters['end_date']);
        }

        $orders = $ordersQuery->get();

        $records = [];
        $matchedCount = 0;
        $discrepancyCount = 0;
        $pendingCount = 0;

        foreach ($orders as $order) {
            $tx = $order->transaction;
            $disb = $order->disbursement;

            $bruto = (float)$order->total_bruto;
            $pph = $tx ? (float)$tx->tax_pph22 : 0;
            $ppn = $tx ? (float)$tx->tax_ppn : 0;
            $fees = $tx ? ((float)$tx->admin_fee + (float)$tx->va_fee) : 0;
            $expectedNet = $tx ? (float)$tx->net_disbursement : ($bruto - ($pph + $ppn + $fees));
            $actualAmount = $disb ? (float)$disb->amount : 0;

            $diff = round($actualAmount - $expectedNet, 2);

            $status = 'pending';
            if ($disb && $disb->status === 'cair') {
                if (abs($diff) < 1.0) {
                    $status = 'matched';
                    $matchedCount++;
                } else {
                    $status = 'discrepancy';
                    $discrepancyCount++;
                }
            } else {
                $pendingCount++;
            }

            $records[] = [
                'id' => $order->id,
                'siplah_order_id' => $order->siplah_order_id,
                'order_date' => $order->order_date->format('Y-m-d'),
                'disbursement_date' => $order->disbursement_date ? $order->disbursement_date->format('Y-m-d') : null,
                'school_name' => $order->customer?->name ?? 'Sekolah Mitra',
                'bruto' => $bruto,
                'tax_pph22' => $pph,
                'tax_ppn' => $ppn,
                'fees' => $fees,
                'expected_net' => $expectedNet,
                'actual_disbursement' => $actualAmount,
                'difference' => $diff,
                'status' => $status,
            ];
        }

        return [
            'summary' => [
                'total_records' => count($records),
                'matched' => $matchedCount,
                'discrepancy' => $discrepancyCount,
                'pending' => $pendingCount,
            ],
            'records' => $records,
        ];
    }

    /**
     * Generate Excel export for reports
     */
    public function exportExcel(string $type, array $data): string
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle(substr(strtoupper($type), 0, 30));

        // Company Header
        $sheet->setCellValue('A1', 'CV TIHANI MAFAZA - BANDUNG');
        $sheet->setCellValue('A2', 'SISTEM INFORMASI AKUNTANSI TERINTEGRASI SIPLAH');
        $sheet->setCellValue('A3', 'LAPORAN: ' . strtoupper(str_replace('_', ' ', $type)));
        $sheet->setCellValue('A4', 'Tanggal Cetak: ' . Carbon::now()->format('d/m/Y H:i'));

        $sheet->getStyle('A1:A3')->getFont()->setBold(true);
        $sheet->getStyle('A1')->getFont()->setSize(14);

        $rowIdx = 6;

        if ($type === 'sales') {
            $headers = ['No', 'No Pesanan SIPLah', 'Tanggal', 'Nama Sekolah', 'Total Bruto (Rp)', 'Belanja Modal (Rp)', 'Laba Kotor (Rp)', 'Margin (%)', 'Status'];
            $sheet->fromArray($headers, null, "A{$rowIdx}");
            $this->styleHeaderRow($sheet, "A{$rowIdx}:I{$rowIdx}");
            $rowIdx++;

            foreach ($data['orders'] as $i => $order) {
                $sheet->fromArray([
                    $i + 1,
                    $order->siplah_order_id,
                    $order->order_date->format('Y-m-d'),
                    $order->customer?->name,
                    $order->total_bruto,
                    $order->total_cost,
                    $order->gross_profit,
                    $order->margin_percentage . '%',
                    ucfirst($order->status),
                ], null, "A{$rowIdx}");
                $rowIdx++;
            }
        } elseif ($type === 'tax') {
            $headers = ['No', 'No Pesanan SIPLah', 'Tanggal', 'Sekolah / Pembeli', 'Dasar Pengenaan Pajak (Rp)', 'PPh Pasal 22 (1.5%)', 'PPN (11%)', 'Total Pajak Dipotong'];
            $sheet->fromArray($headers, null, "A{$rowIdx}");
            $this->styleHeaderRow($sheet, "A{$rowIdx}:H{$rowIdx}");
            $rowIdx++;

            foreach ($data['transactions'] as $i => $tx) {
                $totalTax = $tx->tax_pph22 + $tx->tax_ppn;
                $sheet->fromArray([
                    $i + 1,
                    $tx->order?->siplah_order_id,
                    $tx->transaction_date->format('Y-m-d'),
                    $tx->order?->customer?->name,
                    $tx->bruto,
                    $tx->tax_pph22,
                    $tx->tax_ppn,
                    $totalTax,
                ], null, "A{$rowIdx}");
                $rowIdx++;
            }
        } else {
            // General Cash Flow / Margin
            $headers = ['No', 'No Pesanan', 'Tanggal', 'Sekolah', 'Bruto', 'Belanja Modal', 'Net Pencairan', 'Status'];
            $sheet->fromArray($headers, null, "A{$rowIdx}");
            $this->styleHeaderRow($sheet, "A{$rowIdx}:H{$rowIdx}");
            $rowIdx++;

            if (isset($data['rows'])) {
                foreach ($data['rows'] as $i => $r) {
                    $sheet->fromArray([
                        $i + 1,
                        $r['siplah_order_id'],
                        $r['order_date'],
                        $r['school_name'],
                        $r['bruto'],
                        $r['belanja_modal'],
                        $r['net_expected'],
                        $r['is_cair'] ? 'Sudah Cair' : 'Pending',
                    ], null, "A{$rowIdx}");
                    $rowIdx++;
                }
            }
        }

        // Auto column width
        foreach (range('A', 'I') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $tempPath = storage_path('app/temp_export_' . uniqid() . '.xlsx');
        $writer = new Xlsx($spreadsheet);
        $writer->save($tempPath);

        return $tempPath;
    }

    protected function styleHeaderRow($sheet, string $range): void
    {
        $sheet->getStyle($range)->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E293B']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        ]);
    }
}
