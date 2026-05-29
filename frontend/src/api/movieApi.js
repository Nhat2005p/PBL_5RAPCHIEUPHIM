import axiosClient from './axiosClient';

const movieApi = {
    // Lấy danh sách phim
    getAll: (params) => axiosClient.get('cinema/movies/', { params }),
    
    // Lấy chi tiết 1 phim
    get: (id) => axiosClient.get(`cinema/movies/${id}/`),
    
    // Thêm phim (Bắt buộc dùng multipart/form-data để upload ảnh)
    create: (data) => axiosClient.post('cinema/movies/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    // Sửa phim (Dùng PATCH để cập nhật từng phần)
    update: (id, data) => axiosClient.patch(`cinema/movies/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    // Xóa phim
    delete: (id) => axiosClient.delete(`cinema/movies/${id}/`),
};

export default movieApi;