from django.db import models

class TimeStampedModel(models.Model):
    """Lớp trừu tượng tự động lưu thời gian tạo và cập nhật"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True