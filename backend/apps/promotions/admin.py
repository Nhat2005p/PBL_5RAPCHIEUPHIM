from django.contrib import admin
from .models import Promotion

@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    # SỬA LỖI: Chỉ hiển thị các trường cơ bản chắc chắn có
    # Hoặc bạn mở file models.py của promotion ra xem tên trường là gì
    list_display = ('name', 'code', 'start_date', 'is_active') 
    search_fields = ('name', 'code')
    list_filter = ('is_active',)