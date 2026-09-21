import axiosClient from './axiosClient';

export const getAddresses = async () => {
  const response = await axiosClient.get('/customer/addresses');
  return response.data.data;
};

export const createAddress = async (data) => {
  const response = await axiosClient.post('/customer/addresses', data);
  return response.data.data;
};

export const updateAddress = async (id, data) => {
  const response = await axiosClient.put(`/customer/addresses/${id}`, data);
  return response.data.data;
};

export const deleteAddress = async (id) => {
  const response = await axiosClient.delete(`/customer/addresses/${id}`);
  return response.data.data;
};

export const setDefaultAddress = async (id) => {
  const response = await axiosClient.put(`/customer/addresses/${id}/default`);
  return response.data.data;
};
