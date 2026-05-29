from django.db import models
from apps.core.models import TimeStampedModel
from django.utils import timezone
from decimal import Decimal # <--- Bắt buộc import

class Promotion(TimeStampedModel):
    DISCOUNT_TYPES = [('PERCENT', '%'), ('AMOUNT', 'VND')]
    
    name = models.CharField(max_length=255, verbose_name="Tên chương trình")
    code = models.CharField(max_length=50, unique=True, verbose_name="Mã giảm giá")
    description = models.TextField(blank=True, verbose_name="Mô tả")
    
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPES, default='PERCENT', verbose_name="Loại giảm")
    
    # --- FIX LỖI 2: Dùng Decimal('0') thay vì số 0 ---
    discount_value = models.DecimalField(max_digits=12, decimal_places=0, verbose_name="Giá trị giảm")
    
    min_spend = models.DecimalField(max_digits=12, decimal_places=0, default=Decimal('0'), verbose_name="Chi tiêu tối thiểu")
    
    discount_amount = models.DecimalField(max_digits=10, decimal_places=0, default=Decimal('0'), verbose_name="Số tiền giảm trực tiếp")

    max_discount = models.DecimalField(max_digits=12, decimal_places=0, null=True, blank=True, verbose_name="Giảm tối đa (cho %)")
    
    quantity_limit = models.IntegerField(default=100, verbose_name="Tổng số lượng mã")
    used_count = models.IntegerField(default=0, verbose_name="Đã sử dụng")
    
    start_date = models.DateTimeField(default=timezone.now, verbose_name="Ngày bắt đầu")
    valid_until = models.DateTimeField(verbose_name="Hạn sử dụng")
    is_active = models.BooleanField(default=True, verbose_name="Kích hoạt")

    class Meta:
        verbose_name = "Mã giảm giá"
        verbose_name_plural = "Quản lý Khuyến mãi"

    # --- FIX LỖI 3: Gọi đúng tên trường discount_value ---
    def __str__(self): 
        unit = "%" if self.discount_type == 'PERCENT' else "VND"
        return f"{self.code} (-{self.discount_value}{unit})"

    @property
    def is_valid(self):
        now = timezone.now()
        return (
            self.is_active and
            self.start_date <= now <= self.valid_until and
            self.used_count < self.quantity_limit
        )
class LoyaltyPolicy(TimeStampedModel):
    """Cấu hình tích điểm và đổi điểm"""
    # VD: 10.000 VND = 1 điểm
    earning_rate = models.DecimalField(max_digits=10, decimal_places=0, default=Decimal('10000'), verbose_name="Số tiền để tích 1 điểm")
    
    # VD: 1 điểm = 1.000 VND (khi thanh toán)
    redemption_rate = models.DecimalField(max_digits=10, decimal_places=0, default=Decimal('1000'), verbose_name="Giá trị quy đổi 1 điểm (VND)")
    
    # VD: Chỉ cho phép dùng điểm khi đơn hàng trên 100k
    min_order_value_to_redeem = models.DecimalField(max_digits=10, decimal_places=0, default=Decimal('0'), verbose_name="Đơn tối thiểu để dùng điểm")

    class Meta:
        verbose_name = "Chính sách tích điểm"
        verbose_name_plural = "Cấu hình Tích điểm"

    def __str__(self):
        return "Cấu hình Tích điểm hiện tại"

    def save(self, *args, **kwargs):
        # Đảm bảo chỉ có 1 bản ghi duy nhất trong Database (Singleton)
        if not self.pk and LoyaltyPolicy.objects.exists():
            return # Không tạo thêm nếu đã có
        return super().save(*args, **kwargs)