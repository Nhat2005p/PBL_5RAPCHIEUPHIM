import React, { useState, useEffect } from 'react';
import customerApi from '../../api/customerApi';
import { Users, Search, Plus, Edit, Trash2, Award, Phone, Mail, X } from 'lucide-react';
import { toast } from 'react-toastify';

const CustomerPage = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // State cho Modal Form
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState({ username: '', phone: '', email: '' });

    useEffect(() => {
        // Debounce search (Chờ người dùng gõ xong mới gọi API)
        const delayDebounceFn = setTimeout(() => {
            fetchCustomers();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await customerApi.getAll(searchTerm);
            setCustomers(res.data);
        } catch (error) {
            toast.error("Lỗi lấy danh sách khách hàng!");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCustomer) {
                await customerApi.update(editingCustomer.id, formData);
                toast.success("Cập nhật thông tin thành công!");
            } else {
                await customerApi.create(formData);
                toast.success("Đã thêm khách hàng mới!");
            }
            setShowForm(false);
            fetchCustomers();
        } catch (error) {
            const errorMsg = error.response?.data?.username?.[0] || error.response?.data?.phone?.[0] || "Dữ liệu không hợp lệ (Trùng SĐT hoặc Tên)!";
            toast.error(errorMsg);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) return;
        try {
            await customerApi.delete(id);
            toast.success("Xóa khách hàng thành công!");
            fetchCustomers();
        } catch (error) {
            toast.error("Không thể xóa khách hàng này!");
        }
    };

    const openAdd = () => {
        setEditingCustomer(null);
        setFormData({ username: '', phone: '', email: '' });
        setShowForm(true);
    };

    const openEdit = (cus) => {
        setEditingCustomer(cus);
        setFormData({ username: cus.username, phone: cus.phone || '', email: cus.email || '' });
        setShowForm(true);
    };

    return (
        <div className="min-h-screen bg-[#0f172a] p-8 text-white font-sans">
            <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                <h1 className="text-3xl font-bold text-[#f3ea28] flex items-center gap-2">
                    <Users size={32} /> TRA CỨU KHÁCH HÀNG
                </h1>
                <button onClick={openAdd} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition">
                    <Plus size={20} /> Thêm Khách Mới
                </button>
            </div>

            {/* Thanh Tìm Kiếm */}
            <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-3 pl-12 pr-4 text-white focus:border-[#f3ea28] focus:outline-none"
                        placeholder="Tìm kiếm theo Tên, Số điện thoại hoặc Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Bảng Danh Sách */}
            <div className="bg-[#1e293b] rounded-xl overflow-hidden shadow-xl border border-gray-700">
                <table className="w-full text-left">
                    <thead className="bg-[#0f172a] text-[#f3ea28] uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="p-4">Khách hàng</th>
                            <th className="p-4">Liên hệ</th>
                            <th className="p-4 text-center">Hạng thành viên</th>
                            <th className="p-4 text-center">Điểm tích lũy</th>
                            <th className="p-4 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 text-sm">
                        {loading ? (
                            <tr><td colSpan="5" className="p-6 text-center text-gray-400">Đang tìm kiếm...</td></tr>
                        ) : customers.length === 0 ? (
                            <tr><td colSpan="5" className="p-6 text-center text-gray-400">Không tìm thấy khách hàng nào.</td></tr>
                        ) : (
                            customers.map(cus => (
                                <tr key={cus.id} className="hover:bg-gray-800 transition">
                                    <td className="p-4 font-bold text-lg text-white">{cus.username}</td>
                                    <td className="p-4 text-gray-300 space-y-1">
                                        <div className="flex items-center gap-2"><Phone size={14} className="text-[#f3ea28]"/> {cus.phone || 'Chưa cập nhật'}</div>
                                        <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400"/> {cus.email || 'Chưa cập nhật'}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                                            cus.rank === 'DIAMOND' ? 'bg-blue-900/40 text-blue-400 border-blue-500' :
                                            cus.rank === 'GOLD' ? 'bg-yellow-900/40 text-yellow-400 border-yellow-500' :
                                            cus.rank === 'SILVER' ? 'bg-gray-400/20 text-gray-300 border-gray-400' :
                                            'bg-orange-900/40 text-orange-400 border-orange-500'
                                        }`}>
                                            {cus.rank || 'BRONZE'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-1 font-bold text-green-400 text-lg">
                                            {cus.loyalty_points.toLocaleString()} <Award size={18}/>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openEdit(cus)} className="p-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600 hover:text-white transition" title="Sửa">
                                                <Edit size={18}/>
                                            </button>
                                            <button onClick={() => handleDelete(cus.id)} className="p-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600 hover:text-white transition" title="Xóa">
                                                <Trash2 size={18}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1e293b] w-full max-w-md rounded-xl border border-gray-600 shadow-2xl relative">
                        <div className="p-6 border-b border-gray-600 flex justify-between items-center bg-[#0f172a] rounded-t-xl">
                            <h2 className="text-xl font-bold text-[#f3ea28]">{editingCustomer ? 'Sửa thông tin khách' : 'Thêm khách hàng mới'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X size={24}/></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-1">Tên khách hàng <span className="text-red-500">*</span></label>
                                <input required type="text" className="w-full bg-[#0f172a] border border-gray-600 rounded p-3 text-white focus:border-[#f3ea28] outline-none"
                                    value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                                <input required type="text" className="w-full bg-[#0f172a] border border-gray-600 rounded p-3 text-white focus:border-[#f3ea28] outline-none"
                                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                {!editingCustomer && <p className="text-xs text-gray-500 mt-1">*Mật khẩu mặc định sẽ là số điện thoại.</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-1">Email (Không bắt buộc)</label>
                                <input type="email" className="w-full bg-[#0f172a] border border-gray-600 rounded p-3 text-white focus:border-[#f3ea28] outline-none"
                                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>

                            <button type="submit" className="w-full bg-[#f3ea28] text-black py-3 rounded-lg font-bold hover:bg-yellow-400 transition mt-4">
                                {editingCustomer ? 'LƯU THAY ĐỔI' : 'TẠO TÀI KHOẢN'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerPage;