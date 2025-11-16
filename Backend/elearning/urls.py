from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

from courses.views import (
    CourseViewSet, EnrollmentViewSet, ChapterViewSet, QuizViewSet, QuestionViewSet,
    OptionViewSet, StudentAnswerViewSet, ProgressViewSet, QuizAttemptViewSet,
    NotificationViewSet, CertificateViewSet, DiscussionViewSet, ReplyViewSet,
    RatingViewSet, BookmarkViewSet, TopicViewSet, TopicProgressViewSet
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'chapters', ChapterViewSet, basename='chapter')
router.register(r'topics', TopicViewSet, basename='topic')
router.register(r'topic-progress', TopicProgressViewSet, basename='topic-progress')
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'options', OptionViewSet, basename='option')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'progress', ProgressViewSet, basename='progress')
router.register(r'student-answers', StudentAnswerViewSet, basename='student-answer')
router.register(r'quiz-attempts', QuizAttemptViewSet, basename='quiz-attempt')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'certificates', CertificateViewSet, basename='certificate')
router.register(r'discussions', DiscussionViewSet, basename='discussion')
router.register(r'replies', ReplyViewSet, basename='reply')
router.register(r'ratings', RatingViewSet, basename='rating')
router.register(r'bookmarks', BookmarkViewSet, basename='bookmark')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('users.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
