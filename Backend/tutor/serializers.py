from rest_framework import serializers
from .models import Conversation, Message
from django.conf import settings


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model"""
    
    class Meta:
        model = Message
        fields = ['id', 'role', 'content', 'timestamp', 'tokens_used']
        read_only_fields = ['id', 'timestamp', 'tokens_used']
    
    def validate_content(self, value):
        """Validate message content"""
        if not value or not value.strip():
            raise serializers.ValidationError("Message cannot be empty")
        
        max_length = getattr(settings, 'AI_TUTOR_MAX_MESSAGE_LENGTH', 2000)
        if len(value) > max_length:
            raise serializers.ValidationError(
                f"Message cannot exceed {max_length} characters"
            )
        
        return value



class ConversationSerializer(serializers.ModelSerializer):
    """Serializer for Conversation model"""
    
    messages = MessageSerializer(many=True, read_only=True)
    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'student', 'course', 'title', 'created_at', 'updated_at', 
                  'messages', 'message_count', 'last_message']
        read_only_fields = ['id', 'student', 'created_at', 'updated_at']
    
    def get_message_count(self, obj):
        """Get the count of messages in the conversation"""
        return obj.messages.count()
    
    def get_last_message(self, obj):
        """Get the content of the last message"""
        last_msg = obj.messages.order_by('-timestamp').first()
        return last_msg.content if last_msg else None



class ChatRequestSerializer(serializers.Serializer):
    """Serializer for chat request data"""
    
    message = serializers.CharField(required=True)
    conversation_id = serializers.UUIDField(required=False, allow_null=True)
    course_id = serializers.IntegerField(required=False, allow_null=True)
    chapter_id = serializers.IntegerField(required=False, allow_null=True)
    
    def validate_message(self, value):
        """Validate message content"""
        if not value or not value.strip():
            raise serializers.ValidationError("Message cannot be empty")
        
        max_length = getattr(settings, 'AI_TUTOR_MAX_MESSAGE_LENGTH', 2000)
        if len(value) > max_length:
            raise serializers.ValidationError(
                f"Message cannot exceed {max_length} characters"
            )
        
        return value.strip()
