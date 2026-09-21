<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('phase 1: brands, categories, products, variants, and images can be created and queried through relationships', function () {
    $brand = Brand::create([
        'name' => 'Apple',
        'slug' => 'apple',
        'description' => 'Apple Inc.',
        'logo' => 'brands/apple.png',
        'is_active' => true,
    ]);

    $category = Category::create([
        'name' => 'Smartphones',
        'slug' => 'smartphones',
        'description' => 'Flagship mobile devices',
        'is_active' => true,
    ]);

    $product = Product::create([
        'brand_id' => $brand->id,
        'category_id' => $category->id,
        'name' => 'iPhone 17 Pro',
        'slug' => 'iphone-17-pro',
        'description' => 'The ultimate iPhone.',
        'base_price' => 999.00,
        'status' => 'ACTIVE',
    ]);

    $variant1 = $product->variants()->create([
        'color' => 'Space Black',
        'ram' => '12GB',
        'storage' => '256GB',
        'price' => 999.00,
        'stock' => 20,
        'sku' => 'IP17P-BLK-256',
    ]);

    $variant2 = $product->variants()->create([
        'color' => 'Space Black',
        'ram' => '12GB',
        'storage' => '512GB',
        'price' => 1199.00,
        'stock' => 10,
        'sku' => 'IP17P-BLK-512',
    ]);

    $image1 = $product->images()->create([
        'image_url' => 'products/iphone-17-pro-front.jpg',
        'is_primary' => true,
    ]);

    $image2 = $product->images()->create([
        'image_url' => 'products/iphone-17-pro-back.jpg',
        'is_primary' => false,
    ]);

    // Assert database has records
    $this->assertDatabaseHas('brands', ['name' => 'Apple', 'slug' => 'apple']);
    $this->assertDatabaseHas('categories', ['name' => 'Smartphones', 'slug' => 'smartphones']);
    $this->assertDatabaseHas('products', ['name' => 'iPhone 17 Pro', 'brand_id' => $brand->id]);
    $this->assertDatabaseHas('product_variants', ['sku' => 'IP17P-BLK-256', 'stock' => 20]);
    $this->assertDatabaseHas('product_images', ['image_url' => 'products/iphone-17-pro-front.jpg', 'is_primary' => true]);

    // Assert relationships
    expect($product->brand->name)->toBe('Apple');
    expect($product->category->name)->toBe('Smartphones');
    expect($product->variants)->toHaveCount(2);
    expect($product->images)->toHaveCount(2);
    expect($product->primaryImage->image_url)->toBe('products/iphone-17-pro-front.jpg');

    expect($brand->products)->toHaveCount(1);
    expect($category->products)->toHaveCount(1);
    expect($variant1->product->name)->toBe('iPhone 17 Pro');
    expect($image1->product->name)->toBe('iPhone 17 Pro');
});
