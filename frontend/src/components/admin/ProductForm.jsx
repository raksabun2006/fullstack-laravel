import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import { getBrands } from '../../api/brandApi';
import { getCategories } from '../../api/categoryApi';

const ProductForm = ({ initialData, onSubmit, isEditing = false }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => ({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    brand_id: initialData?.brand_id || '',
    category_id: initialData?.category_id || '',
    base_price: initialData?.base_price || '',
    status: initialData?.status || 'ACTIVE',
    description: initialData?.description || '',
  }));

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getBrands(), getCategories()])
      .then(([bList, cList]) => {
        setBrands(bList || []);
        setCategories(cList || []);
      })
      .finally(() => setLoadingMeta(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-generate slug from name if slug isn't customized yet
      if (name === 'name' && !isEditing) {
        updated.slug = value
          .toLowerCase()
          .replace(/[^\w ]+/g, '')
          .replace(/ +/g, '-');
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        ...formData,
        brand_id: Number(formData.brand_id),
        category_id: Number(formData.category_id),
        base_price: Number(formData.base_price),
      });
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in product specifications, pricing, and brand taxonomy
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. iPhone 17 Pro Max"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">URL Slug</label>
            <input
              type="text"
              name="slug"
              placeholder="iphone-17-pro-max"
              value={formData.slug}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 font-mono text-[11px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Brand Manufacturer</label>
            <select
              name="brand_id"
              value={formData.brand_id}
              onChange={handleChange}
              required
              disabled={loadingMeta}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">Select Brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              disabled={loadingMeta}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Base Price ($ USD)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="base_price"
              placeholder="999.00"
              value={formData.base_price}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Catalog Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full sm:w-48 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 bg-white font-semibold"
          >
            <option value="ACTIVE">ACTIVE (Published)</option>
            <option value="INACTIVE">INACTIVE (Draft)</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Product Description</label>
          <textarea
            rows={5}
            name="description"
            placeholder="Detailed description of smartphone specs, chipset, camera, and display..."
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            to="/admin/products"
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md font-semibold hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold shadow-xs transition disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>{isEditing ? 'Update Product' : 'Create Product'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
