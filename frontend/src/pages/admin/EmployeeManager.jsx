import { useState, useEffect } from 'react';
import employeeApi from '../../api/employeeApi';
import { Users, UserPlus, Trash2, Edit, Shield, Mail, Phone, Lock, X } from 'lucide-react';

const EmployeeManager = () => {
    const [employees, setEmployees] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingEmp, setEditingEmp] = useState(null);

    const initialForm = { username: '', email: '', phone: '', role: 'STAFF', password: '' };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await employeeApi.getAll();
            setEmployees(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEmp) {
                // Khi sửa, nếu không nhập pass thì backend sẽ không đổi pass
                const dataToSend = { ...formData };
                if (!dataToSend.password) delete dataToSend.password;
                
                await employeeApi.update(editingEmp.id, dataToSend);
                alert("Cập nhật thông tin thành công!");
            } else {
                await employeeApi.create(formData);
                alert("Tạo tài khoản nhân viên thành công!");
            }
            setShowForm(false);
            fetchEmployees();
        } catch (error) {
    console.error("Lỗi chi tiết:", error.response);

    if (error.response) {
        // Trường hợp 1: Lỗi 403 - Không có quyền
        if (error.response.status === 403) {
            alert("LỖI: Bạn không có quyền thực hiện hành động này! (Chỉ Admin mới được tạo)");
            return;
        }

        // Trường hợp 2: Lỗi 400 - Dữ liệu không hợp lệ (Trùng tên, thiếu email...)
        if (error.response.data) {
            // Lấy dòng thông báo lỗi đầu tiên từ Server
            const firstErrorKey = Object.keys(error.response.data)[0];
            const errorMessage = error.response.data[firstErrorKey];
            
            // Ví dụ: "username: A user with that username already exists."
            alert(`LỖI DỮ LIỆU: ${firstErrorKey.toUpperCase()} - ${errorMessage}`);
            return;
        }
    }

    // Trường hợp 3: Lỗi mất mạng hoặc Server sập
    alert("Lỗi kết nối Server! Vui lòng kiểm tra lại.");
}
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa nhân viên này?")) {
            await employeeApi.delete(id);
            fetchEmployees();
        }
    };

    const openEdit = (emp) => {
        setEditingEmp(emp);
        setFormData({
            username: emp.username,
            email: emp.email,
            phone: emp.phone || '',
            role: emp.role,
            password: '' // Reset pass khi sửa
        });
        setShowForm(true);
    };

    const openAdd = () => {
        setEditingEmp(null);
        setFormData(initialForm);
        setShowForm(true);
    };

    // Hàm render Badge cho Role
    const getRoleBadge = (role) => {
        if (role === 'ADMIN') return <span className="bg-red-600 px-2 py-1 rounded text-xs font-bold">QUẢN TRỊ VIÊN</span>;
        if (role === 'MANAGER') return <span className="bg-purple-600 px-2 py-1 rounded text-xs font-bold">QUẢN LÝ</span>;
        return <span className="bg-blue-600 px-2 py-1 rounded text-xs font-bold">NHÂN VIÊN</span>;
    };

    return (
        <div className="min-h-screen bg-[#0f172a] p-8 text-white">
            <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                <h1 className="text-3xl font-bold text-[#f3ea28] flex items-center gap-2">
                    <Users size={32}/> QUẢN LÝ NHÂN SỰ
                </h1>
                <button onClick={openAdd} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold flex items-center gap-2">
                    <UserPlus size={20}/> Thêm Nhân Viên
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map(emp => (
                    <div key={emp.id} className="bg-[#1e293b] p-6 rounded-xl border border-gray-700 shadow-lg hover:border-[#f3ea28] transition relative group">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gray-600 rounded-full flex items-center justify-center text-xl font-bold border-2 border-[#f3ea28]">
                                    {emp.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{emp.username}</h3>
                                    <div className="mt-1">{getRoleBadge(emp.role)}</div>
                                </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                <button onClick={() => openEdit(emp)} className="p-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600 hover:text-white"><Edit size={16}/></button>
                                <button onClick={() => handleDelete(emp.id)} className="p-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600 hover:text-white"><Trash2 size={16}/></button>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3 text-sm text-gray-300">
                            <div className="flex items-center gap-2"><Mail size={14} className="text-[#f3ea28]"/> {emp.email}</div>
                            <div className="flex items-center gap-2"><Phone size={14} className="text-[#f3ea28]"/> {emp.phone || 'Chưa cập nhật'}</div>
                            <div className="flex items-center gap-2"><Shield size={14} className="text-[#f3ea28]"/> ID: #{emp.id}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL FORM */}
            {showForm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1e293b] w-full max-w-md p-6 rounded-xl border border-gray-600 shadow-2xl relative">
                        <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24}/></button>
                        <h2 className="text-2xl font-bold text-[#f3ea28] mb-6">{editingEmp ? 'Cập Nhật Hồ Sơ' : 'Tạo Tài Khoản Mới'}</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Tên đăng nhập</label>
                                <input required type="text" className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white"
                                    value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                            </div>
                            
                            <div>
                                <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Email</label>
                                <input required type="email" className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white"
                                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Số điện thoại</label>
                                    <input type="text" className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white"
                                        value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Phân quyền</label>
                                    <select className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white"
                                        value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                        <option value="STAFF">Nhân viên</option>
                                        <option value="MANAGER">Quản lý</option>
                                        <option value="ADMIN">Quản trị viên</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-700">
                                <label className="block text-xs uppercase font-bold text-[#f3ea28] mb-1 flex items-center gap-2">
                                    <Lock size={12}/> {editingEmp ? 'Đổi mật khẩu (Bỏ trống nếu không đổi)' : 'Mật khẩu khởi tạo'}
                                </label>
                                <input type={editingEmp ? "text" : "text"} placeholder={editingEmp ? "******" : "Nhập mật khẩu..."}
                                    className="w-full bg-[#0f172a] border border-gray-600 rounded p-2 text-white"
                                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} 
                                    required={!editingEmp} // Bắt buộc khi tạo mới
                                />
                            </div>

                            <button type="submit" className="w-full bg-[#f3ea28] text-black font-bold py-3 rounded mt-4 hover:bg-yellow-400">
                                {editingEmp ? 'LƯU THAY ĐỔI' : 'TẠO TÀI KHOẢN'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeManager;