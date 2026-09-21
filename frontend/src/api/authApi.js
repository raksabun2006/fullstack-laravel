import axiosClient from './axiosClient';

export const registerUser = async (data) => {
  const response = await axiosClient.post('/auth/register', data);
  return response.data.data;
};

export const loginUser = async (credentials) => {
  const response = await axiosClient.post('/auth/login', credentials);
  return response.data.data;
};

export const logoutUser = async () => {
  const response = await axiosClient.post('/auth/logout');
  return response.data.data;
};

export const getMe = async () => {
  const response = await axiosClient.get('/auth/me');
  return response.data.data;
};
