import axiosClient from './axiosClient';

export const getVariantsByProduct = async (productId) => {
  const response = await axiosClient.get(`/products/${productId}/variants`);
  return response.data.data;
};

export const getVariantById = async (id) => {
  const response = await axiosClient.get(`/variants/${id}`);
  return response.data.data;
};

export const createVariant = async (productId, data) => {
  const response = await axiosClient.post(`/products/${productId}/variants`, data);
  return response.data.data;
};

export const updateVariant = async (id, data) => {
  const response = await axiosClient.put(`/variants/${id}`, data);
  return response.data.data;
};

export const deleteVariant = async (id) => {
  const response = await axiosClient.delete(`/variants/${id}`);
  return response.data.data;
};
