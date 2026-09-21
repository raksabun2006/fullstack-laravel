import axiosClient from './axiosClient';

export const getCustomerDashboardStats = async () => {
  const response = await axiosClient.get('/customer/dashboard/stats');
  return response.data.data;
};

export const getAdminDashboardStats = async () => {
  const response = await axiosClient.get('/admin/dashboard/stats');
  return response.data.data;
};

export const getSalesChartData = async (timeRange = '30d') => {
  const response = await axiosClient.get('/admin/dashboard/sales-chart', {
    params: { range: timeRange },
  });
  return response.data.data;
};
