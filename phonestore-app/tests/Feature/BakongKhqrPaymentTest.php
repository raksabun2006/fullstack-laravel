<?php

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Services\BakongService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

function createTestOrder(User $user, float $total = 100.00, string $currency = 'USD'): Order
{
    return Order::create([
        'id' => 'ORD-' . rand(1000, 9999),
        'user_id' => $user->id,
        'status' => 'PENDING',
        'payment_status' => 'PENDING',
        'payment_method' => 'KHQR',
        'shipping_fee' => 5.00,
        'subtotal' => $total - 5.00,
        'total' => $total,
        'shipping_address' => [
            'name' => $user->name,
            'phone' => '+85512345678',
            'province' => 'Phnom Penh',
            'address' => 'Street 2004',
        ],
    ]);
}

// 1. Customer creates KHQR for own order
test('customer can create dynamic Bakong KHQR for their own order', function () {
    $customer = User::factory()->create(['role' => 'CUSTOMER']);
    $order = createTestOrder($customer, 150.00);

    $response = $this->actingAs($customer, 'sanctum')
        ->postJson('/api/payments/khqr', [
            'order_id' => $order->id,
            'currency' => 'USD',
        ]);

    $response->assertStatus(201)
        ->assertJson([
            'success' => true,
            'data' => [
                'order_id' => $order->id,
                'amount' => 150.00,
                'currency' => 'USD',
                'payment_status' => 'PENDING',
            ],
        ])
        ->assertJsonStructure([
            'data' => [
                'payment_id',
                'order_id',
                'amount',
                'currency',
                'payment_status',
                'khqr',
                'md5',
                'expires_at',
            ],
        ]);

    $this->assertDatabaseHas('payments', [
        'order_id' => $order->id,
        'user_id' => $customer->id,
        'status' => 'PENDING',
        'method' => 'KHQR',
    ]);
});

// 2. Customer cannot create payment for another user's order
test('customer cannot create payment for another customers order', function () {
    $alice = User::factory()->create(['role' => 'CUSTOMER']);
    $bob = User::factory()->create(['role' => 'CUSTOMER']);
    $orderOfBob = createTestOrder($bob, 200.00);

    // Alice attempts to create payment for Bob's order
    $response = $this->actingAs($alice, 'sanctum')
        ->postJson('/api/payments/khqr', [
            'order_id' => $orderOfBob->id,
        ]);

    $response->assertStatus(403)
        ->assertJson(['success' => false]);
});

// 3. KHQR payment is generated with valid EMVCo string and MD5 hash
test('generated KHQR contains correct EMVCo tags and valid MD5 hash', function () {
    $bakongService = new BakongService();
    $result = $bakongService->generateKhqr(125.50, 'USD', 'ORD-9999');

    expect($result)->toHaveKeys(['khqr', 'md5', 'amount', 'currency']);
    expect($result['amount'])->toBe(125.50);
    expect($result['currency'])->toBe('USD');
    expect($result['md5'])->toBe(strtolower(md5($result['khqr'])));
    // EMVCo Payload Format tag 00
    expect(str_starts_with($result['khqr'], '000201'))->toBeTrue();
    // Dynamic QR tag 01
    expect(str_contains($result['khqr'], '010212'))->toBeTrue();
});

// 4. Payment remains PENDING when transaction is not found on Bakong
test('payment check remains PENDING when Bakong reports transaction not found', function () {
    $customer = User::factory()->create(['role' => 'CUSTOMER']);
    $order = createTestOrder($customer, 80.00);

    $payment = Payment::create([
        'id' => 'PAY-TEST-01',
        'order_id' => $order->id,
        'user_id' => $customer->id,
        'amount' => 80.00,
        'currency' => 'USD',
        'method' => 'KHQR',
        'status' => 'PENDING',
        'md5' => 'e10adc3949ba59abbe56e057f20f883e',
        'expires_at' => now()->addMinutes(15),
    ]);

    // Mock Bakong API returning 404 or responseCode: 1 (not found)
    Http::fake([
        '*/v1/check_transaction_by_md5' => Http::response([
            'responseCode' => 1,
            'responseMessage' => 'Transaction not found',
            'data' => null,
        ], 200),
    ]);

    $response = $this->actingAs($customer, 'sanctum')
        ->getJson("/api/payments/{$payment->id}/check");

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'data' => [
                'payment_status' => 'PENDING',
            ],
        ]);

    expect($payment->fresh()->status)->toBe('PENDING');
});

