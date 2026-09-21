import ProductForm from '../../components/admin/ProductForm';
import { createProduct } from '../../api/productApi';

const AdminProductCreatePage = () => {
  const handleCreate = async (data) => {
    return await createProduct(data);
  };

  return <ProductForm onSubmit={handleCreate} isEditing={false} />;
};

export default AdminProductCreatePage;
