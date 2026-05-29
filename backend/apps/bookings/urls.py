from django.urls import path
from .views import AdminDashboardStatsView,CheckInTicketView,CancelBookingView # <--- Import thêm
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet
router = DefaultRouter()
# Tạo link: POST /api/bookings/ (Đặt vé), GET /api/bookings/ (Xem lịch sử)
router.register(r'', BookingViewSet, basename='booking')
urlpatterns = [
    # ... các url cũ ...
    path('stats/dashboard/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    
    path('check-in/', CheckInTicketView.as_view(), name='ticket-check-in'),
    path('cancel/', CancelBookingView.as_view(), name='booking-cancel'),
    path('', include(router.urls)),
]
