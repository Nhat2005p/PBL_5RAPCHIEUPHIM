import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/', // Địa chỉ Backend Django
    headers: {
        'Content-Type': 'application/json',
    },
});

// 1. Interceptor REQUEST: Tự động gắn Token vào mỗi request gửi đi
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 2. Interceptor RESPONSE: Xử lý lỗi chung (Ví dụ: Hết hạn Token)
axiosClient.interceptors.response.use(
    (response) => {
        return response; // Nếu thành công thì trả về data bình thường
    },
    (error) => {
        // Nếu lỗi 401 (Unauthorized) -> Token hết hạn hoặc sai lệch
        if (error.response && error.response.status === 401) {
            console.error("Token hết hạn hoặc không hợp lệ. Đang đăng xuất...");
            localStorage.removeItem('access_token');
            // Nếu không ở trang chủ, tự động đẩy về trang đăng nhập
            if (window.location.pathname !== '/') {
                window.location.href = '/'; 
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;