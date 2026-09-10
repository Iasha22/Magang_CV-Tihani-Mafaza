<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Models\PaymentDisbursement;
use App\Models\Transaction;
use App\Services\TaxCalculationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        protected TaxCalculationService $taxService
    ) {}

    public function index(Request $request): Response
    {
        $query = Order::with(['customer', 'items', 'transaction', 'disbursement']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('siplah_order_id', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn ($c) => $c->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->input('customer_id'));
        }

        $orders = $query->orderBy('order_date', 'desc')->paginate(15)->withQueryString();
        $customers = Customer::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'customers' => $customers,
            'filters' => $request->only(['search', 'status', 'customer_id']),
        ]);
    }

    public function updateDisbursement(Request $request, Order $order)
    {
        $validated = $request->validate([
            'disbursement_date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0'],
            'bank_name' => ['nullable', 'string'],
            'reference_number' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        PaymentDisbursement::updateOrCreate(
            ['order_id' => $order->id],
            [
                'disbursement_date' => $validated['disbursement_date'],
                'amount' => $validated['amount'],
                'bank_name' => $validated['bank_name'] ?? 'BJB',
                'reference_number' => $validated['reference_number'] ?? 'CAIR-' . $order->siplah_order_id,
                'status' => 'cair',
                'notes' => $validated['notes'],
            ]
        );

        $order->update([
            'disbursement_date' => $validated['disbursement_date'],
            'status' => 'selesai',
        ]);

        return back()->with('success', 'Status pencairan dana BOS berhasil dicatat!');
    }
}
