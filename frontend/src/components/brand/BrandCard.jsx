import { Link } from 'react-router-dom';
import { Smartphone, ChevronRight } from 'lucide-react';

const BrandCard = ({ brand }) => {
  if (!brand) return null;

  const logoSrc = brand.logo_url || brand.logo;

  return (
    <Link
      to={`/products?brand_id=${brand.id}`}
      className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-xs transition group text-slate-900"
    >
      <div className="w-12 h-12 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
        {logoSrc ? (
          <img
            src={logoSrc}
            alt={brand.name}
            className="max-w-[80%] max-h-[80%] object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) {
                e.target.nextSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div
          className="items-center justify-center gap-1 text-slate-600 font-bold text-base"
          style={{ display: logoSrc ? 'none' : 'flex' }}
        >
          <Smartphone size={18} className="text-blue-600" />
          <span>{brand.name.charAt(0).toUpperCase()}</span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition truncate">
          {brand.name}
        </h3>
        {brand.description && (
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {brand.description}
          </p>
        )}
        {brand.products_count !== undefined && (
          <span className="text-[11px] text-slate-400 font-medium">
            {brand.products_count} Models
          </span>
        )}
      </div>

      <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition shrink-0" />
    </Link>
  );
};

export default BrandCard;
