<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Image\StoreProductImageRequest;
use App\Http\Resources\ProductImageResource;
use App\Models\Product;
use App\Models\ProductImage;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class ProductImageController extends Controller
{
    use ApiResponse;

    /**
     * List all images for a product.
     */
    public function indexForProduct(string $productId): JsonResponse
    {
        $product = Product::find($productId);

        if (! $product) {
            return $this->sendError('Product not found', [], 404);
        }

        $images = $product->images()->latest()->get();

        return $this->sendResponse(ProductImageResource::collection($images), 'Product images retrieved successfully');
    }

    /**
     * Upload or attach an image to a product.
     */
    public function storeForProduct(StoreProductImageRequest $request, string $productId): JsonResponse
    {
        $product = Product::find($productId);

        if (! $product) {
            return $this->sendError('Product not found', [], 404);
        }

        $isPrimary = filter_var($request->input('is_primary', false), FILTER_VALIDATE_BOOLEAN);

        // If this image is marked primary, reset other images
        if ($isPrimary) {
            $product->images()->update(['is_primary' => false]);
        }

        $imageUrl = $request->input('image_url');

        // Handle uploaded file
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $imageUrl = $path;
        }

        $image = $product->images()->create([
            'image_url' => $imageUrl,
            'is_primary' => $isPrimary,
        ]);

        return $this->sendResponse(new ProductImageResource($image), 'Product image added successfully', 201);
    }

    /**
     * Delete an image.
     */
    public function destroy(string $id): JsonResponse
    {
        $image = ProductImage::find($id);

        if (! $image) {
            return $this->sendError('Image not found', [], 404);
        }

        // Delete physical file if stored in public disk and not an external URL
        if (! filter_var($image->image_url, FILTER_VALIDATE_URL) && Storage::disk('public')->exists($image->image_url)) {
            Storage::disk('public')->delete($image->image_url);
        }

        $image->delete();

        return $this->sendResponse(null, 'Image deleted successfully');
    }
}
