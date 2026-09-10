<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentDisbursement extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'disbursement_date',
        'amount',
        'bank_name',
        'reference_number',
        'status',
        'notes',
    ];

    protected $casts = [
        'disbursement_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
