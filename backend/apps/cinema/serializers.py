from rest_framework import serializers
from django.db.models import Avg
from .models import Movie, Cinema, Room, Seat, Showtime, Review

# --- 1. CINEMA & ROOM ---
class CinemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cinema
        fields = '__all__'

class RoomSerializer(serializers.ModelSerializer):
    cinema_name = serializers.CharField(source='cinema.name', read_only=True)
    
    class Meta:
        model = Room
        fields = '__all__'

# --- 2. SEAT ---
class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = '__all__'

# --- 3. MOVIE ---
class MovieSerializer(serializers.ModelSerializer):
    """Serializer cho Admin (CRUD đầy đủ)"""
    class Meta:
        model = Movie
        fields = '__all__'

class MoviePublicSerializer(serializers.ModelSerializer):
    """Serializer cho Khách (Chỉ đọc, thêm thông tin bổ trợ)"""
    # Hiển thị tên thể loại (VD: "Hành động") thay vì mã (VD: "ACTION")
    genre_display = serializers.CharField(source='get_genre_display', read_only=True)
    # Hiển thị tên nhãn tuổi (VD: "T18 - Trên 18 tuổi")
    age_rating_display = serializers.CharField(source='get_age_rating_display', read_only=True)
    
    # Các trường tính toán
    avg_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'poster', 'trailer_url', 'duration_minutes', 
            'release_date', 'description', 'director', 'cast',
            'genre', 'genre_display', 
            'status', 
            'age_rating', 'age_rating_display',
            'avg_rating', 'total_reviews'
        ]

    def get_avg_rating(self, obj):
        # Tính điểm trung bình từ các review liên quan
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0

    def get_total_reviews(self, obj):
        return obj.reviews.count()

# --- 4. SHOWTIME ---
class ShowtimeSerializer(serializers.ModelSerializer):
    # Flatten dữ liệu để frontend dễ hiển thị
    movie_title = serializers.CharField(source='movie.title', read_only=True)
    poster = serializers.ImageField(source='movie.poster', read_only=True)
    cinema_name = serializers.CharField(source='room.cinema.name', read_only=True)
    room_name = serializers.CharField(source='room.name', read_only=True)
    
    class Meta:
        model = Showtime
        fields = [
            'id', 'movie', 'movie_title', 'poster',
            'room', 'room_name', 'cinema_name', 
            'start_time', 'end_time', 'base_price'
        ]

# --- 5. REVIEW ---
class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    # Giả sử User có avatar, nếu không có thì bỏ dòng dưới
    # avatar = serializers.ImageField(source='user.avatar', read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'user_name', 'rating', 'comment', 'created_at']