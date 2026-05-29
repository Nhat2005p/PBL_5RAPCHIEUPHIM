import axiosClient from './axiosClient';

const statsApi = {
    // SỬA DÒNG NÀY: Trỏ đúng về app 'reports' mà chúng ta vừa tạo ở Backend
    getDashboardStats: () => axiosClient.get('reports/dashboard/'),
};

export default statsApi;