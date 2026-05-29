import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext'; // Nhớ trỏ đúng đường dẫn
import { Link, useNavigate } from 'react-router-dom';
import bookingApi from '../../api/bookingApi';
import { User, Mail, Phone, Award, Ticket, MapPin, Clock, Film, LogOut, QrCode } from 'lucide-react';
import { toast } from 'react-toastify';

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Nếu chưa đăng nhập thì đẩy về trang chủ (để mở AuthModal)
        if (!user) {
            navigate('/');
            return;
        }

        const fetchMyBookings = async () => {
            try {
                // Gọi API lấy lịch sử đặt vé của user hiện tại
                const res = await bookingApi.getAll();
                setBookings(res.data);
            } catch (error) {
                toast.error("Không thể tải lịch sử đặt vé.");
            } finally {
                setLoading(false);
            }
        };

        fetchMyBookings();
    }, [user, navigate]);

    if (!user) return null;

    const handleLogout = () => {
        logout();
        toast.success("Đã đăng xuất thành công!");
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#0f172a] pt-24 pb-12 px-4 md:px-8 text-white font-sans">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
                
                {/* ========================================== */}
                {/* CỘT TRÁI: THÔNG TIN THÀNH VIÊN */}
                {/* ========================================== */}
                <div className="lg:w-1/3">
                    <div className="bg-[#1e293b] rounded-2xl border border-gray-700 p-8 shadow-2xl relative overflow-hidden">
                        {/* Background Card Kính mờ */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#f3ea28]/20 to-transparent"></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-28 h-28 bg-[#0f172a] rounded-full border-4 border-[#f3ea28] flex items-center justify-center shadow-[0_0_20px_rgba(243,234,40,0.4)] mb-4">
                                {user.avatar ? (
                                    <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <User size={48} className="text-[#f3ea28]"/>
                                )}
                            </div>
                            <h2 className="text-2xl font-black uppercase text-white mb-1">{user.username}</h2>
                            
                            {/* Hạng thành viên */}
                            <div className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold mb-6 shadow-md">
                                <Award size={14}/> THÀNH VIÊN {user.rank || 'MỚI'}
                            </div>

                            <div className="w-full space-y-4 text-left bg-[#0f172a] p-4 rounded-xl border border-gray-700">
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <Mail size={16} className="text-[#f3ea28]"/> 
                                    <span className="truncate">{user.email || 'Chưa cập nhật email'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <Phone size={16} className="text-[#f3ea28]"/> 
                                    <span>{user.phone || 'Chưa cập nhật SĐT'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-300 border-t border-gray-700 pt-4 mt-2">
                                    <Award size={16} className="text-[#f3ea28]"/> 
                                    <span>Điểm tích lũy: <strong className="text-green-400 text-lg">{user.loyalty_points || 0}</strong></span>
                                </div>
                            </div>

                            <button onClick={handleLogout} className="w-full mt-6 bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition">
                                <LogOut size={18}/> Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>

                {/* ========================================== */}
                {/* CỘT PHẢI: LỊCH SỬ ĐẶT VÉ */}
                {/* ========================================== */}
                <div className="lg:w-2/3">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-8 bg-[#f3ea28] rounded-full"></div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <Ticket size={24}/> VÉ CỦA TÔI
                        </h2>
                    </div>

                    {loading ? (
                        <div className="text-center text-gray-500 py-10 animate-pulse">Đang tải lịch sử vé...</div>
                    ) : bookings.length === 0 ? (
                        <div className="bg-[#1e293b] border border-gray-700 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                            <Ticket size={64} className="text-gray-600 mb-4"/>
                            <p className="text-gray-400 text-lg mb-6">Bạn chưa có lịch sử đặt vé nào.</p>
                            <Link to="/" className="bg-[#f3ea28] text-black font-bold px-8 py-3 rounded-full hover:bg-yellow-400 transition shadow-[0_0_15px_rgba(243,234,40,0.3)]">
                                ĐẶT VÉ NGAY
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {bookings.map(booking => (
                                <div key={booking.id} className="bg-[#1e293b] border border-gray-700 rounded-2xl flex flex-col md:flex-row overflow-hidden shadow-lg relative group">
                                    
                                    {/* Phần QR Code (Dùng để check-in) */}
                                    <div className="md:w-48 bg-[#0f172a] p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-700 border-dashed">
                                        <div className="bg-white p-2 rounded-lg mb-2">
                                            {/* Trong thực tế bạn có thể dùng thư viện QRCode.react để render mã thật. Ở đây dùng Icon minh họa */}
                                            <QrCode size={80} className="text-black"/>
                                        </div>
                                        <span className="font-mono text-[#f3ea28] font-bold text-sm tracking-widest">{booking.booking_code || booking.code}</span>
                                        <span className={`mt-2 text-xs font-bold px-2 py-1 rounded ${
                                            booking.status === 'PAID' ? 'bg-green-900/50 text-green-400' :
                                            booking.status === 'CHECKED_IN' ? 'bg-blue-900/50 text-blue-400' :
                                            'bg-red-900/50 text-red-400'
                                        }`}>
                                            {booking.status_display || booking.status}
                                        </span>
                                    </div>

                                    {/* Chi tiết vé */}
                                    <div className="flex-1 p-6 relative">
                                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                            <Film size={20} className="text-[#f3ea28]"/> {booking.movie_title}
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-300 mt-4">
                                            <div className="flex items-start gap-2">
                                                <MapPin size={16} className="text-gray-500 mt-0.5"/>
                                                <div>
                                                    <span className="block text-white font-semibold">{booking.cinema_name}</span>
                                                    <span>Phòng: {booking.room_name}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <Clock size={16} className="text-gray-500 mt-0.5"/>
                                                <div>
                                                    <span className="block text-white font-semibold">{new Date(booking.showtime_start).toLocaleDateString('vi-VN')}</span>
                                                    <span>Giờ chiếu: {new Date(booking.showtime_start).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-700 flex flex-wrap justify-between items-end gap-4">
                                            <div>
                                                <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Ghế đã đặt</span>
                                                <div className="flex gap-2">
                                                    {booking.seats?.map((seat, idx) => (
                                                        <span key={idx} className="bg-gray-700 text-white px-2 py-1 rounded text-xs font-bold border border-gray-500">
                                                            {seat.row}{seat.number}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Tổng tiền</span>
                                                <span className="text-2xl font-black text-green-400">{parseInt(booking.total_price).toLocaleString()}đ</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Profile;