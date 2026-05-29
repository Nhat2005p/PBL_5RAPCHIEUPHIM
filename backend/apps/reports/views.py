from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Count, Q
from django.db.models.functions import Coalesce, TruncDate
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

# Import Models từ các app khác để thống kê
from apps.bookings.models import Booking, Ticket, ConcessionItem
from apps.cinema.models import Showtime, Seat, Movie, Room

class AdminDashboardStatsView(APIView):
    permission_classes = [permissions.IsAdminUser] # Chỉ Admin mới được xem

    def get(self, request):
        # 1. TỔNG QUAN DOANH THU (Chỉ tính các đơn ĐÃ THANH TOÁN hoặc ĐÃ SOÁT VÉ)
        paid_bookings = Booking.objects.filter(status__in=['PAID', 'CHECKED_IN'])
        
        total_revenue = paid_bookings.aggregate(total=Coalesce(Sum('final_amount'), Decimal('0')))['total']
        total_tickets_sold = Ticket.objects.filter(booking__status__in=['PAID', 'CHECKED_IN']).count()
        
        food_revenue = ConcessionItem.objects.filter(booking__status__in=['PAID', 'CHECKED_IN']).aggregate(
            total=Coalesce(Sum('total_price'), Decimal('0'))
        )['total']
        
        if total_revenue is None: total_revenue = Decimal('0')
        if food_revenue is None: food_revenue = Decimal('0')

        ticket_revenue = total_revenue - food_revenue

        # 2. BIỂU ĐỒ DOANH THU 7 NGÀY GẦN NHẤT
        last_7_days = timezone.now().date() - timedelta(days=6)
        revenue_chart = (
            paid_bookings
            .filter(created_at__date__gte=last_7_days)
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(revenue=Sum('final_amount'))
            .order_by('date')
        )

        # 3. TOP 5 PHIM BÁN CHẠY NHẤT
        top_movies = (
            Movie.objects
            .annotate(
                total_revenue=Coalesce(Sum(
                    'showtime__bookings__final_amount', 
                    filter=Q(showtime__bookings__status__in=['PAID', 'CHECKED_IN'])
                ), Decimal('0')),
                tickets_count=Count(
                    'showtime__bookings__tickets',
                    filter=Q(showtime__bookings__status__in=['PAID', 'CHECKED_IN'])
                )
            )
            .exclude(total_revenue=0)
            .order_by('-total_revenue')[:5]
            .values('title', 'total_revenue', 'tickets_count')
        )

        # 4. HIỆU SUẤT LẤP ĐẦY PHÒNG CHIẾU (Occupancy Rate)
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