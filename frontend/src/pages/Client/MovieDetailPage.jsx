import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlayCircle, Clock, Calendar, Star, MapPin } from 'lucide-react';
import cinemaApi from '../../api/cinemaApi';

const MovieDetailPage = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [showtimes, setShowtimes] = useState([]);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const [movieRes, showtimeRes] = await Promise.all([
                    cinemaApi.getMovieDetail(id),
                    cinemaApi.getShowtimes(id)
                ]);
                setMovie(movieRes.data);
                setShowtimes(showtimeRes.data);
            } catch (error) {
                console.error("Lỗi tải chi tiết phim:", error);
            }
        };
        fetchDetail();
    }, [id]);

    if (!movie) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="text-center text-white animate-pulse">
                <div className="w-12 h-12 border-4 border-[#f3ea28] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                Đang tải chi tiết phim...
            </div>
        </div>
    );

    // Nhóm suất chiếu theo Rạp
    const groupedShowtimes = showtimes.reduce((acc, st) => {
        if (!acc[st.cinema_name]) acc[st.cinema_name] = [];
        acc[st.cinema_name].push(st);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans pb-16">
            
            {/* HERO SECTION (Nền mờ phía trên) */}
            <div className="relative w-full h-[60vh] md:h-[500px] overflow-hidden">
                <img src={movie.poster} alt="backdrop" className="w-full h-full object-cover opacity-20 blur-sm scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/60 to-transparent"></div>
            </div>

            {/* THÔNG TIN PHIM */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 -mt-48 md:-mt-32 flex flex-col md:flex-row gap-8">
                {/* Cột trái: Poster */}
                <div className="flex-shrink-0 mx-auto md:mx-0 w-64 md:w-72">
                    <img 
                        src={movie.poster} 
                        alt={movie.title} 
                        className="w-full rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-2 border-gray-700 object-cover" 
                    />
                </div>

                {/* Cột phải: Chi tiết */}
                <div className="flex-1 pt-4 md:pt-16">
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#f3ea28] to-yellow-500 mb-4 uppercase leading-tight">
                        {movie.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="bg-red-600 text-white font-bold px-3 py-1 rounded shadow-sm text-sm">
                            {movie.age_rating_display || movie.age_rating}
                        </span>
                        <span className="bg-gray-800 border border-gray-600 text-gray-300 font-semibold px-3 py-1 rounded text-sm">
                            {movie.genre_display || "Hành động"}
                        </span>
                        <span className="flex items-center gap-1 bg-[#1e293b] border border-gray-600 px-3 py-1 rounded text-sm font-bold text-yellow-400">
                            <Star size={16} fill="currentColor"/> {movie.avg_rating ? parseFloat(movie.avg_rating).toFixed(1) : "4.5"} / 5
                        </span>
                    </div>

                    <p className="text-gray-300 text-lg leading-relaxed mb-6 italic opacity-90">
                        {movie.description || "Chưa có mô tả cho phim này."}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm text-gray-400 mb-8 border-t border-gray-700 pt-6">
                        <div><strong className="text-white">Đạo diễn:</strong> {movie.director || "Đang cập nhật"}</div>
                        <div><strong className="text-white">Diễn viên:</strong> {movie.cast || "Đang cập nhật"}</div>
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-[#f3ea28]"/> 
                            <strong className="text-white">Thời lượng:</strong> {movie.duration_minutes} phút
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-[#f3ea28]"/> 
                            <strong className="text-white">Khởi chiếu:</strong> {movie.release_date}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button className="flex items-center justify-center gap-2 bg-transparent border-2 border-white/30 hover:border-[#f3ea28] hover:text-[#f3ea28] hover:bg-white/5 px-8 py-3 rounded-full font-bold transition-all active:scale-95">
                            <PlayCircle size={20}/> XEM TRAILER
                        </button>
                    </div>
                </div>
            </div>

            {/* KHU VỰC LỊCH CHIẾU */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-16">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-8 bg-[#f3ea28] rounded-full"></div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider">LỊCH CHIẾU</h2>
                </div>

                {Object.keys(groupedShowtimes).length === 0 ? (
                    <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-12 text-center text-gray-500">
                        <Calendar size={48} className="mx-auto mb-4 opacity-20"/>
                        <p className="text-lg">Hiện tại chưa có suất chiếu nào cho phim này.</p>
                        <p className="text-sm mt-2 text-gray-600">Vui lòng quay lại sau hoặc chọn phim khác.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.keys(groupedShowtimes).map(cinemaName => (
                            <div key={cinemaName} className="bg-[#1e293b] border border-gray-700 rounded-xl p-6 shadow-lg transition-all hover:border-gray-600">
                                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-gray-700 pb-3">
                                    <MapPin size={20} className="text-[#f3ea28]"/> {cinemaName}
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    {groupedShowtimes[cinemaName].map(st => (
                                        <Link 
                                            key={st.id} 
                                            to={`/booking/${st.id}`} 
                                            className="group relative border border-[#f3ea28] bg-[#0f172a] text-[#f3ea28] hover:bg-[#f3ea28] hover:text-black px-6 py-2 rounded-lg font-bold transition-all text-center min-w-[110px]"
                                        >
                                            {/* Ép định dạng 24h để đồng bộ giao diện */}
                                            {new Date(st.start_time).toLocaleTimeString('vi-VN', {
                                                hour: '2-digit', 
                                                minute: '2-digit', 
                                                hour12: false
                                            })}
                                            
                                            {/* Tooltip hiện thông tin chi tiết khi Hover */}
                                            <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-xl border border-gray-700 z-20">
                                                <span className="block font-bold text-[#f3ea28]">{st.room_name}</span>
                                                <span className="block">{Number(st.base_price).toLocaleString()}đ</span>
                                                {/* Mũi tên nhỏ bên dưới tooltip */}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black"></div>
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieDetailPage;