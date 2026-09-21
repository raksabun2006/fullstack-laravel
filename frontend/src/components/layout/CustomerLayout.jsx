import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Heart,
  Star,
  MapPin,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Smartphone,
  ShoppingCart,
  Menu,
  X,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
  { name: 'My Orders', path: '/customer/orders', icon: Package },
  { name: 'Wishlist', path: '/customer/wishlist', icon: Heart },
  { name: 'Reviews', path: '/customer/reviews', icon: Star },
  { name: 'Addresses', path: '/customer/addresses', icon: MapPin },
  { name: 'Profile', path: '/customer/profile', icon: User },
  { name: 'Settings', path: '/customer/settings', icon: Settings },
];

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Customer Portal Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Portal Badge */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              aria-label="Toggle customer portal menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <Smartphone size={18} />
              </div>
              <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                Phone<span className="text-blue-600">Store</span>
              </span>
            </Link>

            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
              Customer Portal
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Back to Shop</span>
              <span className="sm:hidden">Store</span>
            </Link>

            <Link
              to="/checkout"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition"
              title="View Cart & Checkout"
            >
              <ShoppingCart size={15} className="text-blue-600" />
              <span className="hidden sm:inline">Cart</span>
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-xs">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Sidebar Navigation */}
          <aside
            className={`w-full lg:w-64 bg-white border border-slate-200 rounded-2xl p-4 shrink-0 shadow-xs lg:block ${
              isMobileMenuOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* User Card */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Customer'}</h4>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/customer/dashboard'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 font-bold border border-blue-100'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight size={14} className="opacity-40" />
                  </NavLink>
                );
              })}

              <div className="pt-3 mt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content Viewport */}
          <div className="flex-1 w-full min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;
