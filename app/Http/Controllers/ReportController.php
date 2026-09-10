<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Services\AccountingReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportController extends Controller
{
    public function __construct(
        protected AccountingReportService $reportService
    ) {}

    public function sales(Request $request): Response
    {
        $filters = $request->only(['start_date', 'end_date', 'customer_id', 'status', 'category']);
        $reportData = $this->reportService->getSalesReport($filters);
        $customers = Customer::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Reports/SalesReport', [
            'reportData' => $reportData,
            'customers' => $customers,
            'filters' => $filters,
        ]);
    }

    public function margin(Request $request): Response
    {
        $filters = $request->only(['start_date', 'end_date', 'category']);
        $reportData = $this->reportService->getMarginReport($filters);

        return Inertia::render('Reports/MarginReport', [
            'reportData' => $reportData,
            'filters' => $filters,
        ]);
    }

    public function cashFlow(Request $request): Response
    {
        $filters = $request->only(['start_date', 'end_date']);
        $reportData = $this->reportService->getCashFlowReport($filters);

        return Inertia::render('Reports/CashFlowReport', [
            'reportData' => $reportData,
            'filters' => $filters,
        ]);
    }

    public function tax(Request $request): Response
    {
        $filters = $request->only(['start_date', 'end_date']);
        $reportData = $this->reportService->getTaxReport($filters);

        return Inertia::render('Reports/TaxReport', [
            'reportData' => $reportData,
            'filters' => $filters,
        ]);
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $type = $request->input('type', 'sales');
        $filters = $request->except(['type']);

        $data = match ($type) {
            'margin' => $this->reportService->getMarginReport($filters),
            'cash_flow' => $this->reportService->getCashFlowReport($filters),
            'tax' => $this->reportService->getTaxReport($filters),
            default => $this->reportService->getSalesReport($filters),
        };

        $filePath = $this->reportService->exportExcel($type, $data);
        $filename = "Laporan_{$type}_CV_Tihani_Mafaza_" . date('Ymd_His') . ".xlsx";

        return response()->download($filePath, $filename)->deleteFileAfterSend(true);
    }

    public function exportPdf(Request $request)
    {
        $type = $request->input('type', 'sales');
        $filters = $request->except(['type']);

        $data = match ($type) {
            'margin' => $this->reportService->getMarginReport($filters),
            'cash_flow' => $this->reportService->getCashFlowReport($filters),
            'tax' => $this->reportService->getTaxReport($filters),
            default => $this->reportService->getSalesReport($filters),
        };

        $pdf = Pdf::loadView('reports.pdf', [
            'type' => $type,
            'data' => $data,
            'title' => 'Laporan ' . ucwords(str_replace('_', ' ', $type)),
            'date' => date('d/m/Y H:i'),
        ])->setPaper('a4', 'landscape');

        return $pdf->download("Laporan_{$type}_CV_Tihani_Mafaza.pdf");
    }
}
