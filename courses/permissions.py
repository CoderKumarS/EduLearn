from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsInstructorOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        # anyone can read (GET, HEAD, OPTIONS)
        if request.method in SAFE_METHODS:
            return True
        # only instructors can modify
        return request.user.is_authenticated and request.user.role == 'instructor'
