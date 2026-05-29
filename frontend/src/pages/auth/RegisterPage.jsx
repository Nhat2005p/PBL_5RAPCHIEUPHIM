import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    // Khởi tạo form dữ liệu theo yêu cầu chức năng 5.1
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Kiểm tra khớp mật khẩu
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Mật khẩu xác nhận không khớp!");
        }

        setLoading(true);
        try {
            // Gọi API đăng ký từ AuthContext
            await register({
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });
            
            toast.success("Đăng ký thành công! Hãy đăng nhập để trải nghiệm.");
            // Sau khi đăng ký thành công, chuyển hướng sang trang đăng nhập
            navigate('/login');
        } catch (error) {
            console.error("Registration Error:", error);
            const msg = error.response?.data?.detail || "Đăng ký thất bại, vui lòng thử lại!";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            {/* Nút quay lại trang chủ */}
            <Link 
                to="/" 
                className="absolute top-8 left-8 text-gray-400 hover:text-[#f3ea28] flex items-center gap-2 transition-colors"
            >
                <ArrowLeft size={20} /> Quay lại trang chủ
            </Link>

            <div className="w-full max-w-md">
                <div className="bg-[#1e293b] border border-white/10 rounded-3xl shadow-2xl p-8 overflow-hidden relative">
                    {/* Hiệu ứng trang trí */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f3ea28] to-transparent"></div>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-[#f3ea28] uppercase tracking-tighter italic">
                            Gia Nhập <span className="text-white">CinePBL5</span>
                        </h2>
                        <p className="text-gray-400 text-sm mt-2">Tạo tài khoản để đặt vé và nhận ưu đãi ngay hôm nay</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Tên đăng nhập */}
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#f3ea28] transition-colors" size={18} />
                            <input 
                                required
                                type="text"
                                placeholder="Tên đăng nhập"
                                className="w-full bg-black/40 border border-gray-700 focus:border-[#f3ea28] rounded-2xl py-4 pl-12 pr-4 text-white outline-none transition-all"
                                value={formData.username}
                                onChange={e => setFormData({...formData, username: e.target.value})}
                            />
                        </div>

                        {/* Email */}
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#f3ea28] transition-colors" size={18} />
                            <input 
                                required
                                type="email"
                                placeholder="Email nhận vé điện tử"
                                className="w-full bg-black/40 border border-gray-700 focus:border-[#f3ea28] rounded-2xl py-4 pl-12 pr-4 text-white outline-none transition-all"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>

                        {/* Số điện thoại */}
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#f3ea28] transition-colors" size={18} />
                            <input 
                                required
                                type="text"
                                placeholder="Số điện thoại"
                                className="w-full bg-black/40 border border-gray-700 focus:border-[#f3ea28] rounded-2xl py-4 pl-12 pr-4 text-white outline-none transition-all"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>

                        {/* Mật khẩu */}
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#f3ea28] transition-colors" size={18} />
                            <input 
                                required
                                type="password"
                                placeholder="Mật khẩu"
                                className="w-full bg-black/40 border border-gray-700 focus:border-[#f3ea28] rounded-2xl py-4 pl-12 pr-4 text-white outline-none transition-all"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                        </div>

                        {/* Xác nhận mật khẩu */}
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#f3ea28] transition-colors" size={18} />
                            <input 
                                required
                                type="password"
                                placeholder="Xác nhận mật khẩu"
                                className="w-full bg-black/40 border border-gray-700 focus:border-[#f3ea28] rounded-2xl py-4 pl-12 pr-4 text-white outline-none transition-all"
                                value={formData.confirmPassword}
                                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-[#f3ea28] text-black font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#f3ea28]/10 mt-4 disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin" size={20} /> ĐANG XỬ LÝ...
                                </span>
                            ) : 'TẠO TÀI KHOẢN NGAY'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-gray-400 text-sm">
                            Đã có tài khoản? 
                            <Link to="/login" className="text-[#f3ea28] font-bold hover:underline ml-2">
                                Đăng nhập tại đây
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;