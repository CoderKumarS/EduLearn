import google.generativeai as genai
from django.conf import settings
from typing import Dict, List, Any
import logging

from .ai_provider import AIProvider

logger = logging.getLogger(__name__)


class GeminiClient(AIProvider):
    """Gemini AI provider implementation"""
    
    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', '')
        if self.api_key:
            genai.configure(api_key=self.api_key)
            # Use gemini-2.0-flash (fast and efficient model)
            self.model = genai.GenerativeModel('gemini-2.0-flash')
        else:
            self.model = None
            logger.warning("GEMINI_API_KEY not configured")
    
    def generate_response(
        self, 
        messages: List[Dict[str, str]], 
        context: Dict[str, Any],
        stream: bool = False
    ) -> str:
        """
        Generate a response from Gemini API
        
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
        if not self.model:
            raise ValueError("Gemini API key not configured")
        
        try:
            # Build the prompt with context
            prompt = self._build_prompt(messages, context)
            
            # Generate response
            response = self.model.generate_content(prompt)
            
            return response.text
            
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}", exc_info=True)
            raise Exception(f"Failed to generate response from Gemini: {str(e)}")
    
    def validate_api_key(self) -> bool:
        """
        Validate the Gemini API key is configured
        
        Returns:
            True if API key is configured, False otherwise
        """
        return bool(self.api_key and self.model)
    
    def _build_prompt(self, messages: List[Dict[str, str]], context: Dict[str, Any]) -> str:
        """
        Build a prompt for Gemini from messages and context
        
        Args:
            messages: Conversation history
            context: Student and course context
            
        Returns:
            Formatted prompt string
        """
        prompt_parts = []
        
        # Add system context
        prompt_parts.append("You are an AI tutor helping students with their coursework.")
        
        # Add course context if available
        if context.get('current_course'):
            course = context['current_course']
            prompt_parts.append(f"\nCurrent Course: {course.get('title')}")
            prompt_parts.append(f"Course Level: {course.get('difficulty_level', 'N/A')}")
            prompt_parts.append(f"Description: {course.get('description', 'N/A')}")
        
        if context.get('current_chapter'):
            chapter = context['current_chapter']
            prompt_parts.append(f"\nCurrent Chapter: {chapter.get('title')}")
            prompt_parts.append(f"Chapter Description: {chapter.get('description', 'N/A')}")
        
        if context.get('recent_topics'):
            topics = context['recent_topics']
            prompt_parts.append(f"\nRecent Topics: {', '.join(topics)}")
        
        if context.get('enrolled_courses'):
            courses = context['enrolled_courses']
            prompt_parts.append(f"\nStudent's Enrolled Courses: {', '.join(courses)}")
        
        # Add conversation history
        prompt_parts.append("\n\nConversation History:")
        for msg in messages:
            role = "Student" if msg['role'] == 'user' else "Tutor"
            prompt_parts.append(f"{role}: {msg['content']}")
        
        prompt_parts.append("\nTutor:")
        
        return "\n".join(prompt_parts)
