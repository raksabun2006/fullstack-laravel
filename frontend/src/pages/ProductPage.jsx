import { useSearchParams } from 'react-router-dom';
import { X, Filter } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import ProductGrid from '../components/product/ProductGrid';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const ProductPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const brandId = searchParams.get('brand_id');
  const categoryId = searchParams.get('category_id');
  const searchQuery = searchParams.get('search');

  const params = {};
  if (brandId) params.brand_id = brandId;
  if (categoryId) params.category_id = categoryId;
  if (searchQuery) params.search = searchQuery;

  const { products, loading, error, refetch } = useProducts(params);

  const hasFilters = Boolean(brandId || categoryId || searchQuery);

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mobile Phones & Devices</h1>
          <p className="text-sm text-slate-500 mt-1">
            {searchQuery
              ? `Showing results for "${searchQuery}"`
              : 'Browse our complete catalog of mobile devices and accessories'}
          </p>
        </div>

        {hasFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
              <Filter size={13} />
              <span>Filters:</span>
            </span>
            {searchQuery && (
              <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
                Search: "{searchQuery}"
              </span>
            )}
            {brandId && (
              <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
                Brand ID: {brandId}
              </span>
            )}
            {categoryId && (
              <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
                Category ID: {categoryId}
              </span>
            )}
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <X size={13} />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {loading && <Loading message="Loading catalog..." />}

      {error && <ErrorMessage message={error} onRetry={refetch} />}

      {!loading && !error && (
        <ProductGrid products={products} />
      )}
    </div>
  );
};

export default ProductPage;
