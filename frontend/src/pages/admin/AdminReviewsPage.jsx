import { useState, useEffect, useMemo } from 'react';
import { Star, Search, Trash2, MessageSquare, CheckCircle2 } from 'lucide-react';
import { getReviews, deleteReview } from '../../api/reviewApi';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReviews();
      setReviews(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load customer reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    getReviews()
      .then((data) => {
        if (!ignore) {
          setReviews(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Failed to load customer reviews');
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesRating = ratingFilter === 'ALL' || Number(r.rating) === Number(ratingFilter);
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.product_name?.toLowerCase().includes(q) ||
        r.customer?.name?.toLowerCase().includes(q) ||
        r.customer?.email?.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q);
      return matchesRating && matchesSearch;
    });
  }, [reviews, search, ratingFilter]);

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteReview(deleteTarget.id);
      setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setActionSuccess('Review has been deleted successfully.');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete review');
    } finally {
      setDeleteTarget(null);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-200 fill-slate-100'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Reviews</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor and moderate user-generated product feedback and ratings
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          {actionSuccess}
        </div>
      )}

      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Average Rating</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-900">{avgRating}</span>
            <span className="text-sm text-slate-400">/ 5.0</span>
          </div>
          <div className="mt-2">{renderStars(Math.round(Number(avgRating)))}</div>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Reviews</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{reviews.length}</p>
          <p className="text-xs text-slate-500 mt-1">Across all catalog products</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">5-Star Feedback</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">
            {reviews.filter((r) => Number(r.rating) === 5).length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Highest satisfaction rate</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, product, or review text..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', '5', '4', '3', '2', '1'].map((r) => (
            <button
              key={r}
              onClick={() => setRatingFilter(r)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border whitespace-nowrap transition-colors ${
                ratingFilter === r
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {r === 'ALL' ? 'All Ratings' : `${r} Stars`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Loading message="Loading customer reviews..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchReviews} />
      ) : filteredReviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No Reviews Found"
          description={
            search || ratingFilter !== 'ALL'
              ? 'No reviews match your selected filter criteria.'
              : 'There are no published reviews yet.'
          }
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Rating</th>
                  <th className="px-5 py-3.5">Review Comment</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">
                        {rev.product_name || `Product #${rev.product_id}`}
                      </div>
                      <div className="text-xs text-slate-400">ID: {rev.product_id}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{rev.customer?.name || 'Customer'}</div>
                      {rev.customer?.email && (
                        <div className="text-xs text-slate-500">{rev.customer.email}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {renderStars(rev.rating)}
                        <span className="text-xs font-bold text-slate-700">{rev.rating}.0</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-md">
                      <p className="text-slate-700 text-sm line-clamp-2">{rev.comment}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setDeleteTarget(rev)}
                        title="Delete review"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Review"
        message={`Are you sure you want to delete the review by "${deleteTarget?.customer?.name}" for "${deleteTarget?.product_name}"? This action cannot be undone.`}
        confirmText="Delete Review"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
