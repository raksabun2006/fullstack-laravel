import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, Eye, Smartphone } from 'lucide-react';
import { getWishlist, removeFromWishlist } from '../../api/wishlistApi';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const CustomerWishlistPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWishlist()
      .then((data) => setItems(data || []))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    const updated = await removeFromWishlist(productId);
    setItems(updated);
  };

  if (loading) {
    return <Loading message="Loading your saved wishlist..." />;
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Wishlist</h1>
        <p className="text-xs text-slate-500 mt-0.5">Your saved smartphones and tech accessories</p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Explore our store catalog and click the wishlist icon to save devices for later."
          action={
            <Link to="/products" className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md shadow-xs">
              Explore Products
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((product) => {
            const imgUrl = product.primary_image?.url || product.primary_image?.image_url || product.images?.[0]?.url;
            return (
              <div key={product.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
                <div className="h-44 bg-slate-50 border-b border-slate-100 flex items-center justify-center p-4 relative">
                  {imgUrl ? (
                    <img src={imgUrl} alt={product.name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <Smartphone size={40} className="text-slate-300" />
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white text-slate-400 hover:text-red-600 shadow-xs border border-slate-200 transition cursor-pointer"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {product.brand?.name || 'Device'}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900 truncate mb-1" title={product.name}>
                      {product.name}
                    </h4>
                    <span className="text-base font-extrabold text-slate-900">
                      ${Number(product.base_price || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <Link
                      to={`/products/${product.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition"
                    >
                      <Eye size={14} />
                      <span>View Product</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerWishlistPage;
