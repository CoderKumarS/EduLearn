from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'instructor'})
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student} -> {self.course}"

User = settings.AUTH_USER_MODEL  # shortcut for referencing the custom User model


class Quiz(models.Model):
    course = models.ForeignKey('Course', on_delete=models.CASCADE, related_name='quizzes')
    title = models.CharField(max_length=255)
    time_limit = models.IntegerField(default=15)  # minutes
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()

    def __str__(self):
        return self.text[:50]

class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.text} ({'Correct' if self.is_correct else 'Wrong'})"


class StudentAnswer(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(Option, on_delete=models.CASCADE)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def is_correct(self):
        return self.selected_option.is_correct


class Progress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    course = models.ForeignKey('Course', on_delete=models.CASCADE)
    completed_lessons = models.IntegerField(default=0)
    total_lessons = models.IntegerField(default=0)
    score = models.FloatField(default=0.0)

    def progress_percent(self):
        if self.total_lessons == 0:
            return 0
        return (self.completed_lessons / self.total_lessons) * 100
