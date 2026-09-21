import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Clock,
  AlertTriangle,
  ArrowRight,
  Eye,
  Plus,
} from 'lucide-react';
import { getAdminDashboardStats } from '../../api/dashboardApi';
import StatCard from '../../components/admin/StatCard';
import SalesChart from '../../components/admin/SalesChart';
import Loading from '../../components/common/Loading';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboardStats()
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Loading message="Loading store analytics and metrics..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Admin Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time revenue, order fulfillment, and catalog metrics</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/products/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition"
          >
            <Plus size={14} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* 6 Statistics Cards (Section 18) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Total Sales"
          value={`$${Number(stats?.total_sales || 0).toLocaleString()}`}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Orders"
          value={stats?.total_orders || 0}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Products"
          value={stats?.total_products || 0}
          icon={Package}
          color="purple"
        />
        <StatCard
          title="Customers"
          value={stats?.total_customers || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Pending"
          value={stats?.pending_orders || 0}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Low Stock"
          value={stats?.low_stock_count || 0}
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Sales Chart (Section 19) */}
      <SalesChart />

      {/* Recent Orders & Low Stock Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Recent Orders */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Recent Store Orders</h3>
            </div>
            <Link to="/admin/orders" className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1">
              <span>Manage</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4">Order</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Total</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {stats?.recent_orders?.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{o.id}</td>
                    <td className="py-2.5 px-4">{o.customer?.name}</td>
                    <td className="py-2.5 px-4 font-semibold">${Number(o.total).toFixed(2)}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <Link to={`/admin/orders/${o.id}`} className="text-blue-600 hover:underline">
                        <Eye size={14} className="inline" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Inventory Alerts</h3>
            </div>
            <Link to="/admin/inventory" className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1">
              <span>All Inventory</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="p-4 space-y-3">
            {stats?.low_stock_products?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">All inventory stock levels are healthy.</p>
            ) : (
              stats?.low_stock_products?.map((prod) => (
                <div key={prod.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <h4 className="font-semibold text-slate-900">{prod.name}</h4>
                    <span className="text-[11px] text-slate-500">{prod.brand?.name || 'Device'}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-50 text-red-700 border border-red-200">
                      Low Stock
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
