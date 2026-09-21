<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    use ApiResponse;

    protected function formatReview(Review $r): array
    {
        return [
            'id' => $r->id,
            'product_id' => $r->product_id,
            'product_name' => $r->product?->name ?? 'Mobile Phone',
            'customer' => $r->customer,
            'rating' => (int) $r->rating,
            'comment' => $r->comment,
            'status' => $r->status,
            'created_at' => $r->created_at?->toISOString(),
        ];
    }

    /**
     * Display all reviews.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Review::with(['product', 'user']);

        if ($request->filled('rating') && $request->rating !== 'ALL') {
            $query->where('rating', $request->rating);
        }

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($sub) use ($q) {
                $sub->where('comment', 'like', "%{$q}%")
                    ->orWhereHas('product', fn ($p) => $p->where('name', 'like', "%{$q}%"))
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$q}%")->orWhere('email', 'like', "%{$q}%"));
            });
        }

        $reviews = $query->latest()->get()->map(fn ($r) => $this->formatReview($r));

        return $this->sendResponse($reviews, 'Reviews retrieved successfully');
    }

    /**
     * Display customer's own reviews.
     */
    public function customerReviews(Request $request): JsonResponse
    {
        $user = $request->user();

        $reviews = Review::with(['product', 'user'])
            ->where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(fn ($r) => $this->formatReview($r));

        return $this->sendResponse($reviews, 'Customer reviews retrieved successfully');
    }

    /**
     * Display reviews for a specific product.
     */
    public function productReviews(string $productId): JsonResponse
    {
        $reviews = Review::with(['product', 'user'])
            ->where('product_id', $productId)
            ->where('status', 'APPROVED')
            ->latest()
            ->get()
            ->map(fn ($r) => $this->formatReview($r));

        return $this->sendResponse($reviews, 'Product reviews retrieved successfully');
    }

    /**
     * Store a new review.
     */
    public function store(Request $request, ?string $productId = null): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'nullable|exists:products,id',
            'product_name' => 'nullable|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:2000',
        ]);

        $pId = $productId ?: ($validated['product_id'] ?? null);

        if (! $pId) {
            // Find first available product or fallback
            $first = Product::first();
            $pId = $first ? $first->id : 1;
        }

        $user = $request->user();

        $review = Review::create([
            'product_id' => $pId,
            'user_id' => $user->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'status' => 'APPROVED',
        ]);

        $review->load(['product', 'user']);

        return $this->sendResponse($this->formatReview($review), 'Review submitted successfully', 201);
    }

    /**
     * Update an existing review.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $review = Review::with(['product', 'user'])->find($id);

        if (! $review) {
            return $this->sendError('Review not found', [], 404);
        }

        if (! $user->isAdmin() && $review->user_id !== $user->id) {
            return $this->sendError('Unauthorized', [], 403);
        }

        $validated = $request->validate([
            'rating' => 'sometimes|required|integer|min:1|max:5',
            'comment' => 'sometimes|required|string|max:2000',
            'status' => 'sometimes|string|in:APPROVED,PENDING,REJECTED',
        ]);

        $review->update($validated);

        return $this->sendResponse($this->formatReview($review), 'Review updated successfully');
    }

    /**
     * Delete a review.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $review = Review::find($id);

        if (! $review) {
            return $this->sendError('Review not found', [], 404);
        }

        if (! $user->isAdmin() && $review->user_id !== $user->id) {
            return $this->sendError('Unauthorized', [], 403);
        }

        $review->delete();

        return $this->sendResponse(null, 'Review deleted successfully');
    }
}
