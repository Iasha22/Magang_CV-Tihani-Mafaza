<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Data Sekolah (Pelanggan SIPLah)
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('npsn', 20)->nullable()->index();
            $table->string('name');
            $table->text('address')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('npwp', 30)->nullable();
            $table->timestamps();
        });

        // 2. Katalog Produk & Referensi HPP
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku', 50)->nullable()->unique();
            $table->string('name');
            $table->string('category', 50)->default('ATK'); // ATK, Elektronik, Furniture, Buku, Lainnya
            $table->string('unit', 30)->default('pcs');
            $table->decimal('reference_price', 15, 2)->default(0);
            $table->decimal('reference_cost', 15, 2)->default(0);
            $table->timestamps();
        });

        // 3. Pesanan Pengadaan SIPLah
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('siplah_order_id', 100)->unique()->index();
            $table->date('order_date')->index();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->string('status', 30)->default('selesai'); // diproses, menunggu_pencairan, selesai, dibatalkan
            $table->decimal('total_bruto', 15, 2)->default(0);
            $table->decimal('total_cost', 15, 2)->default(0); // Belanja Modal / HPP
            $table->decimal('gross_profit', 15, 2)->default(0); // Laba Kotor = Bruto - Total Cost
            $table->decimal('margin_percentage', 5, 2)->default(0); // (Gross Profit / Bruto) * 100
            $table->date('disbursement_date')->nullable()->index();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 4. Rincian Item Pesanan
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('product_name');
            $table->string('category', 50)->default('ATK');
            $table->integer('qty')->default(1);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('cost_price', 15, 2)->default(0);
            $table->decimal('subtotal_bruto', 15, 2)->default(0);
            $table->decimal('subtotal_cost', 15, 2)->default(0);
            $table->decimal('gross_profit', 15, 2)->default(0);
            $table->timestamps();
        });

        // 5. Transaksi Akuntansi & Pemotongan Pajak/Biaya
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->date('transaction_date')->index();
            $table->string('invoice_number', 100)->nullable();
            $table->decimal('bruto', 15, 2)->default(0);
            $table->decimal('tax_pph22', 15, 2)->default(0); // PPh 22 (1.5%)
            $table->decimal('tax_ppn', 15, 2)->default(0);   // PPN (11%)
            $table->decimal('admin_fee', 15, 2)->default(0); // Biaya Admin SIPLah
            $table->decimal('va_fee', 15, 2)->default(0);    // Biaya Virtual Account
            $table->decimal('net_disbursement', 15, 2)->default(0); // Bruto - PPh22 - PPN - Admin - VA
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 6. Catatan Pencairan Dana / Serah Terima Kas Masuk
        Schema::create('payment_disbursements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->date('disbursement_date')->index();
            $table->decimal('amount', 15, 2)->default(0);
            $table->string('bank_name', 50)->nullable()->default('BJB');
            $table->string('reference_number', 100)->nullable();
            $table->string('status', 30)->default('cair'); // pending, cair, selisih
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 7. Log Rekonsiliasi Finansial
        Schema::create('reconciliation_logs', function (Blueprint $table) {
            $table->id();
            $table->dateTime('sync_date');
            $table->string('siplah_order_id', 100)->index();
            $table->decimal('expected_amount', 15, 2)->default(0);
            $table->decimal('actual_amount', 15, 2)->default(0);
            $table->decimal('difference', 15, 2)->default(0);
            $table->string('status', 30)->default('matched'); // matched, discrepancy, pending
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 8. Log Riwayat Impor File SIPLah / Excel
        Schema::create('import_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('filename');
            $table->string('file_type', 30)->default('xlsx');
            $table->integer('total_rows')->default(0);
            $table->integer('success_count')->default(0);
            $table->integer('error_count')->default(0);
            $table->decimal('total_bruto', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('import_logs');
        Schema::dropIfExists('reconciliation_logs');
        Schema::dropIfExists('payment_disbursements');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('products');
        Schema::dropIfExists('customers');
    }
};
