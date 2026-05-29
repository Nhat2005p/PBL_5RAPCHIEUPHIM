import { useState, useEffect } from 'react';
import movieApi from '../../api/movieApi';
import { Trash2, Edit, Plus, X, Film, Calendar, Clock, Video } from 'lucide-react';

const MovieManager = () => {
    // --- STATE QUẢN LÝ DỮ LIỆU ---
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingMovie, setEditingMovie] = useState(null);

    // Dữ liệu mặc định cho Form
    const initialFormState = {
        title: '', description: '', director: '', cast: '',
        duration_minutes: '', release_date: '', trailer_url: '',
        status: 'COMING_SOON', genre: 'ACTION', age_rating: 'P',
        poster: null // File ảnh
    };
    const [formData, setFormData] = useState(initialFormState);

    // --- CẤU HÌNH DROPDOWN (Khớp với models.py Backend) ---
    const GENRES = [
        { value: 'ACTION', label: 'Hành động' }, { value: 'ROMANCE', label: 'Tình cảm' },
        { value: 'HORROR', label: 'Kinh dị' }, { value: 'COMEDY', label: 'Hài' },
        { value: 'SCI_FI', label: 'Viễn tưởng' }, { value: 'ANIMATION', label: 'Hoạt hình' },
        { value: 'DRAMA', label: 'Tâm lý' }, { value: 'FAMILY', label: 'Gia đình' }
    ];

    const RATINGS = [
        { value: 'P', label: 'P - Mọi lứa tuổi' },
        { value: 'K', label: 'K - Dưới 13 (Có bảo hộ)' },
        { value: 'T13', label: 'T13 - Trên 13 tuổi' },
        { value: 'T16', label: 'T16 - Trên 16 tuổi' },
        { value: 'T18', label: 'T18 - Trên 18 tuổi' },
    ];

    const STATUSES = [
        { value: 'COMING_SOON', label: '🗓 Sắp chiếu' },
        { value: 'NOW_SHOWING', label: '🔥 Đang chiếu' },
        { value: 'STOPPED', label: '❌ Ngừng chiếu' },
    ];

    // --- LOGIC GỌI API ---
    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        setLoading(true);
        try {
            const res = await movieApi.getAll();
            setMovies(res.data);
        } catch (error) {
            console.error("Lỗi tải danh sách phim:", error);
            alert("Không thể tải danh sách phim. Kiểm tra lại Server!");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('CẢNH BÁO: Bạn có chắc muốn XÓA VĨNH VIỄN phim này?')) {
            try {
                await movieApi.delete(id);
                fetchMovies(); // Load lại danh sách
            } catch (error) {
                alert('Xóa thất bại!');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. Chuyển object formData thành FormData (để gửi file)
        const dataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            // Nếu đang sửa mà người dùng không chọn ảnh mới (poster === null) thì không gửi field này
            if (key === 'poster' && formData[key] === null) return;
            dataToSend.append(key, formData[key]);
        });

        try {
            if (editingMovie) {
                // Sửa
                await movieApi.update(editingMovie.id, dataToSend);
                alert('Cập nhật thành công!');
            } else {
                // Thêm mới
                await movieApi.create(dataToSend);
                alert('Thêm phim mới thành công!');
            }
            handleCloseForm();
            fetchMovies();
        } catch (error) {
            console.error("Lỗi submit:", error);
            alert('Lỗi! Vui lòng kiểm tra lại thông tin nhập.');
        }
    };

    // --- LOGIC FORM ---
    const handleOpenAdd = () => {
        setEditingMovie(null);
        setFormData(initialFormState);
        setShowForm(true);
    };

    const handleOpenEdit = (movie) => {
        setEditingMovie(movie);
        // Đổ dữ liệu cũ vào form
        setFormData({
            title: movie.title,
            description: movie.description,
            director: movie.director || '',
            cast: movie.cast || '',
            duration_minutes: movie.duration_minutes,
            release_date: movie.release_date,
            trailer_url: movie.trailer_url || '',
            status: movie.status,
            genre: movie.genre,
            age_rating: movie.age_rating,
            poster: null // Reset file input (nếu người dùng ko chọn thì giữ ảnh cũ)
        });
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingMovie(null);
    };

    // --- RENDER GIAO DIỆN ---
    return (
        <div className="min-h-screen bg-[#0f172a] p-10 text-white font-sans">
            {/* 1. Header */}
            <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#f3ea28] flex items-center gap-3">
                        <Film size={32} /> QUẢN TRỊ PHIM
                    </h1>
                    <p className="text-gray-400 mt-1">Quản lý danh sách, lịch chiếu và ấn phẩm phim.</p>
                </div>
                <button 
                    onClick={handleOpenAdd}
                    className="bg-[#663399] hover:bg-[#4c1d95] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg transition transform hover:scale-105"
                >
                    <Plus size={20} /> THÊM PHIM MỚI
                </button>
            </div>

            {/* 2. Bảng Danh Sách */}
            <div className="bg-[#1e293b] rounded-xl overflow-hidden shadow-xl border border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#0f172a] text-[#f3ea28] uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="p-4 w-28 text-center">Poster</th>
                                <th className="p-4">Tên Phim / Thể loại</th>
                                <th className="p-4">Thông tin chi tiết</th>
                                <th className="p-4 text-center">Trạng thái</th>
                                <th className="p-4 text-center w-32">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 text-sm">
                            {loading && <tr><td colSpan="5" className="p-6 text-center">Đang tải dữ liệu...</td></tr>}
                            {!loading && movies.length === 0 && <tr><td colSpan="5" className="p-6 text-center">Chưa có phim nào.</td></tr>}
                            
                            {movies.map(movie => (
                                <tr key={movie.id} className="hover:bg-[#334155] transition duration-150">
                                    <td className="p-4 text-center">
                                        <div className="w-16 h-24 bg-gray-700 rounded overflow-hidden mx-auto shadow-sm border border-gray-600">
                                            {movie.poster ? (
                                                <img src={movie.poster} alt="Poster" className="w-full h-full object-cover"/>
                                            ) : <span className="text-xs flex h-full items-center justify-center">No Img</span>}
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <h3 className="font-bold text-lg text-white mb-1">{movie.title}</h3>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-xs border border-gray-600">
                                                {movie.genre_display}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${
                                                movie.age_rating === 'T18' ? 'bg-red-600' : 
                                                movie.age_rating === 'T16' ? 'bg-orange-500' : 
                                                'bg-green-600'
                                            }`}>
                                                {movie.age_rating}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-300 space-y-1 align-top">
                                        <div className="flex items-center gap-2"><Clock size={14} className="text-[#f3ea28]"/> {movie.duration_minutes} phút</div>
                                        <div className="flex items-center gap-2"><Calendar size={14} className="text-[#f3ea28]"/> {movie.release_date}</div>
                                        <div className="truncate w-48 text-xs text-gray-500" title={movie.director}>ĐD: {movie.director}</div>
                                    </td>
                                    <td className="p-4 text-center align-middle">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                                            movie.status === 'NOW_SHOWING' ? 'bg-green-900/40 text-green-400 border-green-500' : 
                                            movie.status === 'STOPPED' ? 'bg-red-900/40 text-red-400 border-red-500' : 
                                            'bg-yellow-900/40 text-yellow-400 border-yellow-500'
                                        }`}>
                                            {movie.status_display}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center align-middle">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => handleOpenEdit(movie)} className="p-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600 hover:text-white transition" title="Sửa">
                                                <Edit size={18}/>
                                            </button>
                                            <button onClick={() => handleDelete(movie.id)} className="p-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600 hover:text-white transition" title="Xóa">
                                                <Trash2 size={18}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3. Modal Form (Thêm/Sửa) */}
            {showForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1e293b] w-full max-w-4xl max-h-[90vh] rounded-xl border border-gray-600 shadow-2xl flex flex-col">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-600 flex justify-between items-center bg-[#0f172a] rounded-t-xl">
                            <h2 className="text-xl font-bold text-[#f3ea28]">
                                {editingMovie ? '✏️ CẬP NHẬT PHIM' : '🎬 THÊM PHIM MỚI'}
                            </h2>
                            <button onClick={handleCloseForm} className="text-gray-400 hover:text-white"><X size={24}/></button>
                        </div>

                        {/* Modal Body (Scroll) */}
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* Cột Trái */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-400 mb-1">Tên phim <span className="text-red-500">*</span></label>
                                        <input required type="text" className="w-full bg-[#0f172a] border border-gray-600 rounded p-3 text-white focus:border-[#f3ea28] outline-none"
                                            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-400 mb-1">Thời lượng (phút)</label>
                                            <input required type="number" className="w-full bg-[#0f172a] border border-gray-600 rounded p-3 text-white focus:border-[#f3ea28] outline-none"
                                                value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-400 mb-1">Ngày khởi chiếu</label>
                                            <input required type="date" className="w-full bg-[#0f172a] border border-gray-600 rounded p-3 text-white focus:border-[#f3ea28] outline-none"
                                                value={formData.release_date} onChange={e => setFormData({...formData, release_date: e.target.value})} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-400 mb-1">Đạo diễn</label>
                                        <input type="text" className="w-full bg-[#0f172a] border border-gray-600 rounded p-3 text-white focus:border-[#f3ea28] outline-none"
                                            value={formData.director} onChange={e => setFormData({...formData, director: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-400 mb-1">Mô tả nội dung</label>
                                        <textarea className="w-full bg-[#0f172a] border border-gray-600 rounded p-3 text-white focus:border-[#f3ea28] outline-none h-32"
                                            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                                    </div>
                                </div>

                                {/* Cột Phải */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-400 mb-1">Thể loại</label>
                                            <select className="w-full bg-[#0f172a] border border-gray-600 rounded p-3 text-white focus:border-[#f3ea28] outline-none"
                                                value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})}>
                                                {GENRES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-400 mb-1">Nhãn tuổi</label>
                                            <select className="w-full bg-[#0f172a] border border-gray-600 rounded p-3 text-white focus:border-[#f3ea28] outline-none"
                                                value={formData.age_rating} onChange={e => setFormData({...formData, age_rating: e.target.value})}>
                                                {RATINGS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-400 mb-1">Trạng thái phát hành</label>
                                        <select className="w-full bg-[#0f172a] border border-gray-600 rounded p-3 text-white focus:border-[#f3ea28] outline-none"
                                            value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">*Chọn "Ngừng chiếu" để ẩn phim khỏi trang chủ.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-400 mb-1 flex items-center gap-2">
                                            <Video size={16}/> Link Trailer (Youtube URL)
                                        </label>
                                        <input type="url" className="w-full bg-[#0f172a] border border-gray-600 rounded p-3 text-white focus:border-[#f3ea28] outline-none"
                                            value={formData.trailer_url} onChange={e => setFormData({...formData, trailer_url: e.target.value})} placeholder="https://..." />
                                    </div>

                                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-[#f3ea28] transition bg-[#0f172a]">
                                        <label className="cursor-pointer block">
                                            <span className="text-gray-300 font-semibold block mb-2">Upload Poster Phim</span>
                                            <input type="file" accept="image/*" className="hidden"
                                                onChange={e => setFormData({...formData, poster: e.target.files[0]})} />
                                            <span className="text-xs text-gray-500 block">
                                                {formData.poster ? `📸 Đã chọn: ${formData.poster.name}` : 'Chưa chọn ảnh (JPG, PNG)'}
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* Nút Submit */}
                                <div className="col-span-1 md:col-span-2 pt-4 border-t border-gray-600 flex justify-end gap-4">
                                    <button type="button" onClick={handleCloseForm} className="px-6 py-3 rounded-lg font-bold text-gray-300 hover:bg-gray-700 transition">
                                        Hủy bỏ
                                    </button>
                                    <button type="submit" className="bg-[#f3ea28] text-black px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 transition shadow-lg">
                                        {editingMovie ? 'CẬP NHẬT' : 'THÊM MỚI'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MovieManager;