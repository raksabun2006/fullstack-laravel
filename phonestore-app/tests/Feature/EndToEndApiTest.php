<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('user can register, login, and fetch profile', function () {
    // 1. Register
    $registerResponse = $this->postJson('/api/auth/register', [
        'name' => 'Alice Customer',
        'email' => 'alice@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'CUSTOMER',
    ]);

    $registerResponse->assertStatus(201)
        ->assertJson([
            'success' => true,
            'message' => 'Registration successful',
        ])
        ->assertJsonStructure([
            'data' => [
                'user' => ['id', 'name', 'email', 'role'],
                'token',
            ],
        ]);

    // 2. Login
    $loginResponse = $this->postJson('/api/auth/login', [
        'email' => 'alice@example.com',
        'password' => 'password123',
    ]);

    $loginResponse->assertStatus(200)
        ->assertJson(['success' => true]);

    $token = $loginResponse->json('data.token');

    // 3. Me endpoint
    $meResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
        ->getJson('/api/auth/me');

    $meResponse->assertStatus(200)
        ->assertJson([
            'success' => true,
            'data' => [
                'email' => 'alice@example.com',
                'role' => 'CUSTOMER',
            ],
        ]);
});

test('admin can manage brands and customer cannot', function () {
    $admin = User::factory()->create(['role' => 'ADMIN']);
    $customer = User::factory()->create(['role' => 'CUSTOMER']);

    // Customer cannot create brand
    $this->actingAs($customer, 'sanctum')
        ->postJson('/api/brands', [
            'name' => 'Apple',
        ])->assertStatus(403);

    // Admin can create brand
    $adminResponse = $this->actingAs($admin, 'sanctum')
        ->postJson('/api/brands', [
            'name' => 'Apple',
            'description' => 'Apple Devices',
            'is_active' => true,
        ]);

    $adminResponse->assertStatus(201)
        ->assertJson([
            'success' => true,
            'data' => [
                'name' => 'Apple',
                'slug' => 'apple',
            ],
        ]);

    $brandId = $adminResponse->json('data.id');

    // Public can view brand
    $this->getJson("/api/brands/{$brandId}")
        ->assertStatus(200)
        ->assertJson(['success' => true]);
});

test('admin can manage products, variants, and images and public can filter products', function () {
    $admin = User::factory()->create(['role' => 'ADMIN']);

    $brand = Brand::create(['name' => 'Samsung', 'slug' => 'samsung', 'is_active' => true]);
    $category = Category::create(['name' => 'Phones', 'slug' => 'phones', 'is_active' => true]);

    // Admin creates product
    $productResponse = $this->actingAs($admin, 'sanctum')
        ->postJson('/api/products', [
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'name' => 'Galaxy S25 Ultra',
            'base_price' => 1299.00,
            'status' => 'ACTIVE',
        ]);

    $productResponse->assertStatus(201)
        ->assertJson(['success' => true]);

    $productId = $productResponse->json('data.id');

    // Admin creates variant
    $variantResponse = $this->actingAs($admin, 'sanctum')
        ->postJson("/api/products/{$productId}/variants", [
            'color' => 'Titanium Black',
            'ram' => '16GB',
            'storage' => '512GB',
            'price' => 1299.00,
            'stock' => 25,
            'sku' => 'S25U-512',
        ]);

    $variantResponse->assertStatus(201)
        ->assertJson(['success' => true]);

    // Admin attaches image
    $imageResponse = $this->actingAs($admin, 'sanctum')
        ->postJson("/api/products/{$productId}/images", [
            'image_url' => 'https://example.com/s25.jpg',
            'is_primary' => true,
        ]);

    $imageResponse->assertStatus(201)
        ->assertJson(['success' => true]);

    // Filter products
    $this->getJson('/api/products?search=Galaxy&status=ACTIVE&min_price=1000')
        ->assertStatus(200)
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Galaxy S25 Ultra');

    // Filter with non-matching search returns 0
    $this->getJson('/api/products?search=iPhone')
        ->assertStatus(200)
        ->assertJsonCount(0, 'data');
});
