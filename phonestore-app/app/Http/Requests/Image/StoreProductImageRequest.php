<?php

namespace App\Http\Requests\Image;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image' => ['required_without:image_url', 'nullable', 'image', 'mimes:jpeg,png,jpg,webp,gif', 'max:5120'], // max 5MB
            'image_url' => ['required_without:image', 'nullable', 'string', 'max:500'],
            'is_primary' => ['nullable', 'boolean'],
        ];
    }
}