// 5. Payment becomes PAID after successful Bakong verification
test('payment transitions to PAID and order CONFIRMED upon successful Bakong verification', function () {
    $customer = User::factory()->create(['role' => 'CUSTOMER']);
    $order = createTestOrder($customer, 120.00);

    $payment = Payment::create([
        'id' => 'PAY-TEST-02',
        'order_id' => $order->id,
        'user_id' => $customer->id,
        'amount' => 120.00,
        'currency' => 'USD',
        'method' => 'KHQR',
        'status' => 'PENDING',
        'md5' => 'c33367701511b4f6020ec61ded352059',
        'expires_at' => now()->addMinutes(15),
    ]);

    // Mock Bakong API returning verified transaction
    Http::fake([
        '*/v1/check_transaction_by_md5' => Http::response([
            'responseCode' => 0,
            'responseMessage' => 'Success',
            'data' => [
                'hash' => 'BAKONG_HASH_XYZ_789',
                'externalTransactionId' => 'EXT_TXN_001',
                'amount' => 120.00,
                'currency' => 'USD',
                'fromAccountId' => 'payer@devb',
                'toAccountId' => 'phonestore@devb',
            ],
        ], 200),
    ]);

    $response = $this->actingAs($customer, 'sanctum')
        ->postJson("/api/payments/{$payment->id}/check");

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'data' => [
                'payment_status' => 'PAID',
                'order_status' => 'CONFIRMED',
                'amount' => 120.00,
                'transaction_hash' => 'BAKONG_HASH_XYZ_789',
            ],
        ]);

    $freshPayment = $payment->fresh();
    expect($freshPayment->status)->toBe('PAID');
    expect($freshPayment->transaction_hash)->toBe('BAKONG_HASH_XYZ_789');
    expect($freshPayment->paid_at)->not->toBeNull();

    $freshOrder = $order->fresh();
    expect($freshOrder->payment_status)->toBe('PAID');
    expect($freshOrder->status)->toBe('CONFIRMED');
});

// 6. Amount mismatch causes failure
test('transaction fails verification when Bakong amount does not match order amount', function () {
    $customer = User::factory()->create(['role' => 'CUSTOMER']);
    $order = createTestOrder($customer, 100.00);

    $payment = Payment::create([
        'id' => 'PAY-TEST-03',
        'order_id' => $order->id,
        'user_id' => $customer->id,
        'amount' => 100.00,
        'currency' => 'USD',
        'method' => 'KHQR',
        'status' => 'PENDING',
        'md5' => 'c33367701511b4f6020ec61ded352059',
        'expires_at' => now()->addMinutes(15),
    ]);

    // Payer only sent 50.00 instead of 100.00
    Http::fake([
        '*/v1/check_transaction_by_md5' => Http::response([
            'responseCode' => 0,
            'data' => [
                'hash' => 'BAKONG_HASH_MISMATCH',
                'amount' => 50.00,
                'currency' => 'USD',
            ],
        ], 200),
    ]);

    $response = $this->actingAs($customer, 'sanctum')
        ->getJson("/api/payments/{$payment->id}/check");

    $response->assertStatus(422)
        ->assertJson(['success' => false]);

    $freshPayment = $payment->fresh();
    expect($freshPayment->status)->toBe('FAILED');
    expect($freshPayment->failure_reason)->toContain('Amount mismatch');
    expect($order->fresh()->payment_status)->toBe('PENDING');
});

// 7. Currency mismatch causes failure
test('transaction fails verification when Bakong currency does not match order currency', function () {
    $customer = User::factory()->create(['role' => 'CUSTOMER']);
    $order = createTestOrder($customer, 100.00);

    $payment = Payment::create([
        'id' => 'PAY-TEST-04',
        'order_id' => $order->id,
        'user_id' => $customer->id,
        'amount' => 100.00,
        'currency' => 'USD',
        'method' => 'KHQR',
        'status' => 'PENDING',
        'md5' => 'c33367701511b4f6020ec61ded352059',
        'expires_at' => now()->addMinutes(15),
    ]);

    // Sent 100 KHR instead of USD
    Http::fake([
        '*/v1/check_transaction_by_md5' => Http::response([
            'responseCode' => 0,
            'data' => [
                'hash' => 'BAKONG_CURRENCY_MISMATCH',
                'amount' => 100.00,
                'currency' => 'KHR',
            ],
        ], 200),
    ]);

    $response = $this->actingAs($customer, 'sanctum')
        ->getJson("/api/payments/{$payment->id}/check");

    $response->assertStatus(422)
        ->assertJson(['success' => false]);

    $freshPayment = $payment->fresh();
    expect($freshPayment->status)->toBe('FAILED');
    expect($freshPayment->failure_reason)->toContain('Currency mismatch');
});

