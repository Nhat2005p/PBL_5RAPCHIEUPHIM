from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, InventoryLogViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'logs', InventoryLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('api/reports/', include('apps.reports.urls')), # <--- Gắn app reports vào đây
]