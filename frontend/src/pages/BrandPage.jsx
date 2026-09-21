import { Tag } from 'lucide-react';
import { useBrands } from '../hooks/useBrands';
import BrandCard from '../components/brand/BrandCard';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const BrandPage = () => {
  const { brands, loading, error, refetch } = useBrands();

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Official Brand Partners</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore mobile smartphones and accessories grouped by verified brand makers
        </p>
      </div>

      {loading && <Loading message="Loading brand partners..." />}

      {error && <ErrorMessage message={error} onRetry={refetch} />}

      {!loading && !error && brands.length === 0 && (
        <div className="text-center py-16 px-4 bg-white border border-dashed border-slate-300 rounded-xl my-6">
          <div className="w-14 h-14 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Tag size={28} />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">No Brands Available</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Check back later as new brands are added to the store catalog.
          </p>
        </div>
      )}

      {!loading && !error && brands.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandPage;
