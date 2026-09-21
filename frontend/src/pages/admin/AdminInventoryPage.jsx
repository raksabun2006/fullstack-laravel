import { useEffect, useState } from 'react';
import { Search, Filter, AlertTriangle, CheckCircle2, XCircle, Boxes, Smartphone } from 'lucide-react';
import { getProducts } from '../../api/productApi';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const STOCK_FILTERS = ['ALL', 'IN STOCK', 'LOW STOCK', 'OUT OF STOCK'];

const AdminInventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    getProducts()
      .then((data) => setProducts(data || []))
      .finally(() => setLoading(false));
  }, []);

  // Flatten product variants into inventory rows
  const inventoryItems = [];
  products.forEach((p) => {
    if (p.variants && p.variants.length > 0) {
      p.variants.forEach((v) => {
        const stock = Number(v.stock) || 0;
        let stockStatus = 'IN STOCK';
        if (stock === 0) stockStatus = 'OUT OF STOCK';
        else if (stock <= 5) stockStatus = 'LOW STOCK';

        inventoryItems.push({
          id: `${p.id}-${v.id}`,
          productId: p.id,
          productName: p.name,
          brandName: p.brand?.name || '—',
          variantName: `${v.color} - ${v.storage}${v.ram ? ` (${v.ram})` : ''}`,
          sku: v.sku,
          price: v.price,
          stock,
          status: stockStatus,
        });
      });
    } else {
      // Product level with no variants configured yet
      inventoryItems.push({
        id: `${p.id}-default`,
        productId: p.id,
        productName: p.name,
        brandName: p.brand?.name || '—',
        variantName: 'No Variants Configured',
        sku: `SKU-${p.id}`,
        price: p.base_price,
        stock: 0,
        status: 'OUT OF STOCK',
      });
    }
  });

  const filtered = inventoryItems.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brandName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const lowStockCount = inventoryItems.filter((i) => i.status === 'LOW STOCK').length;
  const outOfStockCount = inventoryItems.filter((i) => i.status === 'OUT OF STOCK').length;

  if (loading) {
    return <Loading message="Auditing inventory stock levels..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Inventory & Stock Levels</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track real-time SKU units, stock depletion, and inventory replenishment</p>
        </div>

        <div className="flex items-center gap-2">
          {lowStockCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-md">
              <AlertTriangle size={14} />
              <span>{lowStockCount} Low Stock</span>
            </span>
          )}
          {outOfStockCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-md">
              <XCircle size={14} />
              <span>{outOfStockCount} Out of Stock</span>
            </span>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by device, SKU, brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <Filter size={14} className="text-slate-400 shrink-0 mr-1" />
          {STOCK_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded text-xs font-semibold shrink-0 transition cursor-pointer ${
                statusFilter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No Inventory Items Found"
          description="Try adjusting your search query or status filter."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Device</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Variant Specs</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock Units</th>
                  <th className="py-3 px-4 text-right">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((item) => {
                  const isLow = item.status === 'LOW STOCK';
                  const isOut = item.status === 'OUT OF STOCK';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Smartphone size={15} className="text-slate-400 shrink-0" />
                          <span>{item.productName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{item.brandName}</td>
                      <td className="py-3 px-4">{item.variantName}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{item.sku}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        ${Number(item.price).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-slate-900 text-sm">{item.stock}</span>
                        <span className="text-slate-400 ml-1">pcs</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isOut
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : isLow
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isOut ? <XCircle size={11} /> : isLow ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
                          <span>{item.status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventoryPage;
