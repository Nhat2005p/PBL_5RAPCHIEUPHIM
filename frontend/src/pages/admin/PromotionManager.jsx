import { useState, useEffect } from 'react';
import promotionApi from '../../api/promotionApi';
import { Tag, Settings, Plus, Trash2, Edit, Save, Gift, Percent } from 'lucide-react';

const PromotionManager = () => {
    const [activeTab, setActiveTab] = useState('VOUCHERS'); // 'VOUCHERS' | 'LOYALTY'

    return (
        <div className="min-h-screen bg-[#0f172a] p-8 text-white font-sans">
            <h1 className="text-3xl font-bold text-[#f3ea28] mb-6 flex items-center gap-2">
                <Gift size={32}/> QUẢN LÝ KHUYẾN MÃI
            </h1>

            {/* TABS HEADER */}
            <div className="flex gap-4 mb-8 border-b border-gray-700">
                <button 
                    onClick={() => setActiveTab('VOUCHERS')}
                    className={`pb-3 px-4 font-bold flex items-center gap-2 transition ${activeTab === 'VOUCHERS' ? 'text-[#f3ea28] border-b-2 border-[#f3ea28]' : 'text-gray-400 hover:text-white'}`}
                >
                    <Tag size={18}/> Danh Sách Voucher
                </button>
                <button 
                    onClick={() => setActiveTab('LOYALTY')}
                    className={`pb-3 px-4 font-bold flex items-center gap-2 transition ${activeTab === 'LOYALTY' ? 'text-[#f3ea28] border-b-2 border-[#f3ea28]' : 'text-gray-400 hover:text-white'}`}
                >
                    <Settings size={18}/> Cấu Hình Tích Điểm
                </button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'VOUCHERS' ? <VoucherTab /> : <LoyaltyTab />}
        </div>
    );
};

// --- COMPONENT CON: QUẢN LÝ VOUCHER ---
const VoucherTab = () => {
    const [promotions, setPromotions] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const initialForm = {
        name: '', code: '', description: '',
        discount_type: 'PERCENT', discount_value: '',
        min_spend: 0, max_discount: 0, quantity_limit: 100,
        start_date: '', valid_until: '', is_active: true
    };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => { fetchPromotions(); }, []);

    const fetchPromotions = async () => {
        // SỬA DÒNG NÀY (Từ getAll thành getPromotions):
        const res = await promotionApi.getPromotions();
        setPromotions(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await promotionApi.update(editingItem.id, formData);
                alert("Cập nhật thành công!");
            } else {
                await promotionApi.create(formData);
                alert("Tạo Voucher thành công!");
            }
            setShowForm(false);
            fetchPromotions();
        } catch (error) {
            alert("Lỗi! Kiểm tra lại thông tin (Mã code phải duy nhất).");
        }
    };

    const handleDelete = async (id) => {
        if(confirm("Xóa voucher này?")) {
            await promotionApi.delete(id);
            fetchPromotions();
        }
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setFormData(item);
        setShowForm(true);
    };

    const openAdd = () => {
        setEditingItem(null);
        setFormData(initialForm);
        setShowForm(true);
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={openAdd} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold flex items-center gap-2">
                    <Plus size={18}/> Tạo Mã Mới
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promotions.map(p => (
                    <div key={p.id} className={`p-6 rounded-xl border border-gray-700 bg-[#1e293b] relative group ${!p.is_active ? 'opacity-60' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="bg-[#f3ea28] text-black font-bold px-2 py-1 rounded text-xs">{p.code}</span>
                            <div className="flex gap-2">
                                <button onClick={() => openEdit(p)} className="p-1 hover:text-blue-400"><Edit size={16}/></button>
                                <button onClick={() => handleDelete(p.id)} className="p-1 hover:text-red-400"><Trash2 size={16}/></button>
                            </div>
                        </div>
                        <h3 className="font-bold text-lg mb-1">{p.name}</h3>
                        <div className="text-2xl font-bold text-green-400 mb-2">
                            Giảm {parseInt(p.discount_value).toLocaleString()} 
                            {p.discount_type === 'PERCENT' ? '%' : 'đ'}
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                            <p>Đơn tối thiểu: {parseInt(p.min_spend).toLocaleString()}đ</p>
                            <p>Đã dùng: {p.used_count} / {p.quantity_limit}</p>
                            <p className="text-xs">HSD: {new Date(p.valid_until).toLocaleDateString('vi-VN')}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL FORM */}
            {showForm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1e293b] w-full max-w-2xl rounded-xl border border-gray-600 p-6 overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold text-[#f3ea28] mb-4">{editingItem ? 'Sửa Voucher' : 'Tạo Voucher Mới'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Tên chương trình</label>
                                    <input required className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white"
                                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Mã Code (Duy nhất)</label>
                                    <input required className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white uppercase font-bold"
                                        value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Loại giảm giá</label>
                                    <select className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white"
                                        value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value})}>
                                        <option value="PERCENT">Theo phần trăm (%)</option>
                                        <option value="AMOUNT">Theo số tiền (VND)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Giá trị giảm</label>
                                    <input required type="number" className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white"
                                        value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: e.target.value})} />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Ngày bắt đầu</label>
                                    <input required type="datetime-local" className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white"
                                        value={formData.start_date ? new Date(formData.start_date).toISOString().slice(0, 16) : ''} 
                                        onChange={e => setFormData({...formData, start_date: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Hạn sử dụng</label>
                                    <input required type="datetime-local" className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white"
                                        value={formData.valid_until ? new Date(formData.valid_until).toISOString().slice(0, 16) : ''} 
                                        onChange={e => setFormData({...formData, valid_until: e.target.value})} />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Số lượng tối đa</label>
                                    <input type="number" className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white"
                                        value={formData.quantity_limit} onChange={e => setFormData({...formData, quantity_limit: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Đơn tối thiểu</label>
                                    <input type="number" className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white"
                                        value={formData.min_spend} onChange={e => setFormData({...formData, min_spend: e.target.value})} />
                                </div>
                                {formData.discount_type === 'PERCENT' && (
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Giảm tối đa</label>
                                        <input type="number" className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white"
                                            value={formData.max_discount} onChange={e => setFormData({...formData, max_discount: e.target.value})} />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                                <label>Kích hoạt ngay</label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-600">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-400">Hủy</button>
                                <button type="submit" className="bg-[#f3ea28] text-black font-bold px-6 py-2 rounded">Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- COMPONENT CON: CẤU HÌNH TÍCH ĐIỂM ---
const LoyaltyTab = () => {
    const [policy, setPolicy] = useState({ earning_rate: 10000, redemption_rate: 1000, min_order_value_to_redeem: 0 });

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const res = await promotionApi.getLoyaltyPolicy();
                setPolicy(res.data);
            } catch (error) {
                console.error("Lỗi lấy cấu hình:", error);
            }
        };
        fetchPolicy();
    }, []);

    const handleSave = async () => {
        try {
            await promotionApi.updateLoyaltyPolicy(policy);
            alert("Đã lưu cấu hình tích điểm!");
        } catch (error) {
            alert("Lỗi khi lưu!");
        }
    };

    return (
        <div className="max-w-2xl bg-[#1e293b] p-8 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="text-xl font-bold text-[#f3ea28] mb-6 flex items-center gap-2">
                <Percent /> Thiết lập quy đổi điểm
            </h2>
            
            <div className="space-y-6">
                <div className="bg-[#0f172a] p-4 rounded-lg border border-gray-600">
                    <h3 className="font-bold text-green-400 mb-2">1. Tích điểm (Khi mua vé)</h3>
                    <div className="flex items-center gap-3">
                        <span>Khách tiêu</span>
                        <input type="number" className="bg-gray-700 p-2 rounded w-32 text-center text-white font-bold"
                            value={policy.earning_rate} onChange={e => setPolicy({...policy, earning_rate: e.target.value})} />
                        {/* FIX LỖI JSX: Dùng html entity &nbsp; và thẻ strong */}
                        <span>VND = Nhận được <strong>1 điểm</strong></span>
                    </div>
                    {/* FIX LỖI JSX: Thay dấu -> bằng &rarr; */}
                    <p className="text-xs text-gray-400 mt-2">Ví dụ: Nhập 10000 &rarr; Mua vé 100k được 10 điểm.</p>
                </div>

                <div className="bg-[#0f172a] p-4 rounded-lg border border-gray-600">
                    <h3 className="font-bold text-purple-400 mb-2">2. Tiêu điểm (Khi thanh toán)</h3>
                    <div className="flex items-center gap-3">
                        <span>Dùng <strong>1 điểm</strong> = Giảm</span>
                        <input type="number" className="bg-gray-700 p-2 rounded w-32 text-center text-white font-bold"
                            value={policy.redemption_rate} onChange={e => setPolicy({...policy, redemption_rate: e.target.value})} />
                        <span>VND</span>
                    </div>
                    {/* FIX LỖI JSX: Thay dấu -> bằng &rarr; */}
                    <p className="text-xs text-gray-400 mt-2">Ví dụ: Nhập 1000 &rarr; Có 50 điểm sẽ được giảm 50.000đ.</p>
                </div>

                <div className="bg-[#0f172a] p-4 rounded-lg border border-gray-600">
                    <h3 className="font-bold text-blue-400 mb-2">3. Điều kiện áp dụng</h3>
                    <div className="flex items-center gap-3">
                        <span>Đơn hàng tối thiểu:</span>
                        <input type="number" className="bg-gray-700 p-2 rounded w-32 text-center text-white font-bold"
                            value={policy.min_order_value_to_redeem} onChange={e => setPolicy({...policy, min_order_value_to_redeem: e.target.value})} />
                        <span>VND mới được dùng điểm</span>
                    </div>
                </div>

                <button onClick={handleSave} className="w-full bg-[#f3ea28] text-black font-bold py-3 rounded hover:bg-yellow-400 flex items-center justify-center gap-2">
                    <Save size={20}/> Lưu Cấu Hình
                </button>
            </div>
        </div>
    );
};

export default PromotionManager;