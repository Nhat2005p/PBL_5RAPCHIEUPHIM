import axiosClient from './axiosClient';

const cinemaApi = {
    // --- DÀNH CHO ADMIN ---
    getCinemas: () => axiosClient.get('cinema/cinemas/'),
    getRooms: () => axiosClient.get('cinema/rooms/'),
    createRoom: (data) => axiosClient.post('cinema/rooms/', data),
    deleteRoom: (id) => axiosClient.delete(`cinema/rooms/${id}/`),
    updateSeatType: (seatIds, newType) => axiosClient.post('cinema/seats/bulk-update/', {
        seat_ids: seatIds, seat_type: newType
    }),

    // --- DÀNH CHO KHÁCH HÀNG ---
    // 1. Lấy danh sách phim đang/sắp chiếu
    getPublicMovies: (status = '') => {
        const url = status ? `cinema/public-movies/?status=${status}` : 'cinema/public-movies/';
        return axiosClient.get(url);
    },
    // 2. Xem chi tiết 1 bộ phim
    getMovieDetail: (id) => axiosClient.get(`cinema/public-movies/${id}/`),
    // 3. Lấy lịch chiếu của 1 phim
    getShowtimes: (movieId) => axiosClient.get(`cinema/showtimes/?movie=${movieId}`),
    // 4. Lấy review của 1 phim
    getReviews: (movieId) => axiosClient.get(`cinema/reviews/?movie_id=${movieId}`),
};

export default cinemaApi;