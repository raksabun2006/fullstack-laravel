import axiosClient from './axiosClient';

export const getCart = async () => {
  const response = await axiosClient.get('/cart');
  return response.data.data;
};

export const addToCart = async (variantId, quantity = 1) => {
  const response = await axiosClient.post('/cart/items', {
    product_variant_id: variantId,
    quantity,
  });
  return response.data.data;
};

export const updateCartItem = async (itemId, quantity) => {
  const response = await axiosClient.put(`/cart/items/${itemId}`, {
    quantity,
  });
  return response.data.data;
};

export const removeCartItem = async (itemId) => {
  const response = await axiosClient.delete(`/cart/items/${itemId}`);
  return response.data.data;
};

export const clearCart = async () => {
  const response = await axiosClient.delete('/cart/clear');
  return response.data.data;
};
