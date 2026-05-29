from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core.models import TimeStampedModel
from datetime import timedelta

# --- 1. MOVIE MODEL ---
class Movie(TimeStampedModel):
    # Trạng thái phim (Khớp với Frontend)
    STATUS_CHOICES = (
        ('COMING_SOON', 'Sắp chiếu'),
        ('NOW_SHOWING', 'Đang chiếu'),
        ('STOPPED', 'Ngừng chiếu'),
    )

    # Phân loại độ tuổi (Hiển thị nhãn T13, T18...)
    RATING_CHOICES = (
        ('P', 'P - Mọi lứa tuổi'),
        ('T13', 'T13 - Trên 13 tuổi'),
        ('T16', 'T16 - Trên 16 tuổi'),
        ('T18', 'T18 - Trên 18 tuổi'),
        ('K', 'K - Khán giả dưới 13 tuổi có người bảo hộ'),
    )
    
    # Thể loại phim
    GENRE_CHOICES = (
        ('ACTION', 'Hành động'), ('ROMANCE', 'Tình cảm'),
        ('HORROR', 'Kinh dị'), ('COMEDY', 'Hài'), 
        ('SCI_FI', 'Viễn tưởng'), ('ANIMATION', 'Hoạt hình'),
        ('DRAMA', 'Tâm lý'), ('FAMILY', 'Gia đình')
    )

    title = models.CharField(max_length=255, verbose_name="Tên phim")
    description = models.TextField(verbose_name="Mô tả", blank=True)
    director = models.CharField(max_length=100, verbose_name="Đạo diễn", null=True, blank=True)
    cast = models.TextField(verbose_name="Diễn viên", null=True, blank=True)
    duration_minutes = models.IntegerField(verbose_name="Thời lượng (phút)", help_text="Nhập số phút")
    release_date = models.DateField(verbose_name="Ngày khởi chiếu")
    trailer_url = models.URLField(verbose_name="Link Trailer", blank=True)
    poster = models.ImageField(upload_to='movies/posters/', verbose_name="Poster")
    
    genre = models.CharField(max_length=20, choices=GENRE_CHOICES, default='ACTION', verbose_name="Thể loại")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='COMING_SOON', verbose_name="Trạng thái")
    age_rating = models.CharField(max_length=5, choices=RATING_CHOICES, default='P', verbose_name="Nhãn tuổi")

    def __str__(self): return self.title

    class Meta:
        verbose_name = "Phim"
        verbose_name_plural = "Quản lý Phim"
        ordering = ['-release_date']


# --- 2. CINEMA & ROOM ---
class Cinema(TimeStampedModel):
    name = models.CharField(max_length=100, verbose_name="Tên rạp")
    address = models.TextField(verbose_name="Địa chỉ")
    hotline = models.CharField(max_length=20, blank=True, verbose_name="Hotline")

    def __str__(self): return self.name
    
    class Meta:
        verbose_name = "Rạp chiếu"
        verbose_name_plural = "Danh sách Rạp"

class Room(TimeStampedModel):
    ROOM_TYPES = (('2D', 'Standard 2D'), ('3D', '3D'), ('IMAX', 'IMAX'))

    cinema = models.ForeignKey(Cinema, on_delete=models.CASCADE, verbose_name="Thuộc rạp")
    name = models.CharField(max_length=50, verbose_name="Tên phòng") # VD: Rap 1
    type = models.CharField(max_length=20, choices=ROOM_TYPES, default='2D', verbose_name="Định dạng")
    
    def __str__(self): return f"{self.cinema.name} - {self.name} ({self.type})"

    class Meta:
        verbose_name = "Phòng chiếu"
        verbose_name_plural = "Danh sách Phòng"


# --- 3. SEAT (GHẾ NGỒI) ---
class Seat(models.Model):
    TYPE_CHOICES = (
        ('STD', 'Ghế thường'), 
        ('VIP', 'Ghế VIP'), 
        ('SWT', 'Sweetbox (Cặp đôi)')
    )

    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='seats', verbose_name="Phòng")
    row = models.CharField(max_length=5, verbose_name="Hàng ghế") # A, B, C
    number = models.IntegerField(verbose_name="Số ghế")       # 1, 2, 3
    seat_type = models.CharField(max_length=3, choices=TYPE_CHOICES, default='STD', verbose_name="Loại ghế")
    is_active = models.BooleanField(default=True, verbose_name="Có thể sử dụng") # Để đánh dấu ghế hỏng
    
    class Meta:
        unique_together = ('room', 'row', 'number') # Một phòng không thể có 2 ghế A1
        verbose_name = "Ghế ngồi"
        verbose_name_plural = "Sơ đồ Ghế"
        ordering = ['row', 'number']
    
    def __str__(self): return f"{self.room.name} | {self.row}{self.number} ({self.seat_type})"


# --- 4. SHOWTIME (LỊCH CHIẾU - QUAN TRỌNG) ---
class Showtime(TimeStampedModel):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, verbose_name="Phim")
    room = models.ForeignKey(Room, on_delete=models.CASCADE, verbose_name="Phòng chiếu")
    start_time = models.DateTimeField(verbose_name="Giờ bắt đầu")
    base_price = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="Giá vé cơ bản (VNĐ)")
    
    @property
    def end_time(self):
        """Tự động tính giờ kết thúc dựa trên thời lượng phim"""
        return self.start_time + timedelta(minutes=self.movie.duration_minutes)

    def clean(self):
        """Kiểm tra logic: Không được tạo lịch chiếu chồng chéo trong cùng 1 phòng"""
        if not self.start_time:
            return

        # Tính giờ kết thúc dự kiến
        end_time_forecast = self.start_time + timedelta(minutes=self.movie.duration_minutes)

        # Tìm các suất chiếu khác trong cùng phòng mà có thời gian trùng lặp
        conflicting_showtimes = Showtime.objects.filter(
            room=self.room,
            start_time__lt=end_time_forecast, # Bắt đầu trước khi suất này kết thúc
            start_time__gt=self.start_time - timedelta(minutes=180) # Giới hạn query cho nhanh
        ).exclude(pk=self.pk) # Loại trừ chính nó (khi đang sửa)

        for show in conflicting_showtimes:
            if show.end_time > self.start_time:
                raise ValidationError(f"Lịch chiếu bị trùng! Phòng {self.room.name} đang chiếu '{show.movie.title}' từ {show.start_time.strftime('%H:%M')} đến {show.end_time.strftime('%H:%M')}.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self): return f"{self.movie.title} | {self.start_time.strftime('%d/%m %H:%M')}"

    class Meta:
        verbose_name = "Suất chiếu"
        verbose_name_plural = "Quản lý Suất chiếu"
        ordering = ['start_time']


# --- 5. REVIEW ---
class Review(TimeStampedModel):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, verbose_name="Người dùng")
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='reviews', verbose_name="Phim")
    rating = models.IntegerField(
        default=5, 
        validators=[MinValueValidator(1), MaxValueValidator(5)], # Chỉ cho phép 1-5 sao
        verbose_name="Điểm (1-5)"
    )
    comment = models.TextField(verbose_name="Bình luận")

    class Meta:
        unique_together = ('user', 'movie') # Mỗi người chỉ được review 1 lần mỗi phim
        verbose_name = "Đánh giá"
        verbose_name_plural = "Danh sách Đánh giá"

    def __str__(self): return f"{self.user.username} - {self.movie.title}"