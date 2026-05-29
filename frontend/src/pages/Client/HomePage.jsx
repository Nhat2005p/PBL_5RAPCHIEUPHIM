import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import cinemaApi from '../../api/cinemaApi';
import MovieCard from '../../components/MovieCard'; // <-- Import MovieCard của bạn vào đây

const HomePage = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await cinemaApi.getPublicMovies();
                setMovies(res.data);
            } catch (error) {
                console.error("Lỗi lấy danh sách phim", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, []);

    if (loading) return <div className="text-center mt-20 text-white font-bold text-xl animate-pulse">Đang tải vũ trụ điện ảnh...</div>;

    const nowShowing = movies.filter(m => m.status === 'NOW_SHOWING');
    const comingSoon = movies.filter(m => m.status === 'COMING_SOON');

    const MovieGrid = ({ title, data, isComingSoon }) => (
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-8 bg-[#f3ea28] rounded-full"></div>
                <h2 className="text-2xl font-black text-white uppercase tracking-wider">{title}</h2>
            </div>
            
            {data.length === 0 ? (
                <div className="text-gray-500 italic">Đang cập nhật danh sách phim...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {data.map(movie => (
                        <Link to={`/movie/${movie.id}`} key={movie.id} className="block transition-transform hover:-translate-y-2">
                            {/* SỬ DỤNG MOVIECARD Ở ĐÂY */}
                            <MovieCard 
                                title={movie.title}
                                image={movie.poster}
                                tag={movie.age_rating}
                                type={movie.format || '2D'}
                                isComingSoon={isComingSoon}
                            />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] pt-24 pb-12 px-4 md:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <MovieGrid title="PHIM ĐANG CHIẾU" data={nowShowing} isComingSoon={false} />
                <MovieGrid title="PHIM SẮP CHIẾU" data={comingSoon} isComingSoon={true} />
            </div>
        </div>
    );
};

export default HomePage;