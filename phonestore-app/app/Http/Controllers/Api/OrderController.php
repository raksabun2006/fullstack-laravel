<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Services\BakongService;
use App\Traits\ApiResponse;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of orders for the authenticated customer.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Order::with(['items', 'user', 'payments'])->where('user_id', $user->id);

        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($sub) use ($q) {
                $sub->where('id', 'like', "%{$q}%")
                    ->orWhere('payment_method', 'like', "%{$q}%");
            });
        }

        $orders = $query->latest()->get();

        return $this->sendResponse($orders, 'Customer orders retrieved successfully');
    }

    /**
     * Display a specific order.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $query = Order::with(['items.product.primaryImage', 'items.variant', 'user', 'payments']);

        $order = $query->where('id', $id)->first();

        if (! $order) {
            return $this->sendError('Order not found', [], 404);
        }

        // Authorize: customer must own the order, or user must be admin
        if (! $user->isAdmin() && $order->user_id !== $user->id) {
            return $this->sendError('Unauthorized access to order', [], 403);
        }

        return $this->sendResponse($order, 'Order retrieved successfully');
    }

    /**
     * Store a newly created order from the user's cart inside a Database Transaction.
     */
    public function store(Request $request, BakongService $bakongService): JsonResponse
    {
        $validated = $request->validate([
            'address_id' => 'nullable|exists:addresses,id',
            'payment_method' => 'required|string|in:KHQR,CASH_ON_DELIVERY,khqr,cash_on_delivery',
            'note' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();
        $paymentMethod = strtoupper($validated['payment_method']);

        DB::beginTransaction();

        try {
            // 1. Get customer's cart
            $cart = Cart::with(['items.variant.product'])->where('user_id', $user->id)->first();

            if (! $cart || $cart->items->isEmpty()) {
                DB::rollBack();
                return $this->sendError('Cart is empty. Cannot create order.', [], 400);
            }

            // 2. Resolve shipping address
            $address = null;
            if (! empty($validated['address_id'])) {
                $address = $user->addresses()->find($validated['address_id']);
            }
            if (! $address) {
                $address = $user->addresses()->where('is_default', true)->first()
                    ?: $user->addresses()->latest()->first();
            }

            $shippingAddressData = $address ? [
                'name' => $address->name,
                'phone' => $address->phone,
                'province' => $address->province,
                'district' => $address->district,
                'commune' => $address->commune,
                'address' => $address->address,
                'postal_code' => $address->postal_code,
            ] : [
                'name' => $user->name,
                'phone' => $user->phone ?: '+855 12 345 678',
                'province' => 'Phnom Penh',
                'district' => 'Daun Penh',
                'commune' => 'Phsar Thmei',
                'address' => 'Central Delivery Address',
                'postal_code' => '12000',
            ];

            // 3. Validate every product, variant, and stock, calculate totals from DB prices
            $subtotal = 0.0;
            $orderItemsData = [];

            foreach ($cart->items as $cartItem) {
                $variant = $cartItem->variant;
                if (! $variant) {
                    DB::rollBack();
                    return $this->sendError("Product variant for item ID {$cartItem->id} not found.", [], 400);
                }

                // Check stock
                if ($variant->stock < $cartItem->quantity) {
                    DB::rollBack();
                    return $this->sendError(
                        "Insufficient stock for variant {$variant->sku}. Available: {$variant->stock}, requested: {$cartItem->quantity}",
                        [],
                        400
                    );
                }

                $product = $variant->product;
                $price = (float) ($variant->price ?: ($product ? $product->base_price : 0));
                $subtotal += round($price * $cartItem->quantity, 2);

                $orderItemsData[] = [
                    'variant_model' => $variant,
                    'data' => [
                        'product_id' => $product?->id,
                        'product_variant_id' => $variant->id,
                        'product_name' => $product?->name ?? 'Mobile Phone',
                        'color' => $variant->color,
                        'storage' => $variant->storage,
                        'sku' => $variant->sku,
                        'price' => $price,
                        'quantity' => $cartItem->quantity,
                    ],
                ];
            }

            $shippingFee = 5.00;
            $discount = 0.00;
            $total = round($subtotal + $shippingFee - $discount, 2);

            // 4. Generate order reference number
            $nextNum = (int) Order::count() + 1001;
            $orderId = 'ORD-' . $nextNum;
            while (Order::where('id', $orderId)->exists()) {
                $nextNum++;
                $orderId = 'ORD-' . $nextNum;
            }

            // 5. Create Order
            $order = Order::create([
                'id' => $orderId,
                'user_id' => $user->id,
                'status' => 'PENDING',
                'payment_status' => 'PENDING',
                'payment_method' => $paymentMethod,
                'shipping_fee' => $shippingFee,
                'subtotal' => $subtotal,
                'total' => $total,
                'shipping_address' => $shippingAddressData,
                'note' => $validated['note'] ?? null,
            ]);

            // 6. Create Order Items & decrement stock
            foreach ($orderItemsData as $itemRecord) {
                $order->items()->create($itemRecord['data']);
                $itemRecord['variant_model']->decrement('stock', $itemRecord['data']['quantity']);
            }

            // 7. Create Payment record
            $payId = 'PAY-' . ((int) Payment::count() + 8001);
            while (Payment::where('id', $payId)->exists()) {
                $payId = 'PAY-' . rand(10000, 99999);
            }

            $paymentData = [
                'id' => $payId,
                'order_id' => $order->id,
                'user_id' => $user->id,
                'amount' => $total,
                'currency' => 'USD',
                'method' => $paymentMethod,
                'status' => 'PENDING',
                'transaction_ref' => 'TXN-' . strtoupper(Str::random(10)),
            ];

            // 8. If KHQR, generate dynamic EMVCo KHQR data & MD5 hash
            if ($paymentMethod === 'KHQR') {
                $expiresAt = now()->addMinutes(15);
                $khqrResult = $bakongService->generateKhqr($total, 'USD', $order->id);

                $paymentData['khqr'] = $khqrResult['khqr'];
                $paymentData['md5'] = $khqrResult['md5'];
                $paymentData['expires_at'] = $expiresAt;
            }

            $payment = Payment::create($paymentData);

            // 9. Clear customer's cart
            $cart->items()->delete();

            DB::commit();

            // Structure response containing order and KHQR payment data
            $order->load(['items.product.primaryImage', 'payments', 'user']);

            return $this->sendResponse([
                'order' => $order,
                'payment' => [
                    'id' => $payment->id,
                    'payment_id' => $payment->id,
                    'order_id' => $order->id,
                    'order_number' => $order->id,
                    'amount' => (float) $payment->amount,
                    'currency' => $payment->currency ?? 'USD',
                    'payment_method' => $payment->method,
                    'payment_status' => $payment->status,
                    'khqr' => $payment->khqr,
                    'md5' => $payment->md5,
                    'expires_at' => $payment->expires_at?->toISOString(),
                ],
                // Root convenience fields
                'payment_id' => $payment->id,
                'order_id' => $order->id,
                'order_number' => $order->id,
                'amount' => (float) $payment->amount,
                'currency' => $payment->currency ?? 'USD',
                'khqr' => $payment->khqr,
                'expires_at' => $payment->expires_at?->toISOString(),
                'payment_status' => $payment->status,
            ], 'Order placed successfully', 201);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->sendError('Failed to place order: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Customer cancel order.
     */
    public function cancel(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $order = Order::where('id', $id)->first();

        if (! $order) {
            return $this->sendError('Order not found', [], 404);
        }

        if (! $user->isAdmin() && $order->user_id !== $user->id) {
            return $this->sendError('Unauthorized', [], 403);
        }

        if ($order->status !== 'PENDING') {
            return $this->sendError('Only pending orders can be cancelled', [], 400);
        }

        $order->update(['status' => 'CANCELLED']);
        $order->payments()->where('status', 'PENDING')->update(['status' => 'CANCELLED']);

        return $this->sendResponse($order, 'Order cancelled successfully');
    }

    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    /**
     * Admin: Listing of all store orders.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Order::with(['items', 'user', 'payments']);

        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($sub) use ($q) {
                $sub->where('id', 'like', "%{$q}%")
                    ->orWhereHas('user', function ($userSub) use ($q) {
                        $userSub->where('name', 'like', "%{$q}%")
                                ->orWhere('email', 'like', "%{$q}%");
                    });
            });
        }

        $orders = $query->latest()->get();

        return $this->sendResponse($orders, 'Admin orders retrieved successfully');
    }

    /**
     * Admin: Update order status.
     */
    public function adminUpdateStatus(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:PENDING,CONFIRMED,PROCESSING,SHIPPED,DELIVERED,CANCELLED',
        ]);

        $order = Order::with(['items', 'user', 'payments'])->find($id);

        if (! $order) {
            return $this->sendError('Order not found', [], 404);
        }

        $order->update(['status' => $validated['status']]);

        // Auto mark payment paid if delivered
        if ($validated['status'] === 'DELIVERED' && $order->payment_status === 'PENDING') {
            $order->update(['payment_status' => 'PAID']);
            $order->payments()->update([
                'status' => 'PAID',
                'paid_at' => now(),
            ]);
        }

        return $this->sendResponse($order, 'Order status updated successfully');
    }
}
