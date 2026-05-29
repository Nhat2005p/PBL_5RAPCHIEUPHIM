from django.db import models
from apps.core.models import TimeStampedModel

class ChatMessage(TimeStampedModel):
    sender = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='sent_msgs')
    receiver = models.ForeignKey('users.User', on_delete=models.CASCADE, null=True, blank=True) # Null = Gửi Admin
    message = models.TextField()
    is_read = models.BooleanField(default=False)

class SystemLog(models.Model):
    actor = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    action_type = models.CharField(max_length=50) # LOGIN, UPDATE_MOVIE
    target = models.CharField(max_length=255)     # Chi tiết đối tượng bị tác động
    ip_address = models.GenericIPAddressField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)