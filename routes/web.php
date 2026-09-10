<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReconciliationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SiplahImportController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

// Authentication
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.submit');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Main SIA System Routes
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

// Modul Integrasi & Parser SIPLah
Route::prefix('import')->name('import.')->group(function () {
    Route::get('/', [SiplahImportController::class, 'index'])->name('index');
    Route::post('/preview', [SiplahImportController::class, 'preview'])->name('preview');
    Route::post('/commit', [SiplahImportController::class, 'commit'])->name('commit');
    Route::get('/template', [SiplahImportController::class, 'downloadTemplate'])->name('template');
});

// Manajemen Pesanan SIPLah
Route::prefix('orders')->name('orders.')->group(function () {
    Route::get('/', [OrderController::class, 'index'])->name('index');
    Route::post('/{order}/disbursement', [OrderController::class, 'updateDisbursement'])->name('disbursement');
});

// Master Data Sekolah (Pelanggan)
Route::resource('customers', CustomerController::class)->except(['create', 'edit', 'show']);

// 5 Modul Laporan Akuntansi & Perpajakan
Route::prefix('reports')->name('reports.')->group(function () {
    Route::get('/sales', [ReportController::class, 'sales'])->name('sales');
    Route::get('/margin', [ReportController::class, 'margin'])->name('margin');
    Route::get('/cash-flow', [ReportController::class, 'cashFlow'])->name('cash_flow');
    Route::get('/tax', [ReportController::class, 'tax'])->name('tax');
    Route::get('/export/excel', [ReportController::class, 'exportExcel'])->name('export.excel');
    Route::get('/export/pdf', [ReportController::class, 'exportPdf'])->name('export.pdf');
});

// Modul Rekonsiliasi Finansial
Route::prefix('reconciliation')->name('reconciliation.')->group(function () {
    Route::get('/', [ReconciliationController::class, 'index'])->name('index');
    Route::post('/resolve', [ReconciliationController::class, 'resolve'])->name('resolve');
});
