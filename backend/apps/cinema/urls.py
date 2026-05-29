# backend/apps/cinema/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MovieViewSet, CinemaViewSet, RoomViewSet, 
    SeatViewSet, ShowtimeViewSet, ReviewViewSet,
    PublicMovieViewSet # Import thêm cái này
)

router = DefaultRouter()
router.register(r'movies', MovieViewSet)
router.register(r'public-movies', PublicMovieViewSet, basename='public-movies') # Dành cho khách
router.register(r'cinemas', CinemaViewSet)
router.register(r'rooms', RoomViewSet)
router.register(r'seats', SeatViewSet)
router.register(r'showtimes', ShowtimeViewSet)
router.register(r'reviews', ReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
]