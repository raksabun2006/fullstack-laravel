<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of user addresses.
     */
    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()->addresses()->orderByDesc('is_default')->latest()->get();

        return $this->sendResponse($addresses, 'Addresses retrieved successfully');
    }

    /**
     * Store a newly created address.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'province' => 'required|string|max:100',
            'district' => 'required|string|max:100',
            'commune' => 'required|string|max:100',
            'address' => 'required|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'is_default' => 'boolean',
        ]);

        $user = $request->user();

        if (! empty($validated['is_default'])) {
            $user->addresses()->update(['is_default' => false]);
        } else {
            // If user has no addresses yet, make this default
            if ($user->addresses()->count() === 0) {
                $validated['is_default'] = true;
            }
        }

        $address = $user->addresses()->create($validated);

        return $this->sendResponse($address, 'Address created successfully', 201);
    }

    /**
     * Update the specified address.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $address = $request->user()->addresses()->find($id);

        if (! $address) {
            return $this->sendError('Address not found', [], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|max:50',
            'province' => 'sometimes|required|string|max:100',
            'district' => 'sometimes|required|string|max:100',
            'commune' => 'sometimes|required|string|max:100',
            'address' => 'sometimes|required|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'is_default' => 'boolean',
        ]);

        if (! empty($validated['is_default'])) {
            $request->user()->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update($validated);

        return $this->sendResponse($address, 'Address updated successfully');
    }

    /**
     * Remove the specified address.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $address = $request->user()->addresses()->find($id);

        if (! $address) {
            return $this->sendError('Address not found', [], 404);
        }

        $address->delete();

        return $this->sendResponse(null, 'Address deleted successfully');
    }

    /**
     * Set the address as default.
     */
    public function setDefault(Request $request, string $id): JsonResponse
    {
        $address = $request->user()->addresses()->find($id);

        if (! $address) {
            return $this->sendError('Address not found', [], 404);
        }

        $request->user()->addresses()->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return $this->sendResponse($address, 'Default address set successfully');
    }
}
