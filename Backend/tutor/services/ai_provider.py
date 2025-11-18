from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any


class AIProvider(ABC):
    """Abstract base class for AI providers"""
    
    @abstractmethod
    def generate_response(
        self, 
        messages: List[Dict[str, str]], 
        context: Dict[str, Any],
        stream: bool = False
    ) -> str:
        """
        Generate a response from the AI provider
        
        Args:
            messages: List of conversation messages with 'role' and 'content' keys
            context: Dictionary containing course and student context information
            stream: Whether to stream the response (if supported)
            
        Returns:
            Generated response text from the AI provider
        """
        pass
    
    @abstractmethod
    def validate_api_key(self) -> bool:
        """
        Validate the API key is configured correctly
        
        Returns:
            True if API key is valid, False otherwise
        """
        pass


class AIProviderFactory:
    """Factory for creating AI provider instances"""
    
    @staticmethod
    def create_provider(provider_type: str) -> AIProvider:
        """
        Create an AI provider instance based on configuration
        
        Args:
            provider_type: 'gemini' or 'openai'
            
        Returns:
            AIProvider instance
            
        Raises:
            ValueError: If provider_type is not supported
        """
        from .gemini_client import GeminiClient
        from .openai_client import OpenAIClient
        
        if provider_type == 'gemini':
            return GeminiClient()
        elif provider_type == 'openai':
            return OpenAIClient()
        else:
            raise ValueError(f"Unsupported provider: {provider_type}")
