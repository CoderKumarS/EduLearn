from rest_framework import serializers
from .models import (
    Course, Enrollment, Quiz, Question, Option, StudentAnswer, Progress, Chapter,
    QuizAttempt, Notification, Certificate, Discussion, Reply, Rating, Bookmark, Topic, TopicProgress
)
from django.conf import settings
from users.serializers import UserProfileSerializer


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'question', 'option_text', 'is_correct', 'order']


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'quiz', 'question_text', 'question_type', 'points', 'order', 'explanation', 'options', 'created_at']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    chapter_title = serializers.CharField(source='chapter.title', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'course', 'course_title', 'chapter', 'chapter_title', 'title', 
                  'description', 'order', 'is_required', 'time_limit_minutes', 
                  'passing_score', 'max_attempts', 'is_active', 'questions', 'created_at']
        read_only_fields = ['created_at']


class TopicProgressSerializer(serializers.ModelSerializer):
    topic_title = serializers.CharField(source='topic.title', read_only=True)
    chapter_title = serializers.CharField(source='topic.chapter.title', read_only=True)
    
    class Meta:
        model = TopicProgress
        fields = ['id', 'student', 'topic', 'topic_title', 'chapter_title', 
                  'is_completed', 'time_spent_minutes', 'last_accessed', 'completed_at']
        read_only_fields = ['student', 'last_accessed']


class TopicSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()
    
    class Meta:
        model = Topic
        fields = ['id', 'chapter', 'title', 'content', 'example', 'video_url', 
                  'order', 'duration_minutes', 'created_at', 'updated_at', 'is_completed']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_is_completed(self, obj):
        """Check if the topic is completed for the current user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from .models import TopicProgress
            progress = TopicProgress.objects.filter(
                student=request.user,
                topic=obj
            ).first()
            return progress.is_completed if progress else False
        return False
    
    def validate_video_url(self, value):
        """Validate video URL format - simplified version"""
        # Allow empty values
        if not value or not value.strip():
            return ''
        
        # Basic validation - just check if it starts with http:// or https://
        if not value.startswith(('http://', 'https://')):
            raise serializers.ValidationError("Video URL must start with http:// or https://")
        
        return value


class ChapterSerializer(serializers.ModelSerializer):
    quizzes = QuizSerializer(many=True, read_only=True)
    topics = TopicSerializer(many=True, source='topic_items', read_only=True)
    total_topics = serializers.SerializerMethodField()
    total_duration = serializers.SerializerMethodField()
    completed_topics = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Chapter
        fields = ['id', 'course', 'title', 'description', 'content', 'topics', 
                  'order', 'is_free_preview', 'total_topics', 'total_duration',
                  'completed_topics', 'progress_percentage', 'quizzes', 'created_at', 'updated_at']
    
    def get_total_topics(self, obj):
        """Get total number of topics in the chapter"""
        return obj.total_topics
    
    def get_total_duration(self, obj):
        """Get total duration of all topics in minutes"""
        return obj.total_duration
    
    def get_completed_topics(self, obj):
        """Get number of completed topics for the current student"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from .models import TopicProgress
            return TopicProgress.objects.filter(
                student=request.user,
                topic__chapter=obj,
                is_completed=True
            ).count()
        return 0
    
    def get_progress_percentage(self, obj):
        """Calculate progress percentage for the current student"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            total = obj.total_topics
            if total == 0:
                return 0
            completed = self.get_completed_topics(obj)
            return round((completed / total) * 100, 2)
        return 0


class CourseSerializer(serializers.ModelSerializer):
    instructor = UserProfileSerializer(read_only=True)
    chapters = ChapterSerializer(many=True, read_only=True)
    thumbnail_image = serializers.ImageField(required=False)
    average_rating = serializers.SerializerMethodField()
    total_ratings = serializers.SerializerMethodField()
    enrollment_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'instructor', 'thumbnail_image',
                  'price', 'is_free', 'difficulty_level', 'category', 'duration_hours',
                  'is_published', 'chapters', 'average_rating', 'total_ratings', 
                  'enrollment_count', 'created_at', 'updated_at']
    
    def get_average_rating(self, obj):
        ratings = obj.ratings.all()
        if ratings.exists():
            return sum(r.rating for r in ratings) / ratings.count()
        return 0
    
    def get_total_ratings(self, obj):
        return obj.ratings.count()
    
    def get_enrollment_count(self, obj):
        return obj.enrollments.count()


class EnrollmentSerializer(serializers.ModelSerializer):
    student = UserProfileSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(),
        source='course',
        write_only=True
    )
    
    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'course', 'course_id', 'enrolled_at', 
                  'is_active', 'completion_date', 'certificate_issued']
        read_only_fields = ['student', 'enrolled_at']


class StudentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentAnswer
        fields = ['id', 'student', 'question', 'selected_option', 'answer_text', 
                  'is_correct', 'answered_at', 'time_taken_seconds']


class ProgressSerializer(serializers.ModelSerializer):
    progress_percent = serializers.SerializerMethodField()
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Progress
        fields = ['id', 'student', 'course', 'course_title', 'chapter', 'completed_lessons', 
                  'total_lessons', 'score', 'time_spent_minutes', 'last_accessed', 
                  'is_completed', 'progress_percent']

    def get_progress_percent(self, obj):
        return obj.progress_percent()


class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    student_name = serializers.CharField(source='student.username', read_only=True)

    class Meta:
        model = QuizAttempt
        fields = ['id', 'student', 'student_name', 'quiz', 'quiz_title', 'score', 'max_score', 
                  'percentage', 'time_taken_minutes', 'started_at', 'completed_at', 
                  'is_completed', 'attempt_number']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'title', 'message', 'notification_type', 'is_read', 
                  'created_at', 'action_url']


class CertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Certificate
        fields = ['id', 'student', 'student_name', 'course', 'course_title', 
                  'certificate_id', 'issued_at', 'is_valid', 'pdf_file']


class ReplySerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = Reply
        fields = ['id', 'discussion', 'user', 'content', 'created_at', 'updated_at']


class DiscussionSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    replies = ReplySerializer(many=True, read_only=True)
    reply_count = serializers.SerializerMethodField()

    class Meta:
        model = Discussion
        fields = ['id', 'course', 'chapter', 'user', 'title', 'content', 
                  'created_at', 'updated_at', 'is_pinned', 'replies', 'reply_count']
    
    def get_reply_count(self, obj):
        return obj.replies.count()


class RatingSerializer(serializers.ModelSerializer):
    student = UserProfileSerializer(read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'student', 'course', 'course_title', 'rating', 'review', 
                  'created_at', 'updated_at']


class BookmarkSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    chapter_title = serializers.CharField(source='chapter.title', read_only=True)

    class Meta:
        model = Bookmark
        fields = ['id', 'student', 'course', 'course_title', 'chapter', 'chapter_title', 'created_at']
