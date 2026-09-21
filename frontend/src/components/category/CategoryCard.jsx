import { Link } from 'react-router-dom';
import { Layers, ChevronRight } from 'lucide-react';

const CategoryCard = ({ category }) => {
  if (!category) return null;

  return (
    <Link
      to={`/products?category_id=${category.id}`}
      className="flex items-center gap-3.5 p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-xs transition group text-slate-900"
    >
      <div className="w-10 h-10 rounded-md bg-slate-50 text-blue-600 flex items-center justify-center shrink-0 border border-slate-100">
        <Layers size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition truncate">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {category.description}
          </p>
        )}
        {category.products_count !== undefined && (
          <span className="text-[11px] text-blue-600 font-medium">
            {category.products_count} Items
          </span>
        )}
      </div>

      <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition shrink-0" />
    </Link>
  );
};

export default CategoryCard;
