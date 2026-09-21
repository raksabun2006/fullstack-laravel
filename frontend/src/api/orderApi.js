import axiosClient from './axiosClient';

export const getOrders = async (params = {}) => {
  const response = await axiosClient.get('/admin/orders', { params });
  return response.data.data;
};

export const getCustomerOrders = async (params = {}) => {
  const response = await axiosClient.get('/customer/orders', { params });
  return response.data.data;
};

export const getOrderById = async (id) => {
  const response = await axiosClient.get(`/orders/${id}`);
  return response.data.data;
};

export const createOrder = async (orderData) => {
  const response = await axiosClient.post('/orders', orderData);
  return response.data.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await axiosClient.put(`/admin/orders/${id}/status`, { status });
  return response.data.data;
};

export const cancelOrder = async (id) => {
  const response = await axiosClient.put(`/orders/${id}/cancel`);
  return response.data.data;
};
