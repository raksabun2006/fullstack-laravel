<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Variant\StoreProductVariantRequest;
use App\Http\Requests\Variant\UpdateProductVariantRequest;
use App\Http\Resources\ProductVariantResource;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class ProductVariantController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of variants for a product.
     */
    public function indexForProduct(string $productId): JsonResponse
    {
        $product = Product::find($productId);

        if (! $product) {
            return $this->sendError('Product not found', [], 404);
        }

        $variants = $product->variants()->latest()->get();

        return $this->sendResponse(ProductVariantResource::collection($variants), 'Variants retrieved successfully');
    }

    /**
     * Store a new variant for a product.
     */
    public function storeForProduct(StoreProductVariantRequest $request, string $productId): JsonResponse
    {
        $product = Product::find($productId);

        if (! $product) {
            return $this->sendError('Product not found', [], 404);
        }

        $variant = $product->variants()->create($request->validated());

        return $this->sendResponse(new ProductVariantResource($variant), 'Variant created successfully', 201);
    }

    /**
     * Display a specific variant.
     */
    public function show(string $id): JsonResponse
    {
        $variant = ProductVariant::find($id);

        if (! $variant) {
            return $this->sendError('Product variant not found', [], 404);
        }

        return $this->sendResponse(new ProductVariantResource($variant), 'Variant retrieved successfully');
    }

    /**
     * Update a specific variant.
     */
    public function update(UpdateProductVariantRequest $request, string $id): JsonResponse
    {
        $variant = ProductVariant::find($id);

        if (! $variant) {
            return $this->sendError('Product variant not found', [], 404);
        }

        $variant->update($request->validated());

        return $this->sendResponse(new ProductVariantResource($variant), 'Variant updated successfully');
    }

    /**
     * Delete a specific variant.
     */
    public function destroy(string $id): JsonResponse
    {
        $variant = ProductVariant::find($id);

        if (! $variant) {
            return $this->sendError('Product variant not found', [], 404);
        }

        $variant->delete();

        return $this->sendResponse(null, 'Variant deleted successfully');
    }
}
