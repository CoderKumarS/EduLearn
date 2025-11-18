from typing import Dict, Optional, Any
from courses.models import Course, Chapter, Enrollment, Progress, TopicProgress
import logging

logger = logging.getLogger(__name__)


class ContextBuilder:
    """Builds context information for AI prompts"""
    
    def build_context(
        self, 
        user, 
        course_id: Optional[int] = None,
        chapter_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Build context from user's courses and progress
        
        Args:
            user: The authenticated user/student
            course_id: Optional course ID for specific course context
            chapter_id: Optional chapter ID for specific chapter context
        
        Returns:
            Dictionary containing:
            - enrolled_courses: List of course titles
            - current_course: Current course details (if course_id provided)
            - current_chapter: Current chapter details (if chapter_id provided)
            - progress: Learning progress information
            - recent_topics: Recently studied topics
        """
        context = {}
        
        try:
            # Get enrolled courses
            enrollments = Enrollment.objects.filter(student=user).select_related('course')
            context['enrolled_courses'] = [e.course.title for e in enrollments]
            
            # Get specific course context if provided
            if course_id:
                try:
                    course = Course.objects.get(id=course_id)
                    context['current_course'] = {
                        'title': course.title,
                        'description': course.description,
                        'difficulty_level': course.difficulty_level
                    }
                    
                    # Get progress
                    progress = Progress.objects.filter(
                        student=user, 
                        course=course
                    ).first()
                    if progress:
                        context['progress'] = progress.completion_percentage
                    
                except Course.DoesNotExist:
                    logger.warning(f"Course {course_id} not found for user {user.id}")
            
            # Get chapter context if provided
            if chapter_id:
                try:
                    chapter = Chapter.objects.get(id=chapter_id)
                    context['current_chapter'] = {
                        'title': chapter.title,
                        'description': chapter.description
                    }
                    
                    # Get recent topics
                    topic_progress = TopicProgress.objects.filter(
                        student=user,
                        topic__chapter=chapter
                    ).select_related('topic').order_by('-updated_at')[:5]
                    
                    context['recent_topics'] = [
                        tp.topic.title for tp in topic_progress
                    ]
                    
                except Chapter.DoesNotExist:
                    logger.warning(f"Chapter {chapter_id} not found for user {user.id}")
        
        except Exception as e:
            logger.error(f"Error building context for user {user.id}: {str(e)}", exc_info=True)
        
        return context
