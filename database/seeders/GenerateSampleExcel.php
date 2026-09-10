<?php

require __DIR__ . '/../../vendor/autoload.php';

$spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();
$sheet->setTitle('Belanja Modal');

$headers = [
    'No', 'Tgl Pesan', 'Tgl Pencairan', 'Uraian', 'Bruto', 
    'Belanja Modal', 'Harga Jual', 'Laba Kotor', 'PPN', 
    'PPH 22', 'VA', 'Admin', 'Sekolah', 'CV'
];
$sheet->fromArray($headers, null, 'A1');

$rows = [
    [1, '2026-02-15', '2026-03-02', 'Buku Paket Siswa Tematik Semester 2', 4500000, 3600000, 4500000, 900000, 495000, 67500, 3500, 25000, 'SDN 01 Sukajadi Bandung', 'CV Tihani Mafaza'],
    [2, '2026-02-20', '2026-03-10', 'Pengadaan Kertas HVS A4 75gr & Tinta Printer', 2800000, 2240000, 2800000, 560000, 308000, 42000, 3500, 20000, 'SMPN 03 Bandung', 'CV Tihani Mafaza'],
    [3, '2026-03-05', '2026-03-22', 'Meja & Kursi Siswa Kayu Jati Set (10 Unit)', 8500000, 6800000, 8500000, 1700000, 935000, 127500, 5000, 35000, 'SDN 12 Babakan Ciparay', 'CV Tihani Mafaza'],
    [4, '2026-03-18', '', 'Proyektor Epson EB-E500 + Layar Tripod', 6200000, 5200000, 6200000, 1000000, 682000, 93000, 3500, 30000, 'SMP Mandiri Bandung', 'CV Tihani Mafaza'],
    [5, '2026-04-02', '2026-04-20', 'Laptop Siswa Chromebook Laboratorium', 11600000, 9900000, 11600000, 1700000, 1276000, 174000, 5000, 50000, 'SDN 05 Cibeunying Kaler', 'CV Tihani Mafaza'],
    [6, '2026-05-10', '2026-05-28', 'Paket Pengayaan Perpustakaan & Literasi', 7200000, 5600000, 7200000, 1600000, 792000, 108000, 3500, 35000, 'SMPN 14 Bandung', 'CV Tihani Mafaza'],
];
$sheet->fromArray($rows, null, 'A2');

foreach (range('A', 'N') as $col) {
    $sheet->getColumnDimension($col)->setAutoSize(true);
}

if (!is_dir(__DIR__ . '/../../sample_data')) {
    mkdir(__DIR__ . '/../../sample_data', 0777, true);
}

$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
$targetPath = __DIR__ . '/../../sample_data/template_siplah_cv_tihani.xlsx';
$writer->save($targetPath);

echo "Template created at {$targetPath}\n";
