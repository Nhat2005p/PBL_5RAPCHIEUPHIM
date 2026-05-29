import React, { forwardRef } from 'react';

const ReceiptPrinter = forwardRef(({ cart, total, staffName }, ref) => {
    return (
        <div ref={ref} className="hidden print:block p-4 text-black bg-white font-mono text-sm">
            <div className="text-center mb-4 border-b border-dashed border-black pb-2">
                <h2 className="text-xl font-bold">CINESTAR CONCESSION</h2>
                <p>HÓA ĐƠN BÁN LẺ</p>
                <p>{new Date().toLocaleString('vi-VN')}</p>
                <p>Thu ngân: {staffName || 'Staff'}</p>
            </div>

            <table className="w-full mb-4">
                <thead>
                    <tr className="border-b border-black text-left">
                        <th>Món</th>
                        <th className="text-center">SL</th>
                        <th className="text-right">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {cart.map((item, index) => (
                        <tr key={index}>
                            <td>{item.name}</td>
                            <td className="text-center">{item.qty}</td>
                            <td className="text-right">{(item.price * item.qty).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="border-t border-dashed border-black pt-2 text-right text-xl font-bold">
                TỔNG: {total.toLocaleString()} đ
            </div>
            <div className="text-center mt-4 text-xs">
                <p>Cảm ơn quý khách!</p>
            </div>
        </div>
    );
});

export default ReceiptPrinter;