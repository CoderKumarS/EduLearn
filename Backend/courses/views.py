from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from django.db.models import Count, Q, Avg
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Course, Enrollment, Chapter, Quiz, Question, Option, StudentAnswer, Progress,
    QuizAttempt, Notification, Certificate, Discussion, Reply, Rating, Bookmark, Topic, TopicProgress, Category
)
from .serializers import (
    CourseSerializer, EnrollmentSerializer, ChapterSerializer, QuizSerializer,
    QuestionSerializer, OptionSerializer, StudentAnswerSerializer, ProgressSerializer,
    QuizAttemptSerializer, NotificationSerializer, CertificateSerializer,
    DiscussionSerializer, ReplySerializer, RatingSerializer, BookmarkSerializer, 
    TopicSerializer, TopicProgressSerializer, CategorySerializer
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

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='continue-learning')
    def continue_learning(self, request):
        """Get courses with incomplete progress for the authenticated user"""
        user = request.user
        
        # Get all enrollments for the user
        enrollments = Enrollment.objects.filter(student=user).select_related('course')
        
        continue_learning_courses = []
        
        for enrollment in enrollments:
            course = enrollment.course
            
            # Calculate progress based on topic completion
            total_topics = Topic.objects.filter(
                chapter__course=course
            ).count()
            
            if total_topics == 0:
                continue
            
            # Count completed topics
            completed_topics = TopicProgress.objects.filter(
                student=user,
                topic__chapter__course=course,
                is_completed=True
            ).count()
            
            # Check if user has any progress in this course
            has_progress = TopicProgress.objects.filter(
                student=user,
                topic__chapter__course=course
            ).exists()
            
            progress_percentage = (completed_topics / total_topics * 100) if total_topics > 0 else 0
            
            # Include courses that have any progress but not completed
            if has_progress and progress_percentage < 100:
                # Get last accessed chapter
                last_progress = Progress.objects.filter(
                    student=user,
                    course=course
                ).order_by('-last_accessed').first()
                
                last_accessed_chapter_id = last_progress.chapter.id if last_progress and last_progress.chapter else None
                
                # Get next chapter to study
                next_chapter = None
                if last_accessed_chapter_id:
                    # Get the next chapter after the last accessed one
                    next_chapter_obj = Chapter.objects.filter(
                        course=course,
                        order__gt=last_progress.chapter.order
                    ).order_by('order').first()
                    
                    if next_chapter_obj:
                        next_chapter = {
                            'id': next_chapter_obj.id,
                            'title': next_chapter_obj.title
                        }
                else:
                    # If no progress, get the first chapter
                    first_chapter = course.chapters.order_by('order').first()
                    if first_chapter:
                        next_chapter = {
                            'id': first_chapter.id,
                            'title': first_chapter.title
                        }
                
                course_data = CourseSerializer(course, context={'request': request}).data
                course_data['progress'] = round(progress_percentage, 2)
                course_data['lastAccessedChapter'] = last_accessed_chapter_id
                course_data['nextChapter'] = next_chapter
                course_data['enrolledAt'] = enrollment.enrolled_at.isoformat()
                
                continue_learning_courses.append(course_data)
        
        # Sort by last accessed (most recent first)
        continue_learning_courses.sort(
            key=lambda x: x.get('enrolledAt', ''),
            reverse=True
        )
        
        return Response({'results': continue_learning_courses})

    @action(detail=True, methods=['get'])
    def enrollment_count(self, request, pk=None):
        """Get the enrollment count for a specific course"""
        course = self.get_object()
        count = course.enrollments.filter(is_active=True).count()
        return Response({'course_id': course.id, 'enrollment_count': count})

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get top courses by enrollment count"""
        limit = int(request.query_params.get('limit', 5))
        
        # Annotate courses with enrollment count and rating
        courses = Course.objects.annotate(
            enrollment_count=Count('enrollments', filter=Q(enrollments__is_active=True)),
            avg_rating=Avg('ratings__rating'),
            review_count=Count('ratings')
        ).filter(
            is_published=True
        ).order_by('-enrollment_count')[:limit]
        
        popular_courses = []
        for course in courses:
            course_data = CourseSerializer(course, context={'request': request}).data
            course_data['enrollmentCount'] = course.enrollment_count
            course_data['rating'] = round(course.avg_rating, 2) if course.avg_rating else 0
            course_data['reviewCount'] = course.review_count
            popular_courses.append(course_data)
        
        return Response({'results': popular_courses})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='recently-joined')
    def recently_joined(self, request):
        """Get user's recently enrolled courses"""
        limit = int(request.query_params.get('limit', 5))
        user = request.user
        
        # Get recent enrollments sorted by enrollment date
        recent_enrollments = Enrollment.objects.filter(
            student=user,
            is_active=True
        ).select_related('course').order_by('-enrolled_at')[:limit]
        
        recently_joined_courses = []
        for enrollment in recent_enrollments:
            course = enrollment.course
            course_data = CourseSerializer(course, context={'request': request}).data
            course_data['enrolledAt'] = enrollment.enrolled_at.isoformat()
            recently_joined_courses.append(course_data)
        
        return Response({'results': recently_joined_courses})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='instructor-dashboard')
    def instructor_dashboard(self, request):
        """Get comprehensive instructor dashboard data"""
        user = request.user
        
        # Check if user is an instructor
        if user.role != 'instructor':
            return Response(
                {'error': 'Only instructors can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get instructor's courses with optimized queries
        instructor_courses = Course.objects.filter(
            instructor=user
        ).select_related('instructor').prefetch_related(
            'enrollments',
            'ratings',
            'chapters'
        )
        
        # Calculate statistics
        total_courses = instructor_courses.count()
        total_students = Enrollment.objects.filter(
            course__instructor=user
        ).values('student').distinct().count()
        total_chapters = Chapter.objects.filter(
            course__instructor=user
        ).count()
        
        # Get recently created courses (last 5)
        recent_courses = instructor_courses.order_by('-created_at')[:5]
        recent_courses_data = []
        for course in recent_courses:
            enrollment_count = course.enrollments.filter(is_active=True).count()
            avg_rating = course.ratings.aggregate(Avg('rating'))['rating__avg']
            
            course_data = {
                'id': course.id,
                'title': course.title,
                'description': course.description,
                'thumbnail': request.build_absolute_uri(course.thumbnail_image.url) if course.thumbnail_image else None,
                'created_at': course.created_at.isoformat(),
                'enrollment_count': enrollment_count,
                'average_rating': round(avg_rating, 2) if avg_rating else None,
                'instructor_name': course.instructor.username
            }
            recent_courses_data.append(course_data)
        
        # Get recently created chapters (last 5)
        recent_chapters = Chapter.objects.filter(
            course__instructor=user
        ).select_related('course').order_by('-created_at')[:5]
        
        recent_chapters_data = []
        for chapter in recent_chapters:
            chapter_data = {
                'id': chapter.id,
                'title': chapter.title,
                'course_id': chapter.course.id,
                'course_title': chapter.course.title,
                'created_at': chapter.created_at.isoformat()
            }
            recent_chapters_data.append(chapter_data)
        
        # Get recent student activities (last 10)
        recent_activities = []
        
        # Get recent enrollments
        recent_enrollments = Enrollment.objects.filter(
            course__instructor=user
        ).select_related('student', 'course').order_by('-enrolled_at')[:10]
        
        for enrollment in recent_enrollments:
            activity = {
                'id': f'enrollment_{enrollment.id}',
                'student_name': enrollment.student.username,
                'student_avatar': request.build_absolute_uri(enrollment.student.profile_image.url) if enrollment.student.profile_image else None,
                'course_name': enrollment.course.title,
                'course_id': enrollment.course.id,
                'activity_type': 'enrollment',
                'timestamp': enrollment.enrolled_at.isoformat(),
                'details': {}
            }
            recent_activities.append(activity)
        
        # Get recent chapter completions
        recent_completions = Progress.objects.filter(
            course__instructor=user,
            chapter__isnull=False,
            is_completed=True
        ).select_related('student', 'course', 'chapter').order_by('-last_accessed')[:10]
        
        for progress in recent_completions:
            activity = {
                'id': f'completion_{progress.id}',
                'student_name': progress.student.username,
                'student_avatar': request.build_absolute_uri(progress.student.profile_image.url) if progress.student.profile_image else None,
                'course_name': progress.course.title,
                'course_id': progress.course.id,
                'activity_type': 'chapter_completion',
                'timestamp': progress.last_accessed.isoformat(),
                'details': {
                    'chapter_title': progress.chapter.title
                }
            }
            recent_activities.append(activity)
        
        # Get recent quiz submissions
        recent_quiz_attempts = QuizAttempt.objects.filter(
            quiz__course__instructor=user,
            is_completed=True
        ).select_related('student', 'quiz', 'quiz__course').order_by('-completed_at')[:10]
        
        for attempt in recent_quiz_attempts:
            activity = {
                'id': f'quiz_{attempt.id}',
                'student_name': attempt.student.username,
                'student_avatar': request.build_absolute_uri(attempt.student.profile_image.url) if attempt.student.profile_image else None,
                'course_name': attempt.quiz.course.title,
                'course_id': attempt.quiz.course.id,
                'activity_type': 'quiz_submission',
                'timestamp': attempt.completed_at.isoformat(),
                'details': {
                    'quiz_title': attempt.quiz.title,
                    'score': float(attempt.percentage)
                }
            }
            recent_activities.append(activity)
        
        # Sort all activities by timestamp and take top 10
        recent_activities.sort(key=lambda x: x['timestamp'], reverse=True)
        recent_activities = recent_activities[:10]
        
        # Get instructor's top performing courses by enrollment (top 3)
        top_by_enrollment = instructor_courses.annotate(
            enrollment_count=Count('enrollments', filter=Q(enrollments__is_active=True))
        ).order_by('-enrollment_count')[:3]
        
        top_by_enrollment_data = []
        for course in top_by_enrollment:
            avg_rating = course.ratings.aggregate(Avg('rating'))['rating__avg']
            course_data = {
                'id': course.id,
                'title': course.title,
                'description': course.description,
                'thumbnail': request.build_absolute_uri(course.thumbnail_image.url) if course.thumbnail_image else None,
                'created_at': course.created_at.isoformat(),
                'enrollment_count': course.enrollment_count,
                'average_rating': round(avg_rating, 2) if avg_rating else None,
                'instructor_name': course.instructor.username
            }
            top_by_enrollment_data.append(course_data)
        
        # Get instructor's top performing courses by rating (top 3)
        top_by_rating = instructor_courses.annotate(
            avg_rating=Avg('ratings__rating'),
            rating_count=Count('ratings')
        ).filter(rating_count__gt=0).order_by('-avg_rating')[:3]
        
        top_by_rating_data = []
        for course in top_by_rating:
            enrollment_count = course.enrollments.filter(is_active=True).count()
            course_data = {
                'id': course.id,
                'title': course.title,
                'description': course.description,
                'thumbnail': request.build_absolute_uri(course.thumbnail_image.url) if course.thumbnail_image else None,
                'created_at': course.created_at.isoformat(),
                'enrollment_count': enrollment_count,
                'average_rating': round(course.avg_rating, 2) if course.avg_rating else None,
                'instructor_name': course.instructor.username
            }
            top_by_rating_data.append(course_data)
        
        # Get other instructors' courses (6 latest, excluding current instructor)
        other_instructors_courses = Course.objects.filter(
            is_published=True
        ).exclude(
            instructor=user
        ).select_related('instructor').prefetch_related(
            'enrollments',
            'ratings'
        ).order_by('-created_at')[:6]
        
        other_instructors_courses_data = []
        for course in other_instructors_courses:
            enrollment_count = course.enrollments.filter(is_active=True).count()
            avg_rating = course.ratings.aggregate(Avg('rating'))['rating__avg']
            
            course_data = {
                'id': course.id,
                'title': course.title,
                'description': course.description,
                'thumbnail': request.build_absolute_uri(course.thumbnail_image.url) if course.thumbnail_image else None,
                'created_at': course.created_at.isoformat(),
                'enrollment_count': enrollment_count,
                'average_rating': round(avg_rating, 2) if avg_rating else None,
                'instructor_name': course.instructor.username
            }
            other_instructors_courses_data.append(course_data)
        
        # Get platform top ranking courses by enrollment (top 5)
        platform_top_by_enrollment = Course.objects.filter(
            is_published=True
        ).select_related('instructor').prefetch_related(
            'enrollments',
            'ratings'
        ).annotate(
            enrollment_count=Count('enrollments', filter=Q(enrollments__is_active=True))
        ).order_by('-enrollment_count')[:5]
        
        platform_top_by_enrollment_data = []
        for course in platform_top_by_enrollment:
            avg_rating = course.ratings.aggregate(Avg('rating'))['rating__avg']
            course_data = {
                'id': course.id,
                'title': course.title,
                'description': course.description,
                'thumbnail': request.build_absolute_uri(course.thumbnail_image.url) if course.thumbnail_image else None,
                'created_at': course.created_at.isoformat(),
                'enrollment_count': course.enrollment_count,
                'average_rating': round(avg_rating, 2) if avg_rating else None,
                'instructor_name': course.instructor.username
            }
            platform_top_by_enrollment_data.append(course_data)
        
        # Get platform top ranking courses by rating (top 5)
        platform_top_by_rating = Course.objects.filter(
            is_published=True
        ).select_related('instructor').prefetch_related(
            'enrollments',
            'ratings'
        ).annotate(
            avg_rating=Avg('ratings__rating'),
            rating_count=Count('ratings')
        ).filter(rating_count__gt=0).order_by('-avg_rating')[:5]
        
        platform_top_by_rating_data = []
        for course in platform_top_by_rating:
            enrollment_count = course.enrollments.filter(is_active=True).count()
            course_data = {
                'id': course.id,
                'title': course.title,
                'description': course.description,
                'thumbnail': request.build_absolute_uri(course.thumbnail_image.url) if course.thumbnail_image else None,
                'created_at': course.created_at.isoformat(),
                'enrollment_count': enrollment_count,
                'average_rating': round(course.avg_rating, 2) if course.avg_rating else None,
                'instructor_name': course.instructor.username
            }
            platform_top_by_rating_data.append(course_data)
        
        # Build the complete response
        dashboard_data = {
            'stats': {
                'total_courses': total_courses,
                'total_students': total_students,
                'total_chapters': total_chapters
            },
            'recent_courses': recent_courses_data,
            'recent_chapters': recent_chapters_data,
            'recent_activities': recent_activities,
            'my_top_courses': {
                'by_enrollment': top_by_enrollment_data,
                'by_rating': top_by_rating_data
            },
            'other_instructors_courses': other_instructors_courses_data,
            'platform_top_courses': {
                'by_enrollment': platform_top_by_enrollment_data,
                'by_rating': platform_top_by_rating_data
            }
        }
        
        return Response(dashboard_data)


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
    
    def create(self, request, *args, **kwargs):
        """Override create to automatically calculate order and log validation errors"""
        
        # Auto-calculate order if not provided or if there's a conflict
        data = request.data.copy()
        chapter_id = data.get('chapter')
        
        if chapter_id:
            # Get the maximum order for this chapter
            max_order = Topic.objects.filter(chapter_id=chapter_id).aggregate(
                max_order=models.Max('order')
            )['max_order']
            
            # If order is not provided or is 1 (default), calculate the next available order
            if 'order' not in data or data.get('order') == 1:
                next_order = (max_order or 0) + 1
                data['order'] = next_order
                print(f"Auto-calculated order: {next_order} (max was {max_order})")
        
        serializer = self.get_serializer(data=data)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            print(f"Validation error: {e}")
            if hasattr(e, 'detail'):
                print(f"Error details: {e.detail}")
            raise

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


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'slug']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def list(self, request, *args, **kwargs):
        """Get all categories with course counts"""
        categories = self.get_queryset()
        
        category_data = []
        for category in categories:
            cat_dict = CategorySerializer(category).data
            # The course_count is already included via the serializer
            category_data.append(cat_dict)
        
        return Response({'results': category_data})


class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get dashboard statistics for the authenticated user"""
        user = request.user
        
        # Get enrollments
        enrollments = Enrollment.objects.filter(student=user, is_active=True)
        enrolled_courses_count = enrollments.count()
        
        # Get completed courses - count courses where user has 100% progress
        # Use the same logic as completed-courses endpoint
        completed_courses_count = 0
        for enrollment in enrollments:
            course = enrollment.course
            
            # Calculate progress percentage based on topic completion (same as completed-courses endpoint)
            total_topics = Topic.objects.filter(
                chapter__course=course
            ).count()
            
            if total_topics > 0:
                # Count completed topics
                completed_topics = TopicProgress.objects.filter(
                    student=user,
                    topic__chapter__course=course,
                    is_completed=True
                ).count()
                
                progress_percentage = (completed_topics / total_topics) * 100
            else:
                # Fallback to chapter-based progress if no topics exist
                total_chapters = course.chapters.count()
                if total_chapters > 0:
                    completed_chapters = Progress.objects.filter(
                        student=user,
                        course=course,
                        chapter__isnull=False,
                        is_completed=True
                    ).values('chapter').distinct().count()
                    progress_percentage = (completed_chapters / total_chapters) * 100
                else:
                    progress_percentage = 0
            
            # If progress is 100%, count as completed
            if progress_percentage >= 100:
                completed_courses_count += 1
                # Optionally set completion_date if not already set
                if not enrollment.completion_date:
                    enrollment.completion_date = timezone.now()
                    enrollment.save()
        
        # Calculate total learning time from Progress
        total_learning_time = Progress.objects.filter(student=user).aggregate(
            total_time=models.Sum('time_spent_minutes')
        )['total_time'] or 0
        
        # Calculate current streak (simplified - days with activity)
        # For a real implementation, you'd want to check consecutive days
        from datetime import timedelta
        today = timezone.now().date()
        recent_activity = Progress.objects.filter(
            student=user,
            last_accessed__gte=today - timedelta(days=7)
        ).values('last_accessed__date').distinct().count()
        current_streak = recent_activity  # Simplified streak calculation
        
        # Calculate average score
        average_score = Progress.objects.filter(student=user).aggregate(
            avg_score=Avg('score')
        )['avg_score'] or 0
        
        # Get weekly progress (last 7 days)
        weekly_progress = []
        for i in range(6, -1, -1):
            date = today - timedelta(days=i)
            minutes_learned = Progress.objects.filter(
                student=user,
                last_accessed__date=date
            ).aggregate(total=models.Sum('time_spent_minutes'))['total'] or 0
            
            weekly_progress.append({
                'date': date.isoformat(),
                'minutesLearned': minutes_learned
            })
        
        # Get recent activity
        recent_activity_list = []
        
        # Recent enrollments
        recent_enrollments = enrollments.order_by('-enrolled_at')[:5]
        for enrollment in recent_enrollments:
            recent_activity_list.append({
                'id': enrollment.id,
                'type': 'course_enrolled',
                'title': f'Enrolled in {enrollment.course.title}',
                'timestamp': enrollment.enrolled_at.isoformat()
            })
        
        # Recent chapter completions
        recent_completions = Progress.objects.filter(
            student=user,
            is_completed=True,
            chapter__isnull=False
        ).select_related('chapter').order_by('-last_accessed')[:5]
        
        for progress in recent_completions:
            recent_activity_list.append({
                'id': progress.id,
                'type': 'chapter_completed',
                'title': f'Completed: {progress.chapter.title}',
                'timestamp': progress.last_accessed.isoformat()
            })
        
        # Recent quiz completions
        recent_quizzes = QuizAttempt.objects.filter(
            student=user,
            is_completed=True
        ).select_related('quiz').order_by('-completed_at')[:5]
        
        for attempt in recent_quizzes:
            recent_activity_list.append({
                'id': attempt.id,
                'type': 'quiz_completed',
                'title': f'Completed quiz: {attempt.quiz.title}',
                'timestamp': attempt.completed_at.isoformat()
            })
        
        # Sort all activities by timestamp and take top 10
        recent_activity_list.sort(key=lambda x: x['timestamp'], reverse=True)
        recent_activity_list = recent_activity_list[:10]
        
        return Response({
            'enrolledCourses': enrolled_courses_count,
            'completedCourses': completed_courses_count,
            'totalLearningTime': total_learning_time,
            'currentStreak': current_streak,
            'averageScore': round(average_score, 2),
            'weeklyProgress': weekly_progress,
            'recentActivity': recent_activity_list
        })

    @action(detail=False, methods=['get'], url_path='continue-learning')
    def continue_learning(self, request):
        """Get courses the user is currently learning (with progress)"""
        user = request.user
        
        # Get active enrollments with progress
        enrollments = Enrollment.objects.filter(
            student=user,
            is_active=True,
            completion_date__isnull=True  # Not completed yet
        ).select_related('course', 'course__instructor').prefetch_related('course__chapters')
        
        courses_data = []
        for enrollment in enrollments:
            course = enrollment.course
            
            # Calculate progress percentage based on topic completion
            # Get all topics for this course
            from django.db.models import Count, Q
            
            total_topics = Topic.objects.filter(
                chapter__course=course
            ).count()
            
            if total_topics > 0:
                # Count completed topics
                completed_topics = TopicProgress.objects.filter(
                    student=user,
                    topic__chapter__course=course,
                    is_completed=True
                ).count()
                
                progress_percentage = (completed_topics / total_topics) * 100
            else:
                # Fallback to chapter-based progress if no topics exist
                total_chapters = course.chapters.count()
                if total_chapters > 0:
                    completed_chapters = Progress.objects.filter(
                        student=user,
                        course=course,
                        chapter__isnull=False,
                        is_completed=True
                    ).values('chapter').distinct().count()
                    progress_percentage = (completed_chapters / total_chapters) * 100
                else:
                    progress_percentage = 0
            
            # Get last accessed chapter
            last_progress = Progress.objects.filter(
                student=user,
                course=course
            ).order_by('-last_accessed').first()
            
            course_data = CourseSerializer(course).data
            course_data['progress'] = round(progress_percentage, 2)
            course_data['enrolledAt'] = enrollment.enrolled_at.isoformat()
            
            if last_progress and last_progress.chapter:
                course_data['lastAccessedChapter'] = last_progress.chapter.id
                course_data['nextChapter'] = {
                    'id': last_progress.chapter.id,
                    'title': last_progress.chapter.title
                }
            
            courses_data.append(course_data)
        
        # Sort by last accessed (most recent first)
        courses_data.sort(key=lambda x: x.get('enrolledAt', ''), reverse=True)
        
        return Response(courses_data)
    
    @action(detail=False, methods=['get'], url_path='completed-courses')
    def completed_courses(self, request):
        """Get courses the user has completed (100% progress)"""
        user = request.user
        
        # Get all active enrollments
        enrollments = Enrollment.objects.filter(
            student=user,
            is_active=True
        ).select_related('course', 'course__instructor').prefetch_related('course__chapters')
        
        completed_courses_data = []
        for enrollment in enrollments:
            course = enrollment.course
            
            # Calculate progress percentage based on topic completion
            from django.db.models import Count, Q
            
            total_topics = Topic.objects.filter(
                chapter__course=course
            ).count()
            
            if total_topics > 0:
                # Count completed topics
                completed_topics = TopicProgress.objects.filter(
                    student=user,
                    topic__chapter__course=course,
                    is_completed=True
                ).count()
                
                progress_percentage = (completed_topics / total_topics) * 100
            else:
                # Fallback to chapter-based progress if no topics exist
                total_chapters = course.chapters.count()
                if total_chapters > 0:
                    completed_chapters = Progress.objects.filter(
                        student=user,
                        course=course,
                        chapter__isnull=False,
                        is_completed=True
                    ).values('chapter').distinct().count()
                    progress_percentage = (completed_chapters / total_chapters) * 100
                else:
                    progress_percentage = 0
            
            # Only include courses with 100% progress
            if progress_percentage >= 100:
                course_data = CourseSerializer(course).data
                course_data['progress'] = 100
                course_data['enrolledAt'] = enrollment.enrolled_at.isoformat()
                course_data['completedAt'] = enrollment.completion_date.isoformat() if enrollment.completion_date else timezone.now().isoformat()
                
                # Set completion_date if not already set
                if not enrollment.completion_date:
                    enrollment.completion_date = timezone.now()
                    enrollment.save()
                
                completed_courses_data.append(course_data)
        
        # Sort by completion date (most recent first)
        completed_courses_data.sort(key=lambda x: x.get('completedAt', ''), reverse=True)
        
        return Response(completed_courses_data)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get popular courses based on enrollment count"""
        limit = int(request.query_params.get('limit', 10))
        
        # Get courses with enrollment count
        courses = Course.objects.filter(
            is_published=True
        ).annotate(
            enrollment_count=Count('enrollments', filter=Q(enrollments__is_active=True)),
            avg_rating=Avg('ratings__rating'),
            review_count=Count('ratings')
        ).order_by('-enrollment_count')[:limit]
        
        courses_data = []
        for course in courses:
            course_data = CourseSerializer(course).data
            course_data['enrollmentCount'] = course.enrollment_count
            course_data['rating'] = round(course.avg_rating, 1) if course.avg_rating else 0
            course_data['reviewCount'] = course.review_count
            courses_data.append(course_data)
        
        return Response(courses_data)
    
    @action(detail=False, methods=['get'], url_path='recently-joined')
    def recently_joined(self, request):
        """Get courses the user recently enrolled in"""
        user = request.user
        limit = int(request.query_params.get('limit', 10))
        
        # Get recent enrollments
        enrollments = Enrollment.objects.filter(
            student=user,
            is_active=True
        ).select_related('course', 'course__instructor').order_by('-enrolled_at')[:limit]
        
        courses_data = []
        for enrollment in enrollments:
            course = enrollment.course
            
            # Calculate progress percentage based on topic completion
            total_topics = Topic.objects.filter(
                chapter__course=course
            ).count()
            
            if total_topics > 0:
                # Count completed topics
                completed_topics = TopicProgress.objects.filter(
                    student=user,
                    topic__chapter__course=course,
                    is_completed=True
                ).count()
                
                progress_percentage = (completed_topics / total_topics) * 100
            else:
                # Fallback to chapter-based progress if no topics exist
                total_chapters = course.chapters.count()
                if total_chapters > 0:
                    completed_chapters = Progress.objects.filter(
                        student=user,
                        course=course,
                        chapter__isnull=False,
                        is_completed=True
                    ).values('chapter').distinct().count()
                    progress_percentage = (completed_chapters / total_chapters) * 100
                else:
                    progress_percentage = 0
            
            course_data = CourseSerializer(course).data
            course_data['enrolledAt'] = enrollment.enrolled_at.isoformat()
            course_data['progress'] = round(progress_percentage, 2)
            courses_data.append(course_data)
        
        return Response(courses_data)
