import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductForm from '../../components/admin/ProductForm';
import { getProductById, updateProduct } from '../../api/productApi';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const AdminProductEditPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProductById(id)
      .then((data) => setProduct(data))
      .catch((err) => setError(err.message || 'Failed to load product for editing'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (data) => {
    return await updateProduct(id, data);
  };

  if (loading) {
    return <Loading message="Loading product data..." />;
  }

  if (error || !product) {
    return <ErrorMessage message={error || 'Product not found'} />;
  }

  return <ProductForm initialData={product} onSubmit={handleUpdate} isEditing={true} />;
};

export default AdminProductEditPage;
