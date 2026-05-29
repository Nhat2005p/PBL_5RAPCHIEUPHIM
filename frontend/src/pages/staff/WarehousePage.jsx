import { useState, useEffect } from 'react';
import warehouseApi from '../../api/warehouseApi'; // Dùng API chuẩn
import { toast } from 'react-toastify';
import { Package, ArrowUpCircle, ArrowDownCircle, AlertTriangle, History, Search, Plus, Filter } from 'lucide-react';

const WarehousePage = () => {
    const [products, setProducts] = useState([]);
    const [logs, setLogs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    
    const [form, setForm] = useState({
        product: '', trans_type: 'IMPORT', quantity: '', reason: ''
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [prodRes, logRes] = await Promise.all([
                warehouseApi.getProducts(),
                warehouseApi.getLogs()
            ]);
            setProducts(prodRes.data);
            setLogs(logRes.data);
        } catch (error) { toast.error("Lỗi tải dữ liệu kho!"); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await warehouseApi.createLog(form);
            toast.success("Tạo phiếu thành công!");
            setShowModal(false);
            setForm({ product: '', trans_type: 'IMPORT', quantity: '', reason: '' });
            fetchData(); 
        } catch (error) {
            toast.error(error.response?.data?.non_field_errors?.[0] || "Lỗi tạo phiếu!");
        }
    };

    const lowStockCount = products.filter(p => p.stock_quantity <= p.min_threshold).length;

    return (
        <div className="min-h-screen bg-[#0f172a] p-8 text-white font-sans">
            <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                <h1 className="text-3xl font-bold text-[#f3ea28] flex items-center gap-3">
                    <Package size={32}/> QUẢN LÝ KHO (DÀNH CHO NHÂN VIÊN)
                </h1>
                <button onClick={() => setShowModal(true)} className="bg-green-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-green-700 flex items-center gap-2 transition">
                    <Plus size={20}/> TẠO PHIẾU NHẬP/XUẤT
                </button>
            </div>

            {/* DASHBOARD MINI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-700 shadow-lg">
                    <h3 className="text-gray-400 font-bold uppercase text-xs">Tổng mặt hàng</h3>
                    <p className="text-3xl font-bold mt-2 text-blue-400">{products.length}</p>
                </div>
                <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-700 shadow-lg">
                    <h3 className="text-gray-400 font-bold uppercase text-xs">Cảnh báo sắp hết</h3>
                    <p className="text-3xl font-bold mt-2 text-red-500 flex items-center gap-2">
                        {lowStockCount} <AlertTriangle size={24}/>
                    </p>
                </div>
                <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-700 shadow-lg">
                    <h3 className="text-gray-400 font-bold uppercase text-xs">Giao dịch hôm nay</h3>
                    <p className="text-3xl font-bold mt-2 text-[#f3ea28]">
                        {logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* BẢNG TỒN KHO */}
                <div className="lg:col-span-2 bg-[#1e293b] rounded-xl border border-gray-700 overflow-hidden shadow-lg">
                    <div className="p-4 bg-[#0f172a] border-b border-gray-700 font-bold text-lg text-[#f3ea28]">📦 DANH SÁCH TỒN KHO</div>
                    <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#1e293b] text-gray-400 uppercase sticky top-0 shadow-md">
                                <tr>
                                    <th className="p-4">Mã</th>
                                    <th className="p-4">Tên sản phẩm</th>
                                    <th className="p-4 text-center">Đơn vị</th>
                                    <th className="p-4 text-right">Số lượng</th>
                                    <th className="p-4 text-center">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {products.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-800 transition">
                                        <td className="p-4 font-mono text-gray-400">{p.code}</td>
                                        <td className="p-4 font-bold">{p.name}</td>
                                        <td className="p-4 text-center">{p.unit}</td>
                                        <td className="p-4 text-right font-mono text-lg">{p.stock_quantity}</td>
                                        <td className="p-4 text-center">
                                            {p.stock_quantity <= p.min_threshold ? (
                                                <span className="bg-red-900/50 text-red-400 px-2 py-1 rounded text-xs font-bold border border-red-500">Sắp hết</span>
                                            ) : (
                                                <span className="bg-green-900/50 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500">Đủ hàng</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* LỊCH SỬ GIAO DỊCH */}
                <div className="bg-[#1e293b] rounded-xl border border-gray-700 overflow-hidden shadow-lg flex flex-col max-h-[600px]">
                    <div className="p-4 bg-[#0f172a] border-b border-gray-700 font-bold text-lg flex items-center gap-2 text-[#f3ea28]">
                        <History size={20}/> LỊCH SỬ NHẬP/XUẤT
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {logs.map(log => (
                            <div key={log.id} className="flex gap-3 border-b border-gray-700 pb-3 last:border-0">
                                <div className={`mt-1 ${log.trans_type === 'IMPORT' ? 'text-green-400' : 'text-red-400'}`}>
                                    {log.trans_type === 'IMPORT' ? <ArrowDownCircle size={24}/> : <ArrowUpCircle size={24}/>}
                                </div>
                                <div>
                                    <div className="font-bold text-white">
                                        {log.trans_type === 'IMPORT' ? 'Nhập kho' : 'Xuất kho'} <span className="text-[#f3ea28]">{log.quantity} {log.product_unit}</span>
                                    </div>
                                    <div className="text-sm text-gray-300">{log.product_name}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {new Date(log.created_at).toLocaleString('vi-VN')} • NV: {log.staff_name}
                                    </div>
                                    {log.reason && <div className="text-xs text-gray-400 italic mt-1">"{log.reason}"</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL FORM */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1e293b] w-full max-w-md rounded-xl border border-gray-600 shadow-2xl p-6">
                        <h2 className="text-xl font-bold text-[#f3ea28] mb-4">LẬP PHIẾU KHO</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-2 bg-[#0f172a] p-1 rounded-lg border border-gray-700">
                                <button type="button" onClick={() => setForm({...form, trans_type: 'IMPORT'})}
                                    className={`py-2 rounded font-bold transition ${form.trans_type === 'IMPORT' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                >NHẬP KHO</button>
                                <button type="button" onClick={() => setForm({...form, trans_type: 'EXPORT'})}
                                    className={`py-2 rounded font-bold transition ${form.trans_type === 'EXPORT' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                >XUẤT / HỦY</button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Sản phẩm</label>
                                <select required className="w-full bg-[#0f172a] border border-gray-600 rounded p-3 text-white focus:border-[#f3ea28] outline-none"
                                    value={form.product} onChange={e => setForm({...form, product: e.target.value})}>
                                    <option value="">-- Chọn sản phẩm --</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (Tồn: {p.stock_quantity} {p.unit})</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Số lượng</label>
                                <input required type="number" min="1" className="w-full bg-[#0f172a] border border-gray-600 rounded p-3 text-white font-bold text-lg focus:border-[#f3ea28] outline-none"
                                    value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Ghi chú</label>
                                <textarea className="w-full bg-[#0f172a] border border-gray-600 rounded p-3 text-white h-20 focus:border-[#f3ea28] outline-none"
                                    placeholder="VD: Nhập hàng NCC A / Xuất bán quầy..."
                                    value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition">Hủy</button>
                                <button type="submit" className="bg-[#f3ea28] text-black font-bold px-6 py-2 rounded hover:bg-yellow-400 transition">
                                    LƯU PHIẾU
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarehousePage;