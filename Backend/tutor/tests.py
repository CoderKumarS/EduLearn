from django.test import TestCase
from django.contrib.auth import get_user_model
from courses.models import Course
from .models import Conversation, Message
from .services.ai_provider import AIProviderFactory
from .services.context_builder import ContextBuilder
import uuid

User = get_user_model()


class ConversationModelTest(TestCase):
    """Tests for Conversation model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.instructor = User.objects.create_user(
            username='instructor',
            email='instructor@example.com',
            password='testpass123'
        )
        self.course = Course.objects.create(
            title='Test Course',
            description='Test Description',
            instructor=self.instructor,
            difficulty_level='beginner'
        )
    
    def test_conversation_creation(self):
        """Test creating a conversation"""
        conversation = Conversation.objects.create(
            student=self.user,
            course=self.course,
            title='Test Conversation'
        )
        self.assertIsInstance(conversation.id, uuid.UUID)
        self.assertEqual(conversation.student, self.user)
        self.assertEqual(conversation.course, self.course)
        self.assertEqual(conversation.title, 'Test Conversation')
    
    def test_conversation_student_relationship(self):
        """Test conversation relationship with student"""
        conversation = Conversation.objects.create(
            student=self.user,
            title='Test'
        )
        self.assertEqual(conversation.student, self.user)
        self.assertIn(conversation, self.user.tutor_conversations.all())

    
    def test_conversation_course_relationship(self):
        """Test conversation relationship with course"""
        conversation = Conversation.objects.create(
            student=self.user,
            course=self.course,
            title='Test'
        )
        self.assertEqual(conversation.course, self.course)
        self.assertIn(conversation, self.course.tutor_conversations.all())
    
    def test_conversation_ordering(self):
        """Test conversations are ordered by updated_at descending"""
        conv1 = Conversation.objects.create(student=self.user, title='First')
        conv2 = Conversation.objects.create(student=self.user, title='Second')
        
        conversations = Conversation.objects.all()
        self.assertEqual(conversations[0], conv2)
        self.assertEqual(conversations[1], conv1)


class MessageModelTest(TestCase):
    """Tests for Message model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.conversation = Conversation.objects.create(
            student=self.user,
            title='Test Conversation'
        )
    
    def test_message_creation_user_role(self):
        """Test creating a message with user role"""
        message = Message.objects.create(
            conversation=self.conversation,
            role='user',
            content='Hello, AI tutor!'
        )
        self.assertIsInstance(message.id, uuid.UUID)
        self.assertEqual(message.role, 'user')
        self.assertEqual(message.content, 'Hello, AI tutor!')
    
    def test_message_creation_assistant_role(self):
        """Test creating a message with assistant role"""
        message = Message.objects.create(
            conversation=self.conversation,
            role='assistant',
            content='Hello! How can I help you?'
        )
        self.assertEqual(message.role, 'assistant')

    
    def test_message_conversation_relationship(self):
        """Test message relationship with conversation"""
        message = Message.objects.create(
            conversation=self.conversation,
            role='user',
            content='Test message'
        )
        self.assertEqual(message.conversation, self.conversation)
        self.assertIn(message, self.conversation.messages.all())
    
    def test_message_ordering(self):
        """Test messages are ordered by timestamp ascending"""
        msg1 = Message.objects.create(
            conversation=self.conversation,
            role='user',
            content='First message'
        )
        msg2 = Message.objects.create(
            conversation=self.conversation,
            role='assistant',
            content='Second message'
        )
        
        messages = self.conversation.messages.all()
        self.assertEqual(messages[0], msg1)
        self.assertEqual(messages[1], msg2)


class AIProviderFactoryTest(TestCase):
    """Tests for AIProviderFactory"""
    
    def test_create_gemini_provider(self):
        """Test creating Gemini provider"""
        from .services.gemini_client import GeminiClient
        provider = AIProviderFactory.create_provider('gemini')
        self.assertIsInstance(provider, GeminiClient)
    
    def test_create_openai_provider(self):
        """Test creating OpenAI provider"""
        from .services.openai_client import OpenAIClient
        provider = AIProviderFactory.create_provider('openai')
        self.assertIsInstance(provider, OpenAIClient)
    
    def test_unsupported_provider_error(self):
        """Test error for unsupported provider"""
        with self.assertRaises(ValueError) as context:
            AIProviderFactory.create_provider('unsupported')
        self.assertIn('Unsupported provider', str(context.exception))



class ContextBuilderTest(TestCase):
    """Tests for ContextBuilder"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.instructor = User.objects.create_user(
            username='instructor',
            email='instructor@example.com',
            password='testpass123'
        )
        self.course = Course.objects.create(
            title='Python Basics',
            description='Learn Python',
            instructor=self.instructor,
            difficulty_level='beginner'
        )
        from courses.models import Enrollment
        Enrollment.objects.create(student=self.user, course=self.course)
    
    def test_context_with_no_parameters(self):
        """Test building context with no course or chapter"""
        builder = ContextBuilder()
        context = builder.build_context(self.user)
        
        self.assertIn('enrolled_courses', context)
        self.assertIn('Python Basics', context['enrolled_courses'])
    
    def test_context_with_course_id(self):
        """Test building context with course_id"""
        builder = ContextBuilder()
        context = builder.build_context(self.user, course_id=self.course.id)
        
        self.assertIn('current_course', context)
        self.assertEqual(context['current_course']['title'], 'Python Basics')
        self.assertEqual(context['current_course']['difficulty_level'], 'beginner')
    
    def test_context_with_invalid_course_id(self):
        """Test building context with invalid course_id"""
        builder = ContextBuilder()
        context = builder.build_context(self.user, course_id=99999)
        
        self.assertNotIn('current_course', context)
