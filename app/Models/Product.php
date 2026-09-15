<?php

namespace App\Models;

use App\Observers\ProductObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

#[ObservedBy([ProductObserver::class])]
class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'sku',
        'name',
        'description',
        'category',
        'unit',
        'reference_price',
        'reference_cost',
        'current_stock',
        'min_stock',
        'primary_image',
    ];

    protected $casts = [
        'reference_price' => 'decimal:2',
        'reference_cost' => 'decimal:2',
        'current_stock' => 'integer',
        'min_stock' => 'integer',
    ];

    protected $appends = [
        'selling_price',
        'purchase_price',
        'margin_amount',
        'margin_percentage',
        'primary_image_url',
        'stock_status',
    ];

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('is_primary', 'desc')->orderBy('id', 'asc');
    }

    public function stockMutations(): HasMany
    {
        return $this->hasMany(StockMutation::class)->latest();
    }

    public function auditTrails(): MorphMany
    {
        return $this->morphMany(AuditTrail::class, 'auditable')->latest();
    }

    // Accessors & Mutators
    public function getSellingPriceAttribute(): float
    {
        return (float) ($this->attributes['reference_price'] ?? 0);
    }

    public function setSellingPriceAttribute(mixed $value): void
    {
        $this->attributes['reference_price'] = $value;
    }

    public function getPurchasePriceAttribute(): float
    {
        return (float) ($this->attributes['reference_cost'] ?? 0);
    }

    public function setPurchasePriceAttribute(mixed $value): void
    {
        $this->attributes['reference_cost'] = $value;
    }

    public function getMarginAmountAttribute(): float
    {
        $selling = $this->selling_price;
        $purchase = $this->purchase_price;

        return $selling - $purchase;
    }

    public function getMarginPercentageAttribute(): float
    {
        $selling = $this->selling_price;
        if ($selling <= 0) {
            return 0.0;
        }

        $margin = $this->margin_amount;

        return round(($margin / $selling) * 100, 2);
    }

    public function getPrimaryImageUrlAttribute(): ?string
    {
        if (! empty($this->primary_image)) {
            if (str_starts_with($this->primary_image, 'http://') || str_starts_with($this->primary_image, 'https://')) {
                return $this->primary_image;
            }

            return asset('storage/'.$this->primary_image);
        }

        // Check if there is an image in images relation
        if ($this->relationLoaded('images') && $this->images->isNotEmpty()) {
            return $this->images->first()->url;
        }

        return null;
    }

    public function getStockStatusAttribute(): string
    {
        $stock = (int) ($this->attributes['current_stock'] ?? 0);
        $min = (int) ($this->attributes['min_stock'] ?? 5);

        if ($stock <= 0) {
            return 'out_of_stock';
        }

        if ($stock <= $min) {
            return 'low_stock';
        }

        return 'in_stock';
    }
}
