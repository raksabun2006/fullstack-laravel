<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Services\BakongService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    use ApiResponse;

    /**
     * Create or retrieve a dynamic Bakong KHQR payment for an order.
     *
     * POST /api/payments/khqr
     */
    public function createKhqr(Request $request, BakongService $bakongService): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|string|exists:orders,id',
            'currency' => 'nullable|string|in:USD,KHR,usd,khr',
        ]);

        $user = $request->user();
        $order = Order::with('user')->find($validated['order_id']);

        if (! $order) {
            return $this->sendError('Order not found', [], 404);
        }

        // Authorization: Verify the authenticated customer owns the order, or is an admin
        if (! $user->isAdmin() && $order->user_id !== $user->id) {
            return $this->sendError('Unauthorized access to this order', [], 403);
        }

        // Verification: Check whether the order is eligible for payment
        if ($order->payment_status === 'PAID') {
            return $this->sendError('This order has already been paid and confirmed', [
                'order_id' => $order->id,
                'payment_status' => 'PAID',
            ], 400);
        }

        if ($order->status === 'CANCELLED') {
            return $this->sendError('Cannot generate payment for a cancelled order', [
                'order_id' => $order->id,
                'order_status' => 'CANCELLED',
            ], 400);
        }

        $currency = strtoupper($validated['currency'] ?? config('bakong.currency', 'USD'));
        $amount = (float) $order->total;

        // Check for an existing valid pending KHQR payment for this order
        $existingPayment = Payment::where('order_id', $order->id)
            ->where('method', 'KHQR')
            ->where('status', 'PENDING')
            ->latest()
            ->first();

        if ($existingPayment && $existingPayment->expires_at && now()->lessThan($existingPayment->expires_at)) {
            return $this->sendResponse([
                'payment_id' => $existingPayment->id,
                'order_id' => $order->id,
                'order_number' => $order->id,
                'amount' => (float) $existingPayment->amount,
                'currency' => $existingPayment->currency ?? $currency,
                'payment_status' => $existingPayment->status,
                'khqr' => $existingPayment->khqr,
                'md5' => $existingPayment->md5,
                'expires_at' => $existingPayment->expires_at?->toISOString(),
            ], 'Active Bakong KHQR retrieved successfully');
        }

        // If an old pending payment has expired, mark it as EXPIRED
        if ($existingPayment && $existingPayment->expires_at && now()->greaterThanOrEqualTo($existingPayment->expires_at)) {
            $existingPayment->update([
                'status' => 'EXPIRED',
                'failure_reason' => 'Payment session window elapsed',
            ]);
        }

        // Generate fresh EMVCo KHQR and MD5 hash
        $khqrResult = $bakongService->generateKhqr($amount, $currency, $order->id);
        $expiresAt = now()->addMinutes(15);

        // Generate a collision-free payment ID
        $payId = 'PAY-' . ((int) Payment::count() + 8001);
        while (Payment::where('id', $payId)->exists()) {
            $payId = 'PAY-' . rand(10000, 99999);
        }

        $payment = Payment::create([
            'id' => $payId,
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'amount' => $amount,
            'currency' => $currency,
            'method' => 'KHQR',
            'status' => 'PENDING',
            'khqr' => $khqrResult['khqr'],
            'md5' => $khqrResult['md5'],
            'expires_at' => $expiresAt,
            'transaction_ref' => 'TXN-' . strtoupper(Str::random(10)),
        ]);

        // Sync payment method and status to order
        $order->update([
            'payment_method' => 'KHQR',
            'payment_status' => 'PENDING',
        ]);

        return $this->sendResponse([
            'payment_id' => $payment->id,
            'order_id' => $order->id,
            'order_number' => $order->id,
            'amount' => (float) $payment->amount,
            'currency' => $payment->currency,
            'payment_status' => $payment->status,
            'khqr' => $payment->khqr,
            'md5' => $payment->md5,
            'expires_at' => $payment->expires_at?->toISOString(),
        ], 'Bakong KHQR payment generated successfully', 201);
    }

    /**
     * Check payment status and safely verify transaction against Bakong Open API.
     *
     * GET|POST /api/payments/{id}/check
     */
    public function check(Request $request, string $id, BakongService $bakongService): JsonResponse
    {
        $user = $request->user();
        $payment = Payment::with(['order.user', 'user'])->find($id);

        if (! $payment) {
            return $this->sendError('Payment not found', [], 404);
        }

        // Authorize: customer must own the payment or order, or be an administrator
        if (! $user->isAdmin() && $payment->user_id !== $user->id && $payment->order?->user_id !== $user->id) {
            return $this->sendError('Unauthorized access to payment', [], 403);
        }

        // 1. Idempotency fast-path: If already PAID, return successful status immediately
        if ($payment->status === 'PAID') {
            return $this->sendResponse([
                'payment_id' => $payment->id,
                'order_id' => $payment->order_id,
                'payment_status' => 'PAID',
                'order_status' => $payment->order?->status ?? 'CONFIRMED',
                'amount' => (float) $payment->amount,
                'currency' => $payment->currency ?? 'USD',
                'transaction_hash' => $payment->transaction_hash,
                'paid_at' => $payment->paid_at?->toISOString(),
                'message' => 'Payment already verified and confirmed',
            ], 'Payment confirmed successfully');
        }

        // 2. Check for expiration
        if ($payment->expires_at && now()->greaterThan($payment->expires_at)) {
            if ($payment->status === 'PENDING') {
                DB::transaction(function () use ($id) {
                    $locked = Payment::where('id', $id)->lockForUpdate()->first();
                    if ($locked && $locked->status === 'PENDING') {
                        $locked->update([
                            'status' => 'EXPIRED',
                            'failure_reason' => 'Payment session window expired',
                        ]);

                        if ($locked->order && $locked->order->payment_status === 'PENDING') {
                            $locked->order->update(['payment_status' => 'EXPIRED']);
                        }
                    }
                });
            }

            return $this->sendResponse([
                'payment_id' => $payment->id,
                'order_id' => $payment->order_id,
                'payment_status' => 'EXPIRED',
                'order_status' => $payment->order?->status ?? 'PENDING',
                'amount' => (float) $payment->amount,
                'currency' => $payment->currency ?? 'USD',
                'message' => 'Payment session has expired. You can generate a new QR code.',
            ], 'Payment session has expired');
        }

        // 3. For non-KHQR payments, return current recorded status
        if (strtoupper($payment->method) !== 'KHQR') {
            return $this->sendResponse([
                'payment_id' => $payment->id,
                'order_id' => $payment->order_id,
                'payment_status' => $payment->status,
                'order_status' => $payment->order?->status ?? 'PENDING',
                'amount' => (float) $payment->amount,
                'currency' => $payment->currency ?? 'USD',
            ], 'Payment status retrieved');
        }

        // 4. Query Bakong Open API via MD5 hash
        $bakongResult = $bakongService->checkTransactionByMd5($payment->md5 ?? '');

        // If Bakong network confirmed the transaction
        if ($bakongResult['success'] && $bakongResult['found'] && ! empty($bakongResult['data'])) {
            return DB::transaction(function () use ($id, $bakongResult) {
                // Pessimistic locking prevents race conditions and duplicate status mutations
                $lockedPayment = Payment::with('order')->where('id', $id)->lockForUpdate()->first();

                if (! $lockedPayment) {
                    return $this->sendError('Payment record not found during transaction lock', [], 404);
                }

                // Double-check idempotency under database row lock
                if ($lockedPayment->status === 'PAID') {
                    return $this->sendResponse([
                        'payment_id' => $lockedPayment->id,
                        'order_id' => $lockedPayment->order_id,
                        'payment_status' => 'PAID',
                        'order_status' => $lockedPayment->order?->status ?? 'CONFIRMED',
                        'amount' => (float) $lockedPayment->amount,
                        'currency' => $lockedPayment->currency ?? 'USD',
                        'transaction_hash' => $lockedPayment->transaction_hash,
                        'paid_at' => $lockedPayment->paid_at?->toISOString(),
                        'message' => 'Payment confirmed successfully',
                    ], 'Payment confirmed successfully');
                }

                $data = $bakongResult['data'];
                $bakongAmount = isset($data['amount']) ? (float) $data['amount'] : null;
                $bakongCurrency = isset($data['currency']) ? strtoupper((string) $data['currency']) : null;
                $orderAmount = (float) $lockedPayment->amount;
                $orderCurrency = strtoupper($lockedPayment->currency ?: 'USD');

                // Verify transaction amount
                if ($bakongAmount !== null && abs($bakongAmount - $orderAmount) > 0.01) {
                    $lockedPayment->update([
                        'status' => 'FAILED',
                        'failure_reason' => "Amount mismatch: expected {$orderAmount}, received {$bakongAmount}",
                    ]);

                    return $this->sendError('Payment amount does not match order total', [
                        'expected' => $orderAmount,
                        'received' => $bakongAmount,
                    ], 422);
                }

                // Verify transaction currency
                if ($bakongCurrency !== null && $bakongCurrency !== $orderCurrency) {
                    $lockedPayment->update([
                        'status' => 'FAILED',
                        'failure_reason' => "Currency mismatch: expected {$orderCurrency}, received {$bakongCurrency}",
                    ]);

                    return $this->sendError('Payment currency does not match order currency', [], 422);
                }

                // Transaction successfully verified: Save details and transition statuses
                $txHash = $data['hash'] ?? $data['externalTransactionId'] ?? ('TXN-' . strtoupper(Str::random(12)));
                $txId = $data['id'] ?? $txHash;

                $lockedPayment->update([
                    'status' => 'PAID',
                    'transaction_hash' => $txHash,
                    'transaction_id' => $txId,
                    'paid_at' => now(),
                ]);

                if ($lockedPayment->order) {
                    $orderUpdates = ['payment_status' => 'PAID'];
                    if ($lockedPayment->order->status === 'PENDING') {
                        $orderUpdates['status'] = 'CONFIRMED';
                    }
                    $lockedPayment->order->update($orderUpdates);
                }

                return $this->sendResponse([
                    'payment_id' => $lockedPayment->id,
                    'order_id' => $lockedPayment->order_id,
                    'payment_status' => 'PAID',
                    'order_status' => $lockedPayment->order?->status ?? 'CONFIRMED',
                    'amount' => (float) $lockedPayment->amount,
                    'currency' => $lockedPayment->currency ?? 'USD',
                    'transaction_hash' => $txHash,
                    'paid_at' => $lockedPayment->paid_at?->toISOString(),
                ], 'Payment confirmed successfully');
            });
        }

        // Transaction not yet confirmed on Bakong network: Keep PENDING
        return $this->sendResponse([
            'payment_id' => $payment->id,
            'order_id' => $payment->order_id,
            'payment_status' => $payment->status,
            'order_status' => $payment->order?->status ?? 'PENDING',
            'amount' => (float) $payment->amount,
            'currency' => $payment->currency ?? 'USD',
            'message' => $bakongResult['message'] ?? 'Waiting for payment authorization',
        ], 'Payment is pending');
    }

    /**
     * Display a specific payment.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $payment = Payment::with(['order.user', 'user'])->find($id);

        if (! $payment) {
            return $this->sendError('Payment not found', [], 404);
        }

        // Customer authorization: must own payment or order, or be an admin
        if (! $user->isAdmin() && $payment->user_id !== $user->id && $payment->order?->user_id !== $user->id) {
            return $this->sendError('Unauthorized access to payment', [], 403);
        }

        return $this->sendResponse([
            'id' => $payment->id,
            'payment_id' => $payment->id,
            'order_id' => $payment->order_id,
            'order_number' => $payment->order_id,
            'customer' => $payment->customer,
            'amount' => (float) $payment->amount,
            'currency' => $payment->currency ?? 'USD',
            'method' => $payment->method,
            'payment_method' => $payment->method,
            'status' => $payment->status,
            'payment_status' => $payment->status,
            'transaction_ref' => $payment->transaction_ref,
            'transaction_id' => $payment->transaction_id ?? $payment->transaction_ref,
            'transaction_hash' => $payment->transaction_hash,
            'khqr' => $payment->khqr,
            'md5' => $payment->md5,
            'paid_at' => $payment->paid_at?->toISOString(),
            'expires_at' => $payment->expires_at?->toISOString(),
            'created_at' => $payment->created_at?->toISOString(),
        ], 'Payment retrieved successfully');
    }

    /**
     * Get payment for a specific order.
     */
    public function getByOrder(Request $request, string $orderId): JsonResponse
    {
        $user = $request->user();
        $payment = Payment::with(['order.user', 'user'])->where('order_id', $orderId)->latest()->first();

        if (! $payment) {
            return $this->sendError('Payment for this order not found', [], 404);
        }

        if (! $user->isAdmin() && $payment->user_id !== $user->id && $payment->order?->user_id !== $user->id) {
            return $this->sendError('Unauthorized access to payment', [], 403);
        }

        return $this->sendResponse([
            'id' => $payment->id,
            'payment_id' => $payment->id,
            'order_id' => $payment->order_id,
            'order_number' => $payment->order_id,
            'customer' => $payment->customer,
            'amount' => (float) $payment->amount,
            'currency' => $payment->currency ?? 'USD',
            'method' => $payment->method,
            'payment_method' => $payment->method,
            'status' => $payment->status,
            'payment_status' => $payment->status,
            'transaction_ref' => $payment->transaction_ref,
            'transaction_id' => $payment->transaction_id ?? $payment->transaction_ref,
            'transaction_hash' => $payment->transaction_hash,
            'khqr' => $payment->khqr,
            'md5' => $payment->md5,
            'paid_at' => $payment->paid_at?->toISOString(),
            'expires_at' => $payment->expires_at?->toISOString(),
            'created_at' => $payment->created_at?->toISOString(),
        ], 'Order payment retrieved successfully');
    }

    /**
     * Record a new payment manually with order ownership validation.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'method' => 'required|string|max:100',
            'amount' => 'nullable|numeric|min:0.01',
            'currency' => 'nullable|string|max:10',
            'transaction_ref' => 'nullable|string|max:100',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        // IDOR Protection: authenticated customer must own this order
        if (! $request->user()->isAdmin() && $order->user_id !== $request->user()->id) {
            return $this->sendError('Unauthorized to create payment for this order', [], 403);
        }

        $payId = 'PAY-' . ((int) Payment::count() + 8001);
        while (Payment::where('id', $payId)->exists()) {
            $payId = 'PAY-' . rand(10000, 99999);
        }

        $payment = Payment::create([
            'id' => $payId,
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'amount' => $validated['amount'] ?? $order->total,
            'currency' => $validated['currency'] ?? 'USD',
            'method' => $validated['method'],
            'status' => 'PENDING',
            'transaction_ref' => $validated['transaction_ref'] ?? ('TXN-' . strtoupper(Str::random(10))),
        ]);

        return $this->sendResponse($payment, 'Payment recorded successfully', 201);
    }

    /**
     * Display a listing of payments (Admin).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Payment::with(['order.user', 'user']);

        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        $payments = $query->latest()->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'payment_id' => $p->id,
                'order_id' => $p->order_id,
                'order_number' => $p->order_id,
                'customer' => $p->customer,
                'amount' => (float) $p->amount,
                'currency' => $p->currency ?? 'USD',
                'method' => $p->method,
                'payment_method' => $p->method,
                'status' => $p->status,
                'payment_status' => $p->status,
                'transaction_ref' => $p->transaction_ref,
                'transaction_id' => $p->transaction_id ?? $p->transaction_ref,
                'transaction_hash' => $p->transaction_hash,
                'khqr' => $p->khqr,
                'md5' => $p->md5,
                'paid_at' => $p->paid_at?->toISOString(),
                'expires_at' => $p->expires_at?->toISOString(),
                'created_at' => $p->created_at?->toISOString(),
            ];
        });

        return $this->sendResponse($payments, 'Payments retrieved successfully');
    }

    /**
     * Admin: Update payment status.
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:PENDING,PAID,FAILED,CANCELLED,REFUNDED,EXPIRED',
        ]);

        $payment = Payment::with('order')->find($id);

        if (! $payment) {
            return $this->sendError('Payment not found', [], 404);
        }

        $payment->update([
            'status' => $validated['status'],
            'paid_at' => $validated['status'] === 'PAID' ? now() : $payment->paid_at,
        ]);

        // Sync with order
        if ($payment->order) {
            $payment->order->update([
                'payment_status' => $validated['status'],
                'status' => $validated['status'] === 'PAID' && $payment->order->status === 'PENDING'
                    ? 'CONFIRMED'
                    : $payment->order->status,
            ]);
        }

        return $this->sendResponse($payment, 'Payment status updated successfully');
    }
}
