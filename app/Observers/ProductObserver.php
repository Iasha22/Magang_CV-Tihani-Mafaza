<?php

namespace App\Observers;

use App\Models\AuditTrail;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class ProductObserver
{
    /**
     * Handle the Product "created" event.
     */
    public function created(Product $product): void
    {
        $user = Auth::user();
        $userName = $user ? $user->name : 'Sistem / Impor SIPLah';

        AuditTrail::create([
            'auditable_type' => Product::class,
            'auditable_id' => $product->id,
            'event' => 'created',
            'user_id' => $user?->id,
            'user_name' => $userName,
            'old_values' => null,
            'new_values' => [
                'name' => $product->name,
                'sku' => $product->sku,
                'category' => $product->category,
                'unit' => $product->unit,
                'reference_price' => $product->reference_price,
                'reference_cost' => $product->reference_cost,
                'current_stock' => $product->current_stock,
                'min_stock' => $product->min_stock,
            ],
            'summary' => "Master produk baru dibuat: {$product->name} (SKU: ".($product->sku ?: '-').')',
            'ip_address' => Request::ip(),
        ]);
    }

    /**
     * Handle the Product "updated" event.
     */
    public function updated(Product $product): void
    {
        $dirty = $product->getDirty();
        unset($dirty['updated_at']);

        if (empty($dirty)) {
            return;
        }

        $oldValues = [];
        $newValues = [];
        $changesDesc = [];

        foreach ($dirty as $key => $newValue) {
            $oldValue = $product->getOriginal($key);
            $oldValues[$key] = $oldValue;
            $newValues[$key] = $newValue;

            $label = match ($key) {
                'name' => 'Nama Produk',
                'sku' => 'SKU',
                'category' => 'Kategori',
                'unit' => 'Satuan',
                'reference_price' => 'Harga Jual',
                'reference_cost' => 'Harga Beli (HPP)',
                'current_stock' => 'Stok Saat Ini',
                'min_stock' => 'Stok Minimum',
                'description' => 'Deskripsi',
                'primary_image' => 'Foto Utama',
                default => $key,
            };

            if ($key === 'reference_price' || $key === 'reference_cost') {
                $formattedOld = 'Rp '.number_format((float) $oldValue, 0, ',', '.');
                $formattedNew = 'Rp '.number_format((float) $newValue, 0, ',', '.');
                $changesDesc[] = "{$label} diubah dari {$formattedOld} ke {$formattedNew}";
            } else {
                $changesDesc[] = "{$label} diperbarui";
            }
        }

        $user = Auth::user();
        $userName = $user ? $user->name : 'Sistem';

        AuditTrail::create([
            'auditable_type' => Product::class,
            'auditable_id' => $product->id,
            'event' => 'updated',
            'user_id' => $user?->id,
            'user_name' => $userName,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'summary' => implode(', ', $changesDesc),
            'ip_address' => Request::ip(),
        ]);
    }

    /**
     * Handle the Product "deleted" event.
     */
    public function deleted(Product $product): void
    {
        $user = Auth::user();
        $userName = $user ? $user->name : 'Sistem';

        AuditTrail::create([
            'auditable_type' => Product::class,
            'auditable_id' => $product->id,
            'event' => 'deleted',
            'user_id' => $user?->id,
            'user_name' => $userName,
            'old_values' => [
                'name' => $product->name,
                'sku' => $product->sku,
                'category' => $product->category,
            ],
            'new_values' => null,
            'summary' => "Produk '{$product->name}' (SKU: {$product->sku}) telah dihapus",
            'ip_address' => Request::ip(),
        ]);
    }
}
