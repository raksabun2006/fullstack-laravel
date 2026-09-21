<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CustomerProfileController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductImageController;
use App\Http\Controllers\Api\ProductVariantController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Mobile Phone Store
|--------------------------------------------------------------------------
*/

// ==============================
// 1. Authentication Routes
// ==============================
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// ==============================
// 2. Public Catalog Routes
// ==============================
// Brands
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/brands/{id}', [BrandController::class, 'show']);

// Categories
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

// Products (with filtering & pagination)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Variants
Route::get('/products/{product}/variants', [ProductVariantController::class, 'indexForProduct']);
Route::get('/variants/{id}', [ProductVariantController::class, 'show']);

// Images
Route::get('/products/{product}/images', [ProductImageController::class, 'indexForProduct']);

// Public Reviews for Product
Route::get('/products/{productId}/reviews', [ReviewController::class, 'productReviews']);

// ==============================
// 3. Cart Routes (Public/Auth)
// ==============================
Route::prefix('cart')->group(function () {
    Route::get('/', [CartController::class, 'show']);
    Route::post('/items', [CartController::class, 'addItem']);
    Route::put('/items/{id}', [CartController::class, 'updateItem']);
    Route::delete('/items/{id}', [CartController::class, 'removeItem']);
    Route::delete('/clear', [CartController::class, 'clear']);
});

// ==============================
// 4. Customer Protected Routes
// ==============================
Route::middleware('auth:sanctum')->group(function () {
    // Customer Profile & Settings
    Route::put('/customer/profile', [CustomerProfileController::class, 'updateProfile']);
    Route::put('/customer/password', [CustomerProfileController::class, 'updatePassword']);

    // Customer Addresses
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::get('/customer/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::post('/customer/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{id}', [AddressController::class, 'update']);
    Route::put('/customer/addresses/{id}', [AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);
    Route::delete('/customer/addresses/{id}', [AddressController::class, 'destroy']);
    Route::put('/addresses/{id}/default', [AddressController::class, 'setDefault']);

    // Customer Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/customer/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::put('/orders/{id}/cancel', [OrderController::class, 'cancel']);

    // Payments
    Route::post('/payments/khqr', [PaymentController::class, 'createKhqr']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::match(['get', 'post'], '/payments/{id}/check', [PaymentController::class, 'check']);
    Route::get('/orders/{orderId}/payment', [PaymentController::class, 'getByOrder']);

    // Customer Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::get('/customer/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::post('/customer/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{productId}', [WishlistController::class, 'destroy']);
    Route::delete('/customer/wishlist/{productId}', [WishlistController::class, 'destroy']);

    // Customer Reviews
    Route::get('/customer/reviews', [ReviewController::class, 'customerReviews']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::post('/products/{productId}/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

    // Customer Dashboard Stats
    Route::get('/customer/dashboard/stats', [DashboardController::class, 'customerStats']);
});

// ==============================
// 5. Admin Protected Routes
// ==============================
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // Brands Management
    Route::post('/brands', [BrandController::class, 'store']);
    Route::put('/brands/{id}', [BrandController::class, 'update']);
    Route::delete('/brands/{id}', [BrandController::class, 'destroy']);

    // Categories Management
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // Products Management
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Variants Management
    Route::post('/products/{product}/variants', [ProductVariantController::class, 'storeForProduct']);
    Route::put('/variants/{id}', [ProductVariantController::class, 'update']);
    Route::delete('/variants/{id}', [ProductVariantController::class, 'destroy']);

    // Images Management
    Route::post('/products/{product}/images', [ProductImageController::class, 'storeForProduct']);
    Route::delete('/images/{id}', [ProductImageController::class, 'destroy']);

    // Admin Orders Management
    Route::get('/admin/orders', [OrderController::class, 'adminIndex']);
    Route::get('/admin/orders/{id}', [OrderController::class, 'show']);
    Route::put('/admin/orders/{id}/status', [OrderController::class, 'adminUpdateStatus']);

    // Admin Customers Management
    Route::get('/customers', [CustomerProfileController::class, 'customersList']);
    Route::get('/admin/customers', [CustomerProfileController::class, 'customersList']);

    // Admin Payments Ledger
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/admin/payments', [PaymentController::class, 'index']);
    Route::put('/admin/payments/{id}/status', [PaymentController::class, 'updateStatus']);

    // Admin Reviews Moderation
    Route::get('/reviews', [ReviewController::class, 'index']);

    // Admin Dashboard & Analytics
    Route::get('/admin/dashboard', [DashboardController::class, 'adminStats']);
    Route::get('/admin/dashboard/stats', [DashboardController::class, 'adminStats']);
    Route::get('/admin/dashboard/sales-chart', [DashboardController::class, 'salesChart']);
});
