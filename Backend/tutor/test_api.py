from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from unittest.mock import patch, MagicMock
from courses.models import Course
from .models import Conversation, Message

User = get_user_model()


class TutorChatAPITest(TestCase):
    """Integration tests for chat endpoint"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.course = Course.objects.create(
            title='Test Course',
            description='Test Description',
            level='beginner'
        )
        self.chat_url = reverse('tutor-chat')
    
    @patch('tutor.services.gemini_client.GeminiClient.generate_response')
    def test_chat_with_valid_data(self, mock_generate):
        """Test successful chat request with valid data"""
        mock_generate.return_value = "This is a test response from AI"
        
        self.client.force_authenticate(user=self.user)
        data = {
            'message': 'What is Python?',
            'course_id': self.course.id
        }
        
        response = self.client.post(self.chat_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('conversation_id', response.data)
        self.assertIn('message_id', response.data)
        self.assertIn('response', response.data)
        self.assertEqual(response.data['response'], "This is a test response from AI")

    
    def test_chat_requires_authentication(self):
        """Test that chat endpoint requires authentication"""
        data = {'message': 'Test message'}
        response = self.client.post(self.chat_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_chat_with_empty_message(self):
        """Test chat with empty message"""
        self.client.force_authenticate(user=self.user)
        data = {'message': ''}
        
        response = self.client.post(self.chat_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_chat_with_too_long_message(self):
        """Test chat with message exceeding max length"""
        self.client.force_authenticate(user=self.user)
        data = {'message': 'a' * 2001}  # Exceeds 2000 char limit
        
        response = self.client.post(self.chat_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    @patch('tutor.services.gemini_client.GeminiClient.generate_response')
    def test_chat_creates_conversation(self, mock_generate):
        """Test that chat creates a new conversation"""
        mock_generate.return_value = "Test response"
        
        self.client.force_authenticate(user=self.user)
        data = {'message': 'Hello'}
        
        initial_count = Conversation.objects.count()
        response = self.client.post(self.chat_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Conversation.objects.count(), initial_count + 1)
    
    @patch('tutor.services.gemini_client.GeminiClient.generate_response')
    def test_chat_with_ai_provider_failure(self, mock_generate):
        """Test error handling when AI provider fails"""
        mock_generate.side_effect = Exception("AI service error")
        
        self.client.force_authenticate(user=self.user)
        data = {'message': 'Test message'}
        
        response = self.client.post(self.chat_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)



class ConversationAPITest(TestCase):
    """Integration tests for conversation endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        self.conversation = Conversation.objects.create(
            student=self.user,
            title='Test Conversation'
        )
        self.list_url = reverse('conversation-list')
    
    def test_list_user_conversations(self):
        """Test listing conversations for authenticated user"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('conversations', response.data)
        self.assertEqual(len(response.data['conversations']), 1)
    
    def test_retrieve_specific_conversation(self):
        """Test retrieving a specific conversation"""
        self.client.force_authenticate(user=self.user)
        detail_url = reverse('conversation-detail', args=[self.conversation.id])
        
        response = self.client.get(detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], str(self.conversation.id))
    
    def test_create_new_conversation(self):
        """Test creating a new conversation"""
        self.client.force_authenticate(user=self.user)
        data = {'title': 'New Conversation'}
        
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Conversation.objects.filter(student=self.user).count(), 2)

    
    def test_user_cannot_access_other_user_conversations(self):
        """Test that users can only access their own conversations"""
        other_conversation = Conversation.objects.create(
            student=self.other_user,
            title='Other User Conversation'
        )
        
        self.client.force_authenticate(user=self.user)
        detail_url = reverse('conversation-detail', args=[other_conversation.id])
        
        response = self.client.get(detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class RateLimitTest(TestCase):
    """Tests for rate limiting"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.chat_url = reverse('tutor-chat')
    
    @patch('tutor.services.gemini_client.GeminiClient.generate_response')
    def test_rate_limit_not_exceeded_with_normal_usage(self, mock_generate):
        """Test that normal usage doesn't trigger rate limit"""
        mock_generate.return_value = "Test response"
        
        self.client.force_authenticate(user=self.user)
        data = {'message': 'Test message'}
        
        # Make a few requests (well under the limit)
        for _ in range(3):
            response = self.client.post(self.chat_url, data, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
