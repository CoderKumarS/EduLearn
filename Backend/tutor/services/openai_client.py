from openai import OpenAI
from django.conf import settings
from typing import Dict, List, Any
import logging

from .ai_provider import AIProvider

logger = logging.getLogger(__name__)


class OpenAIClient(AIProvider):
    """OpenAI provider implementation"""
    
    def __init__(self):
        self.api_key = getattr(settings, 'OPENAI_API_KEY', '')
        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)
        else:
            self.client = None
            logger.warning("OPENAI_API_KEY not configured")
    
    def generate_response(
        self, 
        messages: List[Dict[str, str]], 
        context: Dict[str, Any],
        stream: bool = False
    ) -> str:
        """
        Generate a response from OpenAI API
        
        Args:
            messages: List of conversation messages
            context: Course and student context
            stream: Whether to stream response (not implemented yet)
            
        Returns:
            Generated response text
            
        Raises:
            ValueError: If API key is not configured
            Exception: If API call fails
        """
        if not self.client:
            raise ValueError("OpenAI API key not configured")
        
        try:
            # Build messages with context
            formatted_messages = self._build_messages(messages, context)
            
            # Generate response
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=formatted_messages,
                temperature=0.7,
                max_tokens=1000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}", exc_info=True)
            raise Exception(f"Failed to generate response from OpenAI: {str(e)}")
    
    def validate_api_key(self) -> bool:
        """
        Validate the OpenAI API key is configured
        
        Returns:
            True if API key is configured, False otherwise
        """
        return bool(self.api_key and self.client)
    
    def _build_messages(self, messages: List[Dict[str, str]], context: Dict[str, Any]) -> List[Dict[str, str]]:
        """
        Build messages for OpenAI from conversation history and context
        
        Args:
            messages: Conversation history
            context: Student and course context
            
        Returns:
            List of formatted messages for OpenAI API
        """
        formatted_messages = []
        
        # Add system message with context
        system_content = self._build_system_message(context)
        formatted_messages.append({
            "role": "system",
            "content": system_content
        })
        
        # Add conversation history
        for msg in messages:
            formatted_messages.append({
                "role": msg['role'],
                "content": msg['content']
            })
        
        return formatted_messages
    
    def _build_system_message(self, context: Dict[str, Any]) -> str:
        """
        Build system message with course context
        
        Args:
            context: Student and course context
            
        Returns:
            System message string
        """
        parts = ["You are an AI tutor helping students with their coursework. Provide clear, helpful explanations."]
        
        # Add course context if available
        if context.get('current_course'):
            course = context['current_course']
            parts.append(f"\nCurrent Course: {course.get('title')}")
            parts.append(f"Course Level: {course.get('difficulty_level', 'N/A')}")
            parts.append(f"Description: {course.get('description', 'N/A')}")
        
        if context.get('current_chapter'):
            chapter = context['current_chapter']
            parts.append(f"\nCurrent Chapter: {chapter.get('title')}")
            parts.append(f"Chapter Description: {chapter.get('description', 'N/A')}")
        
        if context.get('recent_topics'):
            topics = context['recent_topics']
            parts.append(f"\nRecent Topics: {', '.join(topics)}")
        
        if context.get('enrolled_courses'):
            courses = context['enrolled_courses']
            parts.append(f"\nStudent's Enrolled Courses: {', '.join(courses)}")
        
        return "\n".join(parts)
