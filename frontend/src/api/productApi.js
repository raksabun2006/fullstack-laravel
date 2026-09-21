import axiosClient from './axiosClient';

export const getProducts = async (params = {}) => {
  const response = await axiosClient.get('/products', { params });
  return response.data.data;
};

export const getProductById = async (id) => {
  const response = await axiosClient.get(`/products/${id}`);
  return response.data.data;
};

export const createProduct = async (data) => {
  const response = await axiosClient.post('/products', data);
  return response.data.data;
};

export const updateProduct = async (id, data) => {
  const response = await axiosClient.put(`/products/${id}`, data);
  return response.data.data;
};

export const deleteProduct = async (id) => {
  const response = await axiosClient.delete(`/products/${id}`);
  return response.data.data;
};
