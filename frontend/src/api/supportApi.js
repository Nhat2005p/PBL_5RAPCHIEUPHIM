import axiosClient from './axiosClient';

const supportApi = {
    // Chat
    getChatHistory: (userId = '') => axiosClient.get(`supports/chat/?user_id=${userId}`),
    sendMessage: (data) => axiosClient.post('supports/chat/', data),
    markAsRead: (userId) => axiosClient.post('supports/chat/mark_read/', { user_id: userId }),
    
    // Logs
    getLogs: () => axiosClient.get('supports/logs/'),
};

export default supportApi;