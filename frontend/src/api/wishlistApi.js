import axiosClient from './axiosClient';

export const getWishlist = async () => {
  const response = await axiosClient.get('/customer/wishlist');
  return response.data.data;
};

export const addToWishlist = async (product) => {
  const response = await axiosClient.post('/customer/wishlist', {
    product_id: product.id,
  });
  return response.data.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await axiosClient.delete(`/customer/wishlist/${productId}`);
  return response.data.data;
};
