import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { User, Lock, Loader2, ArrowLeft } from 'lucide-react'; // Thêm icon cho đúng aesthetic

const LoginPage = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        // 'userData' giờ đây chứa toàn bộ thông tin từ profile
        const userData = await login(formData.username, formData.password);
        
        // Kiểm tra role chính xác từ object của bạn (Backend trả uppercase, convert to lowercase)
        const userRole = (userData?.role || 'customer').toLowerCase();
        
        toast.success(`Chào mừng ${formData.username} trở lại!`);

        // Điều hướng dựa trên vai trò thực tế
        if (userRole === 'admin') {
            navigate('/admin/dashboard', { replace: true });
        } else if (userRole === 'staff') {
            navigate('/staff/pos', { replace: true });
        } else {
            navigate('/', { replace: true });
        }
    } catch (error) {
        toast.error("Tài khoản hoặc mật khẩu không chính xác!");
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4 font-sans text-[#F8F8F8]">
            {/* Nút quay về trang chủ theo style Cinematic */}
            <Link to="/" className="absolute top-8 left-8 text-gray-500 hover:text-[#C9A84C] transition-colors flex items-center gap-2 text-sm font-bold tracking-widest">
                <ArrowLeft size={16} /> QUAY LẠI
            </Link>

            <div className="w-full max-w-md">
                <form onSubmit={handleSubmit} className="bg-[#16161f] p-10 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                    {/* Accent border phía trên card theo thiết kế hệ thống */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent opacity-50"></div>

                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-[#C9A84C] uppercase italic tracking-tighter mb-2">Đăng Nhập</h2>
                        <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Hệ thống quản lý CinePBL5</p>
                    </div>

                    <div className="space-y-5">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#C9A84C] transition-colors" size={18} />
                            <input 
                                required 
                                className="w-full bg-black/40 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#C9A84C]/50 transition-all placeholder:text-gray-700" 
                                placeholder="Tên đăng nhập" 
                                value={formData.username}
                                onChange={e => setFormData({...formData, username: e.target.value})} 
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#C9A84C] transition-colors" size={18} />
                            <input 
                                required 
                                type="password" 
                                className="w-full bg-black/40 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#C9A84C]/50 transition-all placeholder:text-gray-700" 
                                placeholder="Mật khẩu" 
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                            />
                        </div>

                        <button 
                            disabled={loading}
                            className="w-full bg-[#C9A84C] text-[#0A0A0F] font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#C9A84C]/10 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "XÁC NHẬN ĐĂNG NHẬP"}
                        </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-gray-500 text-sm">
                            Chưa có tài khoản? 
                            <Link to="/register" className="text-[#C9A84C] font-black ml-2 hover:underline">ĐĂNG KÝ NGAY</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;