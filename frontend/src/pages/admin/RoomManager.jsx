import { useState, useEffect } from 'react';
import cinemaApi from '../../api/cinemaApi';
import { Trash2, Plus, Monitor, Armchair, Save } from 'lucide-react';

const RoomManager = () => {
    const [rooms, setRooms] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null); // Phòng đang chọn xem sơ đồ
    const [seats, setSeats] = useState([]); // Danh sách ghế của phòng đang chọn
    const [showForm, setShowForm] = useState(false);
    
    // Form thêm phòng
    const [newRoom, setNewRoom] = useState({ name: '', type: '2D', cinema: '' });
    
    // State chọn ghế để sửa
    const [selectedSeatIds, setSelectedSeatIds] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [roomRes, cinemaRes] = await Promise.all([
            cinemaApi.getRooms(),
            cinemaApi.getCinemas()
        ]);
        setRooms(roomRes.data);
        setCinemas(cinemaRes.data);
        if (cinemaRes.data.length > 0) {
            setNewRoom(prev => ({ ...prev, cinema: cinemaRes.data[0].id }));
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            await cinemaApi.createRoom(newRoom);
            alert('Tạo phòng thành công! Đã tự động sinh 200 ghế.');
            fetchData();
            setShowForm(false);
        } catch (error) {
            alert('Lỗi khi tạo phòng');
        }
    };

    const handleSelectRoom = async (room) => {
        try {
            // Gọi API lấy chi tiết phòng (bao gồm seats)
            const res = await cinemaApi.getRoomDetail(room.id);
            setSelectedRoom(res.data);
            setSeats(res.data.seats); // Lưu danh sách ghế để vẽ
            setSelectedSeatIds([]); // Reset ghế đang chọn
        } catch (error) {
            alert('Không tải được sơ đồ ghế');
        }
    };

    const toggleSeatSelection = (seatId) => {
        setSelectedSeatIds(prev => 
            prev.includes(seatId) ? prev.filter(id => id !== seatId) : [...prev, seatId]
        );
    };

    const handleChangeSeatType = async (type) => {
        if (selectedSeatIds.length === 0) return alert('Chưa chọn ghế nào!');
        try {
            await cinemaApi.updateSeatType(selectedSeatIds, type);
            alert('Cập nhật thành công!');
            handleSelectRoom(selectedRoom); // Load lại sơ đồ mới
        } catch (error) {
            alert('Lỗi cập nhật');
        }
    };

    const handleDeleteRoom = async (id) => {
        if(confirm("Xóa phòng sẽ xóa luôn toàn bộ ghế và lịch chiếu của phòng này!")) {
            await cinemaApi.deleteRoom(id);
            fetchData();
            setSelectedRoom(null);
        }
    }

    // Hàm render màu ghế
    const getSeatColor = (type, isSelected) => {
        if (isSelected) return 'bg-cine-yellow border-2 border-white text-black'; // Đang chọn
        if (type === 'VIP') return 'bg-red-600 border-red-800';
        if (type === 'SWT') return 'bg-pink-500 border-pink-700'; // Sweetbox
        return 'bg-gray-600 border-gray-700'; // Thường
    };

    return (
        <div className="min-h-screen bg-[#0f172a] p-8 text-white flex gap-6">
            
            {/* CỘT TRÁI: DANH SÁCH PHÒNG */}
            <div className="w-1/3 bg-[#1e293b] rounded-xl p-6 border border-gray-700 flex flex-col h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[#f3ea28]">PHÒNG CHIẾU</h2>
                    <button onClick={() => setShowForm(true)} className="p-2 bg-blue-600 rounded hover:bg-blue-500"><Plus size={20}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {rooms.map(room => (
                        <div 
                            key={room.id} 
                            onClick={() => handleSelectRoom(room)}
                            className={`p-4 rounded-lg cursor-pointer transition border ${selectedRoom?.id === room.id ? 'bg-blue-900/50 border-blue-500' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold">{room.name}</h3>
                                    <p className="text-xs text-gray-400">{room.cinema_name} • {room.type}</p>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.id); }} className="text-red-500 hover:text-red-300"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CỘT PHẢI: SƠ ĐỒ GHẾ & CẤU HÌNH */}
            <div className="w-2/3 bg-[#1e293b] rounded-xl p-6 border border-gray-700 relative h-[90vh] flex flex-col">
                {selectedRoom ? (
                    <>
                        <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Monitor size={24} className="text-[#f3ea28]"/> 
                                SƠ ĐỒ GHẾ: {selectedRoom.name}
                            </h2>
                            
                            {/* Toolbar chỉnh ghế */}
                            <div className="flex gap-2">
                                <span className="text-xs text-gray-400 self-center mr-2">Đang chọn: {selectedSeatIds.length} ghế</span>
                                <button onClick={() => handleChangeSeatType('STD')} className="px-3 py-1 text-xs bg-gray-600 rounded hover:bg-gray-500">Thường</button>
                                <button onClick={() => handleChangeSeatType('VIP')} className="px-3 py-1 text-xs bg-red-600 rounded hover:bg-red-500">VIP</button>
                                <button onClick={() => handleChangeSeatType('SWT')} className="px-3 py-1 text-xs bg-pink-600 rounded hover:bg-pink-500">Sweetbox</button>
                            </div>
                        </div>

                        {/* MÀN HÌNH CHIẾU */}
                        <div className="w-full h-2 bg-gray-500 mb-8 rounded-full shadow-[0_10px_20px_rgba(255,255,255,0.1)] relative">
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-400 uppercase tracking-widest">Màn hình</span>
                        </div>

                        {/* LƯỚI GHẾ (GRID) */}
                        <div className="flex-1 overflow-auto flex justify-center items-start custom-scrollbar">
                            <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1 md:gap-2">
                                {seats.map(seat => (
                                    <button
                                        key={seat.id}
                                        onClick={() => toggleSeatSelection(seat.id)}
                                        title={`${seat.row}${seat.number} - ${seat.seat_type}`}
                                        className={`w-6 h-6 md:w-8 md:h-8 rounded-t-lg text-[10px] font-bold flex items-center justify-center transition ${getSeatColor(seat.seat_type, selectedSeatIds.includes(seat.id))}`}
                                    >
                                        <Armchair size={14} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* CHÚ THÍCH */}
                        <div className="mt-4 flex gap-6 justify-center text-sm border-t border-gray-600 pt-4">
                            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-600 rounded"></div> Ghế thường</div>
                            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-600 rounded"></div> Ghế VIP</div>
                            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-pink-500 rounded"></div> Sweetbox</div>
                            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-cine-yellow border-2 border-white rounded"></div> Đang chọn</div>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <Monitor size={64} className="mb-4 opacity-50"/>
                        <p>Chọn một phòng để xem và cấu hình sơ đồ ghế</p>
                    </div>
                )}
            </div>

            {/* MODAL THÊM PHÒNG */}
            {showForm && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                    <div className="bg-gray-800 p-6 rounded-lg w-96 border border-gray-600">
                        <h3 className="text-xl font-bold mb-4 text-[#f3ea28]">Thêm Phòng Mới</h3>
                        <form onSubmit={handleCreateRoom} className="space-y-4">
                            <input required placeholder="Tên phòng (VD: Phòng 01)" className="w-full bg-gray-700 p-2 rounded text-white"
                                value={newRoom.name} onChange={e => setNewRoom({...newRoom, name: e.target.value})} />
                            
                            <select className="w-full bg-gray-700 p-2 rounded text-white"
                                value={newRoom.type} onChange={e => setNewRoom({...newRoom, type: e.target.value})}>
                                <option value="2D">2D</option>
                                <option value="3D">3D</option>
                                <option value="IMAX">IMAX</option>
                            </select>

                            <select className="w-full bg-gray-700 p-2 rounded text-white"
                                value={newRoom.cinema} onChange={e => setNewRoom({...newRoom, cinema: e.target.value})}>
                                {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-400">Hủy</button>
                                <button type="submit" className="px-4 py-2 bg-[#f3ea28] text-black font-bold rounded">Tạo & Sinh Ghế</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManager;