import { FolderTree } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import CategoryCard from '../../components/category/CategoryCard';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

const CategoryPage = () => {
  const { categories, loading, error, refetch } = useCategories();

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Categories</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore smartphones, tablets, chargers, and premium mobile accessories by category
        </p>
      </div>

      {loading && <Loading message="Loading categories..." />}

      {error && <ErrorMessage message={error} onRetry={refetch} />}

      {!loading && !error && categories.length === 0 && (
        <EmptyState
          icon={FolderTree}
          title="No Categories Found"
          description="There are currently no active categories in the store catalog."
        />
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
