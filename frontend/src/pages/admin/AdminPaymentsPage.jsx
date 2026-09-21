import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Search, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';
import { getPayments } from '../../api/paymentApi';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPayments();
      setPayments(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load payments ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    getPayments()
      .then((data) => {
        if (!ignore) {
          setPayments(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Failed to load payments ledger');
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.id?.toLowerCase().includes(q) ||
        p.order_id?.toLowerCase().includes(q) ||
        p.transaction_ref?.toLowerCase().includes(q) ||
        p.customer?.name?.toLowerCase().includes(q) ||
        p.customer?.email?.toLowerCase().includes(q) ||
        p.method?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [payments, search, statusFilter]);

  const totalCollected = useMemo(() => {
    return payments
      .filter((p) => p.status === 'PAID')
      .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  }, [payments]);

  const pendingAmount = useMemo(() => {
    return payments
      .filter((p) => p.status === 'PENDING')
      .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  }, [payments]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Paid
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payment Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor transactions, payment methods, and settlement statuses
          </p>
        </div>
        <button
          onClick={fetchPayments}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Collected</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ${totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified settlements
          </p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Clearance</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            ${pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">COD & in-process gateways</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Records</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{payments.length}</p>
          <p className="text-xs text-slate-500 mt-1">Transactions recorded</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Payment ID, Order ID, Customer, Reference..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'PAID', 'PENDING', 'FAILED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'All Statuses' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Loading message="Loading payment transactions..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchPayments} />
      ) : filteredPayments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No Transactions Found"
          description={
            search || statusFilter !== 'ALL'
              ? 'No payments match your active filter criteria.'
              : 'There are currently no recorded payments.'
          }
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Payment ID</th>
                  <th className="px-4 py-3.5">Order Number</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Method</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Transaction ID / Hash</th>
                  <th className="px-4 py-3.5">Created At</th>
                  <th className="px-4 py-3.5">Paid At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-medium text-slate-900">{p.id}</td>
                    <td className="px-4 py-3.5">
                      {p.order_id ? (
                        <Link
                          to={`/admin/orders/${p.order_id}`}
                          className="font-mono text-blue-600 hover:underline font-medium"
                        >
                          {p.order_id}
                        </Link>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-900">{p.customer?.name || 'Customer'}</div>
                      {p.customer?.email && (
                        <div className="text-xs text-slate-500">{p.customer.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      ${Number(p.amount).toFixed(2)} <span className="text-xs text-slate-500 font-normal">{p.currency || 'USD'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-800 rounded">
                        {p.payment_method || p.method}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">{getStatusBadge(p.payment_status || p.status)}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-600 max-w-[140px] truncate" title={p.transaction_hash || p.transaction_id || p.transaction_ref}>
                      {p.transaction_hash || p.transaction_id || p.transaction_ref || '-'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                      {p.paid_at ? (
                        <span className="text-emerald-600 font-medium">{new Date(p.paid_at).toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
