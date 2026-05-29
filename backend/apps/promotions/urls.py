from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PromotionViewSet, LoyaltyPolicyView

router = DefaultRouter()
router.register(r'vouchers', PromotionViewSet)

urlpatterns = [
    path('loyalty-policy/', LoyaltyPolicyView.as_view()), # API cấu hình điểm
    path('', include(router.urls)),
]