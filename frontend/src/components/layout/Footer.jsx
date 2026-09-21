import { Link } from 'react-router-dom';
import { Smartphone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-200">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-slate-900 font-bold text-lg tracking-tight mb-3">
              <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <Smartphone size={18} />
              </div>
              <span>Phone<span className="text-blue-600">Store</span></span>
            </Link>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Your trusted destination for authentic mobile devices, warranty-backed smartphones, and verified accessories.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Catalog</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link to="/products" className="hover:text-blue-600 transition">All Mobile Phones</Link></li>
              <li><Link to="/brands" className="hover:text-blue-600 transition">Shop by Brand</Link></li>
              <li><Link to="/products?status=ACTIVE" className="hover:text-blue-600 transition">In-Stock Devices</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link to="/profile" className="hover:text-blue-600 transition">My Profile</Link></li>
              <li><Link to="/login" className="hover:text-blue-600 transition">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-blue-600 transition">Create Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Mobile Phone Store. All rights reserved.</p>
          <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-slate-600 font-medium">
            Laravel Sanctum API Connected
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
