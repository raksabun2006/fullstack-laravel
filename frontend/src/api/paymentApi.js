import axiosClient from './axiosClient';

export const getPayments = async (params = {}) => {
  const response = await axiosClient.get('/admin/payments', { params });
  return response.data.data;
};

export const getPaymentById = async (id) => {
  const response = await axiosClient.get(`/payments/${id}`);
  return response.data.data;
};

export const getPayment = getPaymentById;

export const getOrderPayment = async (orderId) => {
  const response = await axiosClient.get(`/orders/${orderId}/payment`);
  return response.data.data;
};

export const createPayment = async (data) => {
  const response = await axiosClient.post('/payments', data);
  return response.data.data;
};

export const createKhqrPayment = async (orderId, currency = 'USD') => {
  const response = await axiosClient.post('/payments/khqr', { order_id: orderId, currency });
  return response.data.data;
};

export const checkPayment = async (id) => {
  const response = await axiosClient.post(`/payments/${id}/check`);
  return response.data;
};

export const checkPaymentStatus = checkPayment;

export const updatePaymentStatus = async (id, status) => {
  const response = await axiosClient.put(`/admin/payments/${id}/status`, { status });
  return response.data.data;
};
