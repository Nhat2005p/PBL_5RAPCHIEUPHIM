import { createContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Kiểm tra trạng thái đăng nhập khi tải trang
    useEffect(() => {
        const checkLogin = async () => {
            // ĐỒNG BỘ: Sử dụng tên 'access_token' để khớp với axiosClient
            const token = localStorage.getItem('access_token'); 
            if (token) {
                try {
                    const res = await axiosClient.get('users/profile/');
                    setUser(res.data);
                } catch (error) {
                    console.error("Phiên đăng nhập hết hạn:", error);
                    logout();
                }
            }
            setLoading(false);
        };
        checkLogin();
    }, []);

   // File: src/context/AuthContext.jsx
const login = async (username, password) => {
    try {
        const res = await axiosClient.post('users/login/', { username, password });
        localStorage.setItem('access_token', res.data.access);
        localStorage.setItem('refresh_token', res.data.refresh);
        
        // Lấy profile thực tế
        const profileRes = await axiosClient.get('users/profile/');
        const userData = profileRes.data;
        setUser(userData); // Cập nhật state toàn cục
        
        return userData; // QUAN TRỌNG: Trả về userData để trang Login sử dụng
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        throw error; 
    }
};

    const register = async (userData) => {
        try {
            await axiosClient.post('users/register/', userData);
            return { success: true };
        } catch (error) {
            console.error("Lỗi đăng ký:", error);
            throw error; 
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {/* Chỉ render ứng dụng khi đã kiểm tra xong trạng thái login */}
            {!loading ? children : (
                <div className="h-screen bg-[#0f172a] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f3ea28]"></div>
                </div>
            )}
        </AuthContext.Provider>
    );
};