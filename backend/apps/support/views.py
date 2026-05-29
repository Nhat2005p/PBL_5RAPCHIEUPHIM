from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request # <--- Thêm dòng này
from django.db.models import Q
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# Import các model và serializer của bạn (giữ nguyên)
from .models import ChatMessage, SystemLog
from .serializers import ChatMessageSerializer, SystemLogSerializer

class ChatMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Ép kiểu cho Pylance hiểu đây là DRF Request và User có role
        request: Request = self.request # type: ignore
        user = request.user
        
        # Bỏ qua cảnh báo tĩnh bằng # type: ignore
        if getattr(user, 'role', None) in ['ADMIN', 'MANAGER']:
            # Lấy query_params từ DRF request
            user_id = request.query_params.get('user_id') # type: ignore
            if user_id:
                return ChatMessage.objects.filter(Q(sender_id=user_id) | Q(receiver_id=user_id)).order_by('created_at')
            return ChatMessage.objects.all().order_by('-created_at')
        else:
            return ChatMessage.objects.filter(Q(sender=user) | Q(receiver=user)).order_by('created_at')

    def perform_create(self, serializer):
        request: Request = self.request # type: ignore
        user = request.user
        
        # 1. Lưu tin nhắn vào DB
        if getattr(user, 'role', None) in ['ADMIN', 'MANAGER']:
            receiver_id = request.data.get('receiver') # type: ignore
            msg = serializer.save(sender=user, receiver_id=receiver_id)
            room_id = str(receiver_id)
        else:
            msg = serializer.save(sender=user, receiver=None)
            room_id = str(user.id)

        # 2. Phát sóng (Broadcast) qua WebSocket
        msg_data = ChatMessageSerializer(msg).data
        channel_layer = get_channel_layer()
        
        # Push cho khách hàng
        async_to_sync(channel_layer.group_send)( # type: ignore
            f'chat_{room_id}', 
            { 'type': 'chat_message', 'message': msg_data }
        )
        
        # Push cho tất cả Admin đang online
        async_to_sync(channel_layer.group_send)( # type: ignore
            'chat_admin', 
            { 'type': 'chat_message', 'message': msg_data }
        )
class SystemLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Admin xem nhật ký hệ thống (Chỉ đọc)"""
    queryset = SystemLog.objects.all().order_by('-created_at')
    serializer_class = SystemLogSerializer
    permission_classes = [permissions.IsAdminUser]