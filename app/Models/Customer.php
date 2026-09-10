<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'npsn',
        'name',
        'address',
        'contact_person',
        'phone',
        'npwp',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
