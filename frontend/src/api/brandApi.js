import axiosClient from './axiosClient';

export const getBrands = async () => {
  const response = await axiosClient.get('/brands');
  return response.data.data;
};

export const getBrandById = async (id) => {
  const response = await axiosClient.get(`/brands/${id}`);
  return response.data.data;
};

export const createBrand = async (data) => {
  const response = await axiosClient.post('/brands', data);
  return response.data.data;
};

export const updateBrand = async (id, data) => {
  const response = await axiosClient.put(`/brands/${id}`, data);
  return response.data.data;
};

export const deleteBrand = async (id) => {
  const response = await axiosClient.delete(`/brands/${id}`);
  return response.data.data;
};
