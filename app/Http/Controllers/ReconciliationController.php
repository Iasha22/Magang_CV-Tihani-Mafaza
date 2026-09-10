<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\PaymentDisbursement;
use App\Models\ReconciliationLog;
use App\Services\AccountingReportService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReconciliationController extends Controller
{
    public function __construct(
        protected AccountingReportService $reportService
    ) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['start_date', 'end_date']);
        $reconciliationData = $this->reportService->getReconciliationReport($filters);

        return Inertia::render('Reconciliation/Index', [
            'reconciliationData' => $reconciliationData,
            'filters' => $filters,
        ]);
    }

    public function resolve(Request $request)
    {
        $validated = $request->validate([
            'order_id' => ['required', 'exists:orders,id'],
            'actual_amount' => ['required', 'numeric', 'min:0'],
            'disbursement_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $order = Order::with('transaction')->findOrFail($validated['order_id']);
        $expectedNet = $order->transaction ? $order->transaction->net_disbursement : $order->total_bruto;
        $diff = round($validated['actual_amount'] - $expectedNet, 2);

        // Update or create disbursement
        PaymentDisbursement::updateOrCreate(
            ['order_id' => $order->id],
            [
                'disbursement_date' => $validated['disbursement_date'],
                'amount' => $validated['actual_amount'],
                'bank_name' => 'BJB (CV Tihani Mafaza)',
                'reference_number' => 'RECON-' . $order->siplah_order_id,
                'status' => 'cair',
                'notes' => $validated['notes'],
            ]
        );

        $order->update([
            'disbursement_date' => $validated['disbursement_date'],
            'status' => 'selesai',
        ]);

        // Log reconciliation
        ReconciliationLog::create([
            'sync_date' => Carbon::now(),
            'siplah_order_id' => $order->siplah_order_id,
            'expected_amount' => $expectedNet,
            'actual_amount' => $validated['actual_amount'],
            'difference' => $diff,
            'status' => abs($diff) < 1.0 ? 'matched' : 'discrepancy',
            'notes' => $validated['notes'] ?? 'Rekonsiliasi manual diselesaikan',
        ]);

        return back()->with('success', 'Status rekonsiliasi berhasil diperbarui!');
    }
}
