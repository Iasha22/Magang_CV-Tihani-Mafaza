<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\ImportLog;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentDisbursement;
use App\Models\Product;
use App\Models\Transaction;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;

class SiplahParserService
{
    public function __construct(
        protected TaxCalculationService $taxService
    ) {}

    /**
     * Parse and preview file contents without committing to database
     */
    public function preview(string $filePath): array
    {
        $spreadsheet = IOFactory::load($filePath);
        $rows = $this->extractRowsFromSpreadsheet($spreadsheet);

        $previewData = [];
        $existingOrderIds = Order::pluck('siplah_order_id')->toArray();

        foreach ($rows as $index => $row) {
            $isDuplicate = in_array($row['siplah_order_id'], $existingOrderIds);
            $isValid = !empty($row['school_name']) && $row['bruto'] > 0;

            $previewData[] = [
                'row_number' => $index + 1,
                'siplah_order_id' => $row['siplah_order_id'],
                'order_date' => $row['order_date'],
                'disbursement_date' => $row['disbursement_date'],
                'school_name' => $row['school_name'],
                'item_description' => $row['item_description'],
                'category' => $row['category'],
                'bruto' => $row['bruto'],
                'belanja_modal' => $row['belanja_modal'],
                'pph22' => $row['pph22'],
                'ppn' => $row['ppn'],
                'admin_fee' => $row['admin_fee'],
                'va_fee' => $row['va_fee'],
                'net_disbursement' => $row['net_disbursement'],
                'gross_profit' => $row['gross_profit'],
                'margin_percentage' => $row['margin_percentage'],
                'is_duplicate' => $isDuplicate,
                'is_valid' => $isValid,
                'validation_message' => $isDuplicate
                    ? 'Nomor pesanan sudah terdaftar di sistem (akan diperbarui)'
                    : (!$isValid ? 'Data tidak lengkap (Sekolah atau Nilai Bruto kosong)' : 'Siap diimpor'),
            ];
        }

        return [
            'total_rows' => count($previewData),
            'valid_count' => count(array_filter($previewData, fn ($r) => $r['is_valid'])),
            'duplicate_count' => count(array_filter($previewData, fn ($r) => $r['is_duplicate'])),
            'total_bruto' => array_sum(array_column($previewData, 'bruto')),
            'total_belanja_modal' => array_sum(array_column($previewData, 'belanja_modal')),
            'rows' => $previewData,
        ];
    }

