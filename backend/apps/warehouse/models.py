from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel
from django.core.exceptions import ValidationError

class Product(TimeStampedModel):
    """Sản phẩm trong kho (Nguyên liệu & Thành phẩm)"""
    CATEGORY_CHOICES = [
        ('FOOD', 'Đồ ăn (Bắp, Snack)'),
        ('DRINK', 'Đồ uống (Nước ngọt)'),
        ('PACKAGING', 'Bao bì (Ly, Túi)'),
        ('OTHER', 'Khác'),
    ]
    
    UNIT_CHOICES = [
        ('PCS', 'Cái/Lon/Chai'),
        ('KG', 'Kilogram'),
        ('BOX', 'Thùng'),
        ('BAG', 'Bao'),
    ]

    code = models.CharField(max_length=50, unique=True, verbose_name="Mã hàng (SKU)")
    name = models.CharField(max_length=100, verbose_name="Tên sản phẩm")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='FOOD', verbose_name="Danh mục")
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='PCS', verbose_name="Đơn vị tính")
    
    price = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Giá nhập/vốn") # type: ignore
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    
    stock_quantity = models.IntegerField(default=0, verbose_name="Tồn kho")
    min_threshold = models.IntegerField(default=10, verbose_name="Mức báo động (Tối thiểu)")
    is_active = models.BooleanField(default=True, verbose_name="Đang kinh doanh")

    class Meta:
        verbose_name = "Sản phẩm kho"
        verbose_name_plural = "Danh sách Kho"
        ordering = ['category', 'name']

    def __str__(self): 
        return f"{self.name} ({self.stock_quantity} {self.unit})"

class InventoryLog(TimeStampedModel):
    """Phiếu Nhập / Xuất kho"""
    TYPE_CHOICES = [
        ('IMPORT', 'Nhập kho'),
        ('EXPORT', 'Xuất kho / Hủy'),
    ]

    staff = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name="Nhân viên")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='logs', verbose_name="Sản phẩm")
    
    trans_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='IMPORT', verbose_name="Loại phiếu")
    quantity = models.PositiveIntegerField(verbose_name="Số lượng") # Luôn nhập số dương
    
    reason = models.TextField(blank=True, verbose_name="Ghi chú / Lý do")

    class Meta:
        verbose_name = "Phiếu kho"
        verbose_name_plural = "Lịch sử Nhập/Xuất"
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        # LOGIC TỰ ĐỘNG CẬP NHẬT KHO
        if not self.pk: # Chỉ chạy khi tạo mới (không chạy khi sửa phiếu cũ để tránh sai lệch)
            if self.trans_type == 'IMPORT':
                self.product.stock_quantity += self.quantity
            elif self.trans_type == 'EXPORT':
                if self.product.stock_quantity < self.quantity:
                    raise ValidationError(f"Không đủ hàng để xuất! Tồn kho hiện tại: {self.product.stock_quantity}")
                self.product.stock_quantity -= self.quantity
            
            # Lưu thay đổi vào bảng Product
            self.product.save()
            
        super().save(*args, **kwargs)