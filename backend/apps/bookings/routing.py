from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Cấu trúc URL WebSocket: ws://127.0.0.1:8000/ws/showtimes/<id>/seats/
    re_path(r'ws/showtimes/(?P<showtime_id>\w+)/seats/$', consumers.SeatConsumer.as_asgi()), # type: ignore
]