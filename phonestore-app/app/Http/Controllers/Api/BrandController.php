<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Brand\StoreBrandRequest;
use App\Http\Requests\Brand\UpdateBrandRequest;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of brands.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Brand::query();

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $brands = $query->withCount('products')->latest()->get();

        return $this->sendResponse(BrandResource::collection($brands), 'Brands retrieved successfully');
    }

    /**
     * Store a newly created brand.
     */
    public function store(StoreBrandRequest $request): JsonResponse
    {
        $data = $request->validated();
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $brand = Brand::create($data);

        return $this->sendResponse(new BrandResource($brand), 'Brand created successfully', 201);
    }

    /**
     * Display the specified brand.
     */
    public function show(string $id): JsonResponse
    {
        $brand = Brand::withCount('products')->find($id);

        if (! $brand) {
            return $this->sendError('Brand not found', [], 404);
        }

        return $this->sendResponse(new BrandResource($brand), 'Brand retrieved successfully');
    }

    /**
     * Update the specified brand.
     */
    public function update(UpdateBrandRequest $request, string $id): JsonResponse
    {
        $brand = Brand::find($id);

        if (! $brand) {
            return $this->sendError('Brand not found', [], 404);
        }

        $data = $request->validated();
        if (isset($data['name']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $brand->update($data);

        return $this->sendResponse(new BrandResource($brand), 'Brand updated successfully');
    }

    /**
     * Remove the specified brand.
     */
    public function destroy(string $id): JsonResponse
    {
        $brand = Brand::find($id);

        if (! $brand) {
            return $this->sendError('Brand not found', [], 404);
        }

        $brand->delete();

        return $this->sendResponse(null, 'Brand deleted successfully');
    }
}
