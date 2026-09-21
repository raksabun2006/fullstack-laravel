import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Calendar, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formattedJoinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently';

  return (
    <div className="max-w-2xl mx-auto py-4">
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        {/* Profile Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-200 mb-6">
          <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 text-blue-600 flex items-center justify-center shrink-0">
            <User size={32} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900 truncate">
              {user?.name || 'Customer Account'}
            </h1>
            <p className="text-sm text-slate-500 truncate">{user?.email}</p>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full shrink-0">
            <Shield size={12} />
            <span>{user?.role || 'CUSTOMER'}</span>
          </span>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <User size={13} />
              <span>Full Name</span>
            </span>
            <span className="text-sm font-semibold text-slate-900">{user?.name}</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <Mail size={13} />
              <span>Email Address</span>
            </span>
            <span className="text-sm font-semibold text-slate-900">{user?.email}</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <Shield size={13} />
              <span>Role Permissions</span>
            </span>
            <span className="text-sm font-semibold text-slate-900">{user?.role || 'CUSTOMER'}</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <Calendar size={13} />
              <span>Member Since</span>
            </span>
            <span className="text-sm font-semibold text-slate-900">{formattedJoinDate}</span>
          </div>
        </div>

        {/* Security Notification */}
        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 mb-6">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Active session authenticated via Laravel Sanctum Bearer Token</span>
        </div>

        {/* Logout Action */}
        <div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
