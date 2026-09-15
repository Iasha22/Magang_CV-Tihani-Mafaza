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
        Schema::create('stock_mutations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->enum('type', ['incoming', 'outgoing', 'adjustment'])->default('incoming');
            $table->integer('quantity');
            $table->integer('balance_before')->default(0);
            $table->integer('balance_after')->default(0);
            $table->string('reference_type', 50)->default('manual'); // initial_stock, supplier_purchase, siplah_order, adjustment_plus, adjustment_minus, damaged, return
            $table->string('reference_number', 100)->nullable(); // e.g. PO, Invoice, Surat Jalan, SIPLah Order ID
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['product_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_mutations');
    }
};
