import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, ShoppingCart, Check, Tag, Layers, ChevronRight, ShieldCheck, Truck, Loader2, CheckCircle2 } from 'lucide-react';
import { addToCart } from '../../api/cartApi';

const ProductDetails = ({ product }) => {
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [cartError, setCartError] = useState(null);

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : (product.primary_image ? [product.primary_image] : []);

  const activeImageUrl = images[selectedImgIndex]?.url
    || images[selectedImgIndex]?.image_url
    || product.primary_image?.url
    || product.primary_image?.image_url;

  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId)
    || product.variants?.[0];

  const currentPrice = selectedVariant
    ? selectedVariant.price
    : product.base_price;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(currentPrice || 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/" className="hover:text-blue-600 transition">Home</Link>
        <ChevronRight size={12} className="text-slate-400" />
        <Link to="/products" className="hover:text-blue-600 transition">Products</Link>
        <ChevronRight size={12} className="text-slate-400" />
        <span className="text-slate-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Gallery Section */}
        <div className="space-y-4">
          <div className="h-96 sm:h-[440px] bg-white border border-slate-200 rounded-xl p-8 flex items-center justify-center shadow-xs">
            {activeImageUrl ? (
              <img
                src={activeImageUrl}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div
              className="items-center justify-center text-slate-300 w-full h-full"
              style={{ display: activeImageUrl ? 'none' : 'flex' }}
            >
              <Smartphone size={72} strokeWidth={1.5} />
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {images.map((img, idx) => {
                const thumbUrl = img.url || img.image_url;
                return (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setSelectedImgIndex(idx)}
                    className={`w-16 h-16 rounded-lg bg-white border p-1 shrink-0 flex items-center justify-center transition cursor-pointer ${
                      idx === selectedImgIndex
                        ? 'border-blue-600 ring-2 ring-blue-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={thumbUrl} alt={`Thumb ${idx + 1}`} className="max-h-full max-w-full object-contain" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="flex flex-col">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {product.brand?.name && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                <Tag size={12} />
                <span>{product.brand.name}</span>
              </span>
            )}
            {product.category?.name && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                <Layers size={12} />
                <span>{product.category.name}</span>
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide ${
                product.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {product.status || 'ACTIVE'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug mb-5">
            {product.name}
          </h1>

          {/* Pricing Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-baseline justify-between mb-6 shadow-xs">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {formattedPrice}
            </span>
            {selectedVariant && (
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                Selected: {selectedVariant.color} / {selectedVariant.storage}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6 pb-6 border-b border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                Description
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Available Configurations
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`text-left p-3 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-50/60 border-blue-600 ring-1 ring-blue-600'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">{v.color}</span>
                        {isSelected && <Check size={14} className="text-blue-600" />}
                      </div>
                      <div className="text-[11px] text-slate-500 mb-2">
                        {v.ram && <span>{v.ram} • </span>}
                        <span>{v.storage}</span>
                      </div>
                      <div className="flex items-baseline justify-between pt-1 border-t border-slate-100 text-xs">
                        <span className="font-bold text-slate-900">${Number(v.price).toFixed(2)}</span>
                        <span className={`text-[10px] font-semibold ${v.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {v.stock > 0 ? `${v.stock} left` : 'Out'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add to Cart Section */}
          <div className="space-y-2 mb-6">
            {cartSuccess && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Added to cart successfully!</span>
                </div>
                <Link
                  to="/checkout"
                  className="underline hover:text-emerald-900 font-bold ml-2 shrink-0"
                >
                  Checkout →
                </Link>
              </div>
            )}
            {cartError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                <span>{cartError}</span>
              </div>
            )}
            <button
              type="button"
              disabled={isAdding || (selectedVariant && selectedVariant.stock === 0)}
              onClick={async () => {
                const variantId = selectedVariant?.id || product.variants?.[0]?.id;
                if (!variantId) return;
                setIsAdding(true);
                setCartSuccess(false);
                setCartError(null);
                try {
                  await addToCart(variantId, 1);
                  setCartSuccess(true);
                  setTimeout(() => setCartSuccess(false), 3000);
                } catch (err) {
                  setCartError(err.response?.data?.message || 'Failed to add item to cart');
                } finally {
                  setIsAdding(false);
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-xs transition cursor-pointer"
            >
              {isAdding ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Adding to Cart...</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  <span>{selectedVariant && selectedVariant.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                </>
              )}
            </button>
          </div>

          {/* Perks */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-600" />
              <span>1 Year Official Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-blue-600" />
              <span>Insured Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
