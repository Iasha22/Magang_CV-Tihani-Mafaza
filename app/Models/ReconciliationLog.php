<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReconciliationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'sync_date',
        'siplah_order_id',
        'expected_amount',
        'actual_amount',
        'difference',
        'status',
        'notes',
    ];

    protected $casts = [
        'sync_date' => 'datetime',
        'expected_amount' => 'decimal:2',
        'actual_amount' => 'decimal:2',
        'difference' => 'decimal:2',
    ];
}
