from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from decimal import Decimal
import uuid
import random
import string

# Import base model của bạn
from apps.core.models import TimeStampedModel 

# --- 1. MODEL KHUYẾN MÃI (PROMOTION) ---
class Promotion(TimeStampedModel):
    DISCOUNT_TYPES = [('PERCENT', '%'), ('AMOUNT', 'VND')]
    
    name = models.CharField(max_length=255, verbose_name="Tên chương trình")
    code = models.CharField(max_length=50, unique=True, verbose_name="Mã giảm giá")
    description = models.TextField(blank=True, verbose_name="Mô tả")
    
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPES, default='PERCENT', verbose_name="Loại giảm")
    discount_value = models.DecimalField(max_digits=12, decimal_places=0, verbose_name="Giá trị giảm")
    
    min_spend = models.DecimalField(max_digits=12, decimal_places=0, default=Decimal('0'), verbose_name="Chi tiêu tối thiểu")
    max_discount = models.DecimalField(max_digits=12, decimal_places=0, null=True, blank=True, verbose_name="Giảm tối đa (cho %)")
    
    quantity_limit = models.IntegerField(default=100, verbose_name="Tổng số lượng mã")
    used_count = models.IntegerField(default=0, verbose_name="Đã sử dụng")
    
    start_date = models.DateTimeField(default=timezone.now, verbose_name="Ngày bắt đầu")
    valid_until = models.DateTimeField(verbose_name="Hạn sử dụng")
    is_active = models.BooleanField(default=True, verbose_name="Kích hoạt")

    class Meta:
        verbose_name = "Khuyến mãi"
        verbose_name_plural = "Quản lý Khuyến mãi"

    def __str__(self):
        return f"{self.code} - {self.name}"

    @property
    def is_valid(self):
        now = timezone.now()
        return (
            self.is_active and
            self.start_date <= now <= self.valid_until and
            self.used_count < self.quantity_limit
        )


# --- 2. MODEL ĐẶT VÉ (BOOKING) ---
class Booking(TimeStampedModel):
    STATUS_CHOICES = (
        ('HOLD', 'Đang giữ vé'),       # Giữ ghế trong 5-10p chờ thanh toán
        ('PENDING', 'Chờ xử lý'),      # Đang gọi API thanh toán
        ('PAID', 'Đã thanh toán'),     # Thành công
        ('CANCELLED', 'Đã hủy'),       # Hết giờ hoặc hủy tay
    )
    
    PAYMENT_METHODS = (
        ('CASH', 'Tiền mặt'),
        ('MOMO', 'Ví MoMo'),
        ('ZALOPAY', 'ZaloPay'),
        ('BANK', 'Chuyển khoản/Thẻ'),
        ('VNPAY', 'VNPay'),
    )

    # Dùng chuỗi ngắn 8 ký tự làm mã vé để khách dễ đọc (thay vì UUID quá dài)
    code = models.CharField(max_length=10, unique=True, editable=False, verbose_name="Mã vé")
    
    # Người dùng & Nhân viên
    user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings', verbose_name="Khách hàng")
    staff = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='sales', verbose_name="Nhân viên bán")
    
    # SỬA: Thêm null=True, blank=True để cho phép đơn hàng không có suất chiếu (chỉ mua bắp)
    showtime = models.ForeignKey('cinema.Showtime', on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings', verbose_name="Suất chiếu")
    
    # Khuyến mãi & Tài chính
    promotion = models.ForeignKey(Promotion, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Mã KM áp dụng")
    total_amount = models.DecimalField(max_digits=12, decimal_places=0, default=Decimal('0'), verbose_name="Tổng tiền")
    discount_amount = models.DecimalField(max_digits=12, decimal_places=0, default=Decimal('0'), verbose_name="Số tiền giảm")
    final_amount = models.DecimalField(max_digits=12, decimal_places=0, default=Decimal('0'), verbose_name="Thực thu")
    
    # Trạng thái & Thanh toán
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='HOLD', verbose_name="Trạng thái")
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, null=True, blank=True, verbose_name="Phương thức TT")
    transaction_id = models.CharField(max_length=100, null=True, blank=True, verbose_name="Mã giao dịch Ngân hàng")
    
    # Logic giữ ghế
    hold_expires_at = models.DateTimeField(null=True, blank=True, verbose_name="Hết hạn giữ vé")

    class Meta:
        verbose_name = "Đơn đặt vé"
        verbose_name_plural = "Danh sách Đơn vé"
        ordering = ['-created_at']

    def __str__(self):
        return f"#{self.code} - {self.showtime} ({self.status})"

    def save(self, *args, **kwargs):
        # Tự động sinh mã vé ngắn gọn nếu chưa có
        if not self.code:
            self.code = self.generate_booking_code()
        
        # Tự động tính thời gian hết hạn giữ vé (VD: 10 phút sau khi tạo)
        if not self.pk and self.status == 'HOLD' and not self.hold_expires_at:
            self.hold_expires_at = timezone.now() + timezone.timedelta(minutes=10)
            
        super().save(*args, **kwargs)

    @staticmethod
    def generate_booking_code():
        """Sinh mã vé ngẫu nhiên gồm 8 ký tự chữ và số in hoa"""
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

    @property
    def is_expired(self):
        """Kiểm tra xem vé HOLD đã hết hạn chưa"""
        # Phải kiểm tra hold_expires_at có tồn tại không trước khi so sánh
        if self.status == 'HOLD' and self.hold_expires_at:
            return timezone.now() > self.hold_expires_at
        return False


# --- 3. MODEL CHI TIẾT VÉ (TICKET) ---
class Ticket(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='tickets')
    seat = models.ForeignKey('cinema.Seat', on_delete=models.CASCADE, verbose_name="Ghế")
    price = models.DecimalField(max_digits=12, decimal_places=0, verbose_name="Giá vé")
    
    # Kiểm soát vào cổng
    is_checked_in = models.BooleanField(default=False, verbose_name="Đã soát vé")
    check_in_time = models.DateTimeField(null=True, blank=True, verbose_name="Thời gian vào")

    class Meta:
        # Một booking không thể đặt trùng 1 ghế (cơ bản)
        unique_together = ('booking', 'seat') 
        verbose_name = "Vé xem phim"
        verbose_name_plural = "Chi tiết Vé"

    def __str__(self):
        return f"{self.seat.row}{self.seat.number} - {self.booking.code}"
    
    def clean(self):
        # NÂNG CAO: Kiểm tra xem ghế này đã bị booking khác mua trong cùng suất chiếu chưa
        # Lưu ý: Logic này nên đặt ở Serializer để tối ưu hiệu năng, nhưng để ở Model để chắc chắn.
        collision = Ticket.objects.filter(
            booking__showtime=self.booking.showtime, # Cùng suất chiếu
            seat=self.seat,                          # Cùng ghế
            booking__status__in=['PAID', 'HOLD']     # Đã thanh toán hoặc đang giữ
        ).exclude(booking=self.booking)              # Trừ chính nó ra

        if collision.exists():
            raise ValidationError(f"Ghế {self.seat} đã có người đặt!")


# --- 4. MODEL BẮP NƯỚC ĐI KÈM (CONCESSION ITEM) ---
class ConcessionItem(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='concessions')
    
    # Liên kết với kho hàng (Warehouse App)
    product = models.ForeignKey('warehouse.Product', on_delete=models.PROTECT, verbose_name="Sản phẩm")
    
    quantity = models.PositiveIntegerField(default=1, verbose_name="Số lượng")
    price = models.DecimalField(max_digits=12, decimal_places=0, verbose_name="Đơn giá lúc mua")
    total_price = models.DecimalField(max_digits=12, decimal_places=0, verbose_name="Thành tiền")

    class Meta:
        verbose_name = "Combo đã đặt"
        verbose_name_plural = "Chi tiết Bắp nước"

    def __str__(self):
        return f"{self.product.name} (x{self.quantity})"

    def save(self, *args, **kwargs):
        # Tự động tính thành tiền
        self.total_price = self.price * self.quantity
        super().save(*args, **kwargs)