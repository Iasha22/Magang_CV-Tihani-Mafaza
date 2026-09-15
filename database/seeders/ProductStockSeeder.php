<?php

namespace Database\Seeders;

use App\Models\AuditTrail;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\StockMutation;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class ProductStockSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        $adminName = $user ? $user->name : 'Iasha Tsamrotul F.';
        $adminId = $user ? $user->id : null;

        $products = Product::all();

        // Ensure storage directory exists
        $storagePath = storage_path('app/public/products');
        if (! File::isDirectory($storagePath)) {
            File::makeDirectory($storagePath, 0755, true);
        }

        // Generate SVG images for each product if not present
        $sampleImages = [
            'ATK' => $this->generateSvg('ATK', '#6366F1', 'Kertas & Tinta SIPLah'),
            'Elektronik' => $this->generateSvg('Elektronik', '#0EA5E9', 'Perangkat Lab & Multimedia'),
            'Furniture' => $this->generateSvg('Furniture', '#F59E0B', 'Mebel Kelas & Kantor'),
            'Buku' => $this->generateSvg('Buku', '#10B981', 'Buku Kurikulum Merdeka'),
        ];

        $stockData = [
            'ATK-001' => [
                'desc' => 'Kertas fotokopi HVS ukuran A4 gramatur 75 gsm merk Sinar Dunia. 1 Box berisi 5 rim (2.500 lembar). Cocok untuk cetak soal ujian dan administrasi sekolah.',
                'incoming' => 50,
                'outgoing' => 18,
                'min' => 10,
            ],
            'ATK-002' => [
                'desc' => 'Tinta original Epson 003 set lengkap 4 warna (Black, Cyan, Magenta, Yellow) untuk printer seri L-Series L1110, L3110, L3150, L3210. Daya cetak tinggi hingga 4.500 halaman.',
                'incoming' => 30,
                'outgoing' => 12,
                'min' => 5,
            ],
            'ATK-003' => [
                'desc' => 'Paket perlengkapan administrasi kantor sekolah terdiri dari 12 spidol whiteboard Snowman, 2 penghapus magnetik, 5 map binder arsip, dan 1 rim kertas sertifikat piagam.',
                'incoming' => 20,
                'outgoing' => 8,
                'min' => 5,
            ],
            'ELK-001' => [
                'desc' => 'Chromebook Acer C733 Intel Celeron N4020, RAM 4GB, eMMC 32GB, Layar 11.6 inch HD anti-glare, ChromeOS berlisensi resmi Kemendikbudristek untuk lab komputer dan asesmen ANBK.',
                'incoming' => 15,
                'outgoing' => 11,
                'min' => 5,
            ],
            'ELK-002' => [
                'desc' => 'Proyektor Epson EB-E500 3LCD 3.300 Lumens XGA HDMI, dilengkapi layar proyektor tripod portable ukuran 70 inch x 70 inch (178 x 178 cm) untuk presentasi kelas.',
                'incoming' => 10,
                'outgoing' => 8,
                'min' => 3,
            ],
            'ELK-003' => [
                'desc' => 'Printer Multifungsi Epson EcoTank L3210 (Print, Scan, Copy) dengan sistem tangki tinta anti-tumpah, kecepatan cetak hingga 10 ipm hitam-putih dan 5.0 ipm warna.',
                'incoming' => 8,
                'outgoing' => 6,
                'min' => 2,
            ],
            'FRN-001' => [
                'desc' => 'Set meja dan kursi siswa sekolah rangka besi hollow finishing powder coating anti karat, top table kayu jati lapis HPL tahan gores. 1 Paket berisi 10 set meja + kursi.',
                'incoming' => 6,
                'outgoing' => 4,
                'min' => 2,
            ],
            'FRN-002' => [
                'desc' => 'Lemari arsip kantor sekolah 2 pintu kaca sliding dengan kunci sentral, plat besi tebal 0.7 mm finishing cat oven abu-abu terang, 4 rak ambalan dapat diatur.',
                'incoming' => 5,
                'outgoing' => 2,
                'min' => 2,
            ],
            'FRN-003' => [
                'desc' => 'Papan tulis whiteboard magnetik gantung / stand beroda ukuran 120 x 240 cm dengan lis aluminium kokoh dan tatakan spidol/penghapus terintegrasi.',
                'incoming' => 12,
                'outgoing' => 9,
                'min' => 3,
            ],
            'BKU-001' => [
                'desc' => 'Paket buku teks utama siswa dan buku panduan guru Kurikulum Merdeka Fase A & B Sekolah Dasar cetakan resmi Pusat Kurikulum dan Perbukuan Kemendikbudristek.',
                'incoming' => 25,
                'outgoing' => 16,
                'min' => 5,
            ],
            'BKU-002' => [
                'desc' => 'Paket pengayaan literasi perpustakaan sekolah berisi 50 judul buku cerita bergambar, sains populer anak, dan ensiklopedia nusantara ber-ISBN resmi.',
                'incoming' => 15,
                'outgoing' => 11,
                'min' => 4,
            ],
            'BKU-003' => [
                'desc' => 'Kamus Besar Bahasa Indonesia (KBBI) Edisi V Hardcover bersama Kamus Basa Sunda Lengkap untuk referensi mata pelajaran Bahasa Daerah dan Bahasa Indonesia.',
                'incoming' => 10,
                'outgoing' => 10, // Stock balance = 0 (Habis)
                'min' => 3,
            ],
        ];

        foreach ($products as $product) {
            $info = $stockData[$product->sku] ?? [
                'desc' => 'Spesifikasi produk pengadaan sekolah SIPLah CV Tihani Mafaza kualitas terjamin sesuai standar pengadaan instansi pendidikan.',
                'incoming' => 20,
                'outgoing' => 5,
                'min' => 5,
            ];

            // 1. Create image file
            $svgContent = $sampleImages[$product->category] ?? $sampleImages['ATK'];
            $imageFileName = 'products/'.strtolower($product->sku ?? 'prod-'.$product->id).'.svg';
            File::put(storage_path('app/public/'.$imageFileName), $svgContent);

            $balance = max(0, $info['incoming'] - $info['outgoing']);

            // Update product master data
            $product->update([
                'description' => $info['desc'],
                'current_stock' => $balance,
                'min_stock' => $info['min'],
                'primary_image' => $imageFileName,
            ]);

            // Save ProductImage record if not exists
            ProductImage::firstOrCreate(
                [
                    'product_id' => $product->id,
                    'image_path' => $imageFileName,
                ],
                [
                    'original_name' => $product->sku.'.svg',
                    'is_primary' => true,
                    'caption' => $product->name,
                ]
            );

            // Clean previous test mutations if any
            StockMutation::where('product_id', $product->id)->delete();
            AuditTrail::where('auditable_type', Product::class)->where('auditable_id', $product->id)->delete();

            // 2. Initial Stock Mutation (Incoming)
            StockMutation::create([
                'product_id' => $product->id,
                'type' => 'incoming',
                'quantity' => $info['incoming'],
                'balance_before' => 0,
                'balance_after' => $info['incoming'],
                'reference_type' => 'supplier_purchase',
                'reference_number' => 'PO/SUPP/2026/01-'.rand(100, 999),
                'notes' => 'Penerimaan stok awal dari distributor resmi / rekanan manufaktur',
                'user_id' => $adminId,
                'created_at' => now()->subDays(rand(15, 30)),
            ]);

            // 3. Outgoing Stock Mutation (Outgoing to school)
            if ($info['outgoing'] > 0) {
                StockMutation::create([
                    'product_id' => $product->id,
                    'type' => 'outgoing',
                    'quantity' => $info['outgoing'],
                    'balance_before' => $info['incoming'],
                    'balance_after' => $balance,
                    'reference_type' => 'siplah_order',
                    'reference_number' => 'SPL-2026-BOS'.rand(1000, 9999),
                    'notes' => 'Pengiriman barang pesanan sekolah via ekspedisi SIPLah',
                    'user_id' => $adminId,
                    'created_at' => now()->subDays(rand(1, 10)),
                ]);
            }

            // 4. Audit Trail records
            AuditTrail::create([
                'auditable_type' => Product::class,
                'auditable_id' => $product->id,
                'event' => 'created',
                'user_id' => $adminId,
                'user_name' => $adminName,
                'old_values' => null,
                'new_values' => [
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'category' => $product->category,
                    'reference_price' => $product->reference_price,
                    'reference_cost' => $product->reference_cost,
                ],
                'summary' => "Master data produk '{$product->name}' (SKU: {$product->sku}) berhasil didaftarkan ke sistem",
                'ip_address' => '127.0.0.1',
                'created_at' => now()->subDays(30),
            ]);

            AuditTrail::create([
                'auditable_type' => Product::class,
                'auditable_id' => $product->id,
                'event' => 'stock_adjusted',
                'user_id' => $adminId,
                'user_name' => $adminName,
                'old_values' => ['current_stock' => $info['incoming']],
                'new_values' => ['current_stock' => $balance],
                'summary' => "Pengurangan stok otomatis -{$info['outgoing']} unit untuk pemenuhan pesanan sekolah",
                'ip_address' => '127.0.0.1',
                'created_at' => now()->subDays(5),
            ]);
        }
    }

    private function generateSvg(string $category, string $color, string $label): string
    {
        return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <defs>
    <linearGradient id="grad_{$category}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="50%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <linearGradient id="accent_{$category}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{$color}" />
      <stop offset="100%" stop-color="{$color}99" />
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#grad_{$category})" rx="24"/>
  <rect x="20" y="20" width="560" height="360" rx="16" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="8 8"/>
  <circle cx="300" cy="170" r="64" fill="url(#accent_{$category})" fill-opacity="0.15"/>
  <circle cx="300" cy="170" r="50" fill="none" stroke="{$color}" stroke-width="2.5"/>
  <text x="300" y="180" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="bold" fill="{$color}" text-anchor="middle">{$category}</text>
  <text x="300" y="270" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="#F8FAFC" text-anchor="middle">{$label}</text>
  <text x="300" y="305" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500" fill="#94A3B8" text-anchor="middle">CV TIHANI MAFAZA • KATALOG RESMI SIPLah</text>
</svg>
SVG;
    }
}
