<?php

namespace App\Http\Controllers;

use App\Models\AuditTrail;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\StockMutation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Product::with(['images']);

        // 1. Text Search (Name, SKU, Description)
        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // 2. Category Filter
        if ($request->filled('category') && $request->input('category') !== 'all') {
            $query->where('category', $request->input('category'));
        }

        // 3. Stock Status Filter
        if ($request->filled('stock_status') && $request->input('stock_status') !== 'all') {
            $status = $request->input('stock_status');
            if ($status === 'out_of_stock') {
                $query->where('current_stock', '<=', 0);
            } elseif ($status === 'low_stock') {
                $query->where('current_stock', '>', 0)
                    ->whereColumn('current_stock', '<=', 'min_stock');
            } elseif ($status === 'in_stock') {
                $query->whereColumn('current_stock', '>', 'min_stock');
            }
        }

        // Sorting
        $sort = $request->input('sort', 'latest');
        match ($sort) {
            'name_asc' => $query->orderBy('name', 'asc'),
            'name_desc' => $query->orderBy('name', 'desc'),
            'price_high' => $query->orderBy('reference_price', 'desc'),
            'price_low' => $query->orderBy('reference_price', 'asc'),
            'stock_low' => $query->orderBy('current_stock', 'asc'),
            'stock_high' => $query->orderBy('current_stock', 'desc'),
            default => $query->latest('id'),
        };

        $products = $query->paginate(12)->withQueryString();

        // 4. Metrics & KPI summary across all products
        $allProducts = Product::all();
        $totalProducts = $allProducts->count();
        $totalInventoryValue = $allProducts->sum(fn ($p) => $p->current_stock * $p->reference_cost);
        $totalSellingValue = $allProducts->sum(fn ($p) => $p->current_stock * $p->reference_price);
        $lowStockCount = $allProducts->filter(fn ($p) => $p->current_stock > 0 && $p->current_stock <= $p->min_stock)->count();
        $outOfStockCount = $allProducts->filter(fn ($p) => $p->current_stock <= 0)->count();

        // Weighted or average margin
        $avgMargin = $allProducts->avg(fn ($p) => $p->margin_percentage) ?? 0;

        $metrics = [
            'total_products' => $totalProducts,
            'total_inventory_value' => (float) $totalInventoryValue,
            'total_selling_value' => (float) $totalSellingValue,
            'low_stock_count' => $lowStockCount,
            'out_of_stock_count' => $outOfStockCount,
            'average_margin_percentage' => round($avgMargin, 1),
        ];

        $categories = ['ATK', 'Elektronik', 'Furniture', 'Buku', 'Lainnya'];

        return Inertia::render('Products/Index', [
            'products' => $products,
            'metrics' => $metrics,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'stock_status', 'sort']),
        ]);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:50', 'unique:products,sku'],
            'category' => ['required', 'string', 'in:ATK,Elektronik,Furniture,Buku,Lainnya'],
            'unit' => ['required', 'string', 'max:30'],
            'reference_price' => ['required', 'numeric', 'min:0'],
            'reference_cost' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'initial_stock' => ['nullable', 'integer', 'min:0'],
            'min_stock' => ['nullable', 'integer', 'min:0'],
            'images' => ['nullable', 'array'],
            'images.*' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,svg', 'max:5120'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            // Auto generate SKU if not provided
            $sku = $validated['sku'] ?? null;
            if (empty($sku)) {
                $prefix = match ($validated['category']) {
                    'ATK' => 'ATK',
                    'Elektronik' => 'ELK',
                    'Furniture' => 'FRN',
                    'Buku' => 'BKU',
                    default => 'PRD',
                };
                $count = Product::where('category', $validated['category'])->count() + 1;
                $sku = sprintf('%s-%03d', $prefix, $count);
            }

            $initialStock = (int) ($validated['initial_stock'] ?? 0);
            $minStock = (int) ($validated['min_stock'] ?? 5);

            $product = Product::create([
                'name' => $validated['name'],
                'sku' => $sku,
                'category' => $validated['category'],
                'unit' => $validated['unit'],
                'reference_price' => $validated['reference_price'],
                'reference_cost' => $validated['reference_cost'],
                'description' => $validated['description'] ?? null,
                'current_stock' => $initialStock,
                'min_stock' => $minStock,
            ]);

            // If initial stock provided, create stock mutation
            if ($initialStock > 0) {
                StockMutation::create([
                    'product_id' => $product->id,
                    'type' => 'incoming',
                    'quantity' => $initialStock,
                    'balance_before' => 0,
                    'balance_after' => $initialStock,
                    'reference_type' => 'initial_stock',
                    'reference_number' => 'INIT-'.strtoupper(Str::random(6)),
                    'notes' => 'Saldo awal saat pendaftaran produk baru',
                    'user_id' => Auth::id(),
                ]);
            }

            // Handle uploaded images
            if ($request->hasFile('images')) {
                $isFirst = true;
                foreach ($request->file('images') as $file) {
                    $path = $file->store('products', 'public');
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'is_primary' => $isFirst,
                        'caption' => $product->name,
                    ]);

                    if ($isFirst) {
                        $product->update(['primary_image' => $path]);
                        $isFirst = false;
                    }
                }
            }
        });

        return back()->with('success', 'Master produk baru berhasil ditambahkan!');
    }

    /**
     * Display the specified product with all related details (AJAX / JSON).
     */
    public function show(Product $product): JsonResponse
    {
        $product->load([
            'images',
            'stockMutations' => function ($q) {
                $q->with('user:id,name,role')->latest()->limit(50);
            },
            'auditTrails' => function ($q) {
                $q->with('user:id,name,role')->latest()->limit(50);
            },
            'orderItems' => function ($q) {
                $q->latest()->limit(10);
            },
        ]);

        return response()->json([
            'product' => $product,
        ]);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:50', 'unique:products,sku,'.$product->id],
            'category' => ['required', 'string', 'in:ATK,Elektronik,Furniture,Buku,Lainnya'],
            'unit' => ['required', 'string', 'max:30'],
            'reference_price' => ['required', 'numeric', 'min:0'],
            'reference_cost' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'min_stock' => ['nullable', 'integer', 'min:0'],
            'images' => ['nullable', 'array'],
            'images.*' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,svg', 'max:5120'],
        ]);

        DB::transaction(function () use ($validated, $request, $product) {
            $product->update([
                'name' => $validated['name'],
                'sku' => $validated['sku'] ?? $product->sku,
                'category' => $validated['category'],
                'unit' => $validated['unit'],
                'reference_price' => $validated['reference_price'],
                'reference_cost' => $validated['reference_cost'],
                'description' => $validated['description'] ?? null,
                'min_stock' => (int) ($validated['min_stock'] ?? $product->min_stock),
            ]);

            // Additional images if uploaded
            if ($request->hasFile('images')) {
                $hasPrimary = $product->images()->where('is_primary', true)->exists();
                foreach ($request->file('images') as $idx => $file) {
                    $path = $file->store('products', 'public');
                    $isPrimary = (! $hasPrimary && $idx === 0);

                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'is_primary' => $isPrimary,
                        'caption' => $product->name,
                    ]);

                    if ($isPrimary) {
                        $product->update(['primary_image' => $path]);
                    }
                }
            }
        });

        return back()->with('success', 'Data produk berhasil diperbarui!');
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product): RedirectResponse
    {
        if ($product->orderItems()->count() > 0) {
            return back()->with('error', "Produk '{$product->name}' memiliki keterkaitan dengan pesanan SIPLah yang sudah ada, sehingga tidak dapat dihapus demi integritas pembukuan akuntansi.");
        }

        // Delete images from disk
        foreach ($product->images as $img) {
            if (! str_starts_with($img->image_path, 'http')) {
                Storage::disk('public')->delete($img->image_path);
            }
        }

        $product->delete();

        return back()->with('success', 'Data produk berhasil dihapus.');
    }

    /**
     * Store stock mutation (incoming, outgoing, adjustment).
     */
    public function storeMutation(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:incoming,outgoing,adjustment'],
            'quantity' => ['required', 'integer'],
            'reference_type' => ['required', 'string', 'max:50'],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $type = $validated['type'];
        $qty = abs((int) $validated['quantity']);
        $currentBalance = (int) $product->current_stock;
        $newBalance = $currentBalance;

        if ($type === 'incoming') {
            $newBalance = $currentBalance + $qty;
        } elseif ($type === 'outgoing') {
            if ($currentBalance < $qty) {
                return back()->with('error', "Stok tidak mencukupi! Saldo stok saat ini: {$currentBalance} {$product->unit}, pengeluaran diminta: {$qty} {$product->unit}.");
            }
            $newBalance = $currentBalance - $qty;
        } elseif ($type === 'adjustment') {
            // In adjustment, quantity is the target physical count
            $targetCount = (int) $validated['quantity'];
            if ($targetCount < 0) {
                return back()->with('error', 'Jumlah stok penyesuaian fisik tidak boleh negatif.');
            }
            $qty = abs($targetCount - $currentBalance);
            $newBalance = $targetCount;
        }

        DB::transaction(function () use ($product, $type, $qty, $currentBalance, $newBalance, $validated) {
            // Update product stock balance
            $product->update(['current_stock' => $newBalance]);

            // Record mutation ledger
            StockMutation::create([
                'product_id' => $product->id,
                'type' => $type,
                'quantity' => $qty,
                'balance_before' => $currentBalance,
                'balance_after' => $newBalance,
                'reference_type' => $validated['reference_type'],
                'reference_number' => $validated['reference_number'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'user_id' => Auth::id(),
            ]);

            // Custom audit trail description
            $user = Auth::user();
            $label = match ($type) {
                'incoming' => "Stok Masuk +{$qty} {$product->unit}",
                'outgoing' => "Stok Keluar -{$qty} {$product->unit}",
                'adjustment' => "Penyesuaian Fisik Stok menjadi {$newBalance} {$product->unit}",
            };

            AuditTrail::create([
                'auditable_type' => Product::class,
                'auditable_id' => $product->id,
                'event' => 'stock_adjusted',
                'user_id' => $user?->id,
                'user_name' => $user ? $user->name : 'Sistem',
                'old_values' => ['current_stock' => $currentBalance],
                'new_values' => ['current_stock' => $newBalance],
                'summary' => "{$label} (Ref: ".($validated['reference_number'] ?: '-').'). Catatan: '.($validated['notes'] ?: '-'),
                'ip_address' => request()->ip(),
            ]);
        });

        return back()->with('success', 'Mutasi stok berhasil dicatat ke kartu stok!');
    }

    /**
     * Upload additional images for a product.
     */
    public function uploadImages(Request $request, Product $product): RedirectResponse
    {
        $request->validate([
            'images' => ['required', 'array', 'min:1'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp,svg', 'max:5120'],
        ]);

        $hasPrimary = $product->images()->where('is_primary', true)->exists();

        foreach ($request->file('images') as $idx => $file) {
            $path = $file->store('products', 'public');
            $isPrimary = (! $hasPrimary && $idx === 0);

            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'is_primary' => $isPrimary,
                'caption' => $product->name,
            ]);

            if ($isPrimary) {
                $product->update(['primary_image' => $path]);
            }
        }

        AuditTrail::create([
            'auditable_type' => Product::class,
            'auditable_id' => $product->id,
            'event' => 'image_uploaded',
            'user_id' => Auth::id(),
            'user_name' => Auth::user()?->name ?? 'Sistem',
            'old_values' => null,
            'new_values' => ['uploaded_count' => count($request->file('images'))],
            'summary' => 'Foto produk baru berhasil diunggah ke galeri',
            'ip_address' => request()->ip(),
        ]);

        return back()->with('success', 'Foto produk berhasil ditambahkan!');
    }

    /**
     * Delete an image from a product.
     */
    public function deleteImage(ProductImage $image): RedirectResponse
    {
        $product = $image->product;

        if (! str_starts_with($image->image_path, 'http')) {
            Storage::disk('public')->delete($image->image_path);
        }

        $wasPrimary = $image->is_primary;
        $image->delete();

        if ($wasPrimary && $product) {
            $next = $product->images()->first();
            if ($next) {
                $next->update(['is_primary' => true]);
                $product->update(['primary_image' => $next->image_path]);
            } else {
                $product->update(['primary_image' => null]);
            }
        }

        if ($product) {
            AuditTrail::create([
                'auditable_type' => Product::class,
                'auditable_id' => $product->id,
                'event' => 'image_deleted',
                'user_id' => Auth::id(),
                'user_name' => Auth::user()?->name ?? 'Sistem',
                'old_values' => ['image_path' => $image->image_path],
                'new_values' => null,
                'summary' => 'Foto produk dihapus dari galeri',
                'ip_address' => request()->ip(),
            ]);
        }

        return back()->with('success', 'Foto produk berhasil dihapus.');
    }
}
