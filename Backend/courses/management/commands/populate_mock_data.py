from django.core.management.base import BaseCommand
from django.db import transaction
from faker import Faker
import requests
import os
from django.conf import settings
from django.core.files.base import ContentFile
from users.models import CustomUser
from courses.models import Course, Chapter, Quiz, Question, Option, Enrollment


class Command(BaseCommand):
    help = 'Populate database with mock data including images'

    def __init__(self):
        super().__init__()
        self.fake = Faker()

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing mock data before generating new data',
        )

    def download_image(self, url, filename):
        """Download image from URL and return ContentFile"""
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                return ContentFile(response.content, name=filename)
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Failed to download image from {url}: {str(e)}'))
        return None

    def generate_users(self):
        """Generate student and instructor users with profile images and bios"""
        self.stdout.write('Generating users...')
        
        students = []
        instructors = []
        
        # Generate 10 students
        for i in range(10):
            username = f"student{i+1}"
            email = f"student{i+1}@example.com"
            
            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                password='password123',
                role='student',
                bio=self.fake.text(max_nb_chars=200)
            )
            
            # Download and assign profile image from Lorem Picsum
            image_url = f"https://picsum.photos/200?random={i+1}"
            image_file = self.download_image(image_url, f"{username}_profile.jpg")
            if image_file:
                user.profile_image.save(f"{username}_profile.jpg", image_file, save=True)
            
            students.append(user)
            self.stdout.write(f'Created student: {username}')
        
        # Generate 5 instructors
        for i in range(5):
            username = f"instructor{i+1}"
            email = f"instructor{i+1}@example.com"
            
            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                password='password123',
                role='instructor',
                bio=self.fake.text(max_nb_chars=200)
            )
            
            # Download and assign profile image from Lorem Picsum
            image_url = f"https://picsum.photos/200?random={i+11}"
            image_file = self.download_image(image_url, f"{username}_profile.jpg")
            if image_file:
                user.profile_image.save(f"{username}_profile.jpg", image_file, save=True)
            
            instructors.append(user)
            self.stdout.write(f'Created instructor: {username}')
        
        self.stdout.write(self.style.SUCCESS(f'Generated {len(students)} students and {len(instructors)} instructors'))
        return students, instructors

    def generate_courses(self, instructors):
        """Generate courses with thumbnails distributed among instructors"""
        self.stdout.write('Generating courses...')
        
        categories = ['Programming', 'Data Science', 'Web Development', 'Mobile Development', 
                     'Machine Learning', 'DevOps', 'Cybersecurity', 'Cloud Computing']
        
        courses = []
        num_courses = 25
        
        for i in range(num_courses):
            instructor = instructors[i % len(instructors)]
            
            course = Course.objects.create(
                title=self.fake.catch_phrase() + " Course",
                description=self.fake.text(max_nb_chars=500),
                instructor=instructor,
                category=categories[i % len(categories)]
            )
            
            # Download and assign thumbnail image from Lorem Picsum
            image_url = f"https://picsum.photos/400/300?random={i+100}"
            image_file = self.download_image(image_url, f"course_{course.id}_thumbnail.jpg")
            if image_file:
                course.thumbnail_image.save(f"course_{course.id}_thumbnail.jpg", image_file, save=True)
            
            courses.append(course)
            self.stdout.write(f'Created course: {course.title}')
        
        self.stdout.write(self.style.SUCCESS(f'Generated {len(courses)} courses'))
        return courses

    def generate_chapters(self, courses):
        """Generate chapters for each course with video URLs and content"""
        self.stdout.write('Generating chapters...')
        
        chapters = []
        
        for course in courses:
            num_chapters = self.fake.random_int(min=4, max=5)
            
            for chapter_num in range(1, num_chapters + 1):
                chapter = Chapter.objects.create(
                    course=course,
                    number=chapter_num,
                    title=f"Chapter {chapter_num}: {self.fake.catch_phrase()}",
                    video_url=f"https://www.youtube.com/watch?v=dQw4w9WgXcQ",  # Placeholder video URL
                    notes=self.fake.text(max_nb_chars=1000),
                    extra_info=self.fake.text(max_nb_chars=500),
                    duration=self.fake.random_int(min=5, max=30)
                )
                
                chapters.append(chapter)
            
            self.stdout.write(f'Created {num_chapters} chapters for course: {course.title}')
        
        self.stdout.write(self.style.SUCCESS(f'Generated {len(chapters)} chapters'))
        return chapters

    def generate_quizzes(self, chapters):
        """Generate quizzes with questions and options for each chapter"""
        self.stdout.write('Generating quizzes, questions, and options...')
        
        quizzes = []
        questions = []
        options = []
        
        for chapter in chapters:
            # Create one quiz per chapter
            quiz = Quiz.objects.create(
                course=chapter.course,
                chapter=chapter,
                title=f"Quiz for {chapter.title}",
                time_limit=self.fake.random_int(min=10, max=30)
            )
            quizzes.append(quiz)
            
            # Generate 3-5 questions per quiz
            num_questions = self.fake.random_int(min=3, max=5)
            
            for q_num in range(num_questions):
                question = Question.objects.create(
                    quiz=quiz,
                    text=self.fake.sentence(nb_words=10) + "?"
                )
                questions.append(question)
                
                # Generate 4 options per question with exactly one correct
                correct_option_index = self.fake.random_int(min=0, max=3)
                
                for opt_num in range(4):
                    option = Option.objects.create(
                        question=question,
                        text=self.fake.sentence(nb_words=5),
                        is_correct=(opt_num == correct_option_index)
                    )
                    options.append(option)
        
        self.stdout.write(self.style.SUCCESS(
            f'Generated {len(quizzes)} quizzes, {len(questions)} questions, and {len(options)} options'
        ))
        return quizzes

    def generate_enrollments(self, students, courses):
        """Generate random enrollments for students"""
        self.stdout.write('Generating enrollments...')
        
        enrollments = []
        
        for student in students:
            # Each student enrolls in 3-5 random courses
            num_enrollments = self.fake.random_int(min=3, max=5)
            selected_courses = self.fake.random_elements(
                elements=courses, 
                length=min(num_enrollments, len(courses)), 
                unique=True
            )
            
            for course in selected_courses:
                enrollment = Enrollment.objects.create(
                    student=student,
                    course=course
                )
                enrollments.append(enrollment)
            
            self.stdout.write(f'Created {len(selected_courses)} enrollments for {student.username}')
        
        self.stdout.write(self.style.SUCCESS(f'Generated {len(enrollments)} enrollments'))
        return enrollments

    def clear_mock_data(self):
        """Clear existing mock data"""
        self.stdout.write('Clearing existing mock data...')
        
        # Delete in reverse order of dependencies
        Enrollment.objects.all().delete()
        Option.objects.all().delete()
        Question.objects.all().delete()
        Quiz.objects.all().delete()
        Chapter.objects.all().delete()
        Course.objects.all().delete()
        CustomUser.objects.filter(username__startswith='student').delete()
        CustomUser.objects.filter(username__startswith='instructor').delete()
        
        self.stdout.write(self.style.SUCCESS('Existing mock data cleared'))

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('Starting mock data generation...'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        
        try:
            with transaction.atomic():
                # Clear existing data if requested
                if options['clear']:
                    self.clear_mock_data()
                    self.stdout.write('')
                self.stdout.write('\n[1/5] Generating users...')
                students, instructors = self.generate_users()
                
                self.stdout.write('\n[2/5] Generating courses...')
                courses = self.generate_courses(instructors)
                
                self.stdout.write('\n[3/5] Generating chapters...')
                chapters = self.generate_chapters(courses)
                
                self.stdout.write('\n[4/5] Generating quizzes, questions, and options...')
                quizzes = self.generate_quizzes(chapters)
                
                self.stdout.write('\n[5/5] Generating enrollments...')
                enrollments = self.generate_enrollments(students, courses)
                
                self.stdout.write('\n' + '=' * 60)
                self.stdout.write(self.style.SUCCESS('✓ Mock data generation completed successfully!'))
                self.stdout.write(self.style.SUCCESS('=' * 60))
                self.stdout.write(f'\nSummary:')
                self.stdout.write(f'  - Users: {len(students)} students, {len(instructors)} instructors')
                self.stdout.write(f'  - Courses: {len(courses)}')
                self.stdout.write(f'  - Chapters: {len(chapters)}')
                self.stdout.write(f'  - Quizzes: {len(quizzes)}')
                self.stdout.write(f'  - Enrollments: {len(enrollments)}')
                self.stdout.write('=' * 60 + '\n')
                
        except Exception as e:
            self.stdout.write('\n' + '=' * 60)
            self.stdout.write(self.style.ERROR(f'✗ Error generating mock data: {str(e)}'))
            self.stdout.write(self.style.ERROR('Transaction rolled back. No data was saved.'))
            self.stdout.write('=' * 60 + '\n')
            raise
