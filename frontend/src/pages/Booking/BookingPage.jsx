import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import bookingApi from '../../api/bookingApi';
import './Booking.css';

const BookingPage = () => {
    const { showtimeId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [showtimeInfo, setShowtimeInfo] = useState(null);
    const [allSeats, setAllSeats] = useState([]);
    const [bookedSeatIds, setBookedSeatIds] = useState([]);
    const [products, setProducts] = useState([]);

    // Trạng thái ghế và bắp nước khách đang chọn
    const [selectedSeatIds, setSelectedSeatIds] = useState([]);
    const [cartConcessions, setCartConcessions] = useState({}); // format: { product_id: quantity }

    // STATE MỚI: Danh sách ghế đang bị người khác "giữ" tạm thời
    const [lockedSeats, setLockedSeats] = useState([]); 
    const ws = useRef(null); // Lưu trữ kết nối WebSocket

    // LẤY DỮ LIỆU BAN ĐẦU
    useEffect(() => {
        const fetchBookingData = async () => {
            try {
                // Gọi API song song: Lấy sơ đồ ghế và Lấy danh sách bắp nước
                const [seatRes, productRes] = await Promise.all([
                    bookingApi.getSeatStatus(showtimeId),
                    bookingApi.getProducts()
                ]);

                setShowtimeInfo(seatRes.data.showtime_info);
                setAllSeats(seatRes.data.all_seats);
                setBookedSeatIds(seatRes.data.booked_seat_ids);
                
                // Lọc sản phẩm là Đồ ăn / Thức uống
                setProducts(productRes.data); 
            } catch (error) {
                toast.error("Lỗi tải dữ liệu. Vui lòng thử lại!");
            } finally {
                setLoading(false);
            }
        };
        fetchBookingData();
    }, [showtimeId]);
 
    // KẾT NỐI WEBSOCKET REAL-TIME
    useEffect(() => {
        // Kết nối WebSocket tới suất chiếu hiện tại
        ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/showtimes/${showtimeId}/seats/`);

        // Lắng nghe tín hiệu từ Backend
        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.action === 'lock_seat') {
                // Khi ai đó chọn ghế -> Đưa vào danh sách khóa
                setLockedSeats(prev => {
                    if (prev.includes(data.seat_id)) return prev;
                    return [...prev, data.seat_id];
                });
            } else if (data.action === 'unlock_seat') {
                // Khi họ bỏ chọn -> Xóa khỏi danh sách khóa
                setLockedSeats(prev => prev.filter(id => id !== data.seat_id));
            }
        };

        // Khi người dùng thoát trang -> Đóng kết nối
        return () => {
            if (ws.current) ws.current.close();
        };
    }, [showtimeId]);

    // XỬ LÝ CLICK CHỌN/BỎ CHỌN GHẾ
    const handleSeatClick = (seat) => {
        // Nếu ghế đã bán hoặc đang bị người khác (lockedSeats) giữ -> Bỏ qua không cho bấm
        if (bookedSeatIds.includes(seat.id) || lockedSeats.includes(seat.id) || !seat.is_active) return; 

        if (selectedSeatIds.includes(seat.id)) {
            setSelectedSeatIds(prev => prev.filter(id => id !== seat.id));
            
            // Gửi tín hiệu UNLOCK cho các User khác
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({ action: 'unlock_seat', seat_id: seat.id }));
            }
        } else {
            if (selectedSeatIds.length >= 8) return toast.warning("Chỉ được chọn tối đa 8 ghế!");
            setSelectedSeatIds(prev => [...prev, seat.id]);
            
            // Gửi tín hiệu LOCK cho các User khác
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({ action: 'lock_seat', seat_id: seat.id }));
            }
        }
    };

    // XỬ LÝ TĂNG/GIẢM SỐ LƯỢNG BẮP NƯỚC
    const updateConcession = (productId, delta) => {
        setCartConcessions(prev => {
            const currentQty = prev[productId] || 0;
            const newQty = currentQty + delta;
            if (newQty <= 0) {
                const { [productId]: _, ...rest } = prev; // Xóa khỏi giỏ nếu qty <= 0
                return rest;
            }
            return { ...prev, [productId]: newQty };
        });
    };

    // TÍNH TỔNG TIỀN REALTIME
    const calculateTotal = () => {
        if (!showtimeInfo) return 0;
        
        let total = 0;
        // 1. Tiền vé
        selectedSeatIds.forEach(id => {
            const seat = allSeats.find(s => s.id === id);
            if (seat) {
                let price = parseFloat(showtimeInfo.price);
                if (seat.seat_type === 'VIP') price += 20000;
                if (seat.seat_type === 'SWT') price += 50000;
                total += price;
            }
        });

        // 2. Tiền bắp nước
        Object.keys(cartConcessions).forEach(pId => {
            const product = products.find(p => p.id === parseInt(pId));
            if (product) total += parseFloat(product.price) * cartConcessions[pId];
        });

        return total;
    };

    // XỬ LÝ GỬI API ĐẶT VÉ
    const handleCheckout = async () => {
        const payload = {
            showtime_id: parseInt(showtimeId),
            seat_ids: selectedSeatIds,
            concessions: Object.keys(cartConcessions).map(pId => ({
                product_id: parseInt(pId),
                quantity: cartConcessions[pId]
            })),
            payment_method: "VNPAY"
        };

        try {
            const res = await bookingApi.createBooking(payload);
            toast.success(res.data.message);
            // Chuyển hướng thanh toán (hiện tại giả lập)
            // window.location.href = res.data.payment_url;
            navigate('/profile'); // Tạm thời chuyển về trang Profile xem vé
        } catch (error) {
            const errorMsg = error.response?.data?.non_field_errors?.[0] || "Đặt vé thất bại!";
            toast.error(errorMsg);
            setTimeout(() => window.location.reload(), 1500); 
        }
    };

    if (loading) return <div className="text-center mt-5 text-white">Đang tải phòng chiếu...</div>;

    return (
        <div className="booking-page-container">
            <div className="screen-section">
                <div className="cinema-screen text-center shadow-lg">MÀN HÌNH</div>
                
                <div className="seat-grid">
                    {allSeats.map(seat => {
                        const isBooked = bookedSeatIds.includes(seat.id);
                        const isSelected = selectedSeatIds.includes(seat.id);
                        
                        // [ĐÃ FIX LỖI] Phải khai báo isLockedByOthers trước khi dùng nội suy chuỗi CSS
                        const isLockedByOthers = lockedSeats.includes(seat.id); 
                        
                        const seatClass = `seat-btn ${seat.seat_type.toLowerCase()} ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''} ${isLockedByOthers ? 'locked' : ''}`; 

                        return (
                            <div 
                                key={seat.id} 
                                className={seatClass.trim()}
                                onClick={() => handleSeatClick(seat)}
                                title={`Ghế ${seat.row}${seat.number} - ${seat.seat_type}`}
                            >
                                {seat.row}{seat.number}
                            </div>
                        );
                    })}
                </div>

                <div className="seat-legend mt-4 text-white d-flex justify-content-center gap-4">
                    <div><span className="legend-box std"></span> Thường</div>
                    <div><span className="legend-box vip"></span> VIP</div>
                    <div><span className="legend-box swt"></span> Đôi</div>
                    <div><span className="legend-box booked"></span> Đã bán</div>
                    <div><span className="legend-box locked"></span> Đang chọn</div>
                    <div><span className="legend-box selected"></span> Ghế của bạn</div>
                </div>
            </div>

            <div className="sidebar-section">
                <h4 className="text-warning">🎬 {showtimeInfo?.movie}</h4>
                <p className="text-muted mb-1">{showtimeInfo?.cinema} - {showtimeInfo?.room}</p>
                <p className="text-muted">🕒 {new Date(showtimeInfo?.start_time).toLocaleString('vi-VN')}</p>
                
                <hr className="border-secondary" />

                {/* Danh sách ghế */}
                <div className="mb-3">
                    <h6 className="text-white">Ghế đã chọn:</h6>
                    <div className="d-flex flex-wrap gap-2">
                        {selectedSeatIds.length === 0 ? <span className="text-muted small">Chưa chọn ghế</span> : null}
                        {selectedSeatIds.map(id => {
                            const s = allSeats.find(seat => seat.id === id);
                            return <span key={id} className="badge bg-success">{s?.row}{s?.number}</span>
                        })}
                    </div>
                </div>

                <hr className="border-secondary" />

                {/* Danh sách Bắp Nước */}
                <h6 className="text-white mb-3">🍿 Thêm Bắp Nước:</h6>
                <div className="concessions-list">
                    {products.map(product => (
                        <div key={product.id} className="concession-item d-flex justify-content-between align-items-center mb-2 p-2 bg-dark rounded">
                            <div>
                                <strong className="text-light d-block">{product.name}</strong>
                                <small className="text-warning">{parseInt(product.price).toLocaleString()}đ</small>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <button className="btn btn-sm btn-outline-danger" onClick={() => updateConcession(product.id, -1)}>-</button>
                                <span className="text-white px-2">{cartConcessions[product.id] || 0}</span>
                                <button className="btn btn-sm btn-outline-success" onClick={() => updateConcession(product.id, 1)}>+</button>
                            </div>
                        </div>
                    ))}
                </div>

                <hr className="border-secondary" />

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="text-white mb-0">Tổng cộng:</h5>
                    <h4 className="text-warning mb-0">{calculateTotal().toLocaleString()} VND</h4>
                </div>

                <button 
                    className="btn btn-danger w-100 py-2 fw-bold" 
                    disabled={selectedSeatIds.length === 0}
                    onClick={handleCheckout}
                >
                    TIẾP TỤC THANH TOÁN
                </button>
            </div>
        </div>
    );
};

export default BookingPage;