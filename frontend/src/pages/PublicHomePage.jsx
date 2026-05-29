import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Ticket, Star, ChevronRight, Info, Calendar } from 'lucide-react';

const PublicHomePage = () => {
    // Dữ liệu mẫu phim để hiển thị Layout
    const movies = [
        { id: 1, title: "Oppenheimer", genre: "Drama/History", duration: "180 min", rating: "8.9", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop" },
        { id: 2, title: "Interstellar", genre: "Sci-fi/Adventure", duration: "169 min", rating: "8.7", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1000&auto=format&fit=crop" },
        { id: 3, title: "Dune: Part Two", genre: "Action/Sci-fi", duration: "166 min", rating: "9.0", image: "https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=1000&auto=format&fit=crop" },
        { id: 4, title: "The Batman", genre: "Action/Crime", duration: "176 min", rating: "7.8", image: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?q=80&w=1000&auto=format&fit=crop" },
    ];

    return (
        <div className="bg-[#0A0A0F] min-h-screen text-[#F8F8F8] font-sans overflow-x-hidden">
            
            {/* 1. HERO SECTION (Immersive Experience) */}
            <section className="relative h-[85vh] w-full flex items-center justify-start overflow-hidden">
                {/* Overlay làm tối ảnh nền theo nguyên tắc Cinematic */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F] via-[#0A0A0F]/60 to-transparent z-10"></div>
                <img 
                    src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop" 
                    alt="Hero Banner" 
                    className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105"
                />

                <div className="container mx-auto px-10 relative z-20 max-w-4xl">
                    <div className="space-y-6">
                        <span className="inline-block px-3 py-1 rounded bg-[#C9A84C]/20 border border-[#C9A84C]/30 text-[#C9A84C] text-xs font-bold tracking-widest uppercase mb-4">
                            Sắp ra mắt
                        </span>
                        <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-none drop-shadow-2xl">
                            CINE<span className="text-[#C9A84C]">PBL5</span> <br /> 
                            <span className="text-5xl normal-case font-serif tracking-normal">Chạm tới cảm xúc điện ảnh</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
                            Đắm chìm vào không gian nghệ thuật với hệ thống âm thanh Dolby Atmos và màn hình IMAX thế hệ mới nhất tại CinePBL5.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <Link to="/register" className="bg-[#C9A84C] text-[#0A0A0F] px-10 py-4 rounded-xl font-black flex items-center gap-3 hover:bg-yellow-500 transition-all shadow-xl shadow-[#C9A84C]/10 active:scale-95">
                                <Ticket size={20} /> ĐĂNG KÝ NGAY
                            </Link>
                            <Link to="/login" className="bg-white/5 backdrop-blur-md border border-white/10 px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all">
                                <Play size={18} fill="white" /> ĐĂNG NHẬP
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. MAIN GRID (Information Architecture) */}
            <main className="container mx-auto px-10 -mt-24 relative z-30 pb-20">
                <div className="grid grid-cols-12 gap-8">
                    
                    {/* TRÁI: DANH SÁCH PHIM (2/3) */}
                    <div className="col-span-12 lg:col-span-8 space-y-10">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-3">
                                    <div className="w-1.5 h-8 bg-[#C9A84C]"></div>
                                    Phim Đang Chiếu
                                </h2>
                            </div>
                            <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-[#C9A84C] flex items-center">
                                XEM TẤT CẢ <ChevronRight size={16} />
                            </Link>
                        </div>

                        {/* Movies Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {movies.map((movie) => (
                                <div key={movie.id} className="bg-[#16161f] border border-white/5 rounded-2xl overflow-hidden hover:border-[#C9A84C]/40 transition-all duration-300 group shadow-lg">
                                    <div className="relative h-64 overflow-hidden">
                                        <img src={movie.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={movie.title} />
                                        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg text-[#C9A84C] flex items-center gap-1 text-xs font-bold border border-white/10">
                                            <Star size={12} fill="#C9A84C" /> {movie.rating}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold mb-1 truncate">{movie.title}</h3>
                                        <p className="text-gray-500 text-sm mb-4">{movie.genre} • {movie.duration}</p>
                                        <Link to="/login" className="w-full block text-center py-3 bg-[#C9A84C]/10 text-[#C9A84C] rounded-xl font-bold border border-[#C9A84C]/20 hover:bg-[#C9A84C] hover:text-black transition-all">
                                            ĐẶT VÉ
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PHẢI: THÔNG TIN PHỤ TRỢ (1/3) */}
                    <div className="col-span-12 lg:col-span-4 space-y-8">
                        {/* Quick Action Card */}
                        <div className="bg-gradient-to-br from-[#16161f] to-[#0A0A0F] border border-[#C9A84C]/20 p-8 rounded-3xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-[#C9A84C] font-black text-xl mb-2">ƯU ĐÃI THÀNH VIÊN</h3>
                                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                    Đăng ký tài khoản CinePBL5 ngay để nhận ưu đãi giảm 20% cho lần đặt vé đầu tiên.
                                </p>
                                <Link to="/register" className="w-full inline-flex items-center justify-center gap-2 bg-[#C9A84C] text-[#0A0A0F] py-3 rounded-xl font-black">
                                    THAM GIA NGAY
                                </Link>
                            </div>
                            <div className="absolute -bottom-4 -right-4 opacity-10">
                                <Ticket size={120} />
                            </div>
                        </div>

                        {/* Recent Events/News */}
                        <div className="bg-[#16161f] border border-white/5 p-6 rounded-3xl space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 border-b border-white/5 pb-4">Tin tức điện ảnh</h3>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-4 group cursor-pointer">
                                    <div className="w-20 h-20 bg-gray-800 rounded-xl flex-shrink-0 animate-pulse"></div>
                                    <div>
                                        <h4 className="text-sm font-bold group-hover:text-[#C9A84C] transition-colors line-clamp-2">CinePBL5 khai trương cụm rạp thứ {i} tại trung tâm thành phố</h4>
                                        <p className="text-[10px] text-gray-500 mt-2 uppercase flex items-center gap-1">
                                            <Calendar size={10} /> 20 Tháng 4, 2026
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>

            {/* 3. FOOTER (Branding) */}
            <footer className="bg-black border-t border-white/5 py-12">
                <div className="container mx-auto px-10 text-center space-y-6">
                    <div className="flex items-center justify-center gap-2 text-2xl font-black text-[#C9A84C] italic">
                        <Play size={24} fill="#C9A84C" /> CINEPBL5
                    </div>
                    <p className="text-gray-500 text-xs tracking-[0.2em] uppercase font-bold">
                        Hệ thống đặt vé chuyên nghiệp & Đẳng cấp
                    </p>
                    <div className="flex justify-center gap-8 pt-4">
                        <Link to="/login" className="text-gray-400 hover:text-white text-sm transition-colors">Điều khoản</Link>
                        <Link to="/login" className="text-gray-400 hover:text-white text-sm transition-colors">Bảo mật</Link>
                        <Link to="/login" className="text-gray-400 hover:text-white text-sm transition-colors">Liên hệ</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicHomePage;