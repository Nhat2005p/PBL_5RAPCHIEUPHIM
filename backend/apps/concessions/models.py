from django.db import models
from apps.core.models import TimeStampedModel

class FoodItem(TimeStampedModel):
    name = models.CharField(max_length=100, verbose_name="Tên Combo/Món")
    description = models.TextField(blank=True, verbose_name="Mô tả")
    price = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="Giá bán")
    image = models.ImageField(upload_to='foods/', verbose_name="Hình ảnh")
    is_active = models.BooleanField(default=True, verbose_name="Đang kinh doanh")

    class Meta:
        verbose_name = "Bắp nước"
        verbose_name_plural = "Quản lý Bắp nước"

    def __str__(self): return self.name