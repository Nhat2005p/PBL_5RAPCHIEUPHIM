import axiosClient from './axiosClient';

const promotionApi = {
    // --- 1. MÃ GIẢM GIÁ (VOUCHERS) ---
    getPromotions: () => axiosClient.get('promotions/vouchers/'),
    createPromotion: (data) => axiosClient.post('promotions/vouchers/', data),
    updatePromotion: (id, data) => axiosClient.put(`promotions/vouchers/${id}/`, data),
    deletePromotion: (id) => axiosClient.delete(`promotions/vouchers/${id}/`),

    // --- 2. CẤU HÌNH TÍCH ĐIỂM (LOYALTY POLICY) ---
    getLoyaltyPolicy: () => axiosClient.get('promotions/loyalty-policy/'),
    updateLoyaltyPolicy: (data) => axiosClient.put('promotions/loyalty-policy/', data),
};

export default promotionApi;