// 8. Expired payment becomes EXPIRED
test('pending payment past expiration window transitions to EXPIRED', function () {
    $customer = User::factory()->create(['role' => 'CUSTOMER']);
    $order = createTestOrder($customer, 50.00);

    $payment = Payment::create([
        'id' => 'PAY-TEST-05',
        'order_id' => $order->id,
        'user_id' => $customer->id,
        'amount' => 50.00,
        'currency' => 'USD',
        'method' => 'KHQR',
        'status' => 'PENDING',
        'md5' => 'e10adc3949ba59abbe56e057f20f883e',
        'expires_at' => now()->subMinutes(1), // Already expired
    ]);

    $response = $this->actingAs($customer, 'sanctum')
        ->getJson("/api/payments/{$payment->id}/check");

    $response->assertStatus(200)
        ->assertJson([
            'data' => [
                'payment_status' => 'EXPIRED',
            ],
        ]);

    expect($payment->fresh()->status)->toBe('EXPIRED');
    expect($order->fresh()->payment_status)->toBe('EXPIRED');
});

// 9. Already PAID payment is idempotent
test('checking an already PAID payment returns success idempotently without duplicate updates', function () {
    $customer = User::factory()->create(['role' => 'CUSTOMER']);
    $order = createTestOrder($customer, 250.00);
    $order->update(['status' => 'CONFIRMED', 'payment_status' => 'PAID']);

    $paidAt = now()->subHour();
    $payment = Payment::create([
        'id' => 'PAY-TEST-06',
        'order_id' => $order->id,
        'user_id' => $customer->id,
        'amount' => 250.00,
        'currency' => 'USD',
        'method' => 'KHQR',
        'status' => 'PAID',
        'transaction_hash' => 'EXISTING_HASH_ABC',
        'paid_at' => $paidAt,
        'expires_at' => now()->addMinutes(15),
    ]);

    // Bakong API should not even be called if already PAID
    Http::fake();

    $response = $this->actingAs($customer, 'sanctum')
        ->getJson("/api/payments/{$payment->id}/check");

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'data' => [
                'payment_status' => 'PAID',
                'order_status' => 'CONFIRMED',
                'transaction_hash' => 'EXISTING_HASH_ABC',
            ],
        ]);

    Http::assertNothingSent();
});

// 10. Bakong API timeout is handled safely without crashing
test('bakong API timeout returns safe pending response without corrupting payment state', function () {
    $customer = User::factory()->create(['role' => 'CUSTOMER']);
    $order = createTestOrder($customer, 75.00);

    $payment = Payment::create([
        'id' => 'PAY-TEST-07',
        'order_id' => $order->id,
        'user_id' => $customer->id,
        'amount' => 75.00,
        'currency' => 'USD',
        'method' => 'KHQR',
        'status' => 'PENDING',
        'md5' => 'e10adc3949ba59abbe56e057f20f883e',
        'expires_at' => now()->addMinutes(15),
    ]);

    // Simulate connection timeout
    Http::fake([
        '*/v1/check_transaction_by_md5' => function () {
            throw new \Illuminate\Http\Client\ConnectionException('Connection timed out');
        },
    ]);

    $response = $this->actingAs($customer, 'sanctum')
        ->getJson("/api/payments/{$payment->id}/check");

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'data' => [
                'payment_status' => 'PENDING',
            ],
        ]);

    expect($payment->fresh()->status)->toBe('PENDING');
});

// 11. Unauthorized payment access returns 403
test('unauthorized customer cannot check payment of another customer', function () {
    $alice = User::factory()->create(['role' => 'CUSTOMER']);
    $bob = User::factory()->create(['role' => 'CUSTOMER']);
    $orderOfBob = createTestOrder($bob, 100.00);

    $payment = Payment::create([
        'id' => 'PAY-BOB-01',
        'order_id' => $orderOfBob->id,
        'user_id' => $bob->id,
        'amount' => 100.00,
        'currency' => 'USD',
        'method' => 'KHQR',
        'status' => 'PENDING',
        'expires_at' => now()->addMinutes(15),
    ]);

    $response = $this->actingAs($alice, 'sanctum')
        ->getJson("/api/payments/{$payment->id}/check");

    $response->assertStatus(403)
        ->assertJson(['success' => false]);
});
