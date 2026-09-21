import { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getAdminDashboardStats, getSalesChartData } from '../../api/dashboardApi';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function AdminReportsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('revenue'); // revenue | orders | summary

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setLoading(true);
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getAdminDashboardStats(),
      getSalesChartData(timeRange),
    ])
      .then(([dashStats, series]) => {
        if (isMounted) {
          setStats(dashStats);
          setChartData(series || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to generate financial and store reports');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [timeRange]);

  const handleExportCSV = () => {
    if (!chartData.length) return;
    const headers = 'Period,Revenue ($),Order Count\n';
    const rows = chartData.map((d) => `"${d.date}",${d.sales},${d.orders}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `phonestore_report_${timeRange}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPeriodSales = chartData.reduce((acc, d) => acc + (Number(d.sales) || 0), 0);
  const totalPeriodOrders = chartData.reduce((acc, d) => acc + (Number(d.orders) || 0), 0);
  const avgOrderValue = totalPeriodOrders > 0 ? (totalPeriodSales / totalPeriodOrders).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics & Reports</h1>
          <p className="text-sm text-slate-500 mt-1">
            Performance analytics, revenue trends, and operational metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: 'Revenue Overview', id: 'revenue' },
            { label: 'Order Volume', id: 'orders' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                reportType === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium mr-1">Period:</span>
          {['7d', '30d', '3m', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {range === '7d'
                ? '7 Days'
                : range === '30d'
                ? '30 Days'
                : range === '3m'
                ? '3 Months'
                : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loading message="Generating analytics data..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Period Revenue</span>
                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                ${totalPeriodSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+12.4% vs previous period</span>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Orders Processed</span>
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <ShoppingBag className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{totalPeriodOrders}</p>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+8.1% order volume</span>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg. Order Value</span>
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">${avgOrderValue}</p>
              <p className="text-xs text-slate-500 mt-1">Per completed transaction</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Catalog</span>
                <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Layers className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.total_products ?? 0}</p>
              <p className="text-xs text-slate-500 mt-1">
                {stats?.low_stock_count ?? 0} items low in stock
              </p>
            </div>
          </div>

          {/* Interactive Chart */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {reportType === 'revenue' ? 'Sales Revenue Trend' : 'Order Volume Timeline'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualized for the selected timeframe ({timeRange.toUpperCase()})
                </p>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {reportType === 'revenue' ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip
                      formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#salesGrad)"
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <Tooltip
                      formatter={(val) => [val, 'Orders']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="orders" fill="#0f172a" radius={[4, 4, 0, 0]} name="Completed Orders" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Period Interval Breakdown</h3>
              <span className="text-xs text-slate-400">{chartData.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Time Interval</th>
                    <th className="px-6 py-3">Revenue ($)</th>
                    <th className="px-6 py-3">Orders</th>
                    <th className="px-6 py-3">Average per Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {chartData.map((item, idx) => {
                    const avg = item.orders > 0 ? (item.sales / item.orders).toFixed(2) : '0.00';
                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-3.5 font-medium text-slate-900">{item.date}</td>
                        <td className="px-6 py-3.5 font-semibold text-slate-900">
                          ${Number(item.sales).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-3.5 text-slate-700">{item.orders}</td>
                        <td className="px-6 py-3.5 font-mono text-xs text-slate-600">${avg}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
