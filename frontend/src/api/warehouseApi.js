
import axiosClient from './axiosClient';

const warehouseApi = {
    // --- SẢN PHẨM ---
    getProducts: (search = '') => axiosClient.get(`warehouse/products/?search=${search}`),
    
    // Dùng FormData vì Sản phẩm có kèm hình ảnh
    createProduct: (data) => axiosClient.post('warehouse/products/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    updateProduct: (id, data) => axiosClient.patch(`warehouse/products/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    deleteProduct: (id) => axiosClient.delete(`warehouse/products/${id}/`),

    // --- LỊCH SỬ NHẬP/XUẤT (PHIẾU KHO) ---
    getLogs: () => axiosClient.get('warehouse/logs/'),
    createLog: (data) => axiosClient.post('warehouse/logs/', data),
};

export default warehouseApi;