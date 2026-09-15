<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AuditTrail extends Model
{
    use HasFactory;

    protected $fillable = [
        'auditable_type',
        'auditable_id',
        'event', // created, updated, deleted, stock_adjusted, image_uploaded, image_deleted
        'user_id',
        'user_name',
        'old_values',
        'new_values',
        'summary',
        'ip_address',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => 'datetime',
    ];

    protected $appends = [
        'formatted_event',
    ];

    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getFormattedEventAttribute(): string
    {
        return match ($this->event) {
            'created' => 'Data Dibuat',
            'updated' => 'Data Diperbarui',
            'deleted' => 'Data Dihapus',
            'stock_adjusted' => 'Mutasi Stok',
            'image_uploaded' => 'Foto Ditambahkan',
            'image_deleted' => 'Foto Dihapus',
            default => ucfirst(str_replace('_', ' ', $this->event)),
        };
    }
}
