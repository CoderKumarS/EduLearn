from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

from .serializers import RegisterSerializer, UserProfileSerializer, CustomTokenObtainPairSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """User registration endpoint"""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view that includes user profile data"""
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout user by blacklisting refresh token"""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    """
    GET: Retrieve current user profile
    PUT/PATCH: Update user profile
    """
    user = request.user
    
    if request.method == 'GET':
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = UserProfileSerializer(user, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """Change user password"""
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response(
            {'error': 'Both old_password and new_password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not user.check_password(old_password):
        return Response(
            {'error': 'Old password is incorrect'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(new_password) < 8:
        return Response(
            {'error': 'New password must be at least 8 characters long'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user.set_password(new_password)
    user.save()
    
    return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_view(request):
    """Send password reset email"""
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
        
        # Generate password reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Create reset link (you'll need to configure your frontend URL)
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
        
        # Send email
        subject = 'Password Reset Request'
        message = f'Click the link below to reset your password:\n\n{reset_link}\n\nIf you did not request this, please ignore this email.'
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        
        return Response(
            {'message': 'Password reset email sent successfully'},
            status=status.HTTP_200_OK
        )
    
    except User.DoesNotExist:
        # Don't reveal that the user doesn't exist
        return Response(
            {'message': 'If an account exists with this email, a password reset link has been sent'},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to send email. Please try again later.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_view(request):
    """Reset password using token"""
    uid = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    if not all([uid, token, new_password]):
        return Response(
            {'error': 'uid, token, and new_password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(new_password) < 8:
        return Response(
            {'error': 'Password must be at least 8 characters long'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
        
        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response(
                {'message': 'Password reset successfully'},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error': 'Invalid or expired token'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response(
            {'error': 'Invalid reset link'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    GET: Retrieve current user profile
    PUT/PATCH: Update user profile
    Legacy endpoint that mirrors user_profile_view
    """
    user = request.user
    
    if request.method == 'GET':
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = UserProfileSerializer(user, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
