import axiosClient from './axiosClient';

const customerApi = {
    // Tận dụng tính năng SearchFilter của DRF bằng query ?search=
    getAll: (searchTerm = '') => axiosClient.get(`customers/?search=${searchTerm}`),
    
    create: (data) => axiosClient.post('customers/', data),
    
    // Dùng patch để chỉ cập nhật những trường có thay đổi
    update: (id, data) => axiosClient.patch(`customers/${id}/`, data),
    
    delete: (id) => axiosClient.delete(`customers/${id}/`),
};

export default customerApi;