from django.contrib import admin
from .models import Cinema, Room, Seat, Movie, Showtime, Review

# 1. Đăng ký Rạp
@admin.register(Cinema)
class CinemaAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'address', 'hotline')
    search_fields = ('name',)

# 2. Đăng ký Phòng
@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'cinema', 'type')
    list_filter = ('cinema', 'type')

# 3. Đăng ký Phim
@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('title', 'release_date', 'status', 'duration_minutes')
    list_filter = ('status', 'genre')
    search_fields = ('title',)

# 4. Đăng ký Lịch chiếu
@admin.register(Showtime)
class ShowtimeAdmin(admin.ModelAdmin):
    list_display = ('movie', 'room', 'start_time', 'base_price')
    list_filter = ('room__cinema', 'start_time')

# 5. Đăng ký Ghế & Review (Đơn giản)
admin.site.register(Seat)
admin.site.register(Review)