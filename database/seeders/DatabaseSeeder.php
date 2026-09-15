<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentDisbursement;
use App\Models\Product;
use App\Models\ReconciliationLog;
use App\Models\Transaction;
use App\Models\User;
use App\Services\TaxCalculationService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $taxService = new TaxCalculationService;

        // 1. Pengguna Sistem (Users)
        User::create([
            'name' => 'Iasha Tsamrotul Fuadi',
            'email' => 'admin@tihani.id',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Direktur CV Tihani Mafaza',
            'email' => 'direktur@tihani.id',
            'password' => Hash::make('direktur123'),
            'role' => 'direktur',
        ]);

        // 2. Data Master Pelanggan (Sekolah di Bandung)
        $schools = [
            ['npsn' => '20219410', 'name' => 'SDN 01 Sukajadi Bandung', 'address' => 'Jl. Sukajadi No. 142, Bandung', 'contact_person' => 'Ibu Heni (Bendahara BOS)', 'phone' => '081223456781', 'npwp' => '00.123.456.7-428.000'],
            ['npsn' => '20219425', 'name' => 'SMPN 03 Bandung', 'address' => 'Jl. R.E. Martadinata No. 85, Bandung', 'contact_person' => 'Bpk. Dedi Haryadi', 'phone' => '081334567892', 'npwp' => '00.234.567.8-428.000'],
            ['npsn' => '20219438', 'name' => 'SDN 12 Babakan Ciparay', 'address' => 'Jl. Soekarno-Hatta No. 210, Bandung', 'contact_person' => 'Ibu Nenden Kurniasih', 'phone' => '085211223344', 'npwp' => '00.345.678.9-428.000'],
            ['npsn' => '20219450', 'name' => 'SMP Mandiri Bandung', 'address' => 'Jl. Terusan Buah Batu No. 45, Bandung', 'contact_person' => 'Bpk. Asep Saepudin', 'phone' => '087799887766', 'npwp' => '00.456.789.0-428.000'],
            ['npsn' => '20219462', 'name' => 'SDN 05 Cibeunying Kaler', 'address' => 'Jl. Cigadung Raya No. 12, Bandung', 'contact_person' => 'Ibu Rina Marlina', 'phone' => '081987654321', 'npwp' => '00.567.890.1-428.000'],
            ['npsn' => '20219475', 'name' => 'SMPN 14 Bandung', 'address' => 'Jl. Lapangan Supratman No. 22, Bandung', 'contact_person' => 'Bpk. Wahyu Pratama', 'phone' => '081321456987', 'npwp' => '00.678.901.2-428.000'],
            ['npsn' => '20219488', 'name' => 'SDN 08 Coblong', 'address' => 'Jl. Dago No. 98, Bandung', 'contact_person' => 'Ibu Siti Aminah', 'phone' => '082154326789', 'npwp' => '00.789.012.3-428.000'],
            ['npsn' => '20219499', 'name' => 'SMP Pasundan 2 Bandung', 'address' => 'Jl. Pasirkaliki No. 67, Bandung', 'contact_person' => 'Bpk. Cecep Solihin', 'phone' => '085312345678', 'npwp' => '00.890.123.4-428.000'],
        ];

        $customerModels = [];
        foreach ($schools as $s) {
            $customerModels[] = Customer::create($s);
        }

        // 3. Data Master Produk & Kategori
        $products = [
            // ATK
            ['sku' => 'ATK-001', 'name' => 'Kertas HVS A4 75gr Sinar Dunia (Box)', 'category' => 'ATK', 'unit' => 'box', 'reference_price' => 245000, 'reference_cost' => 195000],
            ['sku' => 'ATK-002', 'name' => 'Tinta Botol Printer Epson 003 (Black, Cyan, Magenta, Yellow)', 'category' => 'ATK', 'unit' => 'set', 'reference_price' => 380000, 'reference_cost' => 310000],
            ['sku' => 'ATK-003', 'name' => 'Paket ATK Administrasi Sekolah & Spidol Boardmarker', 'category' => 'ATK', 'unit' => 'paket', 'reference_price' => 1500000, 'reference_cost' => 1150000],
            // Elektronik
            ['sku' => 'ELK-001', 'name' => 'Laptop Chromebook Acer C733 untuk Laboratorium Komputer', 'category' => 'Elektronik', 'unit' => 'unit', 'reference_price' => 5800000, 'reference_cost' => 4950000],
            ['sku' => 'ELK-002', 'name' => 'Proyektor Epson EB-E500 + Layar Tripod 70 inch', 'category' => 'Elektronik', 'unit' => 'unit', 'reference_price' => 6400000, 'reference_cost' => 5350000],
            ['sku' => 'ELK-003', 'name' => 'Printer Multifungsi Epson EcoTank L3210 (Print/Scan/Copy)', 'category' => 'Elektronik', 'unit' => 'unit', 'reference_price' => 2750000, 'reference_cost' => 2300000],
            // Furniture
            ['sku' => 'FRN-001', 'name' => 'Set Meja Kursi Siswa Kayu Jati Rangka Besi (10 Set)', 'category' => 'Furniture', 'unit' => 'paket', 'reference_price' => 8500000, 'reference_cost' => 6800000],
            ['sku' => 'FRN-002', 'name' => 'Lemari Arsip Kantor Sekolah 2 Pintu Kaca', 'category' => 'Furniture', 'unit' => 'unit', 'reference_price' => 2600000, 'reference_cost' => 2050000],
            ['sku' => 'FRN-003', 'name' => 'Papan Tulis Whiteboard Magnetik 120 x 240 cm + Stand', 'category' => 'Furniture', 'unit' => 'unit', 'reference_price' => 1350000, 'reference_cost' => 1050000],
            // Buku
            ['sku' => 'BKU-001', 'name' => 'Buku Siswa & Guru Kurikulum Merdeka Fase A/B SD', 'category' => 'Buku', 'unit' => 'paket', 'reference_price' => 4750000, 'reference_cost' => 3800000],
            ['sku' => 'BKU-002', 'name' => 'Paket Pengayaan Perpustakaan Sekolah & Literasi Siswa', 'category' => 'Buku', 'unit' => 'paket', 'reference_price' => 7200000, 'reference_cost' => 5600000],
            ['sku' => 'BKU-003', 'name' => 'Kamus Lengkap Bahasa Indonesia & Kamus Basa Sunda Sekolah', 'category' => 'Buku', 'unit' => 'paket', 'reference_price' => 1850000, 'reference_cost' => 1400000],
        ];

        $productModels = [];
        foreach ($products as $p) {
            $productModels[] = Product::create($p);
        }

        // 4. Data Transaksi Pengadaan SIPLah Realistis (Puncak BOS Feb-Mei & Berjalan)
        $sampleOrders = [
            [
                'order_date' => '2026-02-12',
                'disbursement_date' => '2026-02-28',
                'customer_idx' => 0,
                'items' => [
                    ['product_idx' => 9, 'qty' => 1, 'price' => 4750000, 'cost' => 3800000],
                ],
                'status' => 'selesai',
                'admin_fee' => 25000,
                'va_fee' => 3500,
            ],
            [
                'order_date' => '2026-02-18',
                'disbursement_date' => '2026-03-05',
                'customer_idx' => 1,
                'items' => [
                    ['product_idx' => 0, 'qty' => 10, 'price' => 2450000, 'cost' => 1950000],
                    ['product_idx' => 1, 'qty' => 2, 'price' => 760000, 'cost' => 620000],
                ],
                'status' => 'selesai',
                'admin_fee' => 20000,
                'va_fee' => 3500,
            ],
            [
                'order_date' => '2026-03-02',
                'disbursement_date' => '2026-03-20',
                'customer_idx' => 2,
                'items' => [
                    ['product_idx' => 6, 'qty' => 1, 'price' => 8500000, 'cost' => 6800000],
                ],
                'status' => 'selesai',
                'admin_fee' => 35000,
                'va_fee' => 5000,
            ],
            [
                'order_date' => '2026-03-14',
                'disbursement_date' => '2026-03-30',
                'customer_idx' => 3,
                'items' => [
                    ['product_idx' => 4, 'qty' => 1, 'price' => 6400000, 'cost' => 5350000],
                    ['product_idx' => 8, 'qty' => 1, 'price' => 1350000, 'cost' => 1050000],
                ],
                'status' => 'selesai',
                'admin_fee' => 40000,
                'va_fee' => 5000,
            ],
            [
                'order_date' => '2026-04-05',
                'disbursement_date' => '2026-04-22',
                'customer_idx' => 4,
                'items' => [
                    ['product_idx' => 3, 'qty' => 2, 'price' => 11600000, 'cost' => 9900000],
                ],
                'status' => 'selesai',
                'admin_fee' => 50000,
                'va_fee' => 5000,
            ],
            [
                'order_date' => '2026-04-18',
                'disbursement_date' => '2026-05-06',
                'customer_idx' => 5,
                'items' => [
                    ['product_idx' => 10, 'qty' => 1, 'price' => 7200000, 'cost' => 5600000],
                ],
                'status' => 'selesai',
                'admin_fee' => 35000,
                'va_fee' => 3500,
            ],
            [
                'order_date' => '2026-05-02',
                'disbursement_date' => '2026-05-20',
                'customer_idx' => 6,
                'items' => [
                    ['product_idx' => 5, 'qty' => 1, 'price' => 2750000, 'cost' => 2300000],
                    ['product_idx' => 2, 'qty' => 1, 'price' => 1500000, 'cost' => 1150000],
                ],
                'status' => 'selesai',
                'admin_fee' => 25000,
                'va_fee' => 3500,
            ],
            [
                'order_date' => '2026-05-15',
                'disbursement_date' => '2026-06-02',
                'customer_idx' => 7,
                'items' => [
                    ['product_idx' => 7, 'qty' => 2, 'price' => 5200000, 'cost' => 4100000],
                ],
                'status' => 'selesai',
                'admin_fee' => 30000,
                'va_fee' => 3500,
            ],
            [
                'order_date' => '2026-08-20',
                'disbursement_date' => '2026-09-02',
                'customer_idx' => 1,
                'items' => [
                    ['product_idx' => 3, 'qty' => 1, 'price' => 5800000, 'cost' => 4950000],
                    ['product_idx' => 5, 'qty' => 1, 'price' => 2750000, 'cost' => 2300000],
                ],
                'status' => 'selesai',
                'admin_fee' => 45000,
                'va_fee' => 5000,
            ],
            [
                'order_date' => '2026-09-01',
                'disbursement_date' => null, // Menunggu pencairan
                'customer_idx' => 0,
                'items' => [
                    ['product_idx' => 9, 'qty' => 2, 'price' => 9500000, 'cost' => 7600000],
                ],
                'status' => 'menunggu_pencairan',
                'admin_fee' => 45000,
                'va_fee' => 3500,
            ],
            [
                'order_date' => '2026-09-04',
                'disbursement_date' => null, // Diproses
                'customer_idx' => 3,
                'items' => [
                    ['product_idx' => 0, 'qty' => 8, 'price' => 1960000, 'cost' => 1560000],
                    ['product_idx' => 2, 'qty' => 1, 'price' => 1500000, 'cost' => 1150000],
                ],
                'status' => 'diproses',
                'admin_fee' => 20000,
                'va_fee' => 3500,
            ],
        ];

        foreach ($sampleOrders as $idx => $so) {
            $customer = $customerModels[$so['customer_idx']];
            $orderDate = Carbon::parse($so['order_date']);
            $orderIdStr = 'SIP-2026'.$orderDate->format('m').'-'.str_pad((string) ($idx + 101), 4, '0', STR_PAD_LEFT);

            $totBruto = 0;
            $totCost = 0;
            foreach ($so['items'] as $item) {
                $totBruto += $item['price'];
                $totCost += $item['cost'];
            }

            $grossProfit = $taxService->calculateGrossProfit($totBruto, $totCost);
            $marginPct = $taxService->calculateMarginPercentage($grossProfit, $totBruto);

            $order = Order::create([
                'siplah_order_id' => $orderIdStr,
                'order_date' => $orderDate,
                'customer_id' => $customer->id,
                'status' => $so['status'],
                'total_bruto' => $totBruto,
                'total_cost' => $totCost,
                'gross_profit' => $grossProfit,
                'margin_percentage' => $marginPct,
                'disbursement_date' => $so['disbursement_date'] ? Carbon::parse($so['disbursement_date']) : null,
                'notes' => 'Pengadaan belanja dana BOS via SIPLah',
            ]);

            // Order items
            foreach ($so['items'] as $item) {
                $product = $productModels[$item['product_idx']];
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'category' => $product->category,
                    'qty' => $item['qty'],
                    'unit_price' => $item['price'] / $item['qty'],
                    'cost_price' => $item['cost'] / $item['qty'],
                    'subtotal_bruto' => $item['price'],
                    'subtotal_cost' => $item['cost'],
                    'gross_profit' => $item['price'] - $item['cost'],
                ]);
            }

            // Calculations
            $pph22 = $taxService->calculatePPh22($totBruto, true);
            $ppn = $taxService->calculatePPN($totBruto);
            $netDisbursement = $taxService->calculateNetDisbursement(
                $totBruto,
                $pph22,
                $ppn,
                $so['admin_fee'],
                $so['va_fee']
            );

            Transaction::create([
                'order_id' => $order->id,
                'transaction_date' => $orderDate,
                'invoice_number' => 'INV/'.$orderIdStr,
                'bruto' => $totBruto,
                'tax_pph22' => $pph22,
                'tax_ppn' => $ppn,
                'admin_fee' => $so['admin_fee'],
                'va_fee' => $so['va_fee'],
                'net_disbursement' => $netDisbursement,
                'notes' => 'Potongan pajak & biaya administrasi SIPLah',
            ]);

            // Disbursement record if paid
            if (! empty($so['disbursement_date'])) {
                PaymentDisbursement::create([
                    'order_id' => $order->id,
                    'disbursement_date' => Carbon::parse($so['disbursement_date']),
                    'amount' => $netDisbursement,
                    'bank_name' => 'BJB (CV Tihani Mafaza)',
                    'reference_number' => 'CAIR-'.$orderIdStr,
                    'status' => 'cair',
                    'notes' => 'Pencairan dana BOS langsung ke rekening perusahaan',
                ]);

                ReconciliationLog::create([
                    'sync_date' => Carbon::parse($so['disbursement_date']),
                    'siplah_order_id' => $orderIdStr,
                    'expected_amount' => $netDisbursement,
                    'actual_amount' => $netDisbursement,
                    'difference' => 0.0,
                    'status' => 'matched',
                    'notes' => 'Otomatis cocok dengan pencairan rekening bank',
                ]);
            }
        }
    }
}
