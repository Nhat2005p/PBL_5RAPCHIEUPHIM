from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Promotion, LoyaltyPolicy
from .serializers import PromotionSerializer, LoyaltyPolicySerializer

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == 'ADMIN')

# 1. Quản lý Mã giảm giá (CRUD)
class PromotionViewSet(viewsets.ModelViewSet):
    queryset = Promotion.objects.all().order_by('-created_at')
    serializer_class = PromotionSerializer
    permission_classes = [IsAdminUser]

# 2. Quản lý Cấu hình Tích điểm (Chỉ lấy/sửa 1 bản ghi duy nhất)
class LoyaltyPolicyView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Luôn lấy bản ghi đầu tiên, nếu chưa có thì tạo mặc định
        policy, created = LoyaltyPolicy.objects.get_or_create(id=1)
        serializer = LoyaltyPolicySerializer(policy)
        return Response(serializer.data)

    def put(self, request):
        policy, created = LoyaltyPolicy.objects.get_or_create(id=1)
        serializer = LoyaltyPolicySerializer(policy, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)