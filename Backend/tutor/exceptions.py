from rest_framework.exceptions import APIException
from rest_framework import status


class AIServiceUnavailable(APIException):
    """Exception raised when AI service is unavailable"""
    
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'AI service temporarily unavailable. Please try again later.'
    default_code = 'service_unavailable'


class RateLimitExceeded(APIException):
    """Exception raised when rate limit is exceeded"""
    
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    default_detail = 'Rate limit exceeded. Please wait before sending another message.'
    default_code = 'rate_limit_exceeded'
    
    def __init__(self, detail=None, retry_after=None):
        super().__init__(detail)
        self.retry_after = retry_after
