<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMutation extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'type', // incoming, outgoing, adjustment
        'quantity',
        'balance_before',
        'balance_after',
        'reference_type', // initial_stock, supplier_purchase, siplah_order, adjustment_plus, adjustment_minus, damaged, return
        'reference_number',
        'notes',
        'user_id',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'balance_before' => 'integer',
        'balance_after' => 'integer',
        'created_at' => 'datetime',
    ];

    protected $appends = [
        'formatted_type',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getFormattedTypeAttribute(): string
    {
        return match ($this->type) {
            'incoming' => 'Masuk',
            'outgoing' => 'Keluar',
            'adjustment' => 'Penyesuaian',
            default => ucfirst($this->type),
        };
    }
}
