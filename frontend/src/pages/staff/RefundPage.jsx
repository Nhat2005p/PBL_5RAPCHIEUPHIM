import { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { Search, AlertTriangle, RotateCcw, CheckCircle, XCircle, FileText } from 'lucide-react';

const RefundPage = () => {
    const [code, setCode] = useState('');
    const [bookingInfo, setBookingInfo] = useState(null);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState('');

    // 1. Tìm kiếm vé
    const handleSearch = async (e) => {
        e.preventDefault();
        setError(''); setSuccessMsg(''); setBookingInfo(null);
        
        if (!code) return;

        try {
            // Tận dụng API check-in cũ để lấy thông tin vé hiển thị (hoặc viết API get detail riêng)
            // Ở đây mình giả sử dùng API check-in nhưng chỉ để lấy data (chưa đổi status)
            // Tuy nhiên, tốt nhất là viết 1 API GET /bookings/{code}/ để xem chi tiết.
            // Để đơn giản, mình sẽ gọi API Cancel nhưng chưa confirm, 
            // Nhưng cách chuẩn là ta nên có 1 API "Get Booking Detail".
            
            // TẠM THỜI: Gọi API lấy list booking filter theo code
            const res = await axiosClient.get(`bookings/bookings/?search=${code}`);
            if (res.data.results && res.data.results.length > 0) {
                const ticket = res.data.results[0];
                if (ticket.code === code) { // Check chính xác mã
                    setBookingInfo(ticket);
                } else {
                    setError("Không tìm thấy mã vé chính xác.");
                }
            } else {
                setError("Không tìm thấy đơn hàng này.");
            }
        } catch (err) {
            setError("Lỗi kết nối hoặc không tìm thấy vé.");
        }
    };

    // 2. Thực hiện Hủy
    const handleRefund = async () => {
        if (!confirm("⚠️ HÀNH ĐỘNG KHÔNG THỂ HOÀN TÁC!\nBạn chắc chắn muốn hủy vé và hoàn tiền?")) return;

        setLoading(true);
        try {
            const res = await axiosClient.post('bookings/cancel/', { 
                code: bookingInfo.code,
                reason: reason
            });
            setSuccessMsg(`Thành công! Hãy hoàn lại ${parseInt(res.data.refund_amount).toLocaleString()}đ cho khách.`);
            setBookingInfo(null); // Ẩn thông tin vé cũ
            setCode('');
        } catch (err) {
            alert(err.response?.data?.detail || "Lỗi khi hủy vé!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 p-6 text-white font-sans flex flex-col items-center">
            <h1 className="text-3xl font-bold text-red-500 mb-8 flex items-center gap-3">
                <RotateCcw size={32}/> HỦY VÉ & HOÀN TIỀN
            </h1>

            {/* FORM TÌM KIẾM */}
            <div className="w-full max-w-xl mb-8">
                <form onSubmit={handleSearch} className="relative flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Nhập mã vé (VD: X8K9M2)..." 
                            className="w-full bg-[#1e293b] border border-gray-600 rounded-lg py-3 pl-12 pr-4 text-white focus:border-red-500 outline-none text-lg uppercase font-bold"
                            value={code}
                            onChange={e => setCode(e.target.value.toUpperCase())}
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 rounded-lg font-bold">
                        TÌM
                    </button>
                </form>
                {error && <p className="text-red-500 mt-2 flex items-center gap-2"><XCircle size={16}/> {error}</p>}
                {successMsg && <div className="bg-green-900/50 border border-green-500 p-4 rounded mt-4 text-green-400 font-bold flex items-center gap-2"><CheckCircle/> {successMsg}</div>}
            </div>

            {/* THÔNG TIN VÉ CẦN HỦY */}
            {bookingInfo && (
                <div className="bg-[#1e293b] w-full max-w-xl rounded-xl border border-gray-600 overflow-hidden shadow-2xl animate-fade-in-up">
                    <div className="bg-red-900/30 p-4 border-b border-red-900/50 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-red-400">XÁC NHẬN HỦY ĐƠN</h2>
                        <span className="bg-gray-800 px-3 py-1 rounded text-sm font-mono">{bookingInfo.code}</span>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between border-b border-gray-700 pb-2">
                            <span className="text-gray-400">Trạng thái hiện tại:</span>
                            <span className={`font-bold ${bookingInfo.status === 'PAID' ? 'text-green-400' : 'text-red-500'}`}>
                                {bookingInfo.status}
                            </span>
                        </div>
                        
                        {/* Lưu ý: Bạn cần điều chỉnh các trường dữ liệu khớp với API trả về của bạn */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Phim</p>
                                <p className="font-bold text-lg text-[#f3ea28]">{bookingInfo.movie_title || "Phim đang tải..."}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Suất chiếu</p>
                                <p className="font-bold">{new Date(bookingInfo.created_at).toLocaleDateString('vi-VN')}</p> 
                                {/* Nếu API có showtime_start thì dùng showtime_start */}
                            </div>
                        </div>

                        <div className="bg-black/30 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400">Tổng tiền hoàn lại:</span>
                                <span className="text-2xl font-bold text-white">{parseInt(bookingInfo.final_amount).toLocaleString()} VND</span>
                            </div>
                            <p className="text-xs text-gray-500 italic">
                                * Lưu ý: Hệ thống sẽ giải phóng ghế ngay lập tức sau khi hủy.
                            </p>
                        </div>

                        {/* Lý do hủy */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Lý do hủy / Ghi chú</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 text-gray-500" size={16}/>
                                <textarea 
                                    className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 pl-10 text-white h-20 focus:border-red-500 outline-none"
                                    placeholder="Khách đổi ý, Nhầm suất, Sự cố rạp..."
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleRefund}
                            disabled={loading || bookingInfo.status === 'CANCELLED'}
                            className={`w-full py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition
                                ${bookingInfo.status === 'CANCELLED' 
                                    ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                                    : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/50'}`}
                        >
                            {loading ? 'Đang xử lý...' : <><AlertTriangle size={20}/> XÁC NHẬN HỦY VÉ</>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RefundPage;