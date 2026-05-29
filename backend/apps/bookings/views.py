from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, viewsets, status
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.db.models import Sum, Count, Q
from django.db.models.functions import Coalesce, TruncDate
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from typing import Dict, Any

# Import Models
from .models import Booking, Ticket, ConcessionItem
from apps.cinema.models import Showtime, Seat, Movie, Room
from apps.warehouse.models import Product

# Import Serializer
from .serializers import CreateBookingSerializer, BookingSerializer

# --- 1. API THỐNG KÊ DASHBOARD ---
class AdminDashboardStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        # TỔNG QUAN (SUMMARY)
        paid_bookings = Booking.objects.filter(status__in=['PAID', 'CHECKED_IN'])
        
        total_revenue = paid_bookings.aggregate(total=Coalesce(Sum('final_amount'), Decimal(0)))['total']
        total_tickets_sold = Ticket.objects.filter(booking__status__in=['PAID', 'CHECKED_IN']).count()
        
        food_revenue = ConcessionItem.objects.filter(booking__status__in=['PAID', 'CHECKED_IN']).aggregate(
            total=Coalesce(Sum('total_price'), Decimal(0))
        )['total']
        
        # Đảm bảo total_revenue là Decimal để tránh lỗi trừ
        if total_revenue is None: total_revenue = Decimal(0)
        if food_revenue is None: food_revenue = Decimal(0)

        ticket_revenue = total_revenue - food_revenue

        # BIỂU ĐỒ DOANH THU 7 NGÀY
        last_7_days = timezone.now().date() - timedelta(days=6)
        revenue_chart = (
            paid_bookings
            .filter(created_at__date__gte=last_7_days)
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(revenue=Sum('final_amount'))
            .order_by('date')
        )

        # TOP PHIM
        top_movies = (
            Movie.objects
            .annotate(
                total_revenue=Coalesce(Sum(
                    'showtime__bookings__final_amount', 
                    filter=Q(showtime__bookings__status__in=['PAID', 'CHECKED_IN'])
                ), Decimal(0)),
                tickets_count=Count(
                    'showtime__bookings__tickets',
                    filter=Q(showtime__bookings__status__in=['PAID', 'CHECKED_IN'])
                )
            )
            .exclude(total_revenue=0)
            .order_by('-total_revenue')[:5]
            .values('title', 'total_revenue', 'tickets_count')
        )

        # HIỆU SUẤT PHÒNG
        rooms_stats = []
        rooms = Room.objects.all()
        for room in rooms:
            total_seats = Seat.objects.filter(room=room).count()
            if total_seats == 0: continue

            showtimes = Showtime.objects.filter(room=room)
            total_shows = showtimes.count()
            
            if total_shows > 0:
                sold_tickets = Ticket.objects.filter(
                    booking__showtime__room=room,
                    booking__status__in=['PAID', 'CHECKED_IN']
                ).count()
                
                capacity = total_seats * total_shows
                rate = round((sold_tickets / capacity) * 100, 2) if capacity > 0 else 0
                
                rooms_stats.append({
                    "name": room.name,
                    "cinema": room.cinema.name,
                    "capacity": capacity,
                    "sold": sold_tickets,
                    "rate": rate
                })

        return Response({
            "summary": {
                "total_revenue": total_revenue,
                "ticket_revenue": ticket_revenue,
                "food_revenue": food_revenue,
                "total_tickets": total_tickets_sold
            },
            "revenue_chart": revenue_chart,
            "top_movies": top_movies,
            "room_occupancy": sorted(rooms_stats, key=lambda x: x['rate'], reverse=True)
        })

# --- 2. API CHECK-IN VÉ (SOÁT VÉ) ---
class CheckInTicketView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response({"detail": "Vui lòng cung cấp mã vé!"}, status=400)

        try:
            booking = Booking.objects.get(code=code)
        except Booking.DoesNotExist:
            return Response({"detail": "❌ Mã vé không tồn tại!"}, status=404)

        if booking.status in ['HOLD', 'PENDING']:
            return Response({"detail": "⚠️ Vé chưa thanh toán!"}, status=400)
        
        if booking.status == 'CANCELLED':
            return Response({"detail": "⛔ Vé đã bị hủy!"}, status=400)

        if not booking.showtime:
             return Response({"detail": "🍿 Đây là đơn mua Bắp nước lẻ, không có vé vào rạp!"}, status=400)

        if booking.status == 'CHECKED_IN':
            # type: ignore giúp Pylance bỏ qua lỗi không tìm thấy tickets (do related_name)
            first_ticket = booking.tickets.all().first() # type: ignore
            check_in_time = "trước đó"
            if first_ticket and first_ticket.check_in_time:
                check_in_time = first_ticket.check_in_time.strftime("%H:%M %d/%m")
            return Response({"detail": f"⚠️ Vé này ĐÃ DÙNG lúc {check_in_time}!"}, status=400)

        # XỬ LÝ CHECK-IN
        booking.status = 'CHECKED_IN'
        booking.save()

        now = timezone.now()
        booking.tickets.all().update(is_checked_in=True, check_in_time=now) # type: ignore

        seats = [f"{t.seat.row}{t.seat.number}" for t in booking.tickets.all()] # type: ignore

        return Response({
            "success": True,
            "message": "✅ HỢP LỆ - MỜI VÀO",
            "data": {
                "movie": booking.showtime.movie.title,
                "room": booking.showtime.room.name,
                "time": booking.showtime.start_time.strftime("%H:%M"),
                "seats": ", ".join(seats),
                "customer": booking.user.username if booking.user else "Khách vãng lai"
            }
        })

# --- 3. API HỦY VÉ ---
class CancelBookingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response({"detail": "Vui lòng nhập mã vé!"}, status=400)

        try:
            booking = Booking.objects.get(code=code)
        except Booking.DoesNotExist:
            return Response({"detail": "❌ Không tìm thấy đơn hàng!"}, status=404)

        if booking.status == 'CANCELLED':
            return Response({"detail": "⚠️ Vé này đã bị hủy trước đó!"}, status=400)

        if booking.status == 'CHECKED_IN':
            return Response({"detail": "⛔ Khách đã vào rạp, không thể hoàn vé!"}, status=400)

        if booking.showtime:
            time_difference = booking.showtime.start_time - timezone.now()
            if time_difference.total_seconds() < 0:
                 return Response({"detail": "⛔ Phim đã bắt đầu chiếu, không thể hủy!"}, status=400)

        booking.status = 'CANCELLED'
        booking.save()

        return Response({
            "success": True, 
            "message": "✅ Đã hủy vé và hoàn tiền thành công!",
            "refund_amount": booking.final_amount
        })

# --- 4. API ĐẶT VÉ (BOOKING VIEWSET) - ĐÃ FIX LỖI ---
class BookingViewSet(viewsets.GenericViewSet): 
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).order_by('-created_at')

    def create(self, request):
        """API Tạo đơn hàng (Transaction Atomic)"""
        serializer = CreateBookingSerializer(data=request.data)
        
        # raise_exception=True đảm bảo nếu lỗi sẽ văng ra ngay, code dưới không chạy
        serializer.is_valid(raise_exception=True)

        # [FIX QUAN TRỌNG] Ép kiểu data thành Dict để Pylance không báo lỗi 'None'
        data: Dict[str, Any] = serializer.validated_data # type: ignore

        user = request.user
        showtime = Showtime.objects.get(id=data['showtime_id'])
        
        try:
            with transaction.atomic():
                # 1. Tạo Booking
                booking = Booking.objects.create(
                    user=user,
                    showtime=showtime,
                    status='HOLD', 
                    payment_method=data.get('payment_method', 'VNPAY'),
                    total_amount=Decimal(0),
                    final_amount=Decimal(0)
                )

                # [FIX QUAN TRỌNG] Dùng Decimal('0') thay vì số 0 để tránh lỗi phép cộng
                calc_total_amount = Decimal('0')

                # 2. Tạo Vé (Tickets)
                seat_ids = data['seat_ids']
                seats = Seat.objects.filter(id__in=seat_ids)
                tickets = []
                
                for seat in seats:
                    price = showtime.base_price
                    if seat.seat_type == 'VIP': 
                        price += Decimal(20000)
                    elif seat.seat_type == 'SWT': 
                        price += Decimal(50000)
                    
                    tickets.append(Ticket(booking=booking, seat=seat, price=price))
                    calc_total_amount += price
                
                Ticket.objects.bulk_create(tickets)

                # 3. Tạo Bắp nước
                if 'concessions' in data and data['concessions']:
                    concessions_list = []
                    for item_data in data['concessions']:
                        product = Product.objects.get(id=item_data['product_id'])
                        qty = item_data['quantity']
                        price = product.price 
                        
                        item_total = price * qty
                        
                        concessions_list.append(ConcessionItem(
                            booking=booking, 
                            product=product, 
                            quantity=qty, 
                            price=price,
                            total_price=item_total
                        ))
                        calc_total_amount += item_total
                    
                    ConcessionItem.objects.bulk_create(concessions_list)

                # 4. Cập nhật Tổng tiền (Đảm bảo kiểu Decimal)
                booking.total_amount = calc_total_amount
                booking.final_amount = calc_total_amount - booking.discount_amount 
                booking.save()

                return Response({
                    "message": "Giữ vé thành công! Vui lòng thanh toán.",
                    "booking_id": booking.pk, # Dùng .pk an toàn hơn .id
                    "booking_code": booking.code,
                    "status": booking.status,
                    "final_amount": booking.final_amount,
                    "hold_expires_at": booking.hold_expires_at,
                    "payment_url": f"/payment/vnpay?booking_id={booking.pk}" 
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request):
        """Xem lịch sử vé"""
        queryset = self.get_queryset()
        serializer = BookingSerializer(queryset, many=True)
        return Response(serializer.data)