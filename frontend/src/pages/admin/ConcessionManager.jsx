import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import concessionApi from '../../api/concessionApi';
import { Plus, Edit, Trash2, Image as ImageIcon, Popcorn, X } from 'lucide-react';

const ConcessionManager = () => {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    const [formData, setFormData] = useState({
        id: null, name: '', description: '', price: '', is_active: true, image: null, previewImage: null
    });

    useEffect(() => { fetchFoods(); }, []);

    const fetchFoods = async () => {
        try {
            const res = await concessionApi.getAll();
            setFoods(res.data);
        } catch (error) { toast.error("Lỗi lấy danh sách bắp nước!"); } 
        finally { setLoading(false); }
    };

    const handleOpenModal = (food = null) => {
        if (food) {
            setFormData({
                id: food.id, name: food.name, description: food.description, 
                price: food.price, is_active: food.is_active, image: null, previewImage: food.image
            });
        } else {
            setFormData({ id: null, name: '', description: '', price: '', is_active: true, image: null, previewImage: null });
        }
        setShowModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file, previewImage: URL.createObjectURL(file) });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('description', formData.description);
        submitData.append('price', formData.price);
        submitData.append('is_active', formData.is_active);
        if (formData.image) submitData.append('image', formData.image);

        try {
            if (formData.id) {
                await concessionApi.update(formData.id, submitData);
                toast.success("Cập nhật thành công!");
            } else {
                if (!formData.image) return toast.warning("Vui lòng chọn hình ảnh!");
                await concessionApi.create(submitData);
                toast.success("Thêm món mới thành công!");
            }
            setShowModal(false);
            fetchFoods();
        } catch (error) { toast.error("Có lỗi xảy ra, vui lòng kiểm tra lại!"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa món này?")) return;
        try {
            await concessionApi.delete(id);
            toast.success("Đã xóa món thành công!");
            fetchFoods();
        } catch (error) { toast.error("Không thể xóa món này!"); }
    };

    if (loading) return <div className="text-white text-center mt-10">Đang tải dữ liệu...</div>;

    return (
        <div className="min-h-screen bg-[#0f172a] p-8 text-white font-sans">
            <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                <h2 className="text-3xl font-bold text-[#f3ea28] flex items-center gap-2"><Popcorn size={32}/> QUẢN LÝ BẮP NƯỚC</h2>
                <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition" onClick={() => handleOpenModal()}>
                    <Plus size={20} /> THÊM MÓN MỚI
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {foods.map(food => (
                    <div className="bg-[#1e293b] rounded-xl border border-gray-700 overflow-hidden shadow-lg flex flex-col" key={food.id}>
                        <img src={food.image || "https://via.placeholder.com/300x200?text=No+Image"} alt={food.name} className="w-full h-48 object-cover border-b border-gray-700" />
                        <div className="p-4 flex flex-col flex-1">
                            <h5 className="font-bold text-lg text-[#f3ea28] truncate" title={food.name}>{food.name}</h5>
                            <p className="text-gray-400 text-sm mb-3 flex-1 line-clamp-2">{food.description}</p>
                            <h5 className="text-green-400 font-black text-xl mb-4">{parseInt(food.price).toLocaleString()}đ</h5>
                            
                            <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-700">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${food.is_active ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                    {food.is_active ? 'Đang bán' : 'Ngừng bán'}
                                </span>
                                <div className="flex gap-2">
                                    <button className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded transition" onClick={() => handleOpenModal(food)}><Edit size={16} /></button>
                                    <button className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded transition" onClick={() => handleDelete(food.id)}><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1e293b] w-full max-w-md rounded-xl border border-gray-600 overflow-hidden shadow-2xl">
                        <div className="bg-[#0f172a] p-4 flex justify-between items-center border-b border-gray-700">
                            <h5 className="font-bold text-[#f3ea28] text-lg">{formData.id ? 'SỬA THÔNG TIN' : 'THÊM MÓN MỚI'}</h5>
                            <button className="text-gray-400 hover:text-white" onClick={() => setShowModal(false)}><X size={20}/></button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tên Combo/Món</label>
                                    <input type="text" className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white outline-none focus:border-[#f3ea28]" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mô tả chi tiết</label>
                                    <textarea className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white outline-none focus:border-[#f3ea28]" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Giá bán (VNĐ)</label>
                                        <input type="number" className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white outline-none focus:border-[#f3ea28]" required min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Trạng thái</label>
                                        <select className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white outline-none focus:border-[#f3ea28]" value={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.value === 'true'})}>
                                            <option value="true">Đang bán</option>
                                            <option value="false">Ngừng bán</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-2"><ImageIcon size={14}/> Hình ảnh</label>
                                    <input type="file" className="w-full bg-[#0f172a] border border-gray-600 rounded p-1 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600" accept="image/*" onChange={handleFileChange} />
                                    {formData.previewImage && (
                                        <div className="mt-3 flex justify-center">
                                            <img src={formData.previewImage} alt="Preview" className="h-32 rounded border border-gray-600 object-cover" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
                                    <button type="button" className="px-4 py-2 text-gray-400 hover:text-white" onClick={() => setShowModal(false)}>Hủy</button>
                                    <button type="submit" className="bg-[#f3ea28] text-black font-bold px-6 py-2 rounded hover:bg-yellow-400">Lưu dữ liệu</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConcessionManager;