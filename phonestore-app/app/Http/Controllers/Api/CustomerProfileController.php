<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class CustomerProfileController extends Controller
{
    use ApiResponse;

    /**
     * Update authenticated user profile.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:50',
        ]);

        $user->update($validated);

        return $this->sendResponse(new UserResource($user), 'Profile updated successfully');
    }

    /**
     * Update authenticated user password.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|different:current_password',
            'new_password_confirmation' => 'required|same:new_password',
        ]);

        if (! Hash::check($validated['current_password'], $user->password)) {
            return $this->sendError('Current password does not match.', ['current_password' => ['The provided password does not match our records.']], 422);
        }

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return $this->sendResponse(null, 'Password updated successfully');
    }

    /**
     * Admin: Listing of registered customers.
     */
    public function customersList(Request $request): JsonResponse
    {
        $query = User::withCount('orders')->where('role', 'CUSTOMER');

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%");
            });
        }

        $customers = $query->latest()->get()->map(function ($c) {
            return [
                'id' => $c->id,
                'name' => $c->name,
                'email' => $c->email,
                'phone' => $c->phone,
                'role' => $c->role,
                'status' => $c->status ?? 'ACTIVE',
                'orders_count' => (int) $c->orders_count,
                'created_at' => $c->created_at?->toISOString(),
            ];
        });

        return $this->sendResponse($customers, 'Customer directory retrieved successfully');
    }
}
