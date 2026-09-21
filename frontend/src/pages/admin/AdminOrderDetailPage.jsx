import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, MapPin, CreditCard, Package } from 'lucide-react';
import { getOrderById, updateOrderStatus } from '../../api/orderApi';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    getOrderById(id)
      .then((data) => setOrder(data))
      .catch((err) => setError(err.message || 'Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      const updated = await updateOrderStatus(id, newStatus);
      setOrder(updated);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <Loading message="Loading order details..." />;
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <ErrorMessage message={error || 'Order record not found'} />
        <Link to="/admin/orders" className="text-xs font-semibold text-blue-600 hover:underline">
          &larr; Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Order #{order.id}</h1>
            <p className="text-xs text-slate-500">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Status:</span>
          <select
            value={order.status}
            disabled={isUpdating}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-md font-bold text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Products Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2">
            <Package size={16} className="text-slate-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Line Items</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {order.items?.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{item.product_name}</h4>
                  <p className="text-slate-500 mt-0.5">
                    {item.color} • {item.storage}
                  </p>
                  <span className="font-mono text-[11px] text-slate-400">SKU: {item.sku}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>${Number(order.subtotal || order.total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee</span>
              <span>${Number(order.shipping_fee || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Gross</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Customer & Shipping Summary */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <User size={16} className="text-blue-600" />
              <span>Customer Details</span>
            </div>
            <p className="text-xs font-bold text-slate-900">{order.customer?.name}</p>
            <p className="text-xs text-slate-600 mt-0.5">{order.customer?.email}</p>
            <p className="text-xs text-slate-500 mt-0.5">{order.customer?.phone}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <MapPin size={16} className="text-blue-600" />
              <span>Destination Address</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {order.shipping_address?.address}, {order.shipping_address?.commune}, {order.shipping_address?.district}, {order.shipping_address?.province}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <CreditCard size={16} className="text-blue-600" />
              <span>Payment Details</span>
            </div>
            <div className="text-xs space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-semibold text-slate-900">{order.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="font-bold text-emerald-600 uppercase text-[10px]">{order.payment_status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
