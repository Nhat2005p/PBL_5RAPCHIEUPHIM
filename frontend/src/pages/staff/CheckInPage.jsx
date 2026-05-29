import { useState, useEffect } from 'react';
import QrScanner from 'react-qr-scanner'; // Import thư viện quét
import axiosClient from '../../api/axiosClient';
import { QrCode, XCircle, CheckCircle, RotateCcw } from 'lucide-react';

const CheckInPage = () => {
    const [scanResult, setScanResult] = useState(null); // Kết quả quét raw
    const [apiResult, setApiResult] = useState(null);   // Kết quả từ API (Thông tin vé)
    const [error, setError] = useState(null);           // Lỗi (Vé giả, vé dùng rồi)
    const [isScanning, setIsScanning] = useState(true); // Trạng thái đang quét hay dừng

    // Xử lý khi Camera đọc được mã
    const handleScan = async (data) => {
        if (data && isScanning) {
            setScanResult(data.text);
            setIsScanning(false); // Dừng camera tạm thời để xử lý
            validateTicket(data.text);
        }
    };

    const handleError = (err) => {
        console.error(err);
    };

    // Gọi API kiểm tra vé
    const validateTicket = async (code) => {
        try {
            const res = await axiosClient.post('bookings/check-in/', { code });
            setApiResult(res.data.data); // Lưu thông tin vé
            setError(null);
            
            // Phát âm thanh báo thành công (Tùy chọn)
            playSound('success');
        } catch (err) {
            setApiResult(null);
            setError(err.response?.data?.detail || "Lỗi kết nối server!");
            
            // Phát âm thanh báo lỗi
            playSound('error');
        }
    };

    // Hàm reset để quét vé tiếp theo
    const handleReset = () => {
        setScanResult(null);
        setApiResult(null);
        setError(null);
        setIsScanning(true);
    };

    // Giả lập âm thanh (UX)
    const playSound = (type) => {
        const audio = new Audio(
            type === 'success' 
                ? 'https://actions.google.com/sounds/v1/cartoon/clank_car_crash.ogg' // Link ví dụ (thay bằng tiếng 'Ding')
                : 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg' // Link ví dụ (thay bằng tiếng 'Buzz')
        );
        // audio.play().catch(e => console.log(e)); // Cần user interaction để play sound trên browser
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold text-[#f3ea28] mb-6 flex items-center gap-2">
                <QrCode /> SOÁT VÉ VÀO RẠP
            </h1>

            {/* KHUNG CAMERA */}
            <div className="relative w-full max-w-sm aspect-square bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-700 shadow-2xl">
                {isScanning ? (
                    <>
                        <QrScanner
                            delay={300}
                            onError={handleError}
                            onScan={handleScan}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            constraints={{ video: { facingMode: 'environment' } }} // Dùng camera sau
                        />
                        {/* Overlay khung quét */}
                        <div className="absolute inset-0 border-2 border-[#f3ea28]/50 m-12 rounded-lg animate-pulse"></div>
                        <div className="absolute bottom-4 w-full text-center text-sm text-gray-300 bg-black/50 py-1">
                            Đang tìm mã QR...
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
                        <p className="text-gray-400 mb-4">Đã quét xong</p>
                        <button onClick={handleReset} className="bg-[#f3ea28] text-black px-6 py-2 rounded-full font-bold flex items-center gap-2">
                            <RotateCcw size={20}/> Quét tiếp
                        </button>
                    </div>
                )}
            </div>

            {/* KHU VỰC HIỂN THỊ KẾT QUẢ */}
            <div className="w-full max-w-sm mt-6">
                
                {/* 1. TRƯỜNG HỢP LỖI (VÉ GIẢ / ĐÃ DÙNG) */}
                {error && (
                    <div className="bg-red-900/80 border border-red-500 p-6 rounded-xl text-center animate-bounce-short">
                        <XCircle size={60} className="text-red-500 mx-auto mb-3" />
                        <h2 className="text-2xl font-bold text-red-400 mb-2">KHÔNG HỢP LỆ</h2>
                        <p className="text-white text-lg font-semibold">{error}</p>
                    </div>
                )}

                {/* 2. TRƯỜNG HỢP HỢP LỆ */}
                {apiResult && (
                    <div className="bg-green-900/80 border border-green-500 p-6 rounded-xl text-center">
                        <CheckCircle size={60} className="text-green-400 mx-auto mb-3" />
                        <h2 className="text-2xl font-bold text-green-400 mb-4">HỢP LỆ - MỜI VÀO</h2>
                        
                        <div className="space-y-3 text-left bg-black/30 p-4 rounded-lg">
                            <div className="flex justify-between border-b border-gray-600 pb-2">
                                <span className="text-gray-400">Phim:</span>
                                <span className="font-bold text-[#f3ea28] text-right">{apiResult.movie}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Phòng:</span>
                                <span className="font-bold text-white">{apiResult.room}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Suất chiếu:</span>
                                <span className="font-bold text-white">{apiResult.time}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-600 mt-2">
                                <span className="text-gray-400">Ghế:</span>
                                <span className="text-2xl font-black text-[#f3ea28]">{apiResult.seats}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hướng dẫn khi chưa quét */}
                {!error && !apiResult && isScanning && (
                    <p className="text-center text-gray-500 mt-4 italic">
                        Hướng dẫn: Đưa mã QR trên vé của khách vào khung hình.
                    </p>
                )}
            </div>
        </div>
    );
};

export default CheckInPage;