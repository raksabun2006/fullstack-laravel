import { useState } from 'react';
import { Bell, Shield, Smartphone, CheckCircle2 } from 'lucide-react';

const CustomerSettingsPage = () => {
  const [settings, setSettings] = useState({
    orderUpdates: true,
    promoOffers: false,
    priceDrops: true,
    twoFactorAuth: false,
  });
  const [saved, setSaved] = useState(false);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Control your email notifications and security preferences</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <CheckCircle2 size={16} />
          <span>Preferences updated successfully.</span>
        </div>
      )}

      {/* Notifications Block */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Bell size={18} className="text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Email Notifications</h3>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
            <div>
              <span className="font-semibold text-slate-900 block">Order & Shipping Updates</span>
              <span className="text-slate-500">Get status notifications about tracking and delivery</span>
            </div>
            <input
              type="checkbox"
              checked={settings.orderUpdates}
              onChange={() => handleToggle('orderUpdates')}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
            <div>
              <span className="font-semibold text-slate-900 block">Special Promotions & Discounts</span>
              <span className="text-slate-500">Receive seasonal deals on smartphones and accessories</span>
            </div>
            <input
              type="checkbox"
              checked={settings.promoOffers}
              onChange={() => handleToggle('promoOffers')}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
            <div>
              <span className="font-semibold text-slate-900 block">Wishlist Price Drop Alerts</span>
              <span className="text-slate-500">Notify me when products on my wishlist are discounted</span>
            </div>
            <input
              type="checkbox"
              checked={settings.priceDrops}
              onChange={() => handleToggle('priceDrops')}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
          </label>
        </div>
      </div>

      {/* Security Block */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield size={18} className="text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Security & Access</h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
            <div className="flex items-center gap-2.5">
              <Smartphone size={16} className="text-slate-500" />
              <div>
                <span className="font-semibold text-slate-900 block">Sanctum Token Authentication</span>
                <span className="text-slate-500">Current device session is active and verified</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700">
              Active
            </span>
          </div>

          <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
            <div>
              <span className="font-semibold text-slate-900 block">Two-Factor Authentication (2FA)</span>
              <span className="text-slate-500">Require an extra security code during customer sign-in</span>
            </div>
            <input
              type="checkbox"
              checked={settings.twoFactorAuth}
              onChange={() => handleToggle('twoFactorAuth')}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition cursor-pointer"
      >
        Save Settings
      </button>
    </div>
  );
};

export default CustomerSettingsPage;
