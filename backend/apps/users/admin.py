from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    model = User
    
    # 1. Cấu hình hiển thị danh sách
    list_display = ['username', 'email', 'role', 'phone', 'is_staff', 'is_active']
    list_filter = ['role', 'is_staff', 'is_active']
    search_fields = ['username', 'email', 'phone']
    
    # 2. Cấu hình form sửa thông tin (Edit User)
    # SỬA LỖI: Ép kiểu list() để tránh lỗi Pylance báo đỏ phép cộng
    fieldsets = list(UserAdmin.fieldsets) + [
        ('Thông tin mở rộng (App)', {'fields': ('role', 'phone', 'avatar', 'loyalty_points')}),
    ]
    
    # 3. Cấu hình form tạo mới (Add User)
    # SỬA LỖI: Tương tự, dùng list() + list[]
    add_fieldsets = list(UserAdmin.add_fieldsets) + [
        ('Thông tin mở rộng (App)', {'fields': ('email', 'role', 'phone')}),
    ]

# Đăng ký Model User
admin.site.register(User, CustomUserAdmin)