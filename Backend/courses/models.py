from django.db import models
from django.conf import settings
import uuid

User = settings.AUTH_USER_MODEL


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, default='folder', help_text='Icon name for frontend display')
    color = models.CharField(max_length=7, default='#3B82F6', help_text='Hex color code')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def course_count(self):
        """Returns the number of published courses in this category"""
        return self.courses.filter(is_published=True).count()


class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses_taught')
    thumbnail_image = models.ImageField(upload_to='course_thumbnails/', null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_free = models.BooleanField(default=True)
    difficulty_level = models.CharField(max_length=20, choices=[
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced')
    ], default='beginner')
    category = models.CharField(max_length=100, blank=True)
    category_obj = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True, related_name='courses', help_text='New category model')
    duration_hours = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at', 'id']

    def __str__(self):
        return self.title


class Chapter(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='chapters')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    content = models.TextField(blank=True, default='')
    order = models.PositiveIntegerField(default=0)
    is_free_preview = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        unique_together = ('course', 'order')

    def __str__(self):
        return f"{self.course.title} - Chapter {self.order}: {self.title}"

    @property
    def total_topics(self):
        """Returns the total number of topics in this chapter"""
        return self.topic_items.count()

    @property
    def total_duration(self):
        """Returns the total duration of all topics in minutes"""
        from django.db.models import Sum
        result = self.topic_items.aggregate(Sum('duration_minutes'))
        return result['duration_minutes__sum'] or 0


class Topic(models.Model):
    """
    Represents a discrete learning unit within a chapter.
    Each topic has its own content, examples, and video lecture.
    """
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='topic_items')
    title = models.CharField(max_length=200)
    content = models.TextField(help_text='Main learning content for this topic')
    example = models.TextField(blank=True, help_text='Code examples or practical demonstrations')
    video_url = models.URLField(blank=True, help_text='YouTube or video platform URL')
    order = models.PositiveIntegerField(default=0)
    duration_minutes = models.PositiveIntegerField(default=0, help_text='Estimated time to complete')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        unique_together = ('chapter', 'order')
        verbose_name = 'Topic'
        verbose_name_plural = 'Topics'

    def __str__(self):
        return f"{self.chapter.title} - Topic {self.order}: {self.title}"


class Quiz(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='quizzes', null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    is_required = models.BooleanField(default=True, help_text='Whether this quiz is mandatory')
    time_limit_minutes = models.PositiveIntegerField(default=30)
    passing_score = models.PositiveIntegerField(default=70)
    max_attempts = models.PositiveIntegerField(default=3)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']
        verbose_name_plural = 'Quizzes'

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=[
        ('multiple_choice', 'Multiple Choice'),
        ('true_false', 'True/False'),
        ('short_answer', 'Short Answer')
    ], default='multiple_choice')
    points = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=0)
    explanation = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.question_text[:50]


class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    option_text = models.CharField(max_length=500, default='')
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.option_text} ({'Correct' if self.is_correct else 'Wrong'})"


class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    completion_date = models.DateTimeField(null=True, blank=True)
    certificate_issued = models.BooleanField(default=False)

    class Meta:
        unique_together = ('student', 'course')
        ordering = ['-enrolled_at']

    def __str__(self):
        return f"{self.student} -> {self.course}"


class Progress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='student_progress')
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='student_progress', null=True, blank=True)
    completed_lessons = models.PositiveIntegerField(default=0)
    total_lessons = models.PositiveIntegerField(default=0)
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    time_spent_minutes = models.PositiveIntegerField(default=0)
    last_accessed = models.DateTimeField(auto_now=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        ordering = ['-last_accessed']

    def progress_percent(self):
        if self.total_lessons == 0:
            return 0
        return (self.completed_lessons / self.total_lessons) * 100


class TopicProgress(models.Model):
    """
    Tracks student progress through individual topics.
    """
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='topic_progress')
    topic = models.ForeignKey('Topic', on_delete=models.CASCADE, related_name='progress_records')
    is_completed = models.BooleanField(default=False)
    time_spent_minutes = models.PositiveIntegerField(default=0)
    last_accessed = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('student', 'topic')
        verbose_name = 'Topic Progress'
        verbose_name_plural = 'Topic Progress Records'
        ordering = ['-last_accessed']

    def __str__(self):
        status = 'Completed' if self.is_completed else 'In Progress'
        return f"{self.student} - {self.topic.title} ({status})"


class StudentAnswer(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='student_answers')
    selected_option = models.ForeignKey(Option, on_delete=models.CASCADE, null=True, blank=True)
    answer_text = models.TextField(blank=True)  # For short answer questions
    is_correct = models.BooleanField(default=False)
    answered_at = models.DateTimeField(auto_now_add=True)
    time_taken_seconds = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['answered_at']


class QuizAttempt(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    max_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    time_taken_minutes = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    attempt_number = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['-started_at']


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=[
        ('course_update', 'Course Update'),
        ('quiz_result', 'Quiz Result'),
        ('enrollment', 'Enrollment'),
        ('achievement', 'Achievement'),
        ('reminder', 'Reminder')
    ])
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    action_url = models.URLField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']


class Certificate(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certificates')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificates')
    certificate_id = models.CharField(max_length=100, unique=True, default=uuid.uuid4)
    issued_at = models.DateTimeField(auto_now_add=True)
    is_valid = models.BooleanField(default=True)
    pdf_file = models.FileField(upload_to='certificates/', null=True, blank=True)

    class Meta:
        ordering = ['-issued_at']


class Discussion(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='discussions')
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='discussions', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='discussions')
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_pinned = models.BooleanField(default=False)

    class Meta:
        ordering = ['-is_pinned', '-created_at']


class Reply(models.Model):
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='replies')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='replies')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
        verbose_name_plural = 'Replies'


class Rating(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='ratings')
    rating = models.PositiveIntegerField(choices=[(i, i) for i in range(1, 6)])
    review = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'course')
        ordering = ['-created_at']


class Bookmark(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarks')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='bookmarks', null=True, blank=True)
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='bookmarks', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course', 'chapter')
        ordering = ['-created_at']
