from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TutorChatView, ConversationViewSet

router = DefaultRouter()
router.register(r'conversations', ConversationViewSet, basename='conversation')

urlpatterns = [
    path('chat/', TutorChatView.as_view(), name='tutor-chat'),
    path('', include(router.urls)),
]
