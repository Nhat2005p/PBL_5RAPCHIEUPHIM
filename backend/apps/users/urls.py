from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

# Import các View
from .views import (
    RegisterView, 
    UserProfileView, 
    MyTokenObtainPairView, 
    EmployeeViewSet,
    CustomerViewSet 
)

# --- KHỞI TẠO ROUTER (Đăng ký ViewSet ở đây) ---
router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employees')

# [SỬA LỖI TẠI ĐÂY]: Phải đặt register ở ngoài, KHÔNG được để trong list urlpatterns
router.register(r'customers', CustomerViewSet, basename='customers') 


urlpatterns = [
    # --- 1. CÁC API AUTH (Custom Views) ---
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='auth_profile'),
    
    # --- 2. CÁC API TỰ ĐỘNG (Router) ---
    # Dòng này sẽ bao gồm cả URL của employees và customers
    path('', include(router.urls)),
]