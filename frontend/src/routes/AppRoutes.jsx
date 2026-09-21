import { Routes, Route, Navigate, Link } from 'react-router-dom';

// Layouts
import StoreLayout from '../components/layout/StoreLayout';
import AuthLayout from '../components/layout/AuthLayout';
import CustomerLayout from '../components/layout/CustomerLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Public Catalog Pages
import HomePage from '../pages/HomePage';
import ProductPage from '../pages/ProductPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import BrandPage from '../pages/BrandPage';
import CategoryPage from '../pages/public/CategoryPage';

// Auth Pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// Customer Pages
import CustomerDashboardPage from '../pages/customer/CustomerDashboardPage';
import CustomerOrdersPage from '../pages/customer/CustomerOrdersPage';
import CustomerOrderDetailPage from '../pages/customer/CustomerOrderDetailPage';
import CustomerWishlistPage from '../pages/customer/CustomerWishlistPage';
import CustomerReviewsPage from '../pages/customer/CustomerReviewsPage';
import CustomerAddressesPage from '../pages/customer/CustomerAddressesPage';
import CustomerProfilePage from '../pages/customer/CustomerProfilePage';
import CustomerSettingsPage from '../pages/customer/CustomerSettingsPage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import PaymentPage from '../pages/customer/PaymentPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import AdminProductCreatePage from '../pages/admin/AdminProductCreatePage';
import AdminProductEditPage from '../pages/admin/AdminProductEditPage';
import AdminBrandsPage from '../pages/admin/AdminBrandsPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminInventoryPage from '../pages/admin/AdminInventoryPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from '../pages/admin/AdminOrderDetailPage';
import AdminCustomersPage from '../pages/admin/AdminCustomersPage';
import AdminPaymentsPage from '../pages/admin/AdminPaymentsPage';
import AdminReviewsPage from '../pages/admin/AdminReviewsPage';
import AdminReportsPage from '../pages/admin/AdminReportsPage';
import AdminProfilePage from '../pages/admin/AdminProfilePage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Store & Shopping Routes (With Store Header & Footer) */}
      <Route element={<StoreLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/brands" element={<BrandPage />} />
        <Route path="/categories" element={<CategoryPage />} />

        {/* Checkout & Payment within Store Layout */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/:id"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route path="/cart" element={<Navigate to="/checkout" replace />} />
        <Route path="/profile" element={<Navigate to="/customer/profile" replace />} />

        {/* Fallback 404 Route */}
        <Route
          path="*"
          element={
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-200 rounded-2xl max-w-lg mx-auto shadow-xs">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Error 404</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Page Not Found</h1>
              <p className="text-sm text-slate-500 mt-2 mb-6">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-xs transition"
              >
                Back to Home
              </Link>
            </div>
          }
        />
      </Route>

      {/* 2. Standalone Auth Routes (OUT of store nav and footer) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* 3. Standalone Customer Dashboard (OUT of store nav and footer) */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboardPage />} />
        <Route path="orders" element={<CustomerOrdersPage />} />
        <Route path="orders/:id" element={<CustomerOrderDetailPage />} />
        <Route path="wishlist" element={<CustomerWishlistPage />} />
        <Route path="reviews" element={<CustomerReviewsPage />} />
        <Route path="addresses" element={<CustomerAddressesPage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
        <Route path="settings" element={<CustomerSettingsPage />} />
      </Route>

      {/* 4. Standalone Admin Dashboard Console (OUT of store nav and footer) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="dashboard" element={<Navigate to="/admin" replace />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/create" element={<AdminProductCreatePage />} />
        <Route path="products/:id/edit" element={<AdminProductEditPage />} />
        <Route path="brands" element={<AdminBrandsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="inventory" element={<AdminInventoryPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
