from django.contrib import admin
from .models import (
    Course, Chapter, Topic, TopicProgress, Quiz, Question, Option, Enrollment, Progress,
    StudentAnswer, QuizAttempt, Notification, Certificate, Discussion,
    Reply, Rating, Bookmark, Category
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'icon', 'color', 'get_course_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    
    def get_course_count(self, obj):
        return obj.course_count
    get_course_count.short_description = 'Course Count'


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'instructor', 'category', 'difficulty_level', 'is_free', 'is_published', 'created_at']
    list_filter = ['difficulty_level', 'is_free', 'is_published', 'category']
    search_fields = ['title', 'description', 'instructor__username']
    date_hierarchy = 'created_at'


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order', 'get_total_duration', 'is_free_preview', 'created_at']
    list_filter = ['is_free_preview', 'course']
    search_fields = ['title', 'content', 'course__title']
    ordering = ['course', 'order']
    
    def get_total_duration(self, obj):
        return obj.total_duration
    get_total_duration.short_description = 'Duration (min)'


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ['title', 'chapter', 'order', 'duration_minutes', 'created_at']
    list_filter = ['chapter__course', 'chapter']
    search_fields = ['title', 'content', 'chapter__title']
    ordering = ['chapter', 'order']


@admin.register(TopicProgress)
class TopicProgressAdmin(admin.ModelAdmin):
    list_display = ['student', 'topic', 'is_completed', 'time_spent_minutes', 'last_accessed', 'completed_at']
    list_filter = ['is_completed', 'topic__chapter__course']
    search_fields = ['student__username', 'topic__title']
    date_hierarchy = 'last_accessed'


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'chapter', 'order', 'is_required', 'time_limit_minutes', 'passing_score', 'is_active', 'created_at']
    list_filter = ['is_active', 'is_required', 'course']
    search_fields = ['title', 'description', 'course__title']
    ordering = ['course', 'chapter', 'order']


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['question_text', 'quiz', 'question_type', 'points', 'order', 'created_at']
    list_filter = ['question_type', 'quiz']
    search_fields = ['question_text', 'quiz__title']
    ordering = ['quiz', 'order']


@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ['option_text', 'question', 'is_correct', 'order']
    list_filter = ['is_correct', 'question__quiz']
    search_fields = ['option_text', 'question__question_text']
    ordering = ['question', 'order']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'enrolled_at', 'is_active', 'completion_date', 'certificate_issued']
    list_filter = ['is_active', 'certificate_issued', 'enrolled_at']
    search_fields = ['student__username', 'course__title']
    date_hierarchy = 'enrolled_at'


@admin.register(Progress)
class ProgressAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'chapter', 'completed_lessons', 'total_lessons', 'score', 'is_completed', 'last_accessed']
    list_filter = ['is_completed', 'course']
    search_fields = ['student__username', 'course__title']
    date_hierarchy = 'last_accessed'


@admin.register(StudentAnswer)
class StudentAnswerAdmin(admin.ModelAdmin):
    list_display = ['student', 'question', 'is_correct', 'answered_at', 'time_taken_seconds']
    list_filter = ['is_correct', 'answered_at']
    search_fields = ['student__username', 'question__question_text']
    date_hierarchy = 'answered_at'


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ['student', 'quiz', 'attempt_number', 'score', 'max_score', 'percentage', 'is_completed', 'started_at']
    list_filter = ['is_completed', 'quiz']
    search_fields = ['student__username', 'quiz__title']
    date_hierarchy = 'started_at'


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['user__username', 'title', 'message']
    date_hierarchy = 'created_at'


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'certificate_id', 'issued_at', 'is_valid']
    list_filter = ['is_valid', 'issued_at']
    search_fields = ['student__username', 'course__title', 'certificate_id']
    date_hierarchy = 'issued_at'


@admin.register(Discussion)
class DiscussionAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'course', 'chapter', 'is_pinned', 'created_at']
    list_filter = ['is_pinned', 'course', 'created_at']
    search_fields = ['title', 'content', 'user__username', 'course__title']
    date_hierarchy = 'created_at'


@admin.register(Reply)
class ReplyAdmin(admin.ModelAdmin):
    list_display = ['user', 'discussion', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'discussion__title', 'content']
    date_hierarchy = 'created_at'


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['student__username', 'course__title', 'review']
    date_hierarchy = 'created_at'


@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'chapter', 'created_at']
    list_filter = ['created_at']
    search_fields = ['student__username', 'course__title', 'chapter__title']
    date_hierarchy = 'created_at'
