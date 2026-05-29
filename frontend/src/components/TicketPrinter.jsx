import React, { forwardRef } from 'react';

const TicketPrinter = forwardRef(({ bookingData, seats }, ref) => {
    if (!bookingData) return null;

    return (
        <div ref={ref} className="hidden print:block p-4 text-black bg-white" style={{ fontFamily: 'monospace' }}>
            <div className="text-center mb-4 border-b border-black pb-2">
                <h1 className="text-2xl font-bold uppercase">CINESTAR CINEMAS</h1>
                <p>ĐC: 123 Nguyễn Lương Bằng, Đà Nẵng</p>
                <p>Hotline: 1900 1234</p>
            </div>

            <div className="mb-4">
                <h2 className="text-xl font-bold uppercase mb-2">{bookingData.movie_title}</h2>
                <div className="flex justify-between">
                    <span>Rạp: {bookingData.cinema}</span>
                    <span>Phòng: {bookingData.room}</span>
                </div>
                <div className="flex justify-between font-bold">
                    <span>Ngày: {bookingData.date}</span>
                    <span>Giờ: {bookingData.time}</span>
                </div>
            </div>

            <div className="border-t border-b border-black py-2 mb-4">
                <div className="flex justify-between font-bold">
                    <span>Ghế ({seats.length})</span>
                    <span>Giá vé</span>
                </div>
                {seats.map((seat, idx) => (
                    <div key={idx} className="flex justify-between">
                        <span>{seat.row}{seat.number} ({seat.seat_type})</span>
                        <span>{parseInt(seat.price).toLocaleString()}đ</span>
                    </div>
                ))}
            </div>

            <div className="text-right text-xl font-bold mb-6">
                TỔNG TIỀN: {parseInt(bookingData.total).toLocaleString()} VND
            </div>

            <div className="text-center text-sm">
                <p>Mã vé: <span className="font-bold text-lg">{bookingData.code}</span></p>
                <p className="mt-2">Cảm ơn quý khách. Chúc quý khách xem phim vui vẻ!</p>
                <p>--------------------------------</p>
            </div>
        </div>
    );
});

export default TicketPrinter;