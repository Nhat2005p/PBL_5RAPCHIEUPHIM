from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Nhận room_name (ID khách hàng hoặc chữ 'admin')
    re_path(r'ws/chat/(?P<room_name>\w+)/$', consumers.ChatConsumer.as_asgi()), # type: ignore
]