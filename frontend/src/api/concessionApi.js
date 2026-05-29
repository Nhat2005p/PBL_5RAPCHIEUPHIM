import axiosClient from './axiosClient';

const concessionApi = {
    // Khách hàng hoặc Admin lấy danh sách
    getAll: () => axiosClient.get('concessions/foods/'),
    
    // Admin thêm món mới (Gửi FormData vì có chứa file ảnh)
    create: (data) => axiosClient.post('concessions/foods/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    // Admin cập nhật món
    update: (id, data) => axiosClient.patch(`concessions/foods/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    // Admin xóa món
    delete: (id) => axiosClient.delete(`concessions/foods/${id}/`),
};

export default concessionApi;