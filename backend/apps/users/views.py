from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, UserSerializer, MyTokenObtainPairSerializer
from .models import User
from rest_framework import viewsets, permissions
from django.contrib.auth import get_user_model
from .serializers import EmployeeSerializer
from rest_framework import filters
from .serializers import CustomerSerializer
# 1. API Đăng ký
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,) # Ai cũng được đăng ký (không cần login)
    serializer_class = RegisterSerializer

# 2. API Login (Custom lại để dùng Serializer xịn hơn ở trên)
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# 3. API Quản lý Profile (Xem & Sửa)
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,) # Bắt buộc đăng nhập

    def get_object(self):
        # Trả về chính user đang đăng nhập (không cần truyền ID trên URL)
        return self.request.user
User = get_user_model()

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff and request.user.role == 'ADMIN')

class EmployeeViewSet(viewsets.ModelViewSet):
    # Lấy tất cả user trừ khách hàng thường (chỉ lấy Admin và Staff)
    queryset = User.objects.filter(role__in=['ADMIN', 'STAFF', 'MANAGER']).order_by('-date_joined')
    serializer_class = EmployeeSerializer
    permission_classes = [IsAdminUser] # Chỉ Admin mới được quản lý nhân sự
    # Hỗ trợ tìm kiếm
    def get_queryset(self):
        queryset = super().get_queryset()
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        return queryset
class CustomerViewSet(viewsets.ModelViewSet):
    # Chỉ lấy danh sách Khách hàng (bỏ qua Admin/Staff)
    queryset = User.objects.filter(role='CUSTOMER').order_by('-date_joined')
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated] # Nhân viên đăng nhập là dùng được
    
    # Cấu hình bộ lọc tìm kiếm
    filter_backends = [filters.SearchFilter]
    search_fields = ['phone', 'email', 'username'] # Cho phép tìm theo cả 3 trường