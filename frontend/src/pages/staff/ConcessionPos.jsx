import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
import concessionApi from '../../api/concessionApi'; // Đổi sang dùng API chuẩn
import bookingApi from '../../api/bookingApi';
import ReceiptPrinter from '../../components/ReceiptPrinter';
import { ShoppingCart, Trash2, Plus, Minus, Coffee, Printer, CheckCircle } from 'lucide-react';

const ConcessionPos = () => {
    const [menu, setMenu] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const componentRef = useRef();
    const handlePrint = useReactToPrint({ content: () => componentRef.current });

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await concessionApi.getAll(); // Dùng concessionApi cho chuẩn
                setMenu(res.data);
            } catch (error) { toast.error("Lỗi tải menu bắp nước!"); }
        };
        fetchMenu();
    }, []);

    const addToCart = (item) => {
        setCart(prev => {
            const exist = prev.find(i => i.id === item.id);
            if (exist) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { ...item, qty: 1 }];
        });
    };

    const updateQty = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) return { ...item, qty: Math.max(0, item.qty + delta) };
            return item;
        }).filter(item => item.qty > 0));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (!window.confirm(`Xác nhận thanh toán ${totalAmount.toLocaleString()}đ?`)) return;

        setLoading(true);
        try {
            const payload = {
                showtime_id: null, // Đơn bán lẻ
                payment_method: 'CASH',
                concessions: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.qty
                }))
            };

            // FIX LỖI Ở ĐÂY: Đổi create thành createBooking
            await bookingApi.createBooking(payload); 
            
            handlePrint();
            setCart([]);
            toast.success("Thanh toán thành công! Đang in hóa đơn...");
        } catch (error) {
            toast.error("Lỗi thanh toán: " + (error.response?.data?.non_field_errors?.[0] || "Lỗi hệ thống"));
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    return (
        <div className="flex h-screen bg-[#0f172a] text-white font-sans overflow-hidden">
            {/* CỘT TRÁI: MENU */}
            <div className="flex-1 flex flex-col border-r border-gray-700">
                <div className="p-4 bg-[#1e293b] border-b border-gray-700 shadow-md z-10">
                    <h1 className="text-xl font-bold text-[#f3ea28] flex items-center gap-2">
                        <Coffee /> BÁN LẺ BẮP NƯỚC
                    </h1>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {menu.map(item => (
                            <div key={item.id} onClick={() => addToCart(item)}
                                className="bg-[#1e293b] rounded-xl overflow-hidden cursor-pointer hover:border hover:border-[#f3ea28] transition shadow-lg group relative"
                            >
                                <div className="h-32 bg-gray-800 flex items-center justify-center">
                                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover"/> : <Coffee size={40} className="text-gray-500"/>}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-sm leading-tight mb-1 truncate" title={item.name}>{item.name}</h3>
                                    <p className="text-[#f3ea28] font-bold text-lg">{parseInt(item.price).toLocaleString()}đ</p>
                                </div>
                                <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                                    <Plus size={40} className="text-white drop-shadow-md"/>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CỘT PHẢI: GIỎ HÀNG */}
            <div className="w-[400px] bg-[#1e293b] flex flex-col shadow-2xl z-20">
                <div className="p-5 border-b border-gray-700 bg-[#0f172a]">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-[#f3ea28]">
                        <ShoppingCart /> Giỏ Hàng <span className="text-sm font-normal text-gray-400">({cart.length} món)</span>
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10">Chưa có món nào</div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="bg-[#0f172a] border border-gray-700 p-3 rounded-lg flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="font-bold text-sm">{item.name}</div>
                                    <div className="text-[#f3ea28] text-sm">{parseInt(item.price).toLocaleString()}đ</div>
                                </div>
                                <div className="flex items-center gap-3 bg-[#1e293b] rounded px-2 py-1 border border-gray-600">
                                    <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:text-red-400"><Minus size={14}/></button>
                                    <span className="font-bold w-4 text-center text-sm">{item.qty}</span>
                                    <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:text-green-400"><Plus size={14}/></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-[#0f172a] border-t border-gray-700">
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-gray-400 font-bold uppercase text-sm">Tổng thanh toán</span>
                        <span className="text-3xl font-black text-[#f3ea28]">{totalAmount.toLocaleString()}đ</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                         <button onClick={() => setCart([])} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition">
                            <Trash2 size={18}/> Hủy
                        </button>
                        <button onClick={handleCheckout} disabled={loading || cart.length === 0}
                            className={`font-black py-3 rounded-xl flex items-center justify-center gap-2 transition ${cart.length > 0 ? 'bg-[#f3ea28] text-black hover:bg-yellow-400 shadow-[0_0_15px_rgba(243,234,40,0.3)]' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                        >
                            {loading ? 'ĐANG XỬ LÝ...' : <><Printer size={20}/> IN BILL</>}
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: "none" }}>
                <ReceiptPrinter ref={componentRef} cart={cart} total={totalAmount} staffName="Nhân viên quầy" />
            </div>
        </div>
    );
};

export default ConcessionPos;