<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'siplah_order_id',
        'order_date',
        'customer_id',
        'status',
        'total_bruto',
        'total_cost',
        'gross_profit',
        'margin_percentage',
        'disbursement_date',
        'notes',
    ];

    protected $casts = [
        'order_date' => 'date',
        'disbursement_date' => 'date',
        'total_bruto' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'gross_profit' => 'decimal:2',
        'margin_percentage' => 'decimal:2',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function transaction(): HasOne
    {
        return $this->hasOne(Transaction::class);
    }

    public function disbursement(): HasOne
    {
        return $this->hasOne(PaymentDisbursement::class);
    }
}
