import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowLeft, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink,
  Smartphone,
  Copy,
  Check,
  RotateCw
} from 'lucide-react';
import { getPaymentById, checkPayment, createKhqrPayment } from '../../api/paymentApi';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const PaymentPage = () => {
  const { id } = useParams();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Expiration countdown
  const [timeLeft, setTimeLeft] = useState(null); // in seconds
  const pollingTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  // 1. Initial Load of Payment Information
  useEffect(() => {
    let isMounted = true;

    const fetchInitialPayment = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPaymentById(id);
        if (isMounted) {
          setPayment(data);
          calculateTimeLeft(data.expires_at);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Failed to load payment information');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInitialPayment();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // 2. Countdown Timer
  const calculateTimeLeft = (expiresAt) => {
    if (!expiresAt) return;
    const diff = Math.floor((new Date(expiresAt).getTime() - new Date().getTime()) / 1000);
    setTimeLeft(diff > 0 ? diff : 0);
  };

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      if (payment && payment.payment_status === 'PENDING') {
        setPayment((prev) => (prev ? { ...prev, payment_status: 'EXPIRED', status: 'EXPIRED' } : null));
      }
      return;
    }

    countdownTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [timeLeft, payment]);

  // 3. Automated Polling of Laravel Payment Verification
  // The Laravel backend queries Bakong Open API and updates payment and order statuses
  useEffect(() => {
    // Only poll if payment is currently pending
    const currentStatus = payment?.payment_status || payment?.status;
    if (!payment || currentStatus !== 'PENDING') {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      return;
    }

    const pollPaymentStatus = async () => {
      try {
        const response = await checkPayment(id);
        const data = response.data || response;

        const updatedStatus = data.payment_status || data.status;

        setPayment((prev) => ({
          ...prev,
          payment_status: updatedStatus,
          status: updatedStatus,
          transaction_hash: data.transaction_hash || prev?.transaction_hash,
          paid_at: data.paid_at || prev?.paid_at,
          order_status: data.order_status || prev?.order_status,
        }));

        // Stop polling immediately on final status
        if (['PAID', 'EXPIRED', 'FAILED', 'CANCELLED'].includes(updatedStatus)) {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
        }
      } catch (err) {
        // Silently capture intermittent network errors during polling
        console.warn('Payment polling check:', err.response?.data?.message || err.message);
      }
    };

    // Poll every 3.5 seconds
    pollingTimerRef.current = setInterval(pollPaymentStatus, 3500);

    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [id, payment?.status, payment?.payment_status]);

  // Manual Check Trigger
  const handleManualCheck = async () => {
    setChecking(true);
    try {
      const response = await checkPayment(id);
      const data = response.data || response;
      const updatedStatus = data.payment_status || data.status;

      setPayment((prev) => ({
        ...prev,
        payment_status: updatedStatus,
        status: updatedStatus,
        transaction_hash: data.transaction_hash || prev?.transaction_hash,
        paid_at: data.paid_at || prev?.paid_at,
        order_status: data.order_status || prev?.order_status,
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Verification check could not be completed.');
    } finally {
      setChecking(false);
    }
  };

  const handleRegenerateKhqr = async () => {
    if (!payment?.order_id) return;
    setRegenerating(true);
    setError(null);
    try {
      const data = await createKhqrPayment(payment.order_id, payment.currency || 'USD');
      setPayment((prev) => ({
        ...prev,
        id: data.payment_id,
        payment_id: data.payment_id,
        khqr: data.khqr,
        md5: data.md5,
        expires_at: data.expires_at,
        payment_status: 'PENDING',
        status: 'PENDING',
      }));
      calculateTimeLeft(data.expires_at);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate a new KHQR code.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyRawKhqr = () => {
    if (!payment?.khqr) return;
    navigator.clipboard.writeText(payment.khqr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCountdown = (seconds) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <Loading message="Loading KHQR payment details..." />;
  }

  if (error && !payment) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 space-y-4">
        <ErrorMessage message={error} />
        <Link
          to="/customer/orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"
        >
          <ArrowLeft size={14} />
          <span>Back to My Orders</span>
        </Link>
      </div>
    );
  }

  const currentStatus = payment?.payment_status || payment?.status || 'PENDING';
  const orderNumber = payment?.order_number || payment?.order_id || 'N/A';
  const amount = Number(payment?.amount || 0).toFixed(2);
  const currency = payment?.currency || 'USD';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Navigation & Order Identifier */}
      <div className="flex items-center justify-between">
        <Link
          to="/customer/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft size={16} />
          <span>My Orders</span>
        </Link>
        <span className="text-xs font-bold text-slate-500">
          Payment ID: <span className="text-slate-900 font-mono">{payment?.id}</span>
        </span>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Main Payment Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Top Branding Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center font-black text-xs tracking-wider">
              KHQR
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Bakong KHQR Payment</h2>
              <p className="text-[11px] text-red-100">National Bank of Cambodia Standard</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-widest text-red-200 block">Currency</span>
            <span className="text-sm font-black">{currency}</span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Order Reference & Amount */}
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Reference</span>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-mono">
              #{orderNumber}
            </h1>
            <div className="pt-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                ${amount}
              </span>
              <span className="text-xs font-bold text-slate-500 ml-1.5">{currency}</span>
            </div>
          </div>

          {/* STATE 1: PAYMENT SUCCESS (PAID) */}
          {currentStatus === 'PAID' ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-950 tracking-tight">
                  Payment Verified Successfully!
                </h3>
                <p className="text-xs text-emerald-700 mt-1 max-w-sm mx-auto">
                  Your transaction has been verified through the Bakong network. Your order is now confirmed and is being prepared for dispatch.
                </p>
              </div>

              {payment?.transaction_hash && (
                <div className="bg-white/80 border border-emerald-200 rounded-lg p-3 text-left max-w-md mx-auto">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Transaction Reference Hash
                  </span>
                  <span className="text-xs font-mono text-slate-800 break-all select-all font-semibold">
                    {payment.transaction_hash}
                  </span>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to={`/customer/orders/${orderNumber}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
                >
                  <span>View Order Details</span>
                  <ExternalLink size={14} />
                </Link>
                <Link
                  to="/products"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : currentStatus === 'EXPIRED' ? (
            /* STATE 2: EXPIRED */
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Clock size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-950">Payment Session Expired</h3>
                <p className="text-xs text-amber-700 mt-1 max-w-sm mx-auto">
                  The KHQR expiration window has elapsed. For your security, this payment session has been closed without charge.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={regenerating}
                  onClick={handleRegenerateKhqr}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <RotateCw size={14} className={regenerating ? 'animate-spin' : ''} />
                  <span>{regenerating ? 'Generating New QR...' : 'Generate New QR Code'}</span>
                </button>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition"
                >
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>
          ) : currentStatus === 'FAILED' ? (
            /* STATE 3: FAILED */
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <XCircle size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-950">Payment Verification Failed</h3>
                <p className="text-xs text-rose-700 mt-1">
                  {payment?.failure_reason || 'We were unable to verify this transaction with Bakong.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleManualCheck}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Recheck Transaction</span>
              </button>
            </div>
          ) : (
            /* STATE 4: ACTIVE KHQR PENDING SCAN */
            <div className="space-y-6">
              {/* Expiration Countdown Banner */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock size={15} className="text-amber-600 shrink-0" />
                  <span>Payment expires in:</span>
                </div>
                <span className={`font-mono font-bold text-sm ${timeLeft !== null && timeLeft < 120 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
                  {formatCountdown(timeLeft)}
                </span>
              </div>

              {/* QR Code Presentation */}
              <div className="relative flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-50 border border-slate-200 rounded-2xl">
                {/* Red KHQR Stamp Header */}
                <div className="w-full max-w-[260px] bg-red-600 text-white text-center py-1.5 rounded-t-xl text-[11px] font-black tracking-widest uppercase">
                  KHQR
                </div>

                {/* QR Canvas */}
                <div className="bg-white p-4 rounded-b-xl border-x border-b border-slate-200 shadow-xs">
                  {payment?.khqr ? (
                    <QRCodeSVG
                      value={payment.khqr}
                      size={230}
                      level="M"
                      includeMargin={false}
                      className="mx-auto"
                    />
                  ) : (
                    <div className="w-[230px] h-[230px] flex items-center justify-center bg-slate-100 text-slate-400 text-xs font-semibold">
                      Generating KHQR...
                    </div>
                  )}
                </div>

                {/* Status Indicator */}
                <div className="mt-5 flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 rounded-full shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  <span className="text-xs font-bold text-slate-700">
                    Waiting for payment confirmation
                  </span>
                </div>
              </div>

              {/* Banking Apps List */}
              <div className="text-center space-y-2">
                <p className="text-xs font-semibold text-slate-700">
                  Scan this KHQR using Bakong or any supported Cambodian banking app:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-slate-600 font-semibold">
                  <span className="px-2.5 py-1 bg-slate-100 rounded-md">Bakong</span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-md">ABA Mobile</span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-md">Wing Bank</span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-md">ACLEDA mobile</span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-md">Canadia Bank</span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-md">+30 More</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={checking}
                  onClick={handleManualCheck}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
                  <span>{checking ? 'Verifying with Bakong...' : 'Check Payment Status'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyRawKhqr}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
                  title="Copy raw KHQR string"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy KHQR'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>Server-verified directly with Cambodia National Bank Bakong Open API</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
