from rest_framework import viewsets, permissions
from .models import Course, Enrollment
from .serializers import CourseSerializer, EnrollmentSerializer
from .permissions import IsInstructorOrReadOnly

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    # permission_classes = [permissions.IsAuthenticated]
    permission_classes = [IsInstructorOrReadOnly]

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

