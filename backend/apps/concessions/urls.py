from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FoodItemViewSet

# Tạo router
router = DefaultRouter()
router.register(r'foods', FoodItemViewSet) # Đăng ký API foods

urlpatterns = [
    path('', include(router.urls)),
]