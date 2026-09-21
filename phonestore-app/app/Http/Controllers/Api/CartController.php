<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    use ApiResponse;

    /**
     * Get or create active cart for user.
     */
    protected function getOrCreateCart(Request $request): Cart
    {
        $user = $request->user();

        if (! $user && ($bearer = $request->bearerToken())) {
            $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($bearer);
            if ($tokenModel && $tokenModel->tokenable) {
                $user = $tokenModel->tokenable;
            }
        }

        if ($user) {
            return Cart::firstOrCreate(['user_id' => $user->id]);
        }

        $sessionId = $request->header('X-Session-Id') ?: ($request->cookie('cart_session') ?: $request->ip());
        return Cart::firstOrCreate(['session_id' => $sessionId]);
    }

    /**
     * Format cart with computed totals and variant details.
     */
    protected function formatCart(Cart $cart): array
    {
        $cart->load(['items.variant.product.primaryImage']);

        $items = [];
        $subtotal = 0.0;

        foreach ($cart->items as $item) {
            $variant = $item->variant;
            if (! $variant) {
                continue;
            }

            $product = $variant->product;
            $price = (float) ($variant->price ?: ($product ? $product->base_price : 0));
            $lineTotal = round($price * $item->quantity, 2);
            $subtotal += $lineTotal;

            $items[] = [
                'id' => $item->id,
                'cart_id' => $cart->id,
                'product_id' => $product?->id,
                'product_name' => $product?->name ?? 'Mobile Phone',
                'product_variant_id' => $variant->id,
                'color' => $variant->color,
                'storage' => $variant->storage,
                'ram' => $variant->ram,
                'sku' => $variant->sku,
                'price' => $price,
                'stock' => (int) $variant->stock,
                'quantity' => (int) $item->quantity,
                'line_total' => $lineTotal,
                'image_url' => $product?->primaryImage?->url ?? $product?->primaryImage?->image_url,
            ];
        }

        $shippingFee = $subtotal > 0 ? 5.00 : 0.00;
        $discount = 0.00;
        $total = round($subtotal + $shippingFee - $discount, 2);

        return [
            'id' => $cart->id,
            'items' => $items,
            'subtotal' => round($subtotal, 2),
            'shipping_fee' => $shippingFee,
            'discount' => $discount,
            'total' => $total,
            'items_count' => count($items),
        ];
    }

    /**
     * Display the cart.
     */
    public function show(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request);

        return $this->sendResponse($this->formatCart($cart), 'Cart retrieved successfully');
    }

    /**
     * Add an item to the cart.
     */
    public function addItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'nullable|integer|min:1|max:50',
        ]);

        $quantity = (int) ($validated['quantity'] ?? 1);
        $variant = ProductVariant::findOrFail($validated['product_variant_id']);

        if ($variant->stock < $quantity) {
            return $this->sendError('Insufficient stock for this product variant', ['stock' => ["Only {$variant->stock} units left in stock."]], 422);
        }

        $cart = $this->getOrCreateCart($request);

        $item = $cart->items()->where('product_variant_id', $variant->id)->first();
        if ($item) {
            $newQuantity = $item->quantity + $quantity;
            if ($variant->stock < $newQuantity) {
                return $this->sendError('Cannot add more than available stock', ['stock' => ["Available stock is {$variant->stock}."]], 422);
            }
            $item->update(['quantity' => $newQuantity]);
        } else {
            $cart->items()->create([
                'product_variant_id' => $variant->id,
                'quantity' => $quantity,
            ]);
        }

        return $this->sendResponse($this->formatCart($cart), 'Item added to cart successfully', 201);
    }

    /**
     * Update quantity of a cart item.
     */
    public function updateItem(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1|max:50',
        ]);

        $cart = $this->getOrCreateCart($request);
        $item = $cart->items()->find($id);

        if (! $item) {
            return $this->sendError('Cart item not found', [], 404);
        }

        $variant = $item->variant;
        if ($variant && $variant->stock < $validated['quantity']) {
            return $this->sendError('Quantity exceeds available stock', ['stock' => ["Available stock is {$variant->stock}."]], 422);
        }

        $item->update(['quantity' => $validated['quantity']]);

        return $this->sendResponse($this->formatCart($cart), 'Cart item updated successfully');
    }

    /**
     * Remove an item from the cart.
     */
    public function removeItem(Request $request, string $id): JsonResponse
    {
        $cart = $this->getOrCreateCart($request);
        $item = $cart->items()->find($id);

        if (! $item) {
            return $this->sendError('Cart item not found', [], 404);
        }

        $item->delete();

        return $this->sendResponse($this->formatCart($cart), 'Cart item removed successfully');
    }

    /**
     * Clear all items in the cart.
     */
    public function clear(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request);
        $cart->items()->delete();

        return $this->sendResponse($this->formatCart($cart), 'Cart cleared successfully');
    }
}
