from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView, CustomTokenObtainPairView, logout_view,
    user_profile_view, change_password_view, forgot_password_view,
    reset_password_view, profile_view
)

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', logout_view, name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User Profile
    path('user/', user_profile_view, name='user_profile'),
    path('profile/', profile_view, name='profile'),  # Legacy endpoint
    
    # Password Management
    path('change-password/', change_password_view, name='change_password'),
    path('forgot-password/', forgot_password_view, name='forgot_password'),
    path('reset-password/', reset_password_view, name='reset_password'),
]
