<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'filename',
        'file_type',
        'total_rows',
        'success_count',
        'error_count',
        'total_bruto',
        'notes',
    ];

    protected $casts = [
        'total_bruto' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
