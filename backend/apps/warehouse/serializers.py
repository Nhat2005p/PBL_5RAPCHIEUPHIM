from rest_framework import serializers
from .models import Product, InventoryLog

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class InventoryLogSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_unit = serializers.CharField(source='product.unit', read_only=True)
    staff_name = serializers.CharField(source='staff.username', read_only=True)

    class Meta:
        model = InventoryLog
        fields = ['id', 'staff', 'staff_name', 'product', 'product_name', 'product_unit', 'trans_type', 'quantity', 'reason', 'created_at']