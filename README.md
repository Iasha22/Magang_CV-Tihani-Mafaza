# SISTEM INFORMASI AKUNTANSI TERINTEGRASI SIPLAH
### CV TIHANI MAFAZA - BANDUNG

**Dibuat oleh:** Iasha Tsamrotul Fuadi  
**Program Studi:** D3 Komputerisasi Akuntansi, STMIK Mardira Indonesia  
**Peruntukan:** Kerja Praktik (KP) & Tugas Akhir (TA)  
**Lokasi Studi:** CV Tihani Mafaza, Bandung  
**Tahun:** 2026  

---

## 1. Executive Summary

### Permasalahan:
CV Tihani Mafaza bergerak dalam pengadaan barang dan jasa untuk 10–20 sekolah di Bandung melalui platform **SIPLah (Kemendikbudristek)**. Sebelumnya, proses administrasi dan pembukuan dilakukan secara manual di **6 lembar kerja Excel** (*Data Transaksi, Belanja Modal, Kirim Itungan, Serah Terima Dana, Rekap Piutang, Rekap Absensi*). Data yang diunduh dari SIPLah harus diformat ulang secara manual setiap 3 minggu hingga 1 bulan, memakan waktu **4–6 jam per bulan** dan rawan kesalahan hitung manusia (*human error*).

### Solusi Sistem:
Membangun Sistem Informasi Akuntansi (SIA) berbasis web yang:
1. **Otomatis membaca & memetakan (parsing)** file ekspor SIPLah dan format Excel 6-sheet CV Tihani ke database relasional dalam waktu < 30 detik.
2. **Menghitung otomatis kewajiban perpajakan pengadaan sekolah** sesuai PMK No. 58/59:
   - **PPh Pasal 22 (1.5%)** atas pengadaan dana BOS belanja barang > Rp 2.000.000.
   - **PPN (11%)** dipungut marketplace SIPLah rekanan Kemendikbudristek.
   - **Potongan Biaya Admin & Virtual Account (VA)**.
3. **Menyajikan 5 Jenis Laporan Keuangan On-Demand**:
   - Laporan Penjualan (*Sales Report*)
   - Laporan Margin & Profitabilitas Belanja Modal (*HPP Report*)
   - Laporan Arus Kas & Serah Terima Dana (*Cash Flow Report*)
   - Laporan Perpajakan (*PPh 22 & PPN Tax Report*)
   - Laporan Rekonsiliasi Bank (*Reconciliation Report*)
4. **Ekspor Laporan** langsung ke format **Excel (.xlsx)** dan cetak resmi **PDF** siap tanda tangan pimpinan.

---

## 2. Tech Stack

- **Backend:** Laravel 11.x (PHP 8.3)
  - Eloquent ORM & Relational Modeling
  - `phpoffice/phpspreadsheet` (Excel reader, validator & generator)
  - `barryvdh/laravel-dompdf` (PDF generator berstandar akuntansi)
  - Laravel Boost Architecture & Guideline Integrations
- **Frontend:** React 18 + TypeScript + Inertia.js
  - Tailwind CSS v4 (Glassmorphism Dark-Mode Aesthetics)
  - `lucide-react` (Modern icon set)
  - `chart.js` & `react-chartjs-2` (Visualisasi data transaksi & tren musiman dana BOS)
- **Database:**
  - Dual-Support: SQLite (default dev lokal instan) dan MySQL 8.0 (Laragon / cPanel Shared Hosting)

---

## 3. Database Schema (Normalisasi Akuntansi)

1. `users`: Autentikasi & kontrol hak akses (Admin Akuntansi & Direktur CV).
2. `customers`: Data master sekolah di Bandung (NPSN, nama sekolah, alamat, kontak bendahara BOS, NPWP).
3. `products`: Katalog barang pengadaan (SKU, nama produk, kategori: ATK, Elektronik, Furniture, Buku, harga acuan, modal acuan).
4. `orders`: Transaksi pesanan pengadaan SIPLah (nomor pesanan, tanggal pesan, tanggal cair, total bruto, belanja modal/HPP, laba kotor, margin %, status).
5. `order_items`: Rincian item per pesanan (produk, qty, harga satuan, harga modal, subtotal bruto, subtotal modal, laba kotor).
6. `transactions`: Nilai finansial dan perpajakan (DPP bruto, potongan PPh 22, PPN, biaya admin, biaya VA, net pencairan).
7. `payment_disbursements`: Catatan pencairan dana BOS ke rekening bank (BJB) dan nomor referensi mutasi.
8. `reconciliation_logs`: Catatan audit rekonsiliasi nilai invoice SIPLah vs mutasi bank (Matched, Discrepancy, Pending).
9. `import_logs`: Riwayat impor file Excel SIPLah.

---

## 4. Cara Menjalankan Sistem di Komputer Lokal

### Langkah 1: Menjalankan Server
Cukup klik ganda file:
```cmd
run-local.bat
```
Atau melalui terminal PowerShell:
```powershell
$env:PATH = "C:\laragon\bin\php\php-8.3.33-Win32-vs16-x64;C:\laragon\bin\composer;C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin;$env:PATH"
php artisan serve --port=8000
```

### Langkah 2: Akses Browser
Buka browser dan kunjungi:
```
http://127.0.0.1:8000
```

### Kredensial Akun Pengujian:
- **Akun Admin Akuntansi (Iasha):**
  - Email: `admin@tihani.id`
  - Password: `admin123`
- **Akun Direktur CV Tihani:**
  - Email: `direktur@tihani.id`
  - Password: `direktur123`
*(Tersedia tombol satu-klik login cepat di halaman masuk)*

---

## 5. File Template Uji Coba SIPLah

Tersedia file contoh siap pakai untuk demonstrasi pengunggahan:
- Lokasi: `sample_data/template_siplah_cv_tihani.xlsx`
- Atau unduh langsung melalui tombol **"Template Excel"** pada navigasi sistem.

---

## 6. Verifikasi & Pengujian Sistem

Seluruh logika perpajakan, parser, dan laporan telah diuji secara otomatis menggunakan PHPUnit:
```powershell
php artisan test
```
**Hasil:** 16/16 Test Suites Passed (100% Lolos Uji).
