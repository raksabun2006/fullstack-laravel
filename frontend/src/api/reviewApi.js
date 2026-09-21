import axiosClient from './axiosClient';

export const getReviews = async (params = {}) => {
  const response = await axiosClient.get('/reviews', { params });
  return response.data.data;
};

export const getCustomerReviews = async () => {
  const response = await axiosClient.get('/customer/reviews');
  return response.data.data;
};

export const getProductReviews = async (productId) => {
  const response = await axiosClient.get(`/products/${productId}/reviews`);
  return response.data.data;
};

export const createReview = async (data) => {
  const response = await axiosClient.post('/reviews', data);
  return response.data.data;
};

export const updateReview = async (id, data) => {
  const response = await axiosClient.put(`/reviews/${id}`, data);
  return response.data.data;
};

export const deleteReview = async (id) => {
  const response = await axiosClient.delete(`/reviews/${id}`);
  return response.data.data;
};
