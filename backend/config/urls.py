from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

# 1. View trang chủ (Để kiểm tra server có sống hay không)
def home(request):
    return JsonResponse({
        "message": "Cinema API is Running...",
        "version": "1.0.0",
        "status": "success"
    })

# 2. Danh sách URL chính
urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    
    # --- MỞ KHÓA VÀ KẾT NỐI CÁC APP (ĐÃ FIX) ---
    path('api/users/', include('apps.users.urls')),       # Luồng Đăng nhập/Đăng ký/Profile
    path('api/cinema/', include('apps.cinema.urls')),     # Luồng Phim/Lịch chiếu/Phòng/Ghế
    path('api/bookings/', include('apps.bookings.urls')), # Luồng Đặt vé/Thanh toán/Check-in
    path('api/warehouse/', include('apps.warehouse.urls')), # Luồng Quản lý kho
    path('api/concessions/', include('apps.concessions.urls')), # Luồng Bán lẻ bắp nước
    path('api/promotions/', include('apps.promotions.urls')),   # Luồng Khuyến mãi
]

# 3. Cấu hình Static/Media cho file ảnh (Poster phim, QR Code)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# 4. Loại bỏ các giá trị None (nếu có) để tránh lỗi server
urlpatterns = [url for url in urlpatterns if url is not None]