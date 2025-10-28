from rest_framework import viewsets, permissions
from .models import Course, Enrollment
from .serializers import CourseSerializer, EnrollmentSerializer
from .permissions import IsInstructorOrReadOnly

from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Quiz, Question, Option, StudentAnswer, Progress
from .serializers import (
    QuizSerializer, QuestionSerializer, OptionSerializer,
    StudentAnswerSerializer, ProgressSerializer
)
class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    # permission_classes = [permissions.IsAuthenticated]
    permission_classes = [IsInstructorOrReadOnly]

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]


class OptionViewSet(viewsets.ModelViewSet):
    queryset = Option.objects.all()
    serializer_class = OptionSerializer
    permission_classes = [permissions.IsAuthenticated]


class StudentAnswerViewSet(viewsets.ModelViewSet):
    queryset = StudentAnswer.objects.all()
    serializer_class = StudentAnswerSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='submit-quiz')
    def submit_quiz(self, request):
        student = request.user
        quiz_id = request.data.get('quiz_id')
        answers = request.data.get('answers', [])

        correct_count = 0
        total = len(answers)

        for ans in answers:
            qid = ans['question']
            oid = ans['selected_option']
            question = Question.objects.get(id=qid)
            option = Option.objects.get(id=oid)
            StudentAnswer.objects.create(student=student, question=question, selected_option=option)
            if option.is_correct:
                correct_count += 1

        score = (correct_count / total) * 100 if total else 0

        Progress.objects.update_or_create(
            student=student,
            course=question.quiz.course,
            defaults={'score': score, 'completed_lessons': total, 'total_lessons': total}
        )

        return Response({'message': 'Quiz submitted', 'score': score})


class ProgressViewSet(viewsets.ModelViewSet):
    queryset = Progress.objects.all()
    serializer_class = ProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
