import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Clock, MapPin, CreditCard, Package } from 'lucide-react';
import { getOrderById } from '../../api/orderApi';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const TIMELINE_STEPS = [
  { key: 'PENDING', label: 'Order Placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
];

const CustomerOrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getOrderById(id)
      .then((data) => setOrder(data))
      .catch((err) => setError(err.message || 'Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <Loading message="Loading order details..." />;
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <ErrorMessage message={error || 'Order not found'} />
        <Link to="/customer/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline">
          <ArrowLeft size={14} />
          <span>Back to My Orders</span>
        </Link>
      </div>
    );
  }

  // Determine current step index in timeline
  const currentStepIndex = TIMELINE_STEPS.findIndex((s) => s.key === order.status);
  const activeIndex = currentStepIndex !== -1 ? currentStepIndex : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/customer/orders"
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

        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 w-fit">
          {order.status}
        </span>
      </div>

      {/* Order Progress Timeline */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Delivery Progress</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative">
          {TIMELINE_STEPS.map((step, idx) => {
            const isCompleted = idx <= activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={18} /> : (isCurrent ? <Clock size={16} /> : <Circle size={14} />)}
                </div>
                <span className={`text-xs font-semibold ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Ordered Items Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2">
            <Package size={16} className="text-slate-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Ordered Items</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {order.items?.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{item.product_name}</h4>
                  <p className="text-slate-500 mt-0.5">
                    {item.color} • {item.storage}
                  </p>
                  <span className="text-[11px] text-slate-400 font-mono">SKU: {item.sku}</span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-slate-500">Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Calculation Summary */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>${Number(order.subtotal || order.total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Standard Shipping Fee</span>
              <span>${Number(order.shipping_fee || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Paid</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Meta */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <MapPin size={16} className="text-blue-600" />
              <span>Shipping Address</span>
            </div>
            <p className="text-xs font-semibold text-slate-900">{order.shipping_address?.name}</p>
            <p className="text-xs text-slate-600 mt-0.5">{order.shipping_address?.phone}</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {order.shipping_address?.address}, {order.shipping_address?.commune}, {order.shipping_address?.district}, {order.shipping_address?.province}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <CreditCard size={16} className="text-blue-600" />
              <span>Payment Information</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-semibold text-slate-900">{order.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700">
                  {order.payment_status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderDetailPage;
