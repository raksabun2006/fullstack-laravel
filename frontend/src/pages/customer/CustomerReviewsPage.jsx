import { useEffect, useState } from 'react';
import { Star, Trash2, Plus, MessageSquare } from 'lucide-react';
import { getCustomerReviews, createReview, deleteReview } from '../../api/reviewApi';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const CustomerReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    product_name: '',
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    getCustomerReviews()
      .then((data) => setReviews(data || []))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    await deleteReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;

    const created = await createReview({
      ...newReview,
      product_id: 1,
    });
    setReviews((prev) => [created, ...prev]);
    setIsModalOpen(false);
    setNewReview({ product_name: '', rating: 5, comment: '' });
  };

  if (loading) {
    return <Loading message="Loading your product reviews..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Product Reviews</h1>
          <p className="text-xs text-slate-500 mt-0.5">Ratings and feedback submitted for purchased phones</p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-xs cursor-pointer"
        >
          <Plus size={15} />
          <span>Write a Review</span>
        </button>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No Reviews Yet"
          description="You haven't written any product reviews yet. Share your experience with other buyers!"
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{rev.product_name}</h4>
                  <span className="text-[11px] text-slate-400">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Rating Stars Component (No Emojis) */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      className={s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-1.5">{rev.rating}.0 / 5.0</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">{rev.comment}</p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-start">
                <button
                  type="button"
                  onClick={() => handleDelete(rev.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded transition cursor-pointer"
                  title="Delete review"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Write a Product Review</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 17 Pro"
                  value={newReview.product_name}
                  onChange={(e) => setNewReview({ ...newReview, product_name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        size={22}
                        className={star <= newReview.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-slate-700 ml-2">{newReview.rating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Review</label>
                <textarea
                  rows={4}
                  placeholder="Share details about device performance, display, battery life..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerReviewsPage;
