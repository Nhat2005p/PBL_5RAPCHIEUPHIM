import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print'; // <-- 1. Import thư viện in
import cinemaApi from '../../api/cinemaApi';
import bookingApi from '../../api/bookingApi';
import TicketPrinter from '../../components/TicketPrinter'; // <-- 2. Import Component tờ vé
import { Film, Calendar, Armchair, Popcorn, ShoppingCart, ArrowLeft, Trash2, Printer } from 'lucide-react';

const PosPage = () => {
    // --- STATE QUẢN LÝ LUỒNG ---
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // --- STATE DỮ LIỆU ---
    const [movies, setMovies] = useState([]);
    const [showtimes, setShowtimes] = useState([]);
    const [seatData, setSeatData] = useState({ all_seats: [], booked_seat_ids: [], showtime_info: null });
    const [products, setProducts] = useState([]);

    // --- STATE GIỎ HÀNG (BILL) ---
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [selectedShowtime, setSelectedShowtime] = useState(null);
    const [selectedSeatIds, setSelectedSeatIds] = useState([]);
    const [cartConcessions, setCartConcessions] = useState({});

    // --- STATE CHO MÁY IN ---
    const ticketRef = useRef(); // Ref gắn vào tờ vé để máy in nhận diện
    const [printData, setPrintData] = useState(null); // Lưu trữ dữ liệu vé chuẩn bị in

    // Tải danh sách phim Đang chiếu & bắp nước
    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const movieRes = await cinemaApi.getPublicMovies('NOW_SHOWING');
                setMovies(movieRes.data);
                const productRes = await bookingApi.getProducts();
                setProducts(productRes.data);
            } catch (error) {
                toast.error("Lỗi tải dữ liệu ban đầu!");
            }
        };
        fetchInitial();
    }, []);

    // --- CẤU HÌNH LỆNH IN ---
    const handlePrintTicket = useReactToPrint({
        content: () => ticketRef.current,
        documentTitle: 'Ve_Phim_CineStar',
        onAfterPrint: () => {
            // Sau khi in xong, tự động reset lại trang POS
            setStep(1);
            setSelectedMovie(null);
            setSelectedShowtime(null);
            setSelectedSeatIds([]);
            setCartConcessions({});
            setPrintData(null);
        }
    });

    const handleSelectMovie = async (movie) => {
        setSelectedMovie(movie);
        setSelectedShowtime(null);
        setSelectedSeatIds([]);
        setStep(2);
        setLoading(true);
        try {
            const res = await cinemaApi.getShowtimes(movie.id);
            setShowtimes(res.data);
        } catch (error) {
            toast.error("Lỗi tải lịch chiếu!");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectShowtime = async (st) => {
        setSelectedShowtime(st);
        setSelectedSeatIds([]);
        setStep(3);
        setLoading(true);
        try {
            const res = await bookingApi.getSeatStatus(st.id);
            setSeatData(res.data);
        } catch (error) {
            toast.error("Lỗi tải sơ đồ ghế!");
        } finally {
            setLoading(false);
        }
    };

    const handleSeatClick = (seat) => {
        if (seatData.booked_seat_ids.includes(seat.id) || !seat.is_active) return;
        if (selectedSeatIds.includes(seat.id)) {
            setSelectedSeatIds(prev => prev.filter(id => id !== seat.id));
        } else {
            setSelectedSeatIds(prev => [...prev, seat.id]);
        }
    };

    const updateConcession = (productId, delta) => {
        setCartConcessions(prev => {
            const currentQty = prev[productId] || 0;
            const newQty = currentQty + delta;
            if (newQty <= 0) {
                const { [productId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [productId]: newQty };
        });
    };

    const calculateTotal = () => {
        let total = 0;
        if (seatData.showtime_info) {
            selectedSeatIds.forEach(id => {
                const seat = seatData.all_seats.find(s => s.id === id);
                let price = parseFloat(seatData.showtime_info.price);
                if (seat?.seat_type === 'VIP') price += 20000;
                if (seat?.seat_type === 'SWT') price += 50000;
                total += price;
            });
        }
        Object.keys(cartConcessions).forEach(pId => {
            const product = products.find(p => p.id === parseInt(pId));
            if (product) total += parseFloat(product.price) * cartConcessions[pId];
        });
        return total;
    };

    // THANH TOÁN VÀ GỌI MÁY IN
    const handleCheckout = async () => {
        if (selectedSeatIds.length === 0) return toast.warning("Vui lòng chọn ít nhất 1 ghế!");
        
        const payload = {
            showtime_id: selectedShowtime.id,
            seat_ids: selectedSeatIds,
            concessions: Object.keys(cartConcessions).map(pId => ({
                product_id: parseInt(pId),
                quantity: cartConcessions[pId]
            })),
            payment_method: "CASH"
        };

        try {
            const res = await bookingApi.createBooking(payload);
            toast.success("BÁN VÉ THÀNH CÔNG! Đang nạp giấy in...");
            
            // Lấy mã vé trả về từ backend, nếu không có tạm sinh mã random
            const newBookingCode = res.data.booking_code || res.data.code || `BKG-${Math.floor(Math.random() * 1000000)}`;

            // Đổ dữ liệu vào PrintData để Component Máy in (TicketPrinter) vẽ ra bill
            setPrintData({
                bookingData: {
                    movie_title: selectedMovie.title,
                    cinema: selectedShowtime.cinema_name,
                    room: selectedShowtime.room_name,
                    date: new Date(selectedShowtime.start_time).toLocaleDateString('vi-VN'),
                    time: new Date(selectedShowtime.start_time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}),
                    total: calculateTotal(),
                    code: newBookingCode
                },
                seats: selectedSeatIds.map(id => {
                    const s = seatData.all_seats.find(seat => seat.id === id);
                    let price = parseFloat(seatData.showtime_info.price);
                    if (s?.seat_type === 'VIP') price += 20000;
                    if (s?.seat_type === 'SWT') price += 50000;
                    return {
                        row: s?.row,
                        number: s?.number,
                        seat_type: s?.seat_type,
                        price: price
                    };
                })
            });

            // Đợi 500ms cho React vẽ tờ vé ẩn vào DOM xong rồi kích hoạt hộp thoại In
            setTimeout(() => {
                handlePrintTicket();
            }, 500);
            
        } catch (error) {
            toast.error(error.response?.data?.non_field_errors?.[0] || "Lỗi khi thanh toán!");
            if (step === 3 && selectedShowtime) handleSelectShowtime(selectedShowtime);
        }
    };

    return (
        <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden font-sans relative">
            
            {/* CỘT TRÁI: KHU VỰC THAO TÁC (70%) */}
            <div className="w-2/3 h-full flex flex-col border-r border-gray-700">
                <div className="bg-[#1e293b] p-4 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3">
                        {step > 1 && (
                            <button onClick={() => setStep(step - 1)} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition">
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <h1 className="text-xl font-bold text-[#f3ea28] flex items-center gap-2">
                            {step === 1 && <><Film size={24}/> CHỌN PHIM</>}
                            {step === 2 && <><Calendar size={24}/> CHỌN SUẤT CHIẾU</>}
                            {step === 3 && <><Armchair size={24}/> CHỌN GHẾ & DỊCH VỤ</>}
                        </h1>
                    </div>
                    <div className="text-sm text-gray-400">POS Thu Ngân</div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    
                    {/* BƯỚC 1: DANH SÁCH PHIM */}
                    {step === 1 && (
                        <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
                            {movies.map(movie => (
                                <div key={movie.id} onClick={() => handleSelectMovie(movie)} 
                                     className="bg-[#1e293b] rounded-xl overflow-hidden cursor-pointer border border-transparent hover:border-[#f3ea28] transition transform hover:scale-105">
                                    <img src={movie.poster} alt={movie.title} className="w-full h-48 object-cover" />
                                    <div className="p-3">
                                        <h3 className="font-bold text-sm truncate" title={movie.title}>{movie.title}</h3>
                                        <div className="text-xs text-gray-400 mt-1">{movie.duration_minutes} phút | <span className="text-red-400 font-bold">{movie.age_rating}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* BƯỚC 2: DANH SÁCH SUẤT CHIẾU */}
                    {step === 2 && (
                        <div>
                            <div className="flex gap-4 items-center mb-6 bg-[#1e293b] p-4 rounded-xl border border-gray-700">
                                <img src={selectedMovie?.poster} className="w-16 h-24 object-cover rounded" />
                                <div>
                                    <h2 className="text-xl font-bold text-[#f3ea28]">{selectedMovie?.title}</h2>
                                    <p className="text-gray-400 text-sm">Vui lòng chọn suất chiếu trong ngày</p>
                                </div>
                            </div>
                            
                            {loading ? <div className="text-center mt-10">Đang tải suất chiếu...</div> : showtimes.length === 0 ? <div className="text-center text-gray-400 mt-10">Không có suất chiếu nào.</div> : (
                                <div className="grid grid-cols-3 gap-4">
                                    {showtimes.map(st => (
                                        <div key={st.id} onClick={() => handleSelectShowtime(st)}
                                             className="bg-[#1e293b] p-4 rounded-xl cursor-pointer border border-gray-700 hover:border-green-400 hover:bg-green-900/20 transition text-center">
                                            <div className="text-2xl font-bold text-green-400 mb-1">
                                                {new Date(st.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                            <div className="text-sm font-semibold">{st.room_name}</div>
                                            <div className="text-xs text-gray-400 mt-2">{parseInt(st.base_price).toLocaleString()}đ</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* BƯỚC 3: SƠ ĐỒ GHẾ & BẮP NƯỚC */}
                    {step === 3 && (
                        <div className="space-y-8">
                            {loading ? <div className="text-center">Đang tải sơ đồ rạp...</div> : (
                                <>
                                    <div className="w-full max-w-2xl mx-auto h-8 bg-gray-600 rounded-t-3xl border-b-4 border-[#f3ea28] flex items-center justify-center shadow-[0_10px_20px_rgba(243,234,40,0.1)] mb-10">
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Màn hình</span>
                                    </div>

                                    <div className="flex justify-center">
                                        <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-2">
                                            {seatData.all_seats.map(seat => {
                                                const isBooked = seatData.booked_seat_ids.includes(seat.id);
                                                const isSelected = selectedSeatIds.includes(seat.id);
                                                
                                                let bgColor = 'bg-gray-600';
                                                let borderColor = 'border-gray-800';
                                                
                                                if (isBooked) { bgColor = 'bg-gray-800 opacity-50 cursor-not-allowed'; }
                                                else if (isSelected) { bgColor = 'bg-[#f3ea28] text-black'; borderColor = 'border-yellow-600'; }
                                                else if (seat.seat_type === 'VIP') { bgColor = 'bg-red-600'; borderColor = 'border-red-800'; }
                                                else if (seat.seat_type === 'SWT') { bgColor = 'bg-pink-500'; borderColor = 'border-pink-700'; }

                                                return (
                                                    <div key={seat.id} 
                                                         onClick={() => handleSeatClick(seat)}
                                                         className={`w-8 h-8 rounded-t-lg flex items-center justify-center text-[10px] font-bold border-b-4 cursor-pointer transition-transform hover:scale-110 ${bgColor} ${borderColor}`}
                                                         title={`${seat.row}${seat.number} - ${seat.seat_type}`}>
                                                        {seat.row}{seat.number}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    
                                    <hr className="border-gray-700" />

                                    <div>
                                        <h3 className="text-lg font-bold text-[#f3ea28] mb-4 flex items-center gap-2"><Popcorn/> THÊM BẮP NƯỚC</h3>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                            {products.filter(p => p.is_active).map(product => (
                                                <div key={product.id} className="bg-[#1e293b] border border-gray-700 p-3 rounded-xl flex items-center justify-between">
                                                    <div>
                                                        <div className="font-bold text-sm truncate w-24" title={product.name}>{product.name}</div>
                                                        <div className="text-green-400 text-xs font-bold">{parseInt(product.price).toLocaleString()}đ</div>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-[#0f172a] rounded-lg p-1">
                                                        <button onClick={() => updateConcession(product.id, -1)} className="w-6 h-6 bg-gray-700 rounded text-white flex items-center justify-center hover:bg-red-500">-</button>
                                                        <span className="w-4 text-center text-sm font-bold">{cartConcessions[product.id] || 0}</span>
                                                        <button onClick={() => updateConcession(product.id, 1)} className="w-6 h-6 bg-gray-700 rounded text-white flex items-center justify-center hover:bg-green-500">+</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* CỘT PHẢI: HÓA ĐƠN (BILL) (30%) */}
            <div className="w-1/3 h-full bg-[#1e293b] flex flex-col shadow-[-10px_0_20px_rgba(0,0,0,0.3)] z-10">
                <div className="bg-[#0f172a] p-4 text-center border-b border-gray-700">
                    <h2 className="text-xl font-black text-white tracking-widest flex items-center justify-center gap-2">
                        <ShoppingCart size={20} className="text-[#f3ea28]"/> HÓA ĐƠN BÁN VÉ
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {selectedMovie ? (
                        <div className="border-b border-gray-700 pb-4">
                            <h3 className="text-lg font-bold text-[#f3ea28] mb-1">{selectedMovie.title}</h3>
                            {selectedShowtime ? (
                                <div className="text-sm text-gray-300 space-y-1">
                                    <div>📍 Rạp: <span className="text-white font-semibold">{selectedShowtime.cinema_name} - {selectedShowtime.room_name}</span></div>
                                    <div>🕒 Suất: <span className="text-white font-semibold">{new Date(selectedShowtime.start_time).toLocaleString('vi-VN')}</span></div>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500 italic">Chưa chọn suất chiếu...</div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 italic mt-10 flex flex-col items-center">
                            <Film size={48} className="mb-2 opacity-20"/>
                            Vui lòng chọn phim để bắt đầu
                        </div>
                    )}

                    {selectedSeatIds.length > 0 && (
                        <div className="border-b border-gray-700 pb-4">
                            <div className="text-xs text-gray-400 font-bold uppercase mb-2">Ghế đã chọn ({selectedSeatIds.length})</div>
                            <div className="flex flex-wrap gap-2">
                                {selectedSeatIds.map(id => {
                                    const s = seatData.all_seats.find(seat => seat.id === id);
                                    return <span key={id} className="bg-green-600 text-white px-2 py-1 rounded text-sm font-bold">{s?.row}{s?.number}</span>
                                })}
                            </div>
                        </div>
                    )}

                    {Object.keys(cartConcessions).length > 0 && (
                        <div className="border-b border-gray-700 pb-4">
                            <div className="text-xs text-gray-400 font-bold uppercase mb-2">Bắp Nước</div>
                            <ul className="space-y-2">
                                {Object.keys(cartConcessions).map(pId => {
                                    const p = products.find(x => x.id === parseInt(pId));
                                    if (!p) return null;
                                    return (
                                        <li key={pId} className="flex justify-between text-sm">
                                            <span>{cartConcessions[pId]}x {p.name}</span>
                                            <span className="text-gray-300">{(p.price * cartConcessions[pId]).toLocaleString()}đ</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="bg-[#0f172a] p-6 border-t border-gray-700">
                    <div className="flex justify-between items-end mb-6">
                        <div className="text-gray-400 uppercase font-bold text-sm">Tổng thanh toán</div>
                        <div className="text-4xl font-black text-green-400">{calculateTotal().toLocaleString()}đ</div>
                    </div>
                    
                    <button 
                        onClick={handleCheckout}
                        disabled={selectedSeatIds.length === 0}
                        className="w-full bg-[#f3ea28] text-black py-4 rounded-xl font-black text-xl hover:bg-yellow-400 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(243,234,40,0.3)]"
                    >
                        <Printer size={24}/> THU TIỀN & IN VÉ
                    </button>
                    
                    {selectedSeatIds.length > 0 && (
                        <button 
                            onClick={() => { setSelectedSeatIds([]); setCartConcessions({}); }}
                            className="w-full mt-3 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-bold flex items-center justify-center gap-2 transition"
                        >
                            <Trash2 size={18}/> HỦY ĐƠN
                        </button>
                    )}
                </div>
            </div>

            {/* PHẦN RENDER ẨN TỜ VÉ CHO MÁY IN (Tailwind class hidden print:block đã lo việc ẩn) */}
            {printData && (
                <TicketPrinter 
                    ref={ticketRef} 
                    bookingData={printData.bookingData} 
                    seats={printData.seats} 
                />
            )}
        </div>
    );
};

export default PosPage;