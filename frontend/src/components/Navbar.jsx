import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, LogOut, LayoutDashboard, TicketCheck, UserCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="fixed w-full z-50 bg-[#0f172a]/95 backdrop-blur-md border-b border-gray-800 py-3 shadow-2xl">
            <div className="container mx-auto px-6 flex justify-between items-center">
                
                {/* LOGO */}
                <Link to="/" className="flex items-center gap-2 text-2xl font-black text-[#f3ea28] tracking-tighter">
                    <Film size={28} /> CINE<span className="text-white">PBL5</span>
                </Link>

                {/* MENU ĐIỀU HƯỚNG DYNAMIC (Hiển thị theo Role) */}
                <div className="hidden md:flex gap-8 items-center text-xs font-bold uppercase tracking-widest">
                    <Link to="/" className="text-gray-300 hover:text-[#f3ea28] transition-colors">Trang Chủ</Link>
                    
                    {/* Menu cho Quản trị viên */}
                    {user?.role?.toLowerCase() === 'admin' && (
                        <Link to="/admin/dashboard" className="flex items-center gap-1.5 text-red-500 hover:text-red-400">
                            <LayoutDashboard size={16} /> Quản Trị
                        </Link>
                    )}

                    {/* Menu cho Nhân viên và Admin */}
                    {(user?.role?.toLowerCase() === 'staff' || user?.role?.toLowerCase() === 'admin') && (
                        <Link to="/staff/pos" className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300">
                            <TicketCheck size={16} /> Bán Vé (POS)
                        </Link>
                    )}
                </div>

                {/* KHU VỰC TÀI KHOẢN */}
                <div className="flex items-center gap-4">
                    {user ? (
                        /* ĐÃ ĐĂNG NHẬP */
                        <div className="flex items-center gap-5">
                            <Link to="/profile" className="flex items-center gap-2 group">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-800 to-gray-700 border border-white/10 flex items-center justify-center text-[#f3ea28] group-hover:border-[#f3ea28] transition-all">
                                    <UserCircle size={20} />
                                </div>
                                <span className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">
                                    {user.username}
                                </span>
                            </Link>
                            <button 
                                onClick={handleLogout} 
                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                title="Đăng xuất"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        /* CHƯA ĐĂNG NHẬP (Chuyển sang trang Login/Register riêng) */
                        <div className="flex gap-3">
                            <Link 
                                to="/login" 
                                className="text-xs font-bold text-gray-300 hover:text-white px-4 py-2 flex items-center transition-colors"
                            >
                                ĐĂNG NHẬP
                            </Link>
                            <Link 
                                to="/register" 
                                className="bg-[#f3ea28] text-black text-[10px] font-black px-6 py-2.5 rounded-full hover:bg-yellow-400 active:scale-95 transition-all shadow-lg shadow-yellow-500/20"
                            >
                                ĐĂNG KÝ
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;