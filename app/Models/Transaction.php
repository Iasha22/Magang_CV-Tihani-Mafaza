<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'transaction_date',
        'invoice_number',
        'bruto',
        'tax_pph22',
        'tax_ppn',
        'admin_fee',
        'va_fee',
        'net_disbursement',
        'notes',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'bruto' => 'decimal:2',
        'tax_pph22' => 'decimal:2',
        'tax_ppn' => 'decimal:2',
        'admin_fee' => 'decimal:2',
        'va_fee' => 'decimal:2',
        'net_disbursement' => 'decimal:2',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
