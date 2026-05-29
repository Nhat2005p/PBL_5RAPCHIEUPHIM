import json
from channels.generic.websocket import AsyncWebsocketConsumer

class SeatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Lấy ID suất chiếu từ URL
        self.showtime_id = self.scope['url_route']['kwargs']['showtime_id'] # type: ignore
        self.room_group_name = f'showtime_{self.showtime_id}'

        # Tham gia vào "Phòng" (Group) của suất chiếu này
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Rời phòng khi user đóng web
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Nhận tin nhắn từ Frontend (Khi user click chọn ghế)
    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data['action']   # 'lock_seat' hoặc 'unlock_seat'
        seat_id = data['seat_id']

        # Phát sóng (Broadcast) cho TẤT CẢ những người khác đang trong phòng
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'seat_message',
                'action': action,
                'seat_id': seat_id
            }
        )

    # Hàm thực thi việc gửi tin nhắn ngược lại cho Frontend
    async def seat_message(self, event):
        await self.send(text_data=json.dumps({
            'action': event['action'],
            'seat_id': event['seat_id']
        }))