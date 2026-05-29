from rest_framework import viewsets, permissions, parsers, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly

# Import Models
from .models import Movie, Room, Seat, Cinema, Showtime, Review
# Import Ticket từ app bookings (Bắt buộc phải có app này để check ghế)
# Nếu chưa có file này, bạn tạm thời comment dòng dưới lại
try:
    from apps.bookings.models import Ticket
except ImportError:
    Ticket = None

# Import Serializers
from .serializers import (
    MovieSerializer, MoviePublicSerializer,
    CinemaSerializer, RoomSerializer, SeatSerializer,
    ShowtimeSerializer, ReviewSerializer
)

# Permission: Admin sửa, Khách chỉ xem
class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS: return True
        return bool(request.user and request.user.is_staff)

# ==========================================
# 1. RẠP & PHÒNG (Tự động sinh ghế)
# ==========================================
class CinemaViewSet(viewsets.ModelViewSet):
    queryset = Cinema.objects.all()
    serializer_class = CinemaSerializer
    permission_classes = [IsAdminOrReadOnly]

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        """Khi tạo phòng -> Tự động sinh 200 ghế (10 hàng, 20 ghế/hàng)"""
        room = serializer.save()
        seats = []
        rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
        for row in rows:
            for number in range(1, 21):
                # Logic: 2 hàng cuối (I, J) là VIP, còn lại là STD
                seat_type = 'VIP' if row in ['I', 'J'] else 'STD'
                seats.append(Seat(room=room, row=row, number=number, seat_type=seat_type))
        Seat.objects.bulk_create(seats)

class SeatViewSet(viewsets.ModelViewSet):
    queryset = Seat.objects.all().order_by('row', 'number')
    serializer_class = SeatSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    @action(detail=False, methods=['post'], url_path='bulk-update')
    def bulk_update(self, request):
        """API cập nhật nhanh loại ghế (VD: Bảo trì cả hàng A)"""
        seat_ids = request.data.get('seat_ids', [])
        new_type = request.data.get('seat_type', 'STD')
        is_active = request.data.get('is_active', True)

        if not seat_ids: 
            return Response({'detail': 'Chưa chọn ghế'}, status=400)
        
        Seat.objects.filter(id__in=seat_ids).update(seat_type=new_type, is_active=is_active)
        return Response({'message': 'Cập nhật thành công'})

# ==========================================
# 2. PHIM (Quản lý Admin)
# ==========================================
class MovieViewSet(viewsets.ModelViewSet):
    """API quản lý phim cho Admin"""
    queryset = Movie.objects.all().order_by('-created_at')
    serializer_class = MovieSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser] # Hỗ trợ upload ảnh
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']

# ==========================================
# 3. SUẤT CHIẾU & TRẠNG THÁI GHẾ
# ==========================================
class ShowtimeViewSet(viewsets.ModelViewSet):
    queryset = Showtime.objects.all().order_by('start_time')
    serializer_class = ShowtimeSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        qs = super().get_queryset()
        # Lọc theo phim, rạp, ngày (Dùng request.GET chuẩn Django)
        movie_id = self.request.GET.get('movie')
        room_id = self.request.GET.get('room')
        date = self.request.GET.get('date') # YYYY-MM-DD
        
        if movie_id: qs = qs.filter(movie_id=movie_id)
        if room_id: qs = qs.filter(room_id=room_id)
        if date: qs = qs.filter(start_time__date=date)
        return qs

    @action(detail=True, methods=['get'])
    def seats_status(self, request, pk=None):
        """API lấy sơ đồ ghế và trạng thái đã đặt"""
        showtime = self.get_object()
        
        # 1. Lấy tất cả ghế trong phòng
        all_seats = Seat.objects.filter(room=showtime.room).values(
            'id', 'row', 'number', 'seat_type', 'is_active'
        )
        
        # 2. Lấy ghế đã bán (Nếu chưa có app Ticket thì trả về rỗng)
        booked_seat_ids = []
        if Ticket:
            booked_seat_ids = Ticket.objects.filter(
                booking__showtime=showtime,
                booking__status__in=['PAID', 'CHECKED_IN', 'HOLD']
            ).values_list('seat_id', flat=True)

        return Response({
            "showtime_info": {
                "id": showtime.id,
                "movie": showtime.movie.title,
                "room": showtime.room.name,
                "cinema": showtime.room.cinema.name,
                "start_time": showtime.start_time,
                "price": showtime.base_price
            },
            "all_seats": list(all_seats),
            "booked_seat_ids": list(booked_seat_ids)
        })

# ==========================================
# 4. REVIEW
# ==========================================
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        movie_id = self.request.GET.get('movie_id')
        if movie_id: return self.queryset.filter(movie_id=movie_id)
        return self.queryset

    def perform_create(self, serializer):
        # Tự động gán user đang login
        serializer.save(user=self.request.user)

# ==========================================
# 5. PUBLIC API (Cho trang chủ Client)
# ==========================================
class PublicMovieViewSet(viewsets.ReadOnlyModelViewSet):
    """API Phim tối ưu cho khách hàng (Có lọc, tìm kiếm)"""
    # Lọc phim đang chiếu hoặc sắp chiếu
    queryset = Movie.objects.filter(status__in=['NOW_SHOWING', 'COMING_SOON'])
    serializer_class = MoviePublicSerializer
    permission_classes = [AllowAny] 
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']

    def get_queryset(self):
        qs = super().get_queryset()
        
        # Lọc theo Trạng thái
        status_param = self.request.GET.get('status')
        if status_param: 
            qs = qs.filter(status=status_param)
            
        # Lọc theo Thể loại (Dùng mã: ACTION, HORROR...)
        genre_param = self.request.GET.get('genre')
        if genre_param:
            qs = qs.filter(genre=genre_param)
            
        return qs