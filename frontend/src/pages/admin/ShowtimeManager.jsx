import { useState, useEffect } from 'react';
import showtimeApi from '../../api/showtimeApi';
import movieApi from '../../api/movieApi';
import cinemaApi from '../../api/cinemaApi';
import { Calendar, Clock, MapPin, Trash2, Plus, AlertCircle } from 'lucide-react';

const ShowtimeManager = () => {
    // Data Lists
    const [showtimes, setShowtimes] = useState([]);
    const [movies, setMovies] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    const [rooms, setRooms] = useState([]); // Phòng (lọc theo rạp)
    
    // UI State
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Form Data
    const [formData, setFormData] = useState({
        cinema_id: '', // Chỉ dùng để lọc phòng, không gửi lên server
        room: '',
        movie: '',
        start_time: '',
        base_price: 45000
    });

    useEffect(() => {
        fetchInitialData();
        fetchShowtimes();
    }, []);

    // 1. Tải dữ liệu ban đầu (Phim, Rạp)
    const fetchInitialData = async () => {
        const [movieRes, cinemaRes] = await Promise.all([
            movieApi.getAll(),
            cinemaApi.getCinemas()
        ]);
        setMovies(movieRes.data);
        setCinemas(cinemaRes.data);
    };

    // 2. Tải danh sách lịch chiếu
    const fetchShowtimes = async () => {
        setLoading(true);
        try {
            const res = await showtimeApi.getAll();
            setShowtimes(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // 3. Khi chọn Rạp -> Tự động tải danh sách Phòng của rạp đó
    const handleCinemaChange = async (cinemaId) => {
        setFormData(prev => ({ ...prev, cinema_id: cinemaId, room: '' })); // Reset phòng cũ
        if (cinemaId) {
            const res = await cinemaApi.getRooms({ cinema: cinemaId });
            // Lọc client-side hoặc gọi API filter tùy backend, ở đây giả sử API trả về all rooms
            // Cách tốt nhất: Backend RoomViewSet nên có filter ?cinema=ID. 
            // Tạm thời mình lọc thủ công ở client nếu API trả về hết:
            const filteredRooms = res.data.filter(r => r.cinema.toString() === cinemaId.toString());
            setRooms(filteredRooms);
        } else {
            setRooms([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        
        try {
            // Chuẩn bị dữ liệu gửi đi (Không gửi cinema_id)
            const payload = {
                movie: formData.movie,
                room: formData.room,
                start_time: formData.start_time, // Format: YYYY-MM-DDTHH:MM
                base_price: formData.base_price
            };

            await showtimeApi.create(payload);
            alert("Thêm lịch chiếu thành công!");
            setShowForm(false);
            fetchShowtimes();
        } catch (error) {
            // Hiển thị lỗi từ Backend (Ví dụ: Trùng lịch)
            if (error.response && error.response.data) {
                // Lấy lỗi đầu tiên tìm thấy
                const serverError = error.response.data.non_field_errors 
                                    || Object.values(error.response.data)[0];
                setErrorMsg(Array.isArray(serverError) ? serverError[0] : "Lỗi không xác định");
            } else {
                setErrorMsg("Có lỗi xảy ra khi kết nối Server");
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn muốn xóa suất chiếu này?")) {
            await showtimeApi.delete(id);
            fetchShowtimes();
        }
    };

    // Helper: Format ngày giờ đẹp
    const formatDate = (isoString) => {
        const d = new Date(isoString);
        return `${d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${d.toLocaleDateString('vi-VN')}`;
    };

    return (
        <div className="min-h-screen bg-[#0f172a] p-8 text-white">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                <h1 className="text-3xl font-bold text-[#f3ea28] flex items-center gap-2">
                    <Calendar /> QUẢN LÝ LỊCH CHIẾU
                </h1>
                <button onClick={() => { setShowForm(true); setErrorMsg(''); }} className="bg-[#663399] hover:bg-purple-700 px-4 py-2 rounded font-bold flex items-center gap-2">
                    <Plus size={20}/> Tạo Suất Chiếu
                </button>
            </div>

            {/* DANH SÁCH SUẤT CHIẾU */}
            <div className="bg-[#1e293b] rounded-xl overflow-hidden shadow-lg border border-gray-700">
                <table className="w-full text-left">
                    <thead className="bg-[#0f172a] text-[#f3ea28] uppercase text-sm font-bold">
                        <tr>
                            <th className="p-4">Thời gian</th>
                            <th className="p-4">Phim</th>
                            <th className="p-4">Rạp / Phòng</th>
                            <th className="p-4">Giá vé</th>
                            <th className="p-4 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 text-sm">
                        {loading && <tr><td colSpan="5" className="p-6 text-center">Đang tải...</td></tr>}
                        {showtimes.map(item => (
                            <tr key={item.id} className="hover:bg-gray-700/50">
                                <td className="p-4">
                                    <div className="font-bold text-lg text-green-400">
                                        {new Date(item.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                    <div className="text-gray-400 text-xs">
                                        {new Date(item.start_time).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Kết thúc: {new Date(item.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                </td>
                                <td className="p-4 font-semibold text-white">
                                    {item.movie_title}
                                    <span className="block text-xs text-gray-400 font-normal">{item.duration} phút</span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-1 text-gray-300"><MapPin size={12}/> {item.cinema_name}</div>
                                    <div className="text-[#f3ea28] font-bold mt-1">{item.room_name}</div>
                                </td>
                                <td className="p-4 font-mono text-white">
                                    {parseInt(item.base_price).toLocaleString()}đ
                                </td>
                                <td className="p-4 text-center">
                                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-400 p-2 bg-red-500/10 rounded">
                                        <Trash2 size={18}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL FORM */}
            {showForm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1e293b] w-full max-w-lg rounded-xl border border-gray-600 shadow-2xl p-6">
                        <h2 className="text-2xl font-bold text-[#f3ea28] mb-6">Thêm Suất Chiếu Mới</h2>
                        
                        {errorMsg && (
                            <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm flex items-center gap-2 border border-red-500/50">
                                <AlertCircle size={16}/> {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* 1. Chọn Rạp */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Chọn Rạp chiếu</label>
                                <select required className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white"
                                    value={formData.cinema_id} onChange={e => handleCinemaChange(e.target.value)}>
                                    <option value="">-- Chọn Rạp --</option>
                                    {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            {/* 2. Chọn Phòng (Phụ thuộc vào Rạp) */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Chọn Phòng</label>
                                <select required className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white disabled:opacity-50"
                                    value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})}
                                    disabled={!formData.cinema_id}>
                                    <option value="">-- Chọn Phòng --</option>
                                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
                                </select>
                            </div>

                            {/* 3. Chọn Phim */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Chọn Phim</label>
                                <select required className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white"
                                    value={formData.movie} onChange={e => setFormData({...formData, movie: e.target.value})}>
                                    <option value="">-- Chọn Phim --</option>
                                    {movies.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.title} ({m.duration_minutes}p)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 4. Chọn Giờ & Giá */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Thời gian bắt đầu</label>
                                    <input required type="datetime-local" className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white"
                                        value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Giá vé cơ bản (VNĐ)</label>
                                    <input required type="number" className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white"
                                        value={formData.base_price} onChange={e => setFormData({...formData, base_price: e.target.value})} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-600">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-400 hover:text-white">Hủy</button>
                                <button type="submit" className="bg-[#f3ea28] text-black font-bold px-6 py-2 rounded hover:bg-yellow-400">Lưu Lịch Chiếu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShowtimeManager;