import React, { useState, useEffect, useRef } from 'react';
import supportApi from '../api/supportApi';
import { MessageCircle, X, Send } from 'lucide-react';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    // Kiểm tra khách đã đăng nhập chưa
    const isLoggedIn = !!localStorage.getItem('access_token');

    useEffect(() => {
        let ws = null; // Biến lưu trữ kết nối WebSocket

        if (isOpen && isLoggedIn) {
            // 1. Tải lại lịch sử tin nhắn cũ
            fetchMessages();
            
            // 2. Đánh dấu đã đọc khi mở hộp thoại
            supportApi.markAsRead();

            // 3. Khởi tạo WebSocket Lắng nghe Real-time
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    // Giải mã JWT Token để lấy ID người dùng
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const userId = payload.user_id;

                    // Kết nối WebSocket tới phòng riêng của khách này
                    ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${userId}/`);
                    
                    ws.onmessage = (event) => {
                        const data = JSON.parse(event.data);
                        setMessages(prev => {
                            // Chống trùng lặp tin nhắn (nếu có)
                            if (prev.find(m => m.id === data.message.id)) return prev;
                            return [...prev, data.message];
                        });
                    };
                } catch (error) {
                    console.error("Lỗi giải mã token hoặc kết nối WebSocket:", error);
                }
            }
        }

        // Cleanup: Đóng kết nối WebSocket khi khách đóng hộp chat hoặc unmount
        return () => {
            if (ws) ws.close();
        };
    }, [isOpen, isLoggedIn]);

    // Cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchMessages = async () => {
        try {
            // Lấy tin nhắn của chính user đang đăng nhập
            const res = await supportApi.getChatHistory();
            setMessages(res.data);
        } catch (error) {
            console.error("Lỗi tải tin nhắn", error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        try {
            // Gửi qua API HTTP thông thường để xác thực an toàn và lưu DB
            await supportApi.sendMessage({ message: inputText });
            setInputText('');
            
            // XÓA fetchMessages() Ở ĐÂY! 
            // Vì ngay sau khi lưu DB, Backend sẽ bắn tin nhắn qua WebSocket và tự nhảy vào giao diện.
        } catch (error) {
            console.error("Lỗi gửi tin nhắn", error);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* NÚT BẬT/TẮT CHAT */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-[#f3ea28] hover:bg-yellow-400 text-black p-4 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110"
                >
                    <MessageCircle size={28} />
                </button>
            )}

            {/* KHUNG CHAT */}
            {isOpen && (
                <div className="bg-[#1e293b] w-80 sm:w-96 rounded-2xl shadow-2xl border border-gray-600 flex flex-col overflow-hidden h-[500px] max-h-[80vh]">
                    {/* Header */}
                    <div className="bg-[#f3ea28] p-4 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-black text-lg leading-tight">Góp ý & Hỗ trợ</h3>
                            <p className="text-black/70 text-xs">Chúng tôi luôn lắng nghe bạn!</p>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-black hover:bg-black/10 p-1 rounded-full">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body (Nội dung chat) */}
                    <div className="flex-1 p-4 overflow-y-auto bg-[#0f172a] space-y-4 custom-scrollbar">
                        {!isLoggedIn ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <MessageCircle size={48} className="text-gray-500 mb-3" />
                                <p className="text-gray-400 text-sm mb-4">Vui lòng đăng nhập để gửi góp ý hoặc chat với nhân viên rạp.</p>
                                <a href="/login" className="bg-[#663399] text-white px-6 py-2 rounded-full font-bold text-sm">Đăng nhập</a>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center text-gray-500 text-sm mt-10">
                                Hãy gửi tin nhắn đầu tiên cho chúng tôi!
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div key={msg.id || idx} className={`flex ${msg.sender_name === 'Admin' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-md ${
                                        msg.sender_name === 'Admin' 
                                        ? 'bg-gray-700 text-white rounded-tl-sm' 
                                        : 'bg-[#663399] text-white rounded-tr-sm'
                                    }`}>
                                        <div className="mb-1">{msg.message}</div>
                                        <div className="text-[10px] text-white/50 text-right mt-1">
                                            {new Date(msg.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer (Khung nhập chat) */}
                    {isLoggedIn && (
                        <div className="p-3 bg-[#1e293b] border-t border-gray-600">
                            <form onSubmit={handleSend} className="flex gap-2">
                                <input 
                                    type="text" 
                                    className="flex-1 bg-[#0f172a] border border-gray-600 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-[#f3ea28]"
                                    placeholder="Nhập tin nhắn..." 
                                    value={inputText} 
                                    onChange={e => setInputText(e.target.value)} 
                                />
                                <button 
                                    type="submit" 
                                    disabled={!inputText.trim()}
                                    className="bg-[#f3ea28] text-black w-10 h-10 rounded-full flex items-center justify-center hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={18} className="ml-1" />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatWidget;