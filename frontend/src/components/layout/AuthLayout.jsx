import { Outlet, Link } from 'react-router-dom';
import { Smartphone, ArrowLeft, ShieldCheck, Zap, Truck, Star } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/80 text-slate-900 selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Subtle Background Glows / Accents */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center transition group-hover:scale-105 shadow-md shadow-blue-600/20">
            <Smartphone size={20} />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Phone<span className="text-blue-600">Store</span>
          </span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/80 shadow-xs transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Store</span>
        </Link>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero & Feature Showcase (Visible on lg+) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-6 pr-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/70 mb-4">
                <ShieldCheck size={14} className="text-blue-600" />
                <span>Authorized Mobile Retailer</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                Your Next Flagship Smartphone Awaits
              </h1>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed font-normal">
                Experience authentic smartphones, seamless checkout with Bakong QR & Stripe, real-time delivery tracking, and official brand warranties.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">100% Genuine Guarantee</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Directly sourced from Apple, Samsung, Xiaomi & Google.</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Instant Bakong QR & Card</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Zero transaction fees with instant KHQR payment validation.</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Truck size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Express Nationwide Dispatch</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Track shipments live from dispatch to your doorstep.</p>
                </div>
              </div>
            </div>

            {/* Testimonial / Social Proof */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-1 text-amber-400 mb-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                &ldquo;Fastest order verification and checkout experience. Received my iPhone 16 Pro sealed with full official warranty!&rdquo;
              </p>
              <div className="mt-2 text-[11px] font-bold text-slate-500">
                — Sokha R., Verified Customer
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="w-full lg:col-span-6 flex justify-center">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Minimal Auth Footer */}
      <footer className="w-full py-5 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white/50 backdrop-blur-xs">
        <p>&copy; {new Date().getFullYear()} PhoneStore. All rights reserved. Secure 256-bit SSL Encrypted.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;
