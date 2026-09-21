<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\User;
use App\Models\Wishlist;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@phonestore.com'],
            [
                'name' => 'System Administrator',
                'phone' => '+855 12 000 999',
                'role' => 'ADMIN',
                'status' => 'ACTIVE',
                'password' => Hash::make('password123'),
            ]
        );

        $customer1 = User::firstOrCreate(
            ['email' => 'raksa@example.com'],
            [
                'name' => 'Raksa Bun',
                'phone' => '+855 12 345 678',
                'role' => 'CUSTOMER',
                'status' => 'ACTIVE',
                'password' => Hash::make('password123'),
            ]
        );

        $customer2 = User::firstOrCreate(
            ['email' => 'sophea@example.com'],
            [
                'name' => 'Sophea Keo',
                'phone' => '+855 70 888 999',
                'role' => 'CUSTOMER',
                'status' => 'ACTIVE',
                'password' => Hash::make('password123'),
            ]
        );

        $customer3 = User::firstOrCreate(
            ['email' => 'dara@example.com'],
            [
                'name' => 'Dara Chan',
                'phone' => '+855 92 111 222',
                'role' => 'CUSTOMER',
                'status' => 'ACTIVE',
                'password' => Hash::make('password123'),
            ]
        );

        // 2. Addresses
        $addr1 = Address::firstOrCreate(
            ['user_id' => $customer1->id, 'name' => 'Raksa Bun (Home)'],
            [
                'phone' => '+855 12 345 678',
                'province' => 'Phnom Penh',
                'district' => 'Mean Chey',
                'commune' => 'Boeng Tumpun',
                'address' => 'Street 271, House #128',
                'postal_code' => '12000',
                'is_default' => true,
            ]
        );

        Address::firstOrCreate(
            ['user_id' => $customer1->id, 'name' => 'Raksa Bun (Office)'],
            [
                'phone' => '+855 12 345 678',
                'province' => 'Phnom Penh',
                'district' => 'Daun Penh',
                'commune' => 'Phsar Thmei 1',
                'address' => 'Monivong Blvd, Tower 2, Level 8',
                'postal_code' => '12201',
                'is_default' => false,
            ]
        );

        // 3. Brands
        $apple = Brand::updateOrCreate(
            ['slug' => 'apple'],
            [
                'name' => 'Apple',
                'description' => 'Official Apple iPhones, iPads, and genuine accessories with manufacturer warranty.',
                'logo' => 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=160&auto=format&fit=crop&q=80',
                'is_active' => true,
            ]
        );

        $samsung = Brand::updateOrCreate(
            ['slug' => 'samsung'],
            [
                'name' => 'Samsung',
                'description' => 'Galaxy flagship devices, dynamic AMOLED displays, and cutting-edge mobile innovations.',
                'logo' => 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=160&auto=format&fit=crop&q=80',
                'is_active' => true,
            ]
        );

        $xiaomi = Brand::updateOrCreate(
            ['slug' => 'xiaomi'],
            [
                'name' => 'Xiaomi',
                'description' => 'High-performance smartphones and smart ecosystem devices offering maximum value.',
                'logo' => 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=160&auto=format&fit=crop&q=80',
                'is_active' => true,
            ]
        );

        $google = Brand::updateOrCreate(
            ['slug' => 'google'],
            [
                'name' => 'Google',
                'description' => 'Pixel smartphones featuring Google AI, clean Android experience, and pro camera systems.',
                'logo' => 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=160&auto=format&fit=crop&q=80',
                'is_active' => true,
            ]
        );

        // 4. Categories
        $flagshipCat = Category::updateOrCreate(
            ['slug' => 'flagship-phones'],
            [
                'name' => 'Flagship Phones',
                'description' => 'Premium high-end smartphones with state-of-the-art processors, cameras, and builds.',
                'is_active' => true,
            ]
        );

        $smartphonesCat = Category::updateOrCreate(
            ['slug' => 'smartphones'],
            [
                'name' => 'Smartphones',
                'description' => 'Complete catalog of Android and iOS mobile devices.',
                'is_active' => true,
            ]
        );

        $budgetCat = Category::updateOrCreate(
            ['slug' => 'budget-phones'],
            [
                'name' => 'Budget & Midrange',
                'description' => 'Reliable and affordable daily-driver mobile phones.',
                'is_active' => true,
            ]
        );

        // 5. Products & Variants
        // Product 1: iPhone 17 Pro
        $p1 = Product::updateOrCreate(
            ['slug' => 'iphone-17-pro'],
            [
                'name' => 'iPhone 17 Pro',
                'brand_id' => $apple->id,
                'category_id' => $flagshipCat->id,
                'base_price' => 999.00,
                'status' => 'ACTIVE',
                'description' => 'Equipped with aerospace-grade titanium frame, A19 Pro bionic chip, 120Hz ProMotion display, and next-generation periscope optical telephoto zoom.',
            ]
        );

        $v1_1 = ProductVariant::updateOrCreate(
            ['sku' => 'IP17P-NAT-256'],
            [
                'product_id' => $p1->id,
                'color' => 'Natural Titanium',
                'ram' => '8GB',
                'storage' => '256GB',
                'price' => 999.00,
                'stock' => 12,
            ]
        );

        ProductVariant::updateOrCreate(
            ['sku' => 'IP17P-NAT-512'],
            [
                'product_id' => $p1->id,
                'color' => 'Natural Titanium',
                'ram' => '8GB',
                'storage' => '512GB',
                'price' => 1199.00,
                'stock' => 8,
            ]
        );

        ProductVariant::updateOrCreate(
            ['sku' => 'IP17P-BLK-256'],
            [
                'product_id' => $p1->id,
                'color' => 'Space Black',
                'ram' => '8GB',
                'storage' => '256GB',
                'price' => 999.00,
                'stock' => 4, // Low stock test
            ]
        );

        ProductImage::updateOrCreate(
            ['product_id' => $p1->id, 'is_primary' => true],
            [
                'image_url' => 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
            ]
        );

        // Product 2: Samsung Galaxy S25
        $p2 = Product::updateOrCreate(
            ['slug' => 'samsung-galaxy-s25'],
            [
                'name' => 'Samsung Galaxy S25',
                'brand_id' => $samsung->id,
                'category_id' => $flagshipCat->id,
                'base_price' => 799.00,
                'status' => 'ACTIVE',
                'description' => 'Featuring Galaxy AI tools, Snapdragon 8 Elite platform, 120Hz Dynamic AMOLED 2X display, and all-day intelligent battery optimization.',
            ]
        );

        $v2_1 = ProductVariant::updateOrCreate(
            ['sku' => 'SGS25-BLK-128'],
            [
                'product_id' => $p2->id,
                'color' => 'Phantom Black',
                'ram' => '8GB',
                'storage' => '128GB',
                'price' => 799.00,
                'stock' => 16,
            ]
        );

        ProductVariant::updateOrCreate(
            ['sku' => 'SGS25-SIL-256'],
            [
                'product_id' => $p2->id,
                'color' => 'Silver Shadow',
                'ram' => '12GB',
                'storage' => '256GB',
                'price' => 899.00,
                'stock' => 10,
            ]
        );

        ProductImage::updateOrCreate(
            ['product_id' => $p2->id, 'is_primary' => true],
            [
                'image_url' => 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
            ]
        );

        // Product 3: Xiaomi 15 Ultra
        $p3 = Product::updateOrCreate(
            ['slug' => 'xiaomi-15-ultra'],
            [
                'name' => 'Xiaomi 15 Ultra',
                'brand_id' => $xiaomi->id,
                'category_id' => $flagshipCat->id,
                'base_price' => 549.00,
                'status' => 'ACTIVE',
                'description' => 'Engineered in partnership with Leica optics. Features 1-inch Sony LYT-900 sensor, 2K Dolby Vision display, and 90W HyperCharge.',
            ]
        );

        $v3_1 = ProductVariant::updateOrCreate(
            ['sku' => 'MI15U-GRY-256'],
            [
                'product_id' => $p3->id,
                'color' => 'Titanium Gray',
                'ram' => '12GB',
                'storage' => '256GB',
                'price' => 549.00,
                'stock' => 6,
            ]
        );

        ProductImage::updateOrCreate(
            ['product_id' => $p3->id, 'is_primary' => true],
            [
                'image_url' => 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
            ]
        );

        // Product 4: Google Pixel 9 Pro
        $p4 = Product::updateOrCreate(
            ['slug' => 'google-pixel-9-pro'],
            [
                'name' => 'Google Pixel 9 Pro',
                'brand_id' => $google->id,
                'category_id' => $smartphonesCat->id,
                'base_price' => 899.00,
                'status' => 'ACTIVE',
                'description' => 'Powered by Google Tensor G4 with built-in Gemini Nano. Super Actua display and computational photography excellence.',
            ]
        );

        ProductVariant::updateOrCreate(
            ['sku' => 'PX9P-OBS-128'],
            [
                'product_id' => $p4->id,
                'color' => 'Obsidian',
                'ram' => '16GB',
                'storage' => '128GB',
                'price' => 899.00,
                'stock' => 9,
            ]
        );

        ProductImage::updateOrCreate(
            ['product_id' => $p4->id, 'is_primary' => true],
            [
                'image_url' => 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
            ]
        );

        // 6. Orders
        // Order 1: Delivered & Paid
        $o1 = Order::updateOrCreate(
            ['id' => 'ORD-1001'],
            [
                'user_id' => $customer1->id,
                'status' => 'DELIVERED',
                'payment_status' => 'PAID',
                'payment_method' => 'Credit Card (Visa)',
                'shipping_fee' => 5.00,
                'subtotal' => 999.00,
                'total' => 1004.00,
                'shipping_address' => [
                    'name' => 'Raksa Bun',
                    'phone' => '+855 12 345 678',
                    'province' => 'Phnom Penh',
                    'district' => 'Mean Chey',
                    'commune' => 'Boeng Tumpun',
                    'address' => 'Street 271, Sangkat Boeng Tumpun',
                    'postal_code' => '12000',
                ],
                'note' => 'Please deliver during office hours.',
                'created_at' => Carbon::now()->subDays(2),
            ]
        );

        OrderItem::updateOrCreate(
            ['order_id' => $o1->id, 'sku' => 'IP17P-NAT-256'],
            [
                'product_id' => $p1->id,
                'product_variant_id' => $v1_1->id,
                'product_name' => 'iPhone 17 Pro',
                'color' => 'Natural Titanium',
                'storage' => '256GB',
                'price' => 999.00,
                'quantity' => 1,
            ]
        );

        Payment::updateOrCreate(
            ['id' => 'PAY-8001'],
            [
                'order_id' => $o1->id,
                'user_id' => $customer1->id,
                'amount' => 1004.00,
                'method' => 'Credit Card (Visa)',
                'status' => 'PAID',
                'transaction_ref' => 'TXN-994821034',
                'created_at' => Carbon::now()->subDays(2),
            ]
        );

        // Order 2: Processing & Paid via KHQR
        $o2 = Order::updateOrCreate(
            ['id' => 'ORD-1002'],
            [
                'user_id' => $customer2->id,
                'status' => 'PROCESSING',
                'payment_status' => 'PAID',
                'payment_method' => 'ABA Pay / KHQR',
                'shipping_fee' => 0.00,
                'subtotal' => 799.00,
                'total' => 799.00,
                'shipping_address' => [
                    'name' => 'Sophea Keo',
                    'phone' => '+855 70 888 999',
                    'province' => 'Phnom Penh',
                    'district' => 'Chamkar Mon',
                    'commune' => 'Boeung Keng Kang 1',
                    'address' => 'House #45, St. 63',
                    'postal_code' => '12302',
                ],
                'created_at' => Carbon::now()->subDay(),
            ]
        );

        OrderItem::updateOrCreate(
            ['order_id' => $o2->id, 'sku' => 'SGS25-BLK-128'],
            [
                'product_id' => $p2->id,
                'product_variant_id' => $v2_1->id,
                'product_name' => 'Samsung Galaxy S25',
                'color' => 'Phantom Black',
                'storage' => '128GB',
                'price' => 799.00,
                'quantity' => 1,
            ]
        );

        Payment::updateOrCreate(
            ['id' => 'PAY-8002'],
            [
                'order_id' => $o2->id,
                'user_id' => $customer2->id,
                'amount' => 799.00,
                'method' => 'ABA Pay / KHQR',
                'status' => 'PAID',
                'transaction_ref' => 'TXN-483019283',
                'created_at' => Carbon::now()->subDay(),
            ]
        );

        // Order 3: Pending & COD
        $o3 = Order::updateOrCreate(
            ['id' => 'ORD-1003'],
            [
                'user_id' => $customer3->id,
                'status' => 'PENDING',
                'payment_status' => 'PENDING',
                'payment_method' => 'Cash on Delivery (COD)',
                'shipping_fee' => 5.00,
                'subtotal' => 549.00,
                'total' => 554.00,
                'shipping_address' => [
                    'name' => 'Dara Chan',
                    'phone' => '+855 92 111 222',
                    'province' => 'Phnom Penh',
                    'district' => 'Prampir Makara',
                    'commune' => 'Veal Vong',
                    'address' => 'Preah Sihanouk Blvd',
                    'postal_code' => '12253',
                ],
                'created_at' => Carbon::now(),
            ]
        );

        OrderItem::updateOrCreate(
            ['order_id' => $o3->id, 'sku' => 'MI15U-GRY-256'],
            [
                'product_id' => $p3->id,
                'product_variant_id' => $v3_1->id,
                'product_name' => 'Xiaomi 15 Ultra',
                'color' => 'Titanium Gray',
                'storage' => '256GB',
                'price' => 549.00,
                'quantity' => 1,
            ]
        );

        Payment::updateOrCreate(
            ['id' => 'PAY-8003'],
            [
                'order_id' => $o3->id,
                'user_id' => $customer3->id,
                'amount' => 554.00,
                'method' => 'Cash on Delivery (COD)',
                'status' => 'PENDING',
                'transaction_ref' => 'TXN-COD-PENDING',
                'created_at' => Carbon::now(),
            ]
        );

        // 7. Wishlist
        Wishlist::firstOrCreate(['user_id' => $customer1->id, 'product_id' => $p1->id]);
        Wishlist::firstOrCreate(['user_id' => $customer1->id, 'product_id' => $p2->id]);

        // 8. Reviews
        Review::updateOrCreate(
            ['user_id' => $customer1->id, 'product_id' => $p1->id],
            [
                'rating' => 5,
                'comment' => 'Exceptional battery endurance and camera performance. The display is crystal clear.',
                'status' => 'APPROVED',
            ]
        );

        Review::updateOrCreate(
            ['user_id' => $customer2->id, 'product_id' => $p2->id],
            [
                'rating' => 4,
                'comment' => 'Very sleek design and fast charging. The AI photo features are genuinely helpful.',
                'status' => 'APPROVED',
            ]
        );
    }
}
