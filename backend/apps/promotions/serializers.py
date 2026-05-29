from rest_framework import serializers
from .models import Promotion, LoyaltyPolicy

class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = '__all__'
    
    def validate(self, data):
        """Kiểm tra logic: Ngày kết thúc phải sau ngày bắt đầu"""
        if data['start_date'] > data['valid_until']:
            raise serializers.ValidationError("Ngày kết thúc phải sau ngày bắt đầu")
        return data

class LoyaltyPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = LoyaltyPolicy
        fields = '__all__'