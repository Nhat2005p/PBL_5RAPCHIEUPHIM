from rest_framework import viewsets, permissions
from .models import FoodItem
from .serializers import FoodItemSerializer

class FoodItemViewSet(viewsets.ModelViewSet):
    queryset = FoodItem.objects.all().order_by('-created_at')
    serializer_class = FoodItemSerializer
    
    # Cấu hình quyền: Ai cũng được xem list bắp nước, nhưng chỉ Admin mới được Thêm/Sửa/Xóa
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]