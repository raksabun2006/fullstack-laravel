<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\Wishlist;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    use ApiResponse;

    /**
     * Display customer wishlist.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $products = Product::with(['brand', 'category', 'variants', 'images', 'primaryImage'])
            ->whereIn('id', $user->wishlists()->pluck('product_id'))
            ->latest()
            ->get();

        return $this->sendResponse(ProductResource::collection($products), 'Wishlist retrieved successfully');
    }

    /**
     * Add a product to wishlist.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $user = $request->user();

        Wishlist::firstOrCreate([
            'user_id' => $user->id,
            'product_id' => $validated['product_id'],
        ]);

        return $this->index($request);
    }

    /**
     * Remove a product from wishlist.
     */
    public function destroy(Request $request, string $productId): JsonResponse
    {
        $user = $request->user();

        $user->wishlists()->where('product_id', $productId)->delete();

        return $this->index($request);
    }
}
