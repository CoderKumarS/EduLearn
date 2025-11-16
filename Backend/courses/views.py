from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q, Avg
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Course, Enrollment, Chapter, Quiz, Question, Option, StudentAnswer, Progress,
    QuizAttempt, Notification, Certificate, Discussion, Reply, Rating, Bookmark, Topic, TopicProgress
)
from .serializers import (
    CourseSerializer, EnrollmentSerializer, ChapterSerializer, QuizSerializer,
    QuestionSerializer, OptionSerializer, StudentAnswerSerializer, ProgressSerializer,
    QuizAttemptSerializer, NotificationSerializer, CertificateSerializer,
    DiscussionSerializer, ReplySerializer, RatingSerializer, BookmarkSerializer, 
    TopicSerializer, TopicProgressSerializer
)
from .permissions import IsInstructorOrReadOnly


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsInstructorOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'difficulty_level', 'is_free', 'instructor', 'is_published']
    search_fields = ['title', 'description', 'category']
    ordering_fields = ['created_at', 'title', 'price']

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=True, methods=['get'])
    def chapters(self, request, pk=None):
        """Get all chapters for a course"""
        course = self.get_object()
        chapters = course.chapters.all()
        serializer = ChapterSerializer(chapters, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def quizzes(self, request, pk=None):
        """Get all quizzes for a course"""
        course = self.get_object()
        quizzes = course.quizzes.all()
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def students(self, request, pk=None):
        """Get enrolled students (instructor only)"""
        course = self.get_object()
        if course.instructor != request.user and request.user.role != 'admin':
            return Response({'error': 'Only course instructor can view students'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        enrollments = course.enrollments.filter(is_active=True)
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def ratings(self, request, pk=None):
        """Get all ratings for a course"""
        course = self.get_object()
        ratings = course.ratings.all()
        serializer = RatingSerializer(ratings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def rate(self, request, pk=None):
        """Rate a course"""
        course = self.get_object()
        rating_value = request.data.get('rating')
        review = request.data.get('review', '')

        if not rating_value or int(rating_value) not in range(1, 6):
            return Response({'error': 'Rating must be between 1 and 5'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        rating, created = Rating.objects.update_or_create(
            student=request.user,
            course=course,
            defaults={'rating': rating_value, 'review': review}
        )
        
        serializer = RatingSerializer(rating)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def instructor_stats(self, request):
        """Get statistics for the authenticated instructor"""
        user = request.user
        
        if user.role != 'instructor':
            return Response({'error': 'Only instructors can access this endpoint'},
                          status=status.HTTP_403_FORBIDDEN)
        
        instructor_courses = Course.objects.filter(instructor=user)
        total_courses = instructor_courses.count()
        total_students = Enrollment.objects.filter(course__instructor=user).values('student').distinct().count()
        
        courses_with_enrollments = []
        for course in instructor_courses:
            enrollment_count = course.enrollments.count()
            course_data = CourseSerializer(course, context={'request': request}).data
            course_data['enrollment_count'] = enrollment_count
            courses_with_enrollments.append(course_data)
        
        return Response({
            'total_courses': total_courses,
            'total_students': total_students,
            'courses': courses_with_enrollments
        })

    @action(detail=True, methods=['get'])
    def enrollment_count(self, request, pk=None):
        """Get the enrollment count for a specific course"""
        course = self.get_object()
        count = course.enrollments.filter(is_active=True).count()
        return Response({'course_id': course.id, 'enrollment_count': count})


class ChapterViewSet(viewsets.ModelViewSet):
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer
    permission_classes = [IsInstructorOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['course']

    def get_serializer_context(self):
        """Add request to serializer context for progress fields"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=True, methods=['get'])
    def topics(self, request, pk=None):
        """Get all topics for a chapter with progress data"""
        chapter = self.get_object()
        topics = chapter.topic_items.all().order_by('order')
        
        # Add progress data for authenticated students
        if request.user.is_authenticated:
            topic_data = []
            for topic in topics:
                progress = TopicProgress.objects.filter(
                    student=request.user,
                    topic=topic
                ).first()
                
                topic_dict = TopicSerializer(topic, context={'request': request}).data
                if progress:
                    topic_dict['progress'] = {
                        'is_completed': progress.is_completed,
                        'time_spent_minutes': progress.time_spent_minutes,
                        'last_accessed': progress.last_accessed,
                        'completed_at': progress.completed_at
                    }
                topic_data.append(topic_dict)
            
            return Response(topic_data)
        
        serializer = TopicSerializer(topics, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def quizzes(self, request, pk=None):
        """Get all quizzes for a chapter with completion status"""
        chapter = self.get_object()
        quizzes = chapter.quizzes.all().order_by('order')
        
        # Add completion status for authenticated students
        if request.user.is_authenticated:
            quiz_data = []
            for quiz in quizzes:
                quiz_dict = QuizSerializer(quiz).data
                
                # Get quiz attempts for this student
                attempts = QuizAttempt.objects.filter(
                    student=request.user,
                    quiz=quiz,
                    is_completed=True
                ).order_by('-percentage')
                
                if attempts.exists():
                    best_attempt = attempts.first()
                    quiz_dict['completion_status'] = {
                        'is_completed': True,
                        'best_score': float(best_attempt.percentage),
                        'passed': best_attempt.percentage >= quiz.passing_score,
                        'attempts_count': attempts.count()
                    }
                else:
                    quiz_dict['completion_status'] = {
                        'is_completed': False,
                        'best_score': 0,
                        'passed': False,
                        'attempts_count': 0
                    }
                
                quiz_data.append(quiz_dict)
            
            return Response(quiz_data)
        
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def bookmark(self, request, pk=None):
        """Bookmark a chapter"""
        chapter = self.get_object()
        bookmark, created = Bookmark.objects.get_or_create(
            student=request.user,
            course=chapter.course,
            chapter=chapter
        )
        serializer = BookmarkSerializer(bookmark)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=['delete'], permission_classes=[permissions.IsAuthenticated])
    def unbookmark(self, request, pk=None):
        """Remove bookmark from a chapter"""
        chapter = self.get_object()
        deleted_count, _ = Bookmark.objects.filter(
            student=request.user,
            chapter=chapter
        ).delete()
        
        if deleted_count > 0:
            return Response({'message': 'Bookmark removed'}, status=status.HTTP_204_NO_CONTENT)
        return Response({'error': 'Bookmark not found'}, status=status.HTTP_404_NOT_FOUND)


class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = [IsInstructorOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['chapter']
    ordering_fields = ['order', 'created_at']
    ordering = ['order']

    def get_serializer_context(self):
        """Add request to serializer context for is_completed field"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def mark_complete(self, request, pk=None):
        """Mark topic as completed for the current student"""
        topic = self.get_object()
        student = request.user
        
        # Create or update topic progress
        progress, created = TopicProgress.objects.get_or_create(
            student=student,
            topic=topic,
            defaults={'is_completed': True, 'completed_at': timezone.now()}
        )
        
        if not created and not progress.is_completed:
            progress.is_completed = True
            progress.completed_at = timezone.now()
            progress.save()
        
        return Response({
            'message': 'Topic marked as complete',
            'topic_id': topic.id,
            'is_completed': True,
            'completed_at': progress.completed_at
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsInstructorOrReadOnly])
    def reorder(self, request):
        """Reorder topics within a chapter"""
        topic_orders = request.data.get('topic_orders', [])
        
        if not topic_orders:
            return Response({'error': 'topic_orders is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Validate and update topic orders
        updated_topics = []
        for item in topic_orders:
            topic_id = item.get('id')
            new_order = item.get('order')
            
            if topic_id is None or new_order is None:
                return Response({'error': 'Each item must have id and order'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            try:
                topic = Topic.objects.get(id=topic_id)
                topic.order = new_order
                topic.save()
                updated_topics.append(topic)
            except Topic.DoesNotExist:
                return Response({'error': f'Topic with id {topic_id} not found'}, 
                              status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(updated_topics, many=True)
        return Response({
            'message': 'Topics reordered successfully',
            'topics': serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def get_progress(self, request, pk=None):
        """Get progress for a specific topic"""
        topic = self.get_object()
        student = request.user
        
        progress = TopicProgress.objects.filter(student=student, topic=topic).first()
        
        if progress:
            return Response({
                'topic_id': topic.id,
                'is_completed': progress.is_completed,
                'time_spent_minutes': progress.time_spent_minutes,
                'last_accessed': progress.last_accessed,
                'completed_at': progress.completed_at
            })
        
        return Response({
            'topic_id': topic.id,
            'is_completed': False,
            'time_spent_minutes': 0,
            'last_accessed': None,
            'completed_at': None
        })


class TopicProgressViewSet(viewsets.ModelViewSet):
    queryset = TopicProgress.objects.all()
    serializer_class = TopicProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['topic', 'is_completed']
    ordering_fields = ['last_accessed', 'completed_at']
    ordering = ['-last_accessed']

    def get_queryset(self):
        """Filter to only show current user's progress"""
        return TopicProgress.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        """Automatically set the student to the current user"""
        serializer.save(student=self.request.user)

    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Mark multiple topics as complete"""
        topic_ids = request.data.get('topic_ids', [])
        
        if not topic_ids:
            return Response({'error': 'topic_ids is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        updated_count = 0
        for topic_id in topic_ids:
            try:
                topic = Topic.objects.get(id=topic_id)
                progress, created = TopicProgress.objects.get_or_create(
                    student=request.user,
                    topic=topic,
                    defaults={'is_completed': True, 'completed_at': timezone.now()}
                )
                
                if not created and not progress.is_completed:
                    progress.is_completed = True
                    progress.completed_at = timezone.now()
                    progress.save()
                
                updated_count += 1
            except Topic.DoesNotExist:
                continue
        
        return Response({
            'message': f'{updated_count} topics marked as complete',
            'updated_count': updated_count
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='chapter/(?P<chapter_id>[^/.]+)')
    def chapter_progress(self, request, chapter_id=None):
        """Get progress summary for a chapter"""
        try:
            chapter = Chapter.objects.get(id=chapter_id)
        except Chapter.DoesNotExist:
            return Response({'error': 'Chapter not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        topics = chapter.topic_items.all()
        total_topics = topics.count()
        
        if total_topics == 0:
            return Response({
                'chapter_id': chapter.id,
                'chapter_title': chapter.title,
                'total_topics': 0,
                'completed_topics': 0,
                'progress_percentage': 0,
                'total_duration': 0,
                'time_spent': 0
            })
        
        progress_records = TopicProgress.objects.filter(
            student=request.user,
            topic__chapter=chapter
        )
        
        completed_topics = progress_records.filter(is_completed=True).count()
        total_time_spent = sum(p.time_spent_minutes for p in progress_records)
        total_duration = sum(t.duration_minutes for t in topics)
        
        progress_percentage = round((completed_topics / total_topics) * 100, 2)
        
        return Response({
            'chapter_id': chapter.id,
            'chapter_title': chapter.title,
            'total_topics': total_topics,
            'completed_topics': completed_topics,
            'progress_percentage': progress_percentage,
            'total_duration': total_duration,
            'time_spent': total_time_spent
        })


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['course', 'chapter', 'is_active', 'is_required']
    ordering_fields = ['order', 'created_at']
    ordering = ['order']

    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Get all questions for a quiz"""
        quiz = self.get_object()
        questions = quiz.questions.all().order_by('order')
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit quiz answers"""
        quiz = self.get_object()
        student = request.user
        answers = request.data.get('answers', [])

        # Check max attempts
        attempt_count = QuizAttempt.objects.filter(student=student, quiz=quiz).count()
        if attempt_count >= quiz.max_attempts:
            return Response({'error': f'Maximum attempts ({quiz.max_attempts}) reached'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        # Create quiz attempt
        attempt = QuizAttempt.objects.create(
            student=student,
            quiz=quiz,
            attempt_number=attempt_count + 1
        )

        correct_count = 0
        total_points = 0
        earned_points = 0

        for ans in answers:
            question_id = ans.get('question_id')
            selected_option_id = ans.get('selected_option_id')
            answer_text = ans.get('answer_text', '')
            time_taken = ans.get('time_taken_seconds', 0)

            try:
                question = Question.objects.get(id=question_id, quiz=quiz)
                total_points += question.points

                is_correct = False
                if question.question_type == 'short_answer':
                    # For short answer, instructor needs to grade manually
                    is_correct = False
                elif selected_option_id:
                    option = Option.objects.get(id=selected_option_id, question=question)
                    is_correct = option.is_correct
                    if is_correct:
                        correct_count += 1
                        earned_points += question.points

                StudentAnswer.objects.create(
                    student=student,
                    question=question,
                    selected_option_id=selected_option_id if selected_option_id else None,
                    answer_text=answer_text,
                    is_correct=is_correct,
                    time_taken_seconds=time_taken
                )
            except (Question.DoesNotExist, Option.DoesNotExist):
                continue

        # Calculate score
        percentage = (earned_points / total_points * 100) if total_points > 0 else 0
        
        # Update attempt
        attempt.score = earned_points
        attempt.max_score = total_points
        attempt.percentage = percentage
        attempt.completed_at = timezone.now()
        attempt.is_completed = True
        attempt.save()

        # Update progress
        Progress.objects.update_or_create(
            student=student,
            course=quiz.course,
            defaults={'score': percentage, 'last_accessed': timezone.now()}
        )

        return Response({
            'message': 'Quiz submitted successfully',
            'attempt_id': attempt.id,
            'score': earned_points,
            'max_score': total_points,
            'percentage': round(percentage, 2),
            'passed': percentage >= quiz.passing_score
        })

    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """Get quiz results for the current user"""
        quiz = self.get_object()
        attempts = QuizAttempt.objects.filter(student=request.user, quiz=quiz, is_completed=True)
        serializer = QuizAttemptSerializer(attempts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def attempts(self, request, pk=None):
        """Get quiz attempts history"""
        quiz = self.get_object()
        attempts = QuizAttempt.objects.filter(student=request.user, quiz=quiz)
        serializer = QuizAttemptSerializer(attempts, many=True)
        return Response(serializer.data)


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['quiz']

    @action(detail=True, methods=['get'])
    def options(self, request, pk=None):
        """Get all options for a question"""
        question = self.get_object()
        options = question.options.all().order_by('order')
        serializer = OptionSerializer(options, many=True)
        return Response(serializer.data)


class OptionViewSet(viewsets.ModelViewSet):
    queryset = Option.objects.all()
    serializer_class = OptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['question']


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['student', 'course', 'is_active']
    ordering_fields = ['enrolled_at']

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Enrollment.objects.all()
        return Enrollment.objects.filter(student=self.request.user)

    def create(self, request, *args, **kwargs):
        """Enroll in a course"""
        course_id = request.data.get('course_id')
        student = request.user
        
        existing_enrollment = Enrollment.objects.filter(student=student, course_id=course_id).first()
        
        if existing_enrollment:
            serializer = self.get_serializer(existing_enrollment)
            return Response({
                'message': 'You are already enrolled in this course',
                'enrollment': serializer.data
            }, status=status.HTTP_200_OK)
        
        return super().create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=False, methods=['get'])
    def my_courses(self, request):
        """Get user's enrolled courses"""
        enrollments = Enrollment.objects.filter(student=request.user, is_active=True)
        serializer = self.get_serializer(enrollments, many=True)
        return Response(serializer.data)


class ProgressViewSet(viewsets.ModelViewSet):
    queryset = Progress.objects.all()
    serializer_class = ProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['student', 'course', 'is_completed']
    ordering_fields = ['last_accessed']

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Progress.objects.all()
        return Progress.objects.filter(student=self.request.user)

    @action(detail=False, methods=['get'], url_path='course/(?P<course_id>[^/.]+)')
    def course_progress(self, request, course_id=None):
        """Get progress for a specific course"""
        progress = Progress.objects.filter(student=request.user, course_id=course_id).first()
        if progress:
            serializer = self.get_serializer(progress)
            return Response(serializer.data)
        return Response({'message': 'No progress found for this course'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def user_stats(self, request):
        """Get comprehensive statistics for the authenticated user"""
        user = request.user
        
        enrollments = Enrollment.objects.filter(student=user, is_active=True)
        enrolled_courses = [e.course for e in enrollments]
        
        total_enrolled = len(enrolled_courses)
        total_chapters = sum(course.chapters.count() for course in enrolled_courses)
        
        user_progress = Progress.objects.filter(student=user)
        completed_lessons = sum(p.completed_lessons for p in user_progress)
        completed_courses = user_progress.filter(is_completed=True).count()
        
        average_score = user_progress.aggregate(Avg('score'))['score__avg'] or 0
        
        user_answers = StudentAnswer.objects.filter(student=user)
        total_quizzes_taken = user_answers.values('question__quiz').distinct().count()
        
        correct_answers = user_answers.filter(is_correct=True).count()
        wrong_answers = user_answers.filter(is_correct=False).count()
        
        total_quizzes = Quiz.objects.filter(course__in=enrolled_courses, is_active=True).count()
        
        recent_progress = ProgressSerializer(
            user_progress.order_by('-last_accessed')[:5],
            many=True
        ).data
        
        return Response({
            'total_enrolled': total_enrolled,
            'completed_courses': completed_courses,
            'total_chapters': total_chapters,
            'completed_lessons': completed_lessons,
            'average_score': round(average_score, 2),
            'quiz_stats': {
                'total_quizzes': total_quizzes,
                'quizzes_taken': total_quizzes_taken,
                'quizzes_completed': total_quizzes_taken,
                'correct_answers': correct_answers,
                'wrong_answers': wrong_answers,
                'total_answers': correct_answers + wrong_answers,
                'accuracy': round((correct_answers / (correct_answers + wrong_answers) * 100), 2) if (correct_answers + wrong_answers) > 0 else 0
            },
            'recent_progress': recent_progress
        })


class StudentAnswerViewSet(viewsets.ModelViewSet):
    queryset = StudentAnswer.objects.all()
    serializer_class = StudentAnswerSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student', 'question']

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return StudentAnswer.objects.all()
        return StudentAnswer.objects.filter(student=self.request.user)

    @action(detail=False, methods=['get'], url_path='quiz/(?P<quiz_id>[^/.]+)')
    def quiz_answers(self, request, quiz_id=None):
        """Get answers for a specific quiz"""
        answers = StudentAnswer.objects.filter(
            student=request.user,
            question__quiz_id=quiz_id
        )
        serializer = self.get_serializer(answers, many=True)
        return Response(serializer.data)


class QuizAttemptViewSet(viewsets.ModelViewSet):
    queryset = QuizAttempt.objects.all()
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['student', 'quiz', 'is_completed']
    ordering_fields = ['started_at']

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return QuizAttempt.objects.all()
        return QuizAttempt.objects.filter(student=self.request.user)

    @action(detail=False, methods=['get'], url_path='quiz/(?P<quiz_id>[^/.]+)')
    def quiz_attempts(self, request, quiz_id=None):
        """Get attempts for a specific quiz"""
        attempts = QuizAttempt.objects.filter(student=request.user, quiz_id=quiz_id)
        serializer = self.get_serializer(attempts, many=True)
        return Response(serializer.data)


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_read', 'notification_type']
    ordering_fields = ['created_at']

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        if self.request.user.role != 'admin':
            return Response({'error': 'Only admins can create notifications'}, 
                          status=status.HTTP_403_FORBIDDEN)
        serializer.save()

    def update(self, request, *args, **kwargs):
        """Mark notification as read"""
        instance = self.get_object()
        instance.is_read = True
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications count"""
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread_count': count})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'All notifications marked as read'})


class CertificateViewSet(viewsets.ModelViewSet):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student', 'course', 'is_valid']

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Certificate.objects.all()
        return Certificate.objects.filter(student=self.request.user)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download certificate PDF"""
        certificate = self.get_object()
        if certificate.pdf_file:
            return Response({'download_url': certificate.pdf_file.url})
        return Response({'error': 'Certificate PDF not available'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], url_path='verify/(?P<cert_id>[^/.]+)')
    def verify(self, request, cert_id=None):
        """Verify certificate"""
        try:
            certificate = Certificate.objects.get(certificate_id=cert_id)
            serializer = self.get_serializer(certificate)
            return Response({
                'valid': certificate.is_valid,
                'certificate': serializer.data
            })
        except Certificate.DoesNotExist:
            return Response({'valid': False, 'message': 'Certificate not found'}, 
                          status=status.HTTP_404_NOT_FOUND)


class DiscussionViewSet(viewsets.ModelViewSet):
    queryset = Discussion.objects.all()
    serializer_class = DiscussionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['course', 'chapter', 'user', 'is_pinned']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'updated_at']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'])
    def replies(self, request, pk=None):
        """Get all replies for a discussion"""
        discussion = self.get_object()
        replies = discussion.replies.all()
        serializer = ReplySerializer(replies, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        """Reply to a discussion"""
        discussion = self.get_object()
        content = request.data.get('content')
        
        if not content:
            return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        reply = Reply.objects.create(
            discussion=discussion,
            user=request.user,
            content=content
        )
        serializer = ReplySerializer(reply)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ReplyViewSet(viewsets.ModelViewSet):
    queryset = Reply.objects.all()
    serializer_class = ReplySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['discussion', 'user']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RatingViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['course', 'student']

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Rating.objects.all()
        return Rating.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=False, methods=['get'], url_path='course/(?P<course_id>[^/.]+)')
    def course_ratings(self, request, course_id=None):
        """Get ratings for a specific course"""
        ratings = Rating.objects.filter(course_id=course_id)
        serializer = self.get_serializer(ratings, many=True)
        
        avg_rating = ratings.aggregate(Avg('rating'))['rating__avg'] or 0
        
        return Response({
            'average_rating': round(avg_rating, 2),
            'total_ratings': ratings.count(),
            'ratings': serializer.data
        })


class BookmarkViewSet(viewsets.ModelViewSet):
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['course', 'chapter']

    def get_queryset(self):
        return Bookmark.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=False, methods=['get'])
    def courses(self, request):
        """Get bookmarked courses"""
        bookmarks = Bookmark.objects.filter(student=request.user, course__isnull=False)
        serializer = self.get_serializer(bookmarks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def chapters(self, request):
        """Get bookmarked chapters"""
        bookmarks = Bookmark.objects.filter(student=request.user, chapter__isnull=False)
        serializer = self.get_serializer(bookmarks, many=True)
        return Response(serializer.data)
