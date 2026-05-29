import axiosClient from './axiosClient';

const bookingApi = {
    // 1. Lấy sơ đồ ghế và trạng thái (Đã bán/Trống/Đang chọn)
    getSeatStatus: (showtimeId) => axiosClient.get(`cinema/showtimes/${showtimeId}/seats_status/`),

    // 2. Tạo đơn đặt vé mới
    createBooking: (data) => axiosClient.post('bookings/', data),

    // 3. Lấy danh sách vé (Lịch sử)
    getAll: () => axiosClient.get('bookings/'),

    // 4. Hủy vé (Dành cho chức năng Hoàn vé của nhân viên)
    cancelBooking: (code, reason) => axiosClient.post('bookings/cancel/', { code, reason }),

    // 5. Soát vé (Check-in QR Code)
    checkInTicket: (code) => axiosClient.post('bookings/check-in/', { code }),

    // 6. Lấy bắp nước từ Warehouse (Dành cho POS bán tại quầy)
    getProducts: () => axiosClient.get('warehouse/products/'),
};

export default bookingApi;