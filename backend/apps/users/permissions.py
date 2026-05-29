from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """Chỉ cho phép Admin truy cập"""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')

class IsStaff(permissions.BasePermission):
    """Cho phép Staff và Admin truy cập"""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'STAFF' or request.user.role == 'ADMIN'))