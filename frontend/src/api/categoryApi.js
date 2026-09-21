import axiosClient from './axiosClient';

export const getCategories = async () => {
  const response = await axiosClient.get('/categories');
  return response.data.data;
};

export const getCategoryById = async (id) => {
  const response = await axiosClient.get(`/categories/${id}`);
  return response.data.data;
};

export const createCategory = async (data) => {
  const response = await axiosClient.post('/categories', data);
  return response.data.data;
};

export const updateCategory = async (id, data) => {
  const response = await axiosClient.put(`/categories/${id}`, data);
  return response.data.data;
};

export const deleteCategory = async (id) => {
  const response = await axiosClient.delete(`/categories/${id}`);
  return response.data.data;
};
