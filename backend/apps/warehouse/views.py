from rest_framework import viewsets, permissions, filters
from .models import Product, InventoryLog
from .serializers import ProductSerializer, InventoryLogSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code'] # Tìm theo tên hoặc mã

class InventoryLogViewSet(viewsets.ModelViewSet):
    queryset = InventoryLog.objects.all()
    serializer_class = InventoryLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Tự động gán nhân viên đang đăng nhập là người tạo phiếu
        serializer.save(staff=self.request.user)