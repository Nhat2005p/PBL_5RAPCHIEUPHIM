import axiosClient from './axiosClient';

const reportApi = {
    getDashboardStats: () => axiosClient.get('reports/dashboard/'),
};

export default reportApi;