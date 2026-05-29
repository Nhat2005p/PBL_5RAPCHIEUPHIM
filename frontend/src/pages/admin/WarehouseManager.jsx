import React, { useState, useEffect } from 'react';
import warehouseApi from '../../api/warehouseApi';
import { Package, History, Plus, Edit, Trash2, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, X } from 'lucide-react';
import { toast } from 'react-toastify';

const WarehouseManager = () => {
    const [activeTab, setActiveTab] = useState('PRODUCTS'); // PRODUCTS | LOGS
    
    return (
        <div className="min-h-screen bg-[#0f172a] p-8 text-white font-sans">
            <h1 className="text-3xl font-bold text-[#f3ea28] mb-6 flex items-center gap-2">
                <Package size={32}/> QUẢN LÝ KHO HÀNG
            </h1>

            {/* TABS HEADER */}
            <div className="flex gap-4 mb-8 border-b border-gray-700">
                <button 
                    onClick={() => setActiveTab('PRODUCTS')}
                    className={`pb-3 px-4 font-bold flex items-center gap-2 transition ${activeTab === 'PRODUCTS' ? 'text-[#f3ea28] border-b-2 border-[#f3ea28]' : 'text-gray-400 hover:text-white'}`}
                >
                    <Package size={18}/> Sản Phẩm & Tồn Kho
                </button>
                <button 
                    onClick={() => setActiveTab('LOGS')}
                    className={`pb-3 px-4 font-bold flex items-center gap-2 transition ${activeTab === 'LOGS' ? 'text-[#f3ea28] border-b-2 border-[#f3ea28]' : 'text-gray-400 hover:text-white'}`}
                >
                    <History size={18}/> Lịch Sử Nhập / Xuất
                </button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'PRODUCTS' ? <ProductsTab /> : <LogsTab />}
        </div>
    );
};

// ==========================================
// COMPONENT 1: QUẢN LÝ SẢN PHẨM & TỒN KHO
// ==========================================
const ProductsTab = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const initialForm = {
        code: '', name: '', category: 'FOOD', unit: 'PCS',
        price: 0, min_threshold: 10, is_active: true, image: null
    };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        const delaySearch = setTimeout(() => { fetchProducts(); }, 500);
        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    const fetchProducts = async () => {
        try {
            const res = await warehouseApi.getProducts(searchTerm);
            setProducts(res.data);
        } catch (error) { toast.error("Lỗi lấy danh sách sản phẩm!"); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'image' && !formData[key]) return; // Không gửi ảnh nếu không chọn
            submitData.append(key, formData[key]);
        });

        try {
            if (editingItem) {
                await warehouseApi.updateProduct(editingItem.id, submitData);
                toast.success("Cập nhật thành công!");
            } else {
                await warehouseApi.createProduct(submitData);
                toast.success("Thêm sản phẩm thành công!");
            }
            setShowForm(false);
            fetchProducts();
        } catch (error) { toast.error("Lỗi dữ liệu (Có thể trùng Mã SKU)!"); }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
        try {
            await warehouseApi.deleteProduct(id);
            fetchProducts();
        } catch (error) { toast.error("Sản phẩm đã có lịch sử kho, không thể xóa!"); }
    };

    const openAdd = () => { setEditingItem(null); setFormData(initialForm); setShowForm(true); };
    const openEdit = (item) => { setEditingItem(item); setFormData({ ...item, image: null }); setShowForm(true); };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <input 
                    type="text" placeholder="Tìm kiếm theo mã SKU hoặc Tên..."
                    className="w-1/3 bg-[#1e293b] border border-gray-600 rounded p-2 text-white"
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                />
                <button onClick={openAdd} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold flex items-center gap-2">
                    <Plus size={18}/> Thêm Sản Phẩm
                </button>
            </div>

            <div className="bg-[#1e293b] rounded-xl overflow-hidden border border-gray-700">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#0f172a] text-[#f3ea28] uppercase font-bold">
                        <tr>
                            <th className="p-4">SKU / Sản phẩm</th>
                            <th className="p-4">Danh mục</th>
                            <th className="p-4 text-right">Tồn kho hiện tại</th>
                            <th className="p-4 text-center">Trạng thái</th>
                            <th className="p-4 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {products.map(p => {
                            const isLowStock = p.stock_quantity <= p.min_threshold;
                            return (
                                <tr key={p.id} className="hover:bg-gray-800">
                                    <td className="p-4">
                                        <div className="font-bold text-white">{p.name}</div>
                                        <div className="text-xs text-gray-400">Mã: {p.code} | Giá: {parseInt(p.price).toLocaleString()}đ</div>
                                    </td>
                                    <td className="p-4">{p.category}</td>
                                    <td className="p-4 text-right">
                                        <div className={`font-bold text-lg ${isLowStock ? 'text-red-500' : 'text-green-400'}`}>
                                            {p.stock_quantity} <span className="text-sm font-normal text-gray-400">{p.unit}</span>
                                        </div>
                                        {isLowStock && <div className="text-[10px] text-red-500 flex items-center justify-end gap-1"><AlertTriangle size={12}/> Sắp hết hàng</div>}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${p.is_active ? 'bg-blue-900/50 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
                                            {p.is_active ? 'Đang bán' : 'Ngừng bán'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => openEdit(p)} className="p-2 text-blue-400 hover:bg-blue-600/20 rounded"><Edit size={16}/></button>
                                        <button onClick={() => handleDelete(p.id)} className="p-2 text-red-400 hover:bg-red-600/20 rounded"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* MODAL THÊM/SỬA SẢN PHẨM */}
            {showForm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1e293b] w-full max-w-2xl rounded-xl border border-gray-600 p-6">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                            <h2 className="text-xl font-bold text-[#f3ea28]">{editingItem ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X size={24}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-gray-400 block mb-1">Mã SKU</label><input required className="w-full bg-[#0f172a] border border-gray-600 rounded p-2" value={formData.code} onChange={e=>setFormData({...formData, code: e.target.value})}/></div>
                                <div><label className="text-xs text-gray-400 block mb-1">Tên sản phẩm</label><input required className="w-full bg-[#0f172a] border border-gray-600 rounded p-2" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})}/></div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Danh mục</label>
                                    <select className="w-full bg-[#0f172a] border border-gray-600 rounded p-2" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})}>
                                        <option value="FOOD">Đồ ăn</option><option value="DRINK">Đồ uống</option><option value="PACKAGING">Bao bì</option><option value="OTHER">Khác</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Đơn vị</label>
                                    <select className="w-full bg-[#0f172a] border border-gray-600 rounded p-2" value={formData.unit} onChange={e=>setFormData({...formData, unit: e.target.value})}>
                                        <option value="PCS">Cái/Lon</option><option value="KG">Kilogram</option><option value="BOX">Thùng</option><option value="BAG">Bao</option>
                                    </select>
                                </div>
                                <div><label className="text-xs text-gray-400 block mb-1">Giá nhập/vốn</label><input type="number" className="w-full bg-[#0f172a] border border-gray-600 rounded p-2" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})}/></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-gray-400 block mb-1">Cảnh báo sắp hết (Số lượng)</label><input type="number" className="w-full bg-[#0f172a] border border-gray-600 rounded p-2" value={formData.min_threshold} onChange={e=>setFormData({...formData, min_threshold: e.target.value})}/></div>
                                <div><label className="text-xs text-gray-400 block mb-1">Tải ảnh lên</label><input type="file" accept="image/*" className="w-full bg-[#0f172a] border border-gray-600 rounded p-1 text-sm" onChange={e=>setFormData({...formData, image: e.target.files[0]})}/></div>
                            </div>
                            <div className="flex justify-end pt-4"><button className="bg-[#f3ea28] text-black px-6 py-2 rounded font-bold">Lưu Thông Tin</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==========================================
// COMPONENT 2: LỊCH SỬ NHẬP XUẤT (PHIẾU KHO)
// ==========================================
const LogsTab = () => {
    const [logs, setLogs] = useState([]);
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ product: '', trans_type: 'IMPORT', quantity: '', reason: '' });

    useEffect(() => {
        fetchLogs();
        fetchProducts(); // Lấy ds sản phẩm để đổ vào Select
    }, []);

    const fetchLogs = async () => {
        const res = await warehouseApi.getLogs();
        setLogs(res.data);
    };

    const fetchProducts = async () => {
        const res = await warehouseApi.getProducts();
        setProducts(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await warehouseApi.createLog(formData);
            toast.success("Tạo phiếu thành công! Tồn kho đã được cập nhật tự động.");
            setShowForm(false);
            fetchLogs();
        } catch (error) { toast.error(error.response?.data?.non_field_errors?.[0] || "Lỗi tạo phiếu! Không đủ hàng để xuất."); }
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => {setFormData({ product: '', trans_type: 'IMPORT', quantity: '', reason: '' }); setShowForm(true);}} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-bold flex items-center gap-2">
                    <Plus size={18}/> Tạo Phiếu Nhập/Xuất Mới
                </button>
            </div>

            <div className="bg-[#1e293b] rounded-xl overflow-hidden border border-gray-700">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#0f172a] text-[#f3ea28] uppercase font-bold">
                        <tr>
                            <th className="p-4">Thời gian</th>
                            <th className="p-4">Sản phẩm</th>
                            <th className="p-4 text-center">Loại phiếu</th>
                            <th className="p-4 text-center">Số lượng</th>
                            <th className="p-4">Lý do</th>
                            <th className="p-4">Người lập phiếu</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-gray-800">
                                <td className="p-4 text-gray-400">{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                                <td className="p-4 font-bold">{log.product_name}</td>
                                <td className="p-4 text-center">
                                    {log.trans_type === 'IMPORT' 
                                        ? <span className="bg-green-900/50 text-green-400 px-2 py-1 rounded text-xs flex items-center justify-center gap-1 w-24 mx-auto"><ArrowDownToLine size={12}/> Nhập kho</span>
                                        : <span className="bg-red-900/50 text-red-400 px-2 py-1 rounded text-xs flex items-center justify-center gap-1 w-24 mx-auto"><ArrowUpFromLine size={12}/> Xuất kho</span>
                                    }
                                </td>
                                <td className="p-4 text-center font-bold text-lg">{log.quantity} <span className="text-xs text-gray-400 font-normal">{log.product_unit}</span></td>
                                <td className="p-4 text-gray-400 text-xs">{log.reason || '-'}</td>
                                <td className="p-4 text-blue-400 font-bold">@{log.staff_name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL TẠO PHIẾU */}
            {showForm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1e293b] w-full max-w-md rounded-xl border border-gray-600 p-6">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                            <h2 className="text-xl font-bold text-[#f3ea28]">Tạo Phiếu Nhập / Xuất Kho</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X size={24}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Chọn sản phẩm</label>
                                <select required className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white" value={formData.product} onChange={e=>setFormData({...formData, product: e.target.value})}>
                                    <option value="">-- Chọn --</option>
                                    {products.map(p => <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Loại giao dịch</label>
                                    <select className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white" value={formData.trans_type} onChange={e=>setFormData({...formData, trans_type: e.target.value})}>
                                        <option value="IMPORT">NHẬP KHO (Cộng)</option>
                                        <option value="EXPORT">XUẤT KHO (Trừ)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Số lượng</label>
                                    <input required type="number" min="1" className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white" value={formData.quantity} onChange={e=>setFormData({...formData, quantity: e.target.value})}/>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Lý do / Ghi chú</label>
                                <textarea className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white" value={formData.reason} onChange={e=>setFormData({...formData, reason: e.target.value})}></textarea>
                            </div>
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-bold mt-4">Tạo Phiếu Ngay</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarehouseManager;