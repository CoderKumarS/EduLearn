from rest_framework import serializers
from .models import Course, Enrollment, Quiz, Question, Option, StudentAnswer, Progress
from django.conf import settings

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'instructor', 'created_at']

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'course', 'enrolled_at']

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'question', 'text', 'is_correct']


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'quiz', 'text', 'options']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'course', 'title', 'time_limit', 'questions']


class StudentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentAnswer
        fields = ['id', 'student', 'question', 'selected_option', 'submitted_at']


class ProgressSerializer(serializers.ModelSerializer):
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = Progress
        fields = ['id', 'student', 'course', 'completed_lessons', 'total_lessons', 'score', 'progress_percent']

    def get_progress_percent(self, obj):
        return obj.progress_percent()