import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Truck,
  ShieldCheck,
  QrCode,
  Banknote,
  Plus,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Package,
} from "lucide-react";
import { getCart } from "../../api/cartApi";
import { getAddresses, createAddress } from "../../api/addressApi";
import { createOrder } from "../../api/orderApi";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";

const CheckoutPage = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("KHQR"); // KHQR or CASH_ON_DELIVERY
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Quick Address modal / inline form state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: "",
    phone: "",
    province: "Phnom Penh",
    district: "",
    commune: "",
    address: "",
    postal_code: "12000",
    is_default: true,
  });
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrError, setAddrError] = useState(null);

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  const fetchCheckoutData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cartData, addrData] = await Promise.all([
        getCart(),
        getAddresses(),
      ]);

      setCart(cartData);
      setAddresses(addrData || []);

      if (addrData && addrData.length > 0) {
        const defaultAddr = addrData.find((a) => a.is_default) || addrData[0];
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to initialize checkout",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddrSaving(true);
    setAddrError(null);
    try {
      const payload = {
        ...newAddr,
        commune: newAddr.commune || newAddr.district || "Sangkat",
      };
      const created = await createAddress(payload);
      setAddresses((prev) => [...prev, created]);
      setSelectedAddressId(created.id);
      setShowAddAddress(false);
      setNewAddr({
        name: "",
        phone: "",
        province: "Phnom Penh",
        district: "",
        commune: "",
        address: "",
        postal_code: "12000",
        is_default: true,
      });
    } catch (err) {
      const errorMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(", ")
        : err.response?.data?.message || "Failed to add shipping address";
      setAddrError(errorMsg);
    } finally {
      setAddrSaving(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId && addresses.length === 0) {
      setError("Please add and select a shipping address before proceeding.");
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      setError("Your shopping cart is empty.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await createOrder({
        address_id: selectedAddressId,
        payment_method: paymentMethod,
        note: note.trim() || undefined,
      });

      // The Laravel backend returns order and payment details
      const responseData = response.data || response;
      const paymentId =
        responseData.payment_id ||
        responseData.payment?.id ||
        responseData.data?.payment_id;
      const orderId =
        responseData.order_id ||
        responseData.order?.id ||
        responseData.data?.order_id;

      if (paymentMethod === "KHQR") {
        // Redirect customer to real Bakong KHQR payment page
        if (paymentId) {
          navigate(`/payment/${paymentId}`);
        } else {
          // Fallback if paymentId is nested inside order
          navigate(`/payment/PAY-${orderId}`);
        }
      } else {
        // Cash on Delivery -> Redirect to order details
        navigate(`/customer/orders/${orderId}`, {
          state: {
            message:
              "Order placed successfully! Please prepare cash on delivery.",
          },
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to place order. Please try again.",
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading message="Preparing your checkout..." />;
  }

  const items = cart?.items || [];
  const subtotal = Number(cart?.subtotal || 0);
  const shippingFee = Number(cart?.shipping_fee || 5.0);
  const total = Number(cart?.total || subtotal + shippingFee);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <Package size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
          Explore our latest flagship smartphones and accessories to begin your
          order.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-xs transition"
        >
          <ArrowLeft size={16} />
          <span>Browse Products</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Continue Shopping"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Checkout
            </h1>
            <p className="text-xs text-slate-500">
              Review items, select delivery address, and choose payment method
            </p>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery & Payment Options */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Shipping Address Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MapPin size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    1. Delivery Address
                  </h2>
                  <p className="text-xs text-slate-500">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>
              {!showAddAddress && (
                <button
                  type="button"
                  onClick={() => setShowAddAddress(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition"
                >
                  <Plus size={14} />
                  <span>New Address</span>
                </button>
              )}
            </div>

            {/* Inline Add Address Form */}
            {showAddAddress && (
              <form
                onSubmit={handleSaveAddress}
                className="p-5 sm:p-6 bg-slate-50/50 border border-slate-200 rounded-2xl space-y-4"
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Add New Destination
                </h3>
                {addrError && (
                  <p className="text-xs text-rose-500 font-medium">
                    {addrError}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Athiphou Thy"
                      value={newAddr.name}
                      onChange={(e) =>
                        setNewAddr({ ...newAddr, name: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 078451239"
                      value={newAddr.phone}
                      onChange={(e) =>
                        setNewAddr({ ...newAddr, phone: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Province / City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Phnom Penh"
                      value={newAddr.province}
                      onChange={(e) =>
                        setNewAddr({ ...newAddr, province: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Khan / District *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sen Sok"
                      value={newAddr.district}
                      onChange={(e) =>
                        setNewAddr({ ...newAddr, district: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Street, House No., Sangkat *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AH11, Tuek Thla, Sen Sok, Phnom Penh, Cambodia."
                      value={newAddr.address}
                      onChange={(e) =>
                        setNewAddr({ ...newAddr, address: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="px-5 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addrSaving}
                    className="inline-flex items-center gap-1.5 px-6 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition disabled:opacity-50"
                  >
                    {addrSaving && (
                      <Loader2 size={13} className="animate-spin" />
                    )}
                    <span>Save Address</span>
                  </button>
                </div>
              </form>
            )}

            {/* Address List */}
            {addresses.length === 0 && !showAddAddress ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <AlertCircle
                  size={24}
                  className="mx-auto text-amber-500 mb-2"
                />
                <p className="text-xs text-slate-600 font-medium mb-3">
                  No saved addresses found.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddAddress(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
                >
                  <Plus size={14} />
                  <span>Add Shipping Address</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start justify-between gap-3 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <input
                            type="radio"
                            name="delivery_address"
                            checked={isSelected}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {addr.name}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              ({addr.phone})
                            </span>
                            {addr.is_default && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-100 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600">
                            {addr.address},{" "}
                            {addr.district && `${addr.district}, `}
                            {addr.province}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2
                          size={16}
                          className="text-blue-600 shrink-0"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Payment Method Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  2. Payment Method
                </h2>
                <p className="text-xs text-slate-500">
                  Official Cambodian banking scan or cash on arrival
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Option A: Bakong KHQR */}
              <div
                onClick={() => setPaymentMethod("KHQR")}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-start justify-between gap-4 ${
                  paymentMethod === "KHQR"
                    ? "border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-1">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === "KHQR"}
                      onChange={() => setPaymentMethod("KHQR")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Bakong KHQR (Recommended)
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 rounded">
                        KHQR
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Instant and secure. Pay by scanning the dynamic QR code
                      with Bakong, ABA Mobile, Wing Bank, ACLEDA mobile, or any
                      supported Cambodian bank.
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 font-medium">
                      <QrCode size={13} className="text-blue-600" />
                      <span>
                        Dynamic NBC KHQR generated instantly upon order
                      </span>
                    </div>
                  </div>
                </div>
                {paymentMethod === "KHQR" && (
                  <CheckCircle2
                    size={18}
                    className="text-blue-600 shrink-0 mt-0.5"
                  />
                )}
              </div>

              {/* Option B: Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-start justify-between gap-4 ${
                  paymentMethod === "CASH_ON_DELIVERY"
                    ? "border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-1">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === "CASH_ON_DELIVERY"}
                      onChange={() => setPaymentMethod("CASH_ON_DELIVERY")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Cash on Delivery (COD)
                      </span>
                      <Banknote size={15} className="text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Pay in cash directly to our delivery courier when you
                      receive and inspect your phone.
                    </p>
                  </div>
                </div>
                {paymentMethod === "CASH_ON_DELIVERY" && (
                  <CheckCircle2
                    size={18}
                    className="text-blue-600 shrink-0 mt-0.5"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 3. Delivery Instructions Note */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-slate-900">
              Delivery Note / Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Please call before delivery, deliver in afternoon, etc."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order Action */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5 sticky top-24">
            <h2 className="text-base font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-200">
              Order Summary
            </h2>

            {/* Item List */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-500 font-bold">
                      <Package size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {item.product_name || "Smartphone"}
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        {item.color} • {item.storage} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    ${(Number(item.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 pt-4 border-t border-slate-200 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>
                  Subtotal ({items.length}{" "}
                  {items.length === 1 ? "item" : "items"})
                </span>
                <span className="font-semibold text-slate-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Insured Standard Shipping</span>
                <span className="font-semibold text-slate-900">
                  ${shippingFee.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="text-lg text-blue-600 tracking-tight">
                  ${total.toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="button"
              disabled={submitting || addresses.length === 0}
              onClick={handlePlaceOrder}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  {paymentMethod === "KHQR" ? (
                    <QrCode size={18} />
                  ) : (
                    <Truck size={18} />
                  )}
                  <span>
                    {paymentMethod === "KHQR"
                      ? "Proceed to KHQR Payment"
                      : "Confirm Order (COD)"}
                  </span>
                </>
              )}
            </button>

            {/* Guarantees */}
            <div className="space-y-2 pt-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                <span>
                  Verified Official Cambodia National Bank (NBC) Bakong KHQR
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-blue-600 shrink-0" />
                <span>1-2 Business Days Nationwide Safe Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
