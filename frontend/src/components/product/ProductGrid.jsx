import { PackageOpen } from 'lucide-react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products = [] }) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white border border-dashed border-slate-300 rounded-xl my-6">
        <div className="w-14 h-14 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <PackageOpen size={30} />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">No products found</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          There are currently no products available matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
