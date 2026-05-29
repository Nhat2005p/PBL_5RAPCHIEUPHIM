import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import statsApi from '../../api/statsApi';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
    DollarSign, Ticket, TrendingUp, Calendar,
    Film, Clock, Building2, Users, FileText, Gift,
    Plus, Edit, Eye, Settings, BarChart3,
    Star, Target, Zap, Award, Activity, PieChart as PieChartIcon
} from 'lucide-react';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await statsApi.getDashboardStats();
                setData(res.data);
            } catch (error) {
                console.error("Lỗi tải thống kê:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-10 text-white text-center">Đang tính toán số liệu...</div>;
    if (!data) return <div className="p-10 text-white text-center">Không có dữ liệu.</div>;

    // Format tiền tệ VND
    const formatVND = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    // Data cho biểu đồ tròn (Cơ cấu doanh thu)
    const pieData = [
        { name: 'Vé phim', value: data.summary.ticket_revenue },
        { name: 'Bắp nước', value: data.summary.food_revenue },
    ];
    const COLORS = ['#f3ea28', '#663399']; // Vàng vs Tím

    return (
        <div className="min-h-screen bg-[#0f172a] p-8 text-white font-sans">
            {/* 1. HEADER */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black text-[#f3ea28] flex items-center gap-3 italic uppercase tracking-tighter">
                    <Settings size={32} />
                    HỆ THỐNG QUẢN TRỊ CINEPBL5
                </h1>
                <div className="text-sm text-gray-400 font-bold uppercase tracking-widest">
                    {new Date().toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            </div>

            {/* 2. QUICK STATS CARDS (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="TỔNG DOANH THU"
                    value={formatVND(data.summary.total_revenue)}
                    icon={<DollarSign size={24} className="text-green-400"/>}
                    bg="bg-green-900/20 border-green-500/50"
                    trend="+12.5%"
                />
                <StatCard
                    title="VÉ ĐÃ BÁN"
                    value={data.summary.total_tickets}
                    icon={<Ticket size={24} className="text-[#f3ea28]"/>}
                    bg="bg-yellow-900/20 border-yellow-500/50"
                    trend="+8.2%"
                />
                <StatCard
                    title="TỶ LỆ LẮP ĐẦY"
                    value="78.5%"
                    icon={<Target size={24} className="text-blue-400"/>}
                    bg="bg-blue-900/20 border-blue-500/50"
                    trend="+5.1%"
                />
                <StatCard
                    title="NHÂN VIÊN"
                    value="24"
                    icon={<Users size={24} className="text-purple-400"/>}
                    bg="bg-purple-900/20 border-purple-500/50"
                    trend="Hoạt động"
                />
            </div>

            {/* 3. MAIN MANAGEMENT MODULES (Chức năng 5.3) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <ManagementCard
                    title="QUẢN LÝ PHIM"
                    description="Thêm, sửa, xóa phim; cập nhật trailer, poster, định dạng 2D/3D"
                    icon={<Film size={32} className="text-[#f3ea28]" />}
                    bg="bg-gradient-to-br from-yellow-900/20 to-orange-900/20"
                    border="border-yellow-500/30"
                    actions={[
                        { label: "Thêm phim mới", icon: <Plus size={16} />, link: "/admin/movies?action=add" },
                        { label: "Danh sách phim", icon: <Eye size={16} />, link: "/admin/movies" }
                    ]}
                />

                <ManagementCard
                    title="LỊCH CHIẾU"
                    description="Sắp xếp suất chiếu, thiết lập khung giờ chiếu cho toàn bộ rạp"
                    icon={<Clock size={32} className="text-blue-400" />}
                    bg="bg-gradient-to-br from-blue-900/20 to-cyan-900/20"
                    border="border-blue-500/30"
                    actions={[
                        { label: "Tạo lịch chiếu", icon: <Plus size={16} />, link: "/admin/showtimes?action=add" },
                        { label: "Xem lịch hiện tại", icon: <Calendar size={16} />, link: "/admin/showtimes" }
                    ]}
                />

                <ManagementCard
                    title="BÁO CÁO TÀI CHÍNH"
                    description="Thống kê doanh thu, hiệu suất phim và phòng chiếu"
                    icon={<BarChart3 size={32} className="text-red-400" />}
                    bg="bg-gradient-to-br from-red-900/20 to-rose-900/20"
                    border="border-red-500/30"
                    actions={[
                        { label: "Báo cáo doanh thu", icon: <FileText size={16} />, link: "/admin/reports" },
                        { label: "Hiệu suất phòng", icon: <Activity size={16} />, link: "/admin/reports?action=rooms" }
                    ]}
                />
            </div>

            {/* 4. ANALYTICS (Charts) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Biểu đồ vùng Doanh thu */}
                <div className="lg:col-span-2 bg-[#1e293b] p-6 rounded-3xl border border-white/5 shadow-2xl">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-[#f3ea28]"/> Doanh Thu 7 Ngày Gần Nhất
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.revenue_chart}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f3ea28" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#f3ea28" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="date" stroke="#9ca3af" tickFormatter={(str) => new Date(str).getDate() + '/' + (new Date(str).getMonth()+1)}/>
                                <YAxis stroke="#9ca3af" />
                                <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '12px'}} formatter={(val) => formatVND(val)}/>
                                <Area type="monotone" dataKey="revenue" stroke="#f3ea28" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Biểu đồ tròn Cơ cấu */}
                <div className="bg-[#1e293b] p-6 rounded-3xl border border-white/5 shadow-2xl">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <PieChartIcon size={20} className="text-purple-400"/> Cơ Cấu Doanh Thu
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                                </Pie>
                                <Tooltip formatter={(value) => formatVND(value)} />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400 uppercase font-bold text-[10px]">Vé phim</span>
                            <span className="text-[#f3ea28] font-black">{((data.summary.ticket_revenue / data.summary.total_revenue) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400 uppercase font-bold text-[10px]">Bắp nước</span>
                            <span className="text-purple-400 font-black">{((data.summary.food_revenue / data.summary.total_revenue) * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. TABLES (Top Movies & Room Occupancy) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Phim */}
                <div className="bg-[#1e293b] p-6 rounded-3xl border border-white/5 shadow-lg">
                    <h3 className="text-lg font-bold text-[#f3ea28] mb-4 flex items-center gap-2"><Star size={20} /> Top 5 Phim Doanh Thu</h3>
                    <div className="overflow-x-auto text-sm">
                        <table className="w-full text-left">
                            <thead className="bg-[#0f172a] text-gray-400 uppercase text-[10px] tracking-widest">
                                <tr><th className="p-4">Phim</th><th className="p-4 text-center">Vé</th><th className="p-4 text-right">Doanh thu</th></tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.top_movies.slice(0, 5).map((movie, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-bold">{idx + 1}. {movie.title}</td>
                                        <td className="p-4 text-center text-gray-400">{movie.tickets_count}</td>
                                        <td className="p-4 text-right font-black text-[#f3ea28]">{formatVND(movie.total_revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Hiệu suất phòng */}
                <div className="bg-[#1e293b] p-6 rounded-3xl border border-white/5 shadow-lg">
                    <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2"><Target size={20} /> Hiệu Suất Phòng</h3>
                    <div className="overflow-x-auto text-sm">
                        <table className="w-full text-left">
                            <thead className="bg-[#0f172a] text-gray-400 uppercase text-[10px] tracking-widest">
                                <tr><th className="p-4">Phòng</th><th className="p-4 text-center">Ghế</th><th className="p-4 text-right">Lấp đầy</th></tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.room_occupancy.slice(0, 5).map((room, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-bold">{room.name} <span className="block text-[10px] font-normal text-gray-500 uppercase">{room.cinema}</span></td>
                                        <td className="p-4 text-center text-gray-400">{room.sold}/{room.capacity}</td>
                                        <td className="p-4 text-right">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black ${room.rate >= 70 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                                {room.rate}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 6. QUICK ACTIONS FOOTER */}
            <div className="mt-8 bg-[#1e293b] p-6 rounded-3xl border border-white/5 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Zap size={20} /> HÀNH ĐỘNG NHANH</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <QuickActionButton icon={<Plus size={20} />} label="Thêm phim" link="/admin/movies?action=add" color="text-[#f3ea28] bg-yellow-900/20" />
                    <QuickActionButton icon={<Calendar size={20} />} label="Lịch chiếu" link="/admin/showtimes?action=add" color="text-blue-400 bg-blue-900/20" />
                    <QuickActionButton icon={<Users size={20} />} label="Nhân sự" link="/admin/employees?action=add" color="text-purple-400 bg-purple-900/20" />
                    <QuickActionButton icon={<Gift size={20} />} label="Khuyến mãi" link="/admin/promotions?action=add" color="text-pink-400 bg-pink-900/20" />
                    <QuickActionButton icon={<FileText size={20} />} label="Báo cáo" link="/admin/reports" color="text-green-400 bg-green-900/20" />
                    <QuickActionButton icon={<Settings size={20} />} label="Cài đặt" link="/admin/settings" color="text-gray-400 bg-gray-900/20" />
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, icon, bg, trend }) => (
    <div className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between h-36 transition-transform hover:scale-[1.02] ${bg}`}>
        <div className="flex justify-between items-start">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</h4>
            <div className="p-2 bg-black/20 rounded-xl">{icon}</div>
        </div>
        <div className="flex justify-between items-end">
            <div className="text-2xl font-black">{value}</div>
            {trend && <div className="text-[10px] font-black text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">{trend}</div>}
        </div>
    </div>
);

const ManagementCard = ({ title, description, icon, bg, border, actions }) => (
    <div className={`p-6 rounded-3xl border shadow-2xl transition-all hover:translate-y-[-4px] group ${bg} ${border}`}>
        <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-black/20 rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>
            <div>
                <h3 className="font-black uppercase italic tracking-tighter text-[#f3ea28]">{title}</h3>
                <p className="text-[11px] text-gray-400 leading-tight mt-1">{description}</p>
            </div>
        </div>
        <div className="space-y-2">
            {actions.map((action, idx) => (
                <Link key={idx} to={action.link} className="flex items-center gap-2 p-2 rounded-xl hover:bg-black/20 text-xs font-bold text-gray-300 hover:text-white transition-all">
                    {action.icon} {action.label}
                </Link>
            ))}
        </div>
    </div>
);

const QuickActionButton = ({ icon, label, link, color }) => (
    <Link to={link} className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105 active:scale-95 ${color}`}>
        {icon}
        <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
    </Link>
);

export default Dashboard;