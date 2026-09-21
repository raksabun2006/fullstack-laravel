import { Link } from 'react-router-dom';
import { Smartphone, ArrowRight } from 'lucide-react';

const ProductCard = ({ product }) => {
  if (!product) return null;

  const primaryImg = product.primary_image?.url
    || product.primary_image?.image_url
    || product.images?.[0]?.url
    || product.images?.[0]?.image_url;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.base_price || 0);

  const isActive = product.status === 'ACTIVE';

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 hover:shadow-sm transition">
      {/* Product Image Area */}
      <div className="relative h-52 bg-slate-50 border-b border-slate-100 flex items-center justify-center p-4">
        {primaryImg ? (
          <img
            src={primaryImg}
            alt={product.name}
            className="max-h-full max-w-full object-contain hover:scale-105 transition duration-200"
            loading="lazy"
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
          style={{ display: primaryImg ? 'none' : 'flex' }}
        >
          <Smartphone size={48} strokeWidth={1.5} />
        </div>

        <span
          className={`absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
            isActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {product.status || 'ACTIVE'}
        </span>
      </div>

      {/* Product Body */}
      <div className="p-4 flex flex-col flex-1">
        {product.brand?.name && (
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            {product.brand.name}
          </span>
        )}

        <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 min-h-[2.6rem] mb-3" title={product.name}>
          {product.name}
        </h3>

        <div className="mt-auto pt-2 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] text-slate-400">From</span>
            <span className="text-base font-bold text-slate-900">{formattedPrice}</span>
          </div>
        </div>

        <div className="mt-3">
          <Link
            to={`/products/${product.id}`}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-xs"
          >
            <span>View Details</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
