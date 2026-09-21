import axiosClient from './axiosClient';

// Re-export address methods from dedicated addressApi
export {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from './addressApi';

// Customer Profile & Security API
export const updateProfile = async (data) => {
  const response = await axiosClient.put('/customer/profile', data);
  return response.data.data;
};

export const updatePassword = async (data) => {
  const response = await axiosClient.put('/customer/password', data);
  return response.data;
};

// Admin Customers Management API
export const getCustomers = async (params = {}) => {
  const response = await axiosClient.get('/admin/customers', { params });
  return response.data.data;
};