    /**
     * Commit parsed rows to database
     */
    public function import(string $filePath, ?int $userId = null): array
    {
        $spreadsheet = IOFactory::load($filePath);
        $rows = $this->extractRowsFromSpreadsheet($spreadsheet);

        $successCount = 0;
        $errorCount = 0;
        $totalBruto = 0;
        $errors = [];

        DB::beginTransaction();
        try {
            foreach ($rows as $index => $data) {
                try {
                    if (empty($data['school_name']) || $data['bruto'] <= 0) {
                        $errorCount++;
                        $errors[] = "Baris " . ($index + 1) . ": Nama sekolah atau bruto tidak valid.";
                        continue;
                    }

                    // 1. Find or create Customer (Sekolah)
                    $customer = Customer::firstOrCreate(
                        ['name' => trim($data['school_name'])],
                        [
                            'address' => 'Bandung, Jawa Barat',
                            'contact_person' => 'Bendahara BOS',
                        ]
                    );

                    // 2. Find or create Product
                    $category = $this->normalizeCategory($data['category']);
                    $product = Product::firstOrCreate(
                        ['name' => trim($data['item_description'])],
                        [
                            'category' => $category,
                            'unit' => 'paket',
                            'reference_price' => $data['bruto'],
                            'reference_cost' => $data['belanja_modal'],
                        ]
                    );

                    // 3. Create or update Order
                    $order = Order::updateOrCreate(
                        ['siplah_order_id' => $data['siplah_order_id']],
                        [
                            'order_date' => $data['order_date'],
                            'customer_id' => $customer->id,
                            'status' => !empty($data['disbursement_date']) ? 'selesai' : 'menunggu_pencairan',
                            'total_bruto' => $data['bruto'],
                            'total_cost' => $data['belanja_modal'],
                            'gross_profit' => $data['gross_profit'],
                            'margin_percentage' => $data['margin_percentage'],
                            'disbursement_date' => $data['disbursement_date'],
                            'notes' => 'Diimpor dari file SIPLah / Rekap CV Tihani',
                        ]
                    );

                    // 4. Order Item
                    OrderItem::updateOrCreate(
                        [
                            'order_id' => $order->id,
                            'product_name' => $data['item_description'],
                        ],
                        [
                            'product_id' => $product->id,
                            'category' => $category,
                            'qty' => 1,
                            'unit_price' => $data['bruto'],
                            'cost_price' => $data['belanja_modal'],
                            'subtotal_bruto' => $data['bruto'],
                            'subtotal_cost' => $data['belanja_modal'],
                            'gross_profit' => $data['gross_profit'],
                        ]
                    );

                    // 5. Transaction
                    Transaction::updateOrCreate(
                        ['order_id' => $order->id],
                        [
                            'transaction_date' => $data['order_date'],
                            'invoice_number' => 'INV-' . $order->siplah_order_id,
                            'bruto' => $data['bruto'],
                            'tax_pph22' => $data['pph22'],
                            'tax_ppn' => $data['ppn'],
                            'admin_fee' => $data['admin_fee'],
                            'va_fee' => $data['va_fee'],
                            'net_disbursement' => $data['net_disbursement'],
                            'notes' => 'Pencatatan transaksi SIPLah',
                        ]
                    );

                    // 6. Payment Disbursement
                    if (!empty($data['disbursement_date'])) {
                        PaymentDisbursement::updateOrCreate(
                            ['order_id' => $order->id],
                            [
                                'disbursement_date' => $data['disbursement_date'],
                                'amount' => $data['net_disbursement'],
                                'bank_name' => 'BJB (Rekening CV Tihani Mafaza)',
                                'reference_number' => 'CAIR-' . $order->siplah_order_id,
                                'status' => 'cair',
                                'notes' => 'Pencairan dana BOS via SIPLah',
                            ]
                        );
                    }

                    $totalBruto += $data['bruto'];
                    $successCount++;
                } catch (Exception $e) {
                    $errorCount++;
                    $errors[] = "Baris " . ($index + 1) . ": " . $e->getMessage();
                }
            }

            // Record in ImportLog
            ImportLog::create([
                'user_id' => $userId,
                'filename' => basename($filePath),
                'file_type' => pathinfo($filePath, PATHINFO_EXTENSION),
                'total_rows' => count($rows),
                'success_count' => $successCount,
                'error_count' => $errorCount,
                'total_bruto' => $totalBruto,
                'notes' => $errorCount > 0 ? implode('; ', array_slice($errors, 0, 3)) : 'Semua data berhasil diimpor',
            ]);

            DB::commit();

            return [
                'success' => true,
                'total_rows' => count($rows),
                'success_count' => $successCount,
                'error_count' => $errorCount,
                'total_bruto' => $totalBruto,
                'errors' => $errors,
            ];
        } catch (Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Gagal mengimpor file: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Extract uniform rows from various spreadsheet formats
     */
    protected function extractRowsFromSpreadsheet(Spreadsheet $spreadsheet): array
    {
        $sheetNames = $spreadsheet->getSheetNames();

        // Check if there is a 'Belanja Modal' or 'Data Transaksi' sheet
        $targetSheet = null;
        if (in_array('Belanja Modal', $sheetNames)) {
            $targetSheet = $spreadsheet->getSheetByName('Belanja Modal');
        } elseif (in_array('Data Transaksi', $sheetNames)) {
            $targetSheet = $spreadsheet->getSheetByName('Data Transaksi');
        } else {
            $targetSheet = $spreadsheet->getActiveSheet();
        }

        $rawRows = $targetSheet->toArray();
        if (empty($rawRows)) {
            return [];
        }

        // Find header row (usually row 0 or 1)
        $headerIndex = 0;
        $headerMap = [];

        foreach ($rawRows as $idx => $row) {
            $rowString = strtolower(implode(' ', array_filter($row, 'is_string')));
            if (
                str_contains($rowString, 'sekolah') ||
                str_contains($rowString, 'uraian') ||
                str_contains($rowString, 'bruto') ||
                str_contains($rowString, 'pesanan')
            ) {
                $headerIndex = $idx;
                foreach ($row as $colIdx => $colName) {
                    if ($colName !== null) {
                        $headerMap[strtolower(trim((string)$colName))] = $colIdx;
                    }
                }
                break;
            }
        }

        $parsedRows = [];
        $dataRows = array_slice($rawRows, $headerIndex + 1);

        foreach ($dataRows as $i => $row) {
            // Check if row has data
            if (empty(array_filter($row))) {
                continue;
            }

            $orderDateVal = $this->getColumnValue($row, $headerMap, ['tgl pesanan', 'tgl pesan', 'tanggal pesanan', 'tanggal', 'order date']);
            $disbursementDateVal = $this->getColumnValue($row, $headerMap, ['tgl pencairan', 'tanggal pencairan', 'tgl cair', 'disbursement date']);
            $description = $this->getColumnValue($row, $headerMap, ['uraian', 'uraian barang', 'nama barang', 'deskripsi', 'item', 'produk']);
            $school = $this->getColumnValue($row, $headerMap, ['sekolah', 'nama sekolah', 'customer', 'instansi']);
            $category = $this->getColumnValue($row, $headerMap, ['kategori', 'category']);
            $siplahId = $this->getColumnValue($row, $headerMap, ['no', 'no pesanan', 'nomor pesanan', 'id pesanan', 'order id']);

            $bruto = $this->parseNumeric($this->getColumnValue($row, $headerMap, ['bruto', 'harga jual', 'total', 'nilai pesanan']));
            $belanjaModal = $this->parseNumeric($this->getColumnValue($row, $headerMap, ['belanja modal', 'modal', 'hpp', 'biaya modal', 'harga modal']));
            $ppn = $this->parseNumeric($this->getColumnValue($row, $headerMap, ['ppn']));
            $pph22 = $this->parseNumeric($this->getColumnValue($row, $headerMap, ['pph 22', 'pph22', 'pph']));
            $admin = $this->parseNumeric($this->getColumnValue($row, $headerMap, ['admin', 'fee admin', 'biaya admin']));
            $va = $this->parseNumeric($this->getColumnValue($row, $headerMap, ['va', 'fee va', 'biaya va']));

            // Auto calculations if values were zero or missing in raw file
            if ($belanjaModal <= 0 && $bruto > 0) {
                // If Belanja Modal not provided, estimate default 80% of Bruto
                $belanjaModal = round($bruto * 0.80, 2);
            }

            if ($ppn <= 0 && $bruto > 0) {
                $ppn = $this->taxService->calculatePPN($bruto);
            }

            if ($pph22 <= 0 && $bruto >= TaxCalculationService::PPH22_THRESHOLD) {
                $pph22 = $this->taxService->calculatePPh22($bruto, true);
            }

            $grossProfit = $this->taxService->calculateGrossProfit($bruto, $belanjaModal);
            $marginPct = $this->taxService->calculateMarginPercentage($grossProfit, $bruto);
            $netDisbursement = $this->taxService->calculateNetDisbursement($bruto, $pph22, $ppn, $admin, $va);

            $orderDate = $this->parseDate($orderDateVal);
            $disbursementDate = $this->parseDate($disbursementDateVal);

            // Clean or generate Order ID
            $cleanOrderId = !empty($siplahId) && strlen(trim($siplahId)) > 2 && !is_numeric($siplahId)
                ? trim($siplahId)
                : 'SIP-' . ($orderDate ? date('Ym', strtotime($orderDate)) : '202609') . '-' . str_pad((string)($i + 1), 4, '0', STR_PAD_LEFT);

            $parsedRows[] = [
                'siplah_order_id' => $cleanOrderId,
                'order_date' => $orderDate ?? Carbon::now()->toDateString(),
                'disbursement_date' => $disbursementDate,
                'school_name' => !empty($school) ? trim($school) : 'SD/SMP Mitra Bandung',
                'item_description' => !empty($description) ? trim($description) : 'Pengadaan Barang SIPLah',
                'category' => !empty($category) ? trim($category) : $this->detectCategory($description),
                'bruto' => $bruto,
                'belanja_modal' => $belanjaModal,
                'pph22' => $pph22,
                'ppn' => $ppn,
                'admin_fee' => $admin,
                'va_fee' => $va,
                'gross_profit' => $grossProfit,
                'margin_percentage' => $marginPct,
                'net_disbursement' => $netDisbursement,
            ];
        }

        return $parsedRows;
    }

    protected function getColumnValue(array $row, array $headerMap, array $possibleNames): ?string
    {
        foreach ($possibleNames as $name) {
            if (isset($headerMap[$name]) && isset($row[$headerMap[$name]])) {
                return (string)$row[$headerMap[$name]];
            }
        }
        return null;
    }

    protected function parseNumeric(?string $val): float
    {
        if ($val === null || trim($val) === '') {
            return 0.0;
        }

        // Remove Rp, spaces, and commas/dots
        $cleaned = trim(str_replace(['Rp', 'rp', 'RP', ' '], '', $val));

        // Format: 1.000.000,00 -> 1000000.00
        if (preg_match('/\.\d{3}/', $cleaned) && str_contains($cleaned, ',')) {
            $cleaned = str_replace('.', '', $cleaned);
            $cleaned = str_replace(',', '.', $cleaned);
        } elseif (preg_match('/\.\d{3}/', $cleaned) && !str_contains($cleaned, ',')) {
            $cleaned = str_replace('.', '', $cleaned);
        } elseif (str_contains($cleaned, ',')) {
            $cleaned = str_replace(',', '', $cleaned);
        }

        return (float)filter_var($cleaned, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION) ?: 0.0;
    }

    protected function parseDate(?string $val): ?string
    {
        if ($val === null || trim($val) === '') {
            return null;
        }

        try {
            // Check Excel serial number
            if (is_numeric($val) && (float)$val > 30000) {
                return Carbon::createFromTimestamp(((float)$val - 25569) * 86400)->toDateString();
            }

            return Carbon::parse(trim($val))->toDateString();
        } catch (Exception) {
            return null;
        }
    }

    protected function detectCategory(?string $description): string
    {
        if (empty($description)) {
            return 'ATK';
        }

        $desc = strtolower($description);
        if (str_contains($desc, 'buku') || str_contains($desc, 'modul') || str_contains($desc, 'kamus')) {
            return 'Buku';
        }
        if (str_contains($desc, 'laptop') || str_contains($desc, 'pc') || str_contains($desc, 'komputer') || str_contains($desc, 'proyektor') || str_contains($desc, 'printer')) {
            return 'Elektronik';
        }
        if (str_contains($desc, 'meja') || str_contains($desc, 'kursi') || str_contains($desc, 'lemari') || str_contains($desc, 'papan tulis')) {
            return 'Furniture';
        }

        return 'ATK';
    }

    protected function normalizeCategory(?string $category): string
    {
        if (empty($category)) {
            return 'ATK';
        }

        $cat = strtolower(trim($category));
        if (str_contains($cat, 'buku')) return 'Buku';
        if (str_contains($cat, 'elektronik') || str_contains($cat, 'komputer')) return 'Elektronik';
        if (str_contains($cat, 'furniture') || str_contains($cat, 'mebel')) return 'Furniture';

        return 'ATK';
    }
}
