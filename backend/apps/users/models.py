from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.core.models import TimeStampedModel  # Nên dùng cái này để có created_at

class User(AbstractUser, TimeStampedModel):
    # AbstractUser đã có: username, password, email, first_name, last_name, is_staff, is_superuser
    
    phone = models.CharField(max_length=15, unique=True, null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    address = models.TextField(blank=True, null=True) # Nên thêm địa chỉ để giao hàng/hóa đơn

    # --- QUẢN LÝ VAI TRÒ (Thay thế cho is_customer, is_staff_member) ---
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),      # Quản trị viên hệ thống
        ('STAFF', 'Staff'),      # Nhân viên bán vé/soát vé
        ('CUSTOMER', 'Customer'),# Khách hàng mua vé
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='CUSTOMER')
    # --- KHÁCH HÀNG THÂN THIẾT ---
    loyalty_points = models.IntegerField(default=0)
    RANK_CHOICES = (
        ('BRONZE', 'Đồng'),
        ('SILVER', 'Bạc'),
        ('GOLD', 'Vàng'),
        ('DIAMOND', 'Kim Cương'),
    )
    rank = models.CharField(max_length=10, choices=RANK_CHOICES, default='BRONZE')

    class Meta:
        db_table = 'users' # <--- SỬA LẠI: Dùng số nhiều để tránh lỗi từ khóa SQL
        ordering = ['-created_at'] # Sắp xếp người mới tạo lên đầu

    def __str__(self):
        # Thêm # type: ignore để tắt báo lỗi
        return f"{self.username} ({self.get_role_display()})"  # type: ignore
    
    # Hàm tiện ích để kiểm tra nhanh (Optional)
    @property
    def is_cinema_staff(self):
        return self.role == 'STAFF' or self.role == 'ADMIN'