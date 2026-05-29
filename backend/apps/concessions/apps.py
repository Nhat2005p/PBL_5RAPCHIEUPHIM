# backend/apps/concessions/apps.py

from django.apps import AppConfig

class ConcessionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.concessions' # <--- QUAN TRỌNG: Phải có chữ 'apps.' ở đầu