import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, PackageOpen } from 'lucide-react';
import { useProductDetail } from '../hooks/useProductDetail';
import ProductDetails from '../components/product/ProductDetails';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { product, loading, error, refetch } = useProductDetail(id);

  if (loading) {
    return <Loading message="Loading product details..." />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorMessage message={error} onRetry={refetch} />
        <div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition"
          >
            <ArrowLeft size={14} />
            <span>Back to Products</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16 px-4 bg-white border border-dashed border-slate-300 rounded-xl my-6">
        <div className="w-14 h-14 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <PackageOpen size={30} />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">Product Not Found</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
          The requested mobile device does not exist or is no longer listed.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition"
        >
          <ArrowLeft size={14} />
          <span>Browse Products</span>
        </Link>
      </div>
    );
  }

  return <ProductDetails product={product} />;
};

export default ProductDetailPage;
