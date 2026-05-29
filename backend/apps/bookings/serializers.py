from rest_framework import serializers
from .models import Booking, Ticket, ConcessionItem
from apps.cinema.models import Seat, Showtime
# Giả định bạn đã có model Product trong warehouse
from apps.warehouse.models import Product 

class ConcessionInputSerializer(serializers.Serializer):
    """Input cho bắp nước (Mapping với Product trong kho)"""
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

class CreateBookingSerializer(serializers.Serializer):
    """Serializer nhận dữ liệu đặt vé từ Client"""
    showtime_id = serializers.IntegerField()
    seat_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )
    concessions = ConcessionInputSerializer(many=True, required=False)
    payment_method = serializers.CharField(required=False, default="VNPAY")

    def validate(self, data):
        showtime_id = data.get('showtime_id')
        seat_ids = data.get('seat_ids', [])

        # 1. Kiểm tra suất chiếu
        try:
            showtime = Showtime.objects.get(id=showtime_id)
        except Showtime.DoesNotExist:
            raise serializers.ValidationError("Suất chiếu không tồn tại.")

        # 2. Kiểm tra ghế đã bị đặt chưa (Logic Real-time)
        # Nếu ghế nằm trong Booking có trạng thái HOLD, PENDING, hoặc PAID -> Chặn
        taken_seats = Ticket.objects.filter(
            booking__showtime=showtime,
            booking__status__in=['HOLD', 'PENDING', 'PAID'],
            seat_id__in=seat_ids
        ).exists()

        if taken_seats:
            raise serializers.ValidationError("Ghế bạn chọn vừa có người khác giữ chỗ hoặc đã thanh toán.")

        return data

class BookingSerializer(serializers.ModelSerializer):
    """Output chi tiết đơn hàng sau khi tạo"""
    class Meta:
        model = Booking
        fields = '__all__'