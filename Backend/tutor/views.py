from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.conf import settings
from django.utils import timezone
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
import logging
import signal

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer, ChatRequestSerializer
from .services.ai_provider import AIProviderFactory
from .services.context_builder import ContextBuilder
from .exceptions import AIServiceUnavailable, RateLimitExceeded

logger = logging.getLogger(__name__)


class TimeoutException(Exception):
    """Exception raised when operation times out"""
    pass


def timeout_handler(signum, frame):
    """Handler for timeout signal"""
    raise TimeoutException("Operation timed out")


def ratelimit_handler(request, exception):
    """Custom handler for rate limit exceptions"""
    return Response(
        {
            'error': 'Rate limit exceeded. Please wait before sending another message.',
            'retry_after': 60
        },
        status=status.HTTP_429_TOO_MANY_REQUESTS
    )


@method_decorator(ratelimit(key='user', rate='60/m', method='POST', block=True), name='dispatch')
class TutorChatView(APIView):
    """API view for chat interactions with the AI tutor"""
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Handle chat message and generate AI response
        
        Request body:
            - message: The user's message
            - conversation_id: Optional UUID of existing conversation
            - course_id: Optional course ID for context
            - chapter_id: Optional chapter ID for context
        
        Returns:
            - conversation_id: UUID of the conversation
            - message_id: UUID of the AI response message
            - response: The AI-generated response text
            - timestamp: Timestamp of the response
        """
        # Validate request data
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        validated_data = serializer.validated_data
        user_message = validated_data['message']
        conversation_id = validated_data.get('conversation_id')
        course_id = validated_data.get('course_id')
        chapter_id = validated_data.get('chapter_id')
        
        try:
            # Get or create conversation
            if conversation_id:
                try:
                    conversation = Conversation.objects.get(
                        id=conversation_id,
                        student=request.user
                    )
                except Conversation.DoesNotExist:
                    return Response(
                        {'error': 'Conversation not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            else:
                # Create new conversation
                conversation = Conversation.objects.create(
                    student=request.user,
                    course_id=course_id,
                    title=user_message[:50]  # Use first 50 chars as title
                )
            
            # Save user message
            user_msg = Message.objects.create(
                conversation=conversation,
                role='user',
                content=user_message
            )
            
            # Build context
            context_builder = ContextBuilder()
            context = context_builder.build_context(
                user=request.user,
                course_id=course_id,
                chapter_id=chapter_id
            )
            
            # Get recent messages for conversation context (limit to 10)
            max_context_messages = getattr(settings, 'AI_TUTOR_MAX_CONTEXT_MESSAGES', 10)
            recent_messages = Message.objects.filter(
                conversation=conversation
            ).order_by('-timestamp')[:max_context_messages]
            
            # Format messages for AI provider
            messages_for_ai = [
                {'role': msg.role, 'content': msg.content}
                for msg in reversed(list(recent_messages))
            ]
            
            # Get AI provider and generate response
            provider_type = getattr(settings, 'AI_PROVIDER', 'gemini')
            
            # Log the request
            logger.info(f"AI chat request from user {request.user.id} using provider {provider_type}")
            
            try:
                ai_provider = AIProviderFactory.create_provider(provider_type)
                
                # Set timeout for AI request
                timeout_seconds = getattr(settings, 'AI_TUTOR_REQUEST_TIMEOUT', 30)
                
                # Generate response with timeout handling
                ai_response = ai_provider.generate_response(
                    messages=messages_for_ai,
                    context=context
                )
                
                # Log successful response
                logger.info(f"AI response generated for user {request.user.id}, conversation {conversation.id}")
                
            except TimeoutException:
                logger.error(f"AI provider timeout for user {request.user.id}")
                raise AIServiceUnavailable("Request timed out. Please try again.")
            except ValueError as e:
                logger.error(f"AI provider configuration error: {str(e)}")
                raise AIServiceUnavailable("AI service configuration error")
            except Exception as e:
                error_msg = str(e).lower()
                
                # Check for rate limit errors
                if 'rate limit' in error_msg or 'quota' in error_msg:
                    logger.warning(f"Rate limit exceeded for user {request.user.id}")
                    raise AIServiceUnavailable("AI service rate limit exceeded. Please try again later.")
                
                # Check for authentication errors
                if 'authentication' in error_msg or 'api key' in error_msg or 'unauthorized' in error_msg:
                    logger.error(f"AI provider authentication error: {str(e)}")
                    raise AIServiceUnavailable("AI service authentication error")
                
                # Generic error
                logger.error(f"AI provider error for user {request.user.id}: {str(e)}", exc_info=True)
                raise AIServiceUnavailable()
            
            # Save AI response
            ai_msg = Message.objects.create(
                conversation=conversation,
                role='assistant',
                content=ai_response
            )
            
            # Update conversation timestamp
            conversation.updated_at = timezone.now()
            conversation.save()
            
            return Response({
                'conversation_id': str(conversation.id),
                'message_id': str(ai_msg.id),
                'response': ai_response,
                'timestamp': ai_msg.timestamp.isoformat()
            }, status=status.HTTP_200_OK)
            
        except AIServiceUnavailable as e:
            return Response(
                {'error': str(e.detail)},
                status=e.status_code
            )
        except RateLimitExceeded as e:
            response_data = {'error': str(e.detail)}
            if e.retry_after:
                response_data['retry_after'] = e.retry_after
            return Response(response_data, status=e.status_code)
        except Exception as e:
            logger.error(f"Unexpected error in chat endpoint for user {request.user.id}: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An unexpected error occurred. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class ConversationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing conversations"""
    
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter conversations by authenticated user"""
        return Conversation.objects.filter(student=self.request.user)
    
    def list(self, request):
        """Get all conversations for the authenticated user"""
        conversations = self.get_queryset()
        serializer = self.get_serializer(conversations, many=True)
        return Response({'conversations': serializer.data})
    
    def retrieve(self, request, pk=None):
        """Get a specific conversation with all messages"""
        try:
            conversation = self.get_queryset().get(pk=pk)
            serializer = self.get_serializer(conversation)
            return Response(serializer.data)
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def create(self, request):
        """Create a new conversation"""
        course_id = request.data.get('course_id')
        title = request.data.get('title', 'New Conversation')
        
        conversation = Conversation.objects.create(
            student=request.user,
            course_id=course_id,
            title=title
        )
        
        serializer = self.get_serializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get all messages for a specific conversation"""
        try:
            conversation = self.get_queryset().get(pk=pk)
            messages = conversation.messages.all()
            serializer = MessageSerializer(messages, many=True)
            return Response({
                'conversation_id': str(conversation.id),
                'messages': serializer.data
            })
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
