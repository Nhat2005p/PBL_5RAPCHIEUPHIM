import React, { useState, useEffect, useRef } from 'react';
import supportApi from '../../api/supportApi';
import { MessageSquare, ShieldAlert, Send } from 'lucide-react';

const SupportManager = () => {
    const [activeTab, setActiveTab] = useState('CHAT'); // CHAT | LOGS
    const [logs, setLogs] = useState([]);
    const [chats, setChats] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [chatDetail, setChatDetail] = useState([]);
    const [replyText, setReplyText] = useState('');
    
    // Ref dùng để tự động cuộn xuống cuối khung chat
    const messagesEndRef = useRef(null);
    // Ref lưu trữ user đang chọn để WebSocket có thể đọc được state mới nhất
    const selectedUserRef = useRef(null);

    // Cập nhật ref mỗi khi selectedUser thay đổi
    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    // Cuộn xuống cuối mỗi khi có tin nhắn mới trong chatDetail
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatDetail]);

    // Xử lý chuyển tab và kết nối WebSocket
    useEffect(() => {
        let ws = null;

        if (activeTab === 'LOGS') {
            fetchLogs();
        } 
        
        if (activeTab === 'CHAT') {
            fetchAllChats();

            // KẾT NỐI WEBSOCKET CHO ADMIN
            ws = new WebSocket('ws://127.0.0.1:8000/ws/chat/admin/');
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                const newMsg = data.message;

                // 1. Refresh lại danh sách sidebar bên trái (để đẩy khách hàng có tin nhắn mới lên)
                fetchAllChats(); 

                // 2. Kiểm tra xem tin nhắn mới có thuộc về khách hàng đang mở hay không
                const currentSelectedUser = selectedUserRef.current;
                
                if (currentSelectedUser && 
                   (newMsg.sender === currentSelectedUser.id || newMsg.receiver === currentSelectedUser.id)) {
                    
                    // Thêm tin nhắn mới vào giao diện
                    setChatDetail(prevChat => {
                        // Chống trùng lặp tin nhắn
                        if (prevChat.find(m => m.id === newMsg.id)) return prevChat;
                        return [...prevChat, newMsg];
                    });

                    // Nếu tin nhắn là do khách gửi đến, tự động đánh dấu đã đọc
                    if (newMsg.sender === currentSelectedUser.id) {
                        supportApi.markAsRead(currentSelectedUser.id);
                    }
                }
            };
        }

        // Cleanup: Đóng kết nối khi chuyển tab hoặc unmount
        return () => {
            if (ws) ws.close();
        };
    }, [activeTab]);

    // Lấy Logs
    const fetchLogs = async () => {
        try {
            const res = await supportApi.getLogs();
            setLogs(res.data);
        } catch (error) { console.error(error); }
    };

    // Lấy danh sách khách hàng đã nhắn tin (Sidebar trái)
    const fetchAllChats = async () => {
        try {
            const res = await supportApi.getChatHistory();
            const uniqueUsers = [];
            const userIds = new Set();
            res.data.forEach(msg => {
                const uid = msg.sender || msg.receiver;
                const uname = msg.sender_name === 'Admin' ? msg.receiver_name : msg.sender_name;
                if (uid && !userIds.has(uid) && msg.sender_name !== 'Admin') {
                    userIds.add(uid);
                    uniqueUsers.push({ id: uid, name: uname });
                }
            });
            setChats(uniqueUsers);
        } catch (error) { console.error(error); }
    };

    // Mở hộp thoại chat với 1 khách cụ thể
    const openChat = async (user) => {
        setSelectedUser(user);
        try {
            const res = await supportApi.getChatHistory(user.id);
            setChatDetail(res.data);
            await supportApi.markAsRead(user.id);
        } catch (error) { console.error(error); }
    };

    // Gửi tin nhắn
    const handleSend = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedUser) return;
        try {
            // Gửi API để lưu DB, sau đó Backend sẽ tự động phát sóng qua WebSocket
            await supportApi.sendMessage({ receiver: selectedUser.id, message: replyText });
            setReplyText('');
            // ĐÃ XÓA openChat() Ở ĐÂY để tránh gọi API dư thừa, WebSocket sẽ lo việc hiển thị tin nhắn mới
        } catch (error) { 
            alert("Lỗi gửi tin nhắn"); 
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] p-8 text-white font-sans">
            <h1 className="text-3xl font-bold text-[#f3ea28] mb-6 flex items-center gap-2">
                <ShieldAlert size={32}/> TRUNG TÂM HỖ TRỢ & HỆ THỐNG
            </h1>

            <div className="flex gap-4 mb-6 border-b border-gray-700">
                <button onClick={() => setActiveTab('CHAT')} className={`pb-3 font-bold flex items-center gap-2 transition ${activeTab === 'CHAT' ? 'text-[#f3ea28] border-b-2 border-[#f3ea28]' : 'text-gray-400 hover:text-white'}`}>
                    <MessageSquare size={18}/> Hỗ trợ Khách hàng
                </button>
                <button onClick={() => setActiveTab('LOGS')} className={`pb-3 font-bold flex items-center gap-2 transition ${activeTab === 'LOGS' ? 'text-[#f3ea28] border-b-2 border-[#f3ea28]' : 'text-gray-400 hover:text-white'}`}>
                    <ShieldAlert size={18}/> Nhật ký hệ thống
                </button>
            </div>

            {activeTab === 'LOGS' ? (
                <div className="bg-[#1e293b] rounded-xl p-4 border border-gray-700 h-[70vh] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left text-sm">
                        <thead className="text-[#f3ea28] border-b border-gray-700">
                            <tr>
                                <th className="pb-3">Thời gian</th>
                                <th className="pb-3">Tài khoản (Actor)</th>
                                <th className="pb-3">Hành động</th>
                                <th className="pb-3">Mục tiêu (Target)</th>
                                <th className="pb-3">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-800 transition">
                                    <td className="py-3 text-gray-400">{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                                    <td className="py-3 font-bold text-blue-400">{log.actor_name}</td>
                                    <td className="py-3"><span className="bg-gray-700 px-2 py-1 rounded text-xs">{log.action_type}</span></td>
                                    <td className="py-3">{log.target}</td>
                                    <td className="py-3 font-mono text-gray-500">{log.ip_address || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex h-[70vh] gap-4">
                    {/* Danh sách khách hàng nhắn tin */}
                    <div className="w-1/3 bg-[#1e293b] border border-gray-700 rounded-xl overflow-y-auto p-2 custom-scrollbar">
                        <h3 className="text-[#f3ea28] font-bold p-3 border-b border-gray-700 mb-2 sticky top-0 bg-[#1e293b]">Khách hàng cần hỗ trợ</h3>
                        {chats.map(user => (
                            <div key={user.id} onClick={() => openChat(user)} className={`p-4 rounded-lg cursor-pointer mb-2 transition border ${selectedUser?.id === user.id ? 'bg-blue-900/40 border-blue-500' : 'bg-gray-800 border-transparent hover:border-gray-500'}`}>
                                <div className="font-bold text-white">{user.name}</div>
                                <div className="text-xs text-gray-400 mt-1">Nhấn để xem tin nhắn</div>
                            </div>
                        ))}
                    </div>

                    {/* Khung Chat */}
                    <div className="w-2/3 bg-[#1e293b] border border-gray-700 rounded-xl flex flex-col overflow-hidden">
                        {selectedUser ? (
                            <>
                                <div className="p-4 border-b border-gray-700 bg-[#0f172a] font-bold text-lg flex justify-between items-center">
                                    <span>Đang hỗ trợ: <span className="text-[#f3ea28]">{selectedUser.name}</span></span>
                                </div>
                                <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-[#0f172a]">
                                    {chatDetail.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.sender_name === 'Admin' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-3 rounded-2xl shadow-md ${msg.sender_name === 'Admin' ? 'bg-[#f3ea28] text-black rounded-tr-sm' : 'bg-gray-700 text-white rounded-tl-sm'}`}>
                                                <div className="text-sm">{msg.message}</div>
                                                <div className={`text-[10px] mt-1 text-right ${msg.sender_name === 'Admin' ? 'text-black/60' : 'text-gray-400'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Mỏ neo để cuộn xuống cuối */}
                                    <div ref={messagesEndRef} />
                                </div>
                                <form onSubmit={handleSend} className="p-4 border-t border-gray-700 bg-[#1e293b] flex gap-3">
                                    <input 
                                        type="text" 
                                        className="flex-1 bg-[#0f172a] border border-gray-600 rounded-full px-4 py-2 text-white focus:outline-none focus:border-[#f3ea28]" 
                                        placeholder="Nhập câu trả lời cho khách..." 
                                        value={replyText} 
                                        onChange={e => setReplyText(e.target.value)} 
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={!replyText.trim()}
                                        className="bg-[#f3ea28] text-black w-10 h-10 rounded-full flex items-center justify-center font-bold hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={18} className="ml-1" />
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-[#0f172a]">
                                <MessageSquare size={64} className="opacity-20 mb-4" />
                                <div>Chọn một khách hàng bên trái để bắt đầu chat</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportManager;