import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Lấy tên phòng từ URL (có thể là ID của khách, hoặc chữ 'admin')
        self.room_name = self.scope['url_route']['kwargs']['room_name'] # type: ignore
        self.room_group_name = f'chat_{self.room_name}'

        # Tham gia vào nhóm chat
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Rời nhóm khi đóng web
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Hàm nhận tin nhắn từ Backend gửi sang và đẩy xuống Frontend
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message']
        }))