from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatMessageViewSet, SystemLogViewSet

router = DefaultRouter()
router.register(r'chat', ChatMessageViewSet, basename='chat')
router.register(r'logs', SystemLogViewSet, basename='logs')

urlpatterns = [
    path('', include(router.urls)),
]