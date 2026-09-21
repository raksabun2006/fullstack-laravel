<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductImageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $url = filter_var($this->image_url, FILTER_VALIDATE_URL)
            ? $this->image_url
            : Storage::disk('public')->url($this->image_url);

        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'image_url' => $this->image_url,
            'url' => $url,
            'is_primary' => (bool) $this->is_primary,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
