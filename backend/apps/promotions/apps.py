# backend/apps/promotions/apps.py

from django.apps import AppConfig

class PromotionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.promotions' # <--- QUAN TRỌNG: Phải có chữ 'apps.' ở đầu