<?php

namespace App\Http\Controllers;

use App\Models\ImportLog;
use App\Services\SiplahParserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SiplahImportController extends Controller
{
    public function __construct(
        protected SiplahParserService $parserService
    ) {}

    public function index(): Response
    {
        $importLogs = ImportLog::with('user')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return Inertia::render('Integration/Import', [
            'importLogs' => $importLogs,
        ]);
    }

    public function preview(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
        ]);

        $file = $request->file('file');
        $tempPath = $file->storeAs('temp_uploads', 'preview_' . uniqid() . '.' . $file->getClientOriginalExtension());
        $fullPath = storage_path('app/' . $tempPath);

        try {
            $previewResult = $this->parserService->preview($fullPath);
            return response()->json([
                'success' => true,
                'temp_file' => $tempPath,
                'data' => $previewResult,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membaca file: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function commit(Request $request)
    {
        $request->validate([
            'file' => ['nullable', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
            'temp_file' => ['nullable', 'string'],
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $tempPath = $file->storeAs('temp_uploads', 'import_' . uniqid() . '.' . $file->getClientOriginalExtension());
            $fullPath = storage_path('app/' . $tempPath);
        } elseif ($request->filled('temp_file')) {
            $fullPath = storage_path('app/' . $request->input('temp_file'));
        } else {
            return back()->with('error', 'Tidak ada file yang dipilih untuk diimpor.');
        }

        if (!file_exists($fullPath)) {
            return back()->with('error', 'File tidak ditemukan di server.');
        }

        $result = $this->parserService->import($fullPath, Auth::id());

        // Clean up temp file
        @unlink($fullPath);

        if ($result['success']) {
            return redirect()->route('dashboard')->with(
                'success',
                "Berhasil mengimpor {$result['success_count']} transaksi SIPLah ke pembukuan! Total Bruto: Rp " . number_format($result['total_bruto'], 0, ',', '.')
            );
        }

        return back()->with('error', $result['message'] ?? 'Terjadi kesalahan saat memproses data.');
    }

    /**
     * Download template Excel untuk pengisian transaksi SIPLah CV Tihani Mafaza
     */
    public function downloadTemplate(): BinaryFileResponse
    {
        $spreadsheet = new Spreadsheet();

        // Sheet 1: Belanja Modal (Format Riil CV Tihani Mafaza)
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Belanja Modal');

        $headers = [
            'No', 'Tgl Pesan', 'Tgl Pencairan', 'Uraian', 'Bruto', 
            'Belanja Modal', 'Harga Jual', 'Laba Kotor', 'PPN', 
            'PPH 22', 'VA', 'Admin', 'Sekolah', 'CV'
        ];
        $sheet->fromArray($headers, null, 'A1');

        $sampleData = [
            [1, '2026-02-15', '2026-03-02', 'Buku Paket Siswa Tematik Semester 2', 4500000, 3600000, 4500000, 900000, 495000, 67500, 3500, 25000, 'SDN 01 Sukajadi Bandung', 'CV Tihani Mafaza'],
            [2, '2026-02-20', '2026-03-10', 'Pengadaan Kertas HVS A4 75gr & Tinta Printer', 2800000, 2240000, 2800000, 560000, 308000, 42000, 3500, 20000, 'SMPN 03 Bandung', 'CV Tihani Mafaza'],
            [3, '2026-03-05', '2026-03-22', 'Meja & Kursi Siswa Kayu Jati Set (10 Unit)', 8500000, 6800000, 8500000, 1700000, 935000, 127500, 5000, 35000, 'SDN 12 Babakan Ciparay', 'CV Tihani Mafaza'],
            [4, '2026-03-18', '', 'Proyektor Epson EB-E500 + Layar Tripod', 6200000, 5200000, 6200000, 1000000, 682000, 93000, 3500, 30000, 'SMP Mandiri Bandung', 'CV Tihani Mafaza'],
        ];
        $sheet->fromArray($sampleData, null, 'A2');

        foreach (range('A', 'N') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $tempPath = storage_path('app/template_siplah_cv_tihani.xlsx');
        $writer = new Xlsx($spreadsheet);
        $writer->save($tempPath);

        return response()->download($tempPath, 'Template_SIPLah_CV_Tihani_Mafaza.xlsx')->deleteFileAfterSend(true);
    }
}
