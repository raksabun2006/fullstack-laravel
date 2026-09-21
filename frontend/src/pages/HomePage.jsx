import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, ShieldCheck, Truck, Headphones, RotateCcw } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useBrands } from '../hooks/useBrands';
import { useCategories } from '../hooks/useCategories';
import ProductGrid from '../components/product/ProductGrid';
import BrandCard from '../components/brand/BrandCard';
import CategoryCard from '../components/category/CategoryCard';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const HomePage = () => {
  const { products, loading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts({ per_page: 8 });
  const { brands, loading: brandsLoading, error: brandsError, refetch: refetchBrands } = useBrands();
  const { categories, loading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useCategories();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-14 text-center shadow-xs">
        <span className="inline-block px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
          Official Mobile Store
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight max-w-2xl mx-auto leading-tight mb-4">
          Next-Gen Smartphones & Modern Accessories
        </h1>
        <p className="text-base text-slate-600 max-w-xl mx-auto mb-8">
          Explore genuine flagship phones, authentic accessories, and certified devices with official brand warranties.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-xs transition"
          >
            <span>Browse All Phones</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/brands"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg transition"
          >
            <span>View Brands</span>
            <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* Feature Highlights Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Genuine Devices</h4>
            <p className="text-[11px] text-slate-500">100% Authentic Guaranteed</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Truck size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Express Delivery</h4>
            <p className="text-[11px] text-slate-500">Insured door-to-door</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <RotateCcw size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">7-Day Return</h4>
            <p className="text-[11px] text-slate-500">Easy replacement policy</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Headphones size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Full Support</h4>
            <p className="text-[11px] text-slate-500">Official customer care</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Shop by Category</h2>
            <p className="text-xs text-slate-500 mt-0.5">Explore smartphones, tablets, and smart accessories</p>
          </div>
        </div>

        {categoriesLoading && <Loading message="Loading categories..." />}
        {categoriesError && <ErrorMessage message={categoriesError} onRetry={refetchCategories} />}
        {!categoriesLoading && !categoriesError && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Brands */}
      <section>
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Featured Brands</h2>
            <p className="text-xs text-slate-500 mt-0.5">Explore top manufacturers and partners</p>
          </div>
          <Link to="/brands" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
            <span>All Brands</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {brandsLoading && <Loading message="Loading brands..." />}
        {brandsError && <ErrorMessage message={brandsError} onRetry={refetchBrands} />}
        {!brandsLoading && !brandsError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {brands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        )}
      </section>

      {/* Latest Products */}
      <section>
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Latest Mobile Devices</h2>
            <p className="text-xs text-slate-500 mt-0.5">Freshly stocked smartphones and tech accessories</p>
          </div>
          <Link to="/products" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
            <span>View All</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {productsLoading && <Loading message="Loading products..." />}
        {productsError && <ErrorMessage message={productsError} onRetry={refetchProducts} />}
        {!productsLoading && !productsError && (
          <ProductGrid products={products} />
        )}
      </section>
    </div>
  );
};

export default HomePage;
