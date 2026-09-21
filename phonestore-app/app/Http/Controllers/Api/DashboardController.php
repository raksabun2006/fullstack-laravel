<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * Customer Dashboard Statistics.
     */
    public function customerStats(Request $request): JsonResponse
    {
        $user = $request->user();

        $orders = Order::with('items')->where('user_id', $user->id)->latest()->get();
        $wishlistCount = $user->wishlists()->count();

        $totalOrders = $orders->count();
        $pendingOrders = $orders->filter(fn ($o) => in_array($o->status, ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED']))->count();
        $completedOrders = $orders->filter(fn ($o) => $o->status === 'DELIVERED')->count();

        return $this->sendResponse([
            'total_orders' => $totalOrders,
            'pending_orders' => $pendingOrders,
            'completed_orders' => $completedOrders,
            'wishlist_items' => $wishlistCount,
            'recent_orders' => $orders->take(5)->values(),
        ], 'Customer dashboard stats retrieved successfully');
    }

    /**
     * Admin Dashboard Statistics.
     */
    public function adminStats(): JsonResponse
    {
        $orders = Order::with(['items', 'user'])->latest()->get();
        $products = Product::with(['brand', 'variants'])->get();
        $customersCount = User::where('role', 'CUSTOMER')->count();

        $totalSales = $orders
            ->filter(fn ($o) => $o->payment_status === 'PAID')
            ->sum(fn ($o) => (float) $o->total);

        $pendingOrders = $orders->filter(fn ($o) => $o->status === 'PENDING')->count();

        // Low stock products (stock <= 5 on any variant or product)
        $lowStockProducts = $products->filter(function ($p) {
            if ($p->variants->isNotEmpty()) {
                return $p->variants->contains(fn ($v) => $v->stock <= 5);
            }
            return false;
        })->values();

        return $this->sendResponse([
            'total_sales' => round($totalSales, 2),
            'total_orders' => $orders->count(),
            'total_products' => $products->count(),
            'total_customers' => $customersCount,
            'pending_orders' => $pendingOrders,
            'low_stock_count' => $lowStockProducts->count(),
            'low_stock_products' => $lowStockProducts->take(5)->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'brand' => ['name' => $p->brand?->name],
            ]),
            'recent_orders' => $orders->take(5)->values(),
        ], 'Admin dashboard stats retrieved successfully');
    }

    /**
     * Admin Sales Chart Data.
     */
    public function salesChart(Request $request): JsonResponse
    {
        $range = $request->query('range', '30d');
        $now = Carbon::now();
        $chartData = [];

        if ($range === '7d') {
            for ($i = 6; $i >= 0; $i--) {
                $date = $now->copy()->subDays($i);
                $dayStart = $date->copy()->startOfDay();
                $dayEnd = $date->copy()->endOfDay();

                $dayOrders = Order::whereBetween('created_at', [$dayStart, $dayEnd])->get();
                $sales = $dayOrders->filter(fn ($o) => $o->payment_status === 'PAID')->sum(fn ($o) => (float) $o->total);

                $chartData[] = [
                    'date' => $date->format('D'),
                    'sales' => round($sales, 2),
                    'orders' => $dayOrders->count(),
                ];
            }
        } elseif ($range === '3m') {
            for ($i = 7; $i >= 0; $i--) {
                $weekStart = $now->copy()->subWeeks($i)->startOfWeek();
                $weekEnd = $now->copy()->subWeeks($i)->endOfWeek();

                $weekOrders = Order::whereBetween('created_at', [$weekStart, $weekEnd])->get();
                $sales = $weekOrders->filter(fn ($o) => $o->payment_status === 'PAID')->sum(fn ($o) => (float) $o->total);

                $chartData[] = [
                    'date' => 'Wk ' . (8 - $i),
                    'sales' => round($sales, 2),
                    'orders' => $weekOrders->count(),
                ];
            }
        } elseif ($range === '1y') {
            for ($i = 11; $i >= 0; $i--) {
                $monthDate = $now->copy()->subMonths($i);
                $monthStart = $monthDate->copy()->startOfMonth();
                $monthEnd = $monthDate->copy()->endOfMonth();

                $monthOrders = Order::whereBetween('created_at', [$monthStart, $monthEnd])->get();
                $sales = $monthOrders->filter(fn ($o) => $o->payment_status === 'PAID')->sum(fn ($o) => (float) $o->total);

                $chartData[] = [
                    'date' => $monthDate->format('M'),
                    'sales' => round($sales, 2),
                    'orders' => $monthOrders->count(),
                ];
            }
        } else {
            // Default: 30 days sampled every 5 days
            for ($i = 5; $i >= 0; $i--) {
                $periodEnd = $now->copy()->subDays($i * 5)->endOfDay();
                $periodStart = $periodEnd->copy()->subDays(4)->startOfDay();

                $periodOrders = Order::whereBetween('created_at', [$periodStart, $periodEnd])->get();
                $sales = $periodOrders->filter(fn ($o) => $o->payment_status === 'PAID')->sum(fn ($o) => (float) $o->total);

                $chartData[] = [
                    'date' => $periodEnd->format('M d'),
                    'sales' => round($sales, 2),
                    'orders' => $periodOrders->count(),
                ];
            }
        }

        return $this->sendResponse($chartData, 'Sales chart data retrieved successfully');
    }
}
