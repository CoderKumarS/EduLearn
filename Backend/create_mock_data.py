"""
Comprehensive Mock Data Generator for E-Learning Platform
Creates realistic test data for all models
"""

import os
import django
import random
from datetime import datetime, timedelta
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elearning.settings')
django.setup()

from django.contrib.auth import get_user_model
from courses.models import (
    Course, Chapter, Quiz, Question, Option, Enrollment, Progress,
    StudentAnswer, QuizAttempt, Notification, Certificate, Discussion,
    Reply, Rating, Bookmark
)

User = get_user_model()

def clear_all_data():
    """Clear all existing data"""
    print("🗑️  Clearing existing data...")
    
    # Delete in reverse order of dependencies
    Reply.objects.all().delete()
    Discussion.objects.all().delete()
    Bookmark.objects.all().delete()
    Rating.objects.all().delete()
    Certificate.objects.all().delete()
    Notification.objects.all().delete()
    StudentAnswer.objects.all().delete()
    QuizAttempt.objects.all().delete()
    Option.objects.all().delete()
    Question.objects.all().delete()
    Quiz.objects.all().delete()
    Progress.objects.all().delete()
    Enrollment.objects.all().delete()
    Chapter.objects.all().delete()
    Course.objects.all().delete()
    User.objects.all().delete()
    
    print("✅ All data cleared!")

def create_users():
    """Create users with different roles"""
    print("\n👥 Creating users...")
    
    users = {
        'admin': User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123',
            role='admin',
            bio='Platform Administrator'
        ),
        'instructors': [],
        'students': []
    }
    
    # Create instructors
    instructor_data = [
        ('john_doe', 'john@example.com', 'John Doe', 'Expert in Web Development with 10+ years experience'),
        ('jane_smith', 'jane@example.com', 'Jane Smith', 'Data Science and AI specialist'),
        ('mike_wilson', 'mike@example.com', 'Mike Wilson', 'Mobile app development expert'),
    ]
    
    for username, email, full_name, bio in instructor_data:
        instructor = User.objects.create_user(
            username=username,
            email=email,
            password='password123',
            role='instructor',
            bio=bio
        )
        users['instructors'].append(instructor)
        print(f"  ✓ Created instructor: {username}")
    
    # Create students
    student_names = [
        'alice_johnson', 'bob_brown', 'carol_white', 'david_lee',
        'emma_davis', 'frank_miller', 'grace_taylor', 'henry_anderson',
        'iris_thomas', 'jack_martinez'
    ]
    
    for name in student_names:
        student = User.objects.create_user(
            username=name,
            email=f'{name}@example.com',
            password='password123',
            role='student',
            bio=f'Passionate learner interested in technology'
        )
        users['students'].append(student)
        print(f"  ✓ Created student: {name}")
    
    return users

def generate_topics_for_chapter(chapter_title):
    """Generate relevant topics for a chapter"""
    topics_map = {
        'Introduction to Python': [
            'Python Installation and Setup',
            'Python Syntax and Indentation',
            'Variables and Data Types',
            'Basic Input/Output Operations',
            'Comments and Documentation',
            'Python IDEs and Text Editors'
        ],
        'Data Types and Variables': [
            'Numbers (int, float, complex)',
            'Strings and String Methods',
            'Lists and List Operations',
            'Tuples and Sets',
            'Dictionaries and Key-Value Pairs',
            'Type Conversion and Casting'
        ],
        'Control Flow': [
            'If-Else Statements',
            'Elif and Nested Conditions',
            'For Loops and Iteration',
            'While Loops',
            'Break and Continue Statements',
            'Loop Control and Best Practices'
        ],
        'Functions and Modules': [
            'Defining Functions',
            'Function Parameters and Arguments',
            'Return Values',
            'Lambda Functions',
            'Importing Modules',
            'Creating Custom Modules'
        ],
        'Object-Oriented Programming': [
            'Classes and Objects',
            'Attributes and Methods',
            'Inheritance',
            'Polymorphism',
            'Encapsulation',
            'Magic Methods and Dunder'
        ],
        'React Fundamentals': [
            'JSX Syntax',
            'Components and Props',
            'State Management',
            'Event Handling',
            'Conditional Rendering',
            'Lists and Keys'
        ],
        'Hooks and Effects': [
            'useState Hook',
            'useEffect Hook',
            'useContext Hook',
            'Custom Hooks',
            'Hook Rules and Best Practices',
            'Performance Optimization'
        ],
        'State Management with Redux': [
            'Redux Core Concepts',
            'Actions and Action Creators',
            'Reducers',
            'Store Configuration',
            'Connect and useSelector',
            'Redux Toolkit'
        ],
        'TypeScript with React': [
            'TypeScript Basics',
            'Typing Props and State',
            'Interface vs Type',
            'Generic Components',
            'Type Guards',
            'Advanced TypeScript Patterns'
        ],
        'Introduction to Data Science': [
            'What is Data Science',
            'Data Science Workflow',
            'Tools and Technologies',
            'Python for Data Science',
            'Jupyter Notebooks',
            'Data Science Applications'
        ],
        'Python for Data Analysis': [
            'NumPy Arrays',
            'Pandas DataFrames',
            'Data Cleaning',
            'Data Transformation',
            'Aggregation and Grouping',
            'Handling Missing Data'
        ],
        'Data Visualization': [
            'Matplotlib Basics',
            'Seaborn Library',
            'Plot Types and Customization',
            'Subplots and Layouts',
            'Interactive Visualizations',
            'Best Practices for Data Viz'
        ],
        'React Native Basics': [
            'React Native Setup',
            'Core Components',
            'Styling in React Native',
            'Flexbox Layout',
            'Platform-Specific Code',
            'Debugging Tools'
        ],
        'Navigation': [
            'React Navigation Setup',
            'Stack Navigator',
            'Tab Navigator',
            'Drawer Navigator',
            'Passing Parameters',
            'Navigation Best Practices'
        ],
        'State Management': [
            'Context API',
            'Redux in React Native',
            'AsyncStorage',
            'State Persistence',
            'Global State Patterns',
            'Performance Considerations'
        ],
        'Native Modules': [
            'Accessing Camera',
            'Location Services',
            'Push Notifications',
            'File System Access',
            'Device Information',
            'Third-Party Native Modules'
        ],
        'ML Fundamentals': [
            'Machine Learning Overview',
            'Types of Machine Learning',
            'Training and Testing Data',
            'Model Evaluation Metrics',
            'Overfitting and Underfitting',
            'Feature Engineering'
        ],
        'Supervised Learning': [
            'Linear Regression',
            'Logistic Regression',
            'Decision Trees',
            'Random Forests',
            'Support Vector Machines',
            'Model Selection'
        ],
        'Unsupervised Learning': [
            'K-Means Clustering',
            'Hierarchical Clustering',
            'Principal Component Analysis',
            'Dimensionality Reduction',
            'Anomaly Detection',
            'Association Rules'
        ]
    }
    
    return topics_map.get(chapter_title, [
        'Introduction and Overview',
        'Core Concepts',
        'Practical Examples',
        'Best Practices',
        'Common Pitfalls',
        'Advanced Techniques'
    ])

def create_courses(users):
    """Create courses with chapters and quizzes"""
    print("\n📚 Creating courses...")
    
    courses_data = [
        {
            'title': 'Complete Python Programming',
            'description': 'Master Python from basics to advanced concepts. Learn data structures, OOP, web development, and more.',
            'category': 'Programming',
            'difficulty_level': 'beginner',
            'duration_hours': 40,
            'price': Decimal('49.99'),
            'is_free': False,
            'is_published': True,
            'chapters': [
                {'title': 'Introduction to Python', 'content': 'Learn Python basics, syntax, and setup', 'duration': 60, 'order': 1},
                {'title': 'Data Types and Variables', 'content': 'Understanding Python data types', 'duration': 45, 'order': 2},
                {'title': 'Control Flow', 'content': 'If statements, loops, and logic', 'duration': 50, 'order': 3},
                {'title': 'Functions and Modules', 'content': 'Creating reusable code', 'duration': 55, 'order': 4},
                {'title': 'Object-Oriented Programming', 'content': 'Classes, objects, and inheritance', 'duration': 70, 'order': 5},
            ]
        },
        {
            'title': 'Web Development with React',
            'description': 'Build modern web applications with React, Redux, and TypeScript.',
            'category': 'Web Development',
            'difficulty_level': 'intermediate',
            'duration_hours': 35,
            'price': Decimal('59.99'),
            'is_free': False,
            'is_published': True,
            'chapters': [
                {'title': 'React Fundamentals', 'content': 'Components, props, and state', 'duration': 50, 'order': 1},
                {'title': 'Hooks and Effects', 'content': 'useState, useEffect, and custom hooks', 'duration': 45, 'order': 2},
                {'title': 'State Management with Redux', 'content': 'Global state management', 'duration': 60, 'order': 3},
                {'title': 'TypeScript with React', 'content': 'Type-safe React applications', 'duration': 55, 'order': 4},
            ]
        },
        {
            'title': 'Data Science Fundamentals',
            'description': 'Learn data analysis, visualization, and machine learning basics.',
            'category': 'Data Science',
            'difficulty_level': 'beginner',
            'duration_hours': 30,
            'price': Decimal('0.00'),
            'is_free': True,
            'is_published': True,
            'chapters': [
                {'title': 'Introduction to Data Science', 'content': 'What is data science?', 'duration': 40, 'order': 1},
                {'title': 'Python for Data Analysis', 'content': 'NumPy and Pandas basics', 'duration': 60, 'order': 2},
                {'title': 'Data Visualization', 'content': 'Matplotlib and Seaborn', 'duration': 50, 'order': 3},
            ]
        },
        {
            'title': 'Mobile App Development',
            'description': 'Create cross-platform mobile apps with React Native.',
            'category': 'Mobile Development',
            'difficulty_level': 'intermediate',
            'duration_hours': 45,
            'price': Decimal('69.99'),
            'is_free': False,
            'is_published': True,
            'chapters': [
                {'title': 'React Native Basics', 'content': 'Setup and first app', 'duration': 50, 'order': 1},
                {'title': 'Navigation', 'content': 'React Navigation setup', 'duration': 45, 'order': 2},
                {'title': 'State Management', 'content': 'Context API and Redux', 'duration': 55, 'order': 3},
                {'title': 'Native Modules', 'content': 'Accessing device features', 'duration': 60, 'order': 4},
            ]
        },
        {
            'title': 'Machine Learning Basics',
            'description': 'Introduction to machine learning algorithms and applications.',
            'category': 'Data Science',
            'difficulty_level': 'advanced',
            'duration_hours': 50,
            'price': Decimal('79.99'),
            'is_free': False,
            'is_published': True,
            'chapters': [
                {'title': 'ML Fundamentals', 'content': 'Types of ML and algorithms', 'duration': 60, 'order': 1},
                {'title': 'Supervised Learning', 'content': 'Classification and regression', 'duration': 70, 'order': 2},
                {'title': 'Unsupervised Learning', 'content': 'Clustering and dimensionality reduction', 'duration': 65, 'order': 3},
            ]
        },
    ]
    
    courses = []
    for i, course_data in enumerate(courses_data):
        instructor = users['instructors'][i % len(users['instructors'])]
        
        chapters_data = course_data.pop('chapters')
        course = Course.objects.create(
            instructor=instructor,
            **course_data
        )
        courses.append(course)
        print(f"  ✓ Created course: {course.title}")
        
        # Create chapters
        for chapter_data in chapters_data:
            duration = chapter_data.pop('duration')
            topics_list = generate_topics_for_chapter(chapter_data['title'])
            chapter = Chapter.objects.create(
                course=course,
                description=f"Chapter covering {chapter_data['title']}",
                is_free_preview=(chapter_data['order'] == 1),
                **chapter_data
            )
            
            # Create Topic instances for the chapter
            from courses.models import Topic
            for idx, topic_title in enumerate(topics_list, start=1):
                Topic.objects.create(
                    chapter=chapter,
                    title=topic_title,
                    content=f"Detailed content for {topic_title}. This section covers important concepts and practical applications.",
                    example=f"# Example code for {topic_title}\nprint('Hello, World!')",
                    video_url=f"https://example.com/videos/{course.id}/{chapter.order}/{idx}",
                    order=idx,
                    duration_minutes=duration // len(topics_list) if topics_list else 0
                )
            
            # Create quiz for each chapter
            quiz = Quiz.objects.create(
                course=course,
                chapter=chapter,
                title=f"{chapter.title} Quiz",
                description=f"Test your knowledge of {chapter.title}",
                time_limit_minutes=15,
                passing_score=70,
                max_attempts=10,  # Allow 10 attempts
                is_active=True
            )
            
            # Create questions for quiz
            create_quiz_questions(quiz, chapter.title)
    
    return courses

def create_quiz_questions(quiz, chapter_title):
    """Create questions and options for a quiz"""
    questions_data = [
        {
            'text': f'What is the main concept covered in {chapter_title}?',
            'type': 'multiple_choice',
            'points': 10,
            'options': [
                ('Basic fundamentals', True),
                ('Advanced topics', False),
                ('Unrelated content', False),
                ('None of the above', False),
            ]
        },
        {
            'text': f'Is {chapter_title} important for beginners?',
            'type': 'true_false',
            'points': 5,
            'options': [
                ('True', True),
                ('False', False),
            ]
        },
        {
            'text': f'Which best describes {chapter_title}?',
            'type': 'multiple_choice',
            'points': 10,
            'options': [
                ('Essential learning material', True),
                ('Optional content', False),
                ('Deprecated information', False),
                ('Not relevant', False),
            ]
        },
    ]
    
    for i, q_data in enumerate(questions_data):
        options_data = q_data.pop('options')
        question = Question.objects.create(
            quiz=quiz,
            question_text=q_data['text'],
            question_type=q_data['type'],
            points=q_data['points'],
            order=i + 1,
            explanation=f"This question tests understanding of {chapter_title}"
        )
        
        for j, (option_text, is_correct) in enumerate(options_data):
            Option.objects.create(
                question=question,
                option_text=option_text,
                is_correct=is_correct,
                order=j + 1
            )

def create_enrollments_and_progress(users, courses):
    """Create enrollments and progress for students"""
    print("\n📝 Creating enrollments and progress...")
    
    students = users['students']
    enrollments = []
    
    for student in students:
        # Each student enrolls in 2-4 random courses
        num_courses = random.randint(2, 4)
        student_courses = random.sample(courses, num_courses)
        
        for course in student_courses:
            enrollment = Enrollment.objects.create(
                student=student,
                course=course,
                is_active=True
            )
            enrollments.append(enrollment)
            
            # Create progress
            total_chapters = course.chapters.count()
            completed = random.randint(0, total_chapters)
            
            Progress.objects.create(
                student=student,
                course=course,
                completed_lessons=completed,
                total_lessons=total_chapters,
                score=Decimal(random.randint(60, 100)),
                time_spent_minutes=random.randint(30, 300),
                is_completed=(completed == total_chapters)
            )
            
            print(f"  ✓ Enrolled {student.username} in {course.title}")
    
    return enrollments

def create_quiz_attempts_and_answers(users, courses):
    """Create quiz attempts and student answers"""
    print("\n📊 Creating quiz attempts and answers...")
    
    students = users['students']
    
    for student in students:
        # Get student's enrolled courses
        enrollments = Enrollment.objects.filter(student=student)
        
        for enrollment in enrollments:
            # Get quizzes for this course
            quizzes = Quiz.objects.filter(course=enrollment.course)
            
            # Student attempts 1-2 quizzes per course
            num_quizzes = min(random.randint(1, 2), quizzes.count())
            attempted_quizzes = random.sample(list(quizzes), num_quizzes)
            
            for quiz in attempted_quizzes:
                # Create quiz attempt
                questions = quiz.questions.all()
                total_points = sum(q.points for q in questions)
                earned_points = random.randint(int(total_points * 0.5), total_points)
                percentage = (earned_points / total_points * 100) if total_points > 0 else 0
                
                attempt = QuizAttempt.objects.create(
                    student=student,
                    quiz=quiz,
                    score=Decimal(earned_points),
                    max_score=Decimal(total_points),
                    percentage=Decimal(percentage),
                    time_taken_minutes=random.randint(5, 15),
                    completed_at=datetime.now(),
                    is_completed=True,
                    attempt_number=1
                )
                
                # Create student answers
                for question in questions:
                    options = list(question.options.all())
                    if options:
                        # 70% chance of correct answer
                        if random.random() < 0.7:
                            selected = next((o for o in options if o.is_correct), random.choice(options))
                        else:
                            selected = random.choice(options)
                        
                        StudentAnswer.objects.create(
                            student=student,
                            question=question,
                            selected_option=selected,
                            is_correct=selected.is_correct,
                            time_taken_seconds=random.randint(10, 60)
                        )
                
                print(f"  ✓ {student.username} completed quiz: {quiz.title}")

def create_ratings_and_reviews(users, courses):
    """Create ratings and reviews for courses"""
    print("\n⭐ Creating ratings and reviews...")
    
    students = users['students']
    
    for course in courses:
        # 50-80% of enrolled students rate the course
        enrolled_students = Enrollment.objects.filter(course=course).values_list('student', flat=True)
        num_ratings = int(len(enrolled_students) * random.uniform(0.5, 0.8))
        
        rating_students = random.sample(list(enrolled_students), min(num_ratings, len(enrolled_students)))
        
        for student_id in rating_students:
            student = User.objects.get(id=student_id)
            rating_value = random.randint(3, 5)
            
            reviews = [
                "Great course! Learned a lot.",
                "Very informative and well-structured.",
                "Excellent instructor and content.",
                "Highly recommended for beginners.",
                "Clear explanations and good examples.",
                "Worth every penny!",
                "Best course I've taken so far.",
            ]
            
            Rating.objects.create(
                student=student,
                course=course,
                rating=rating_value,
                review=random.choice(reviews) if random.random() < 0.7 else ""
            )
    
    print(f"  ✓ Created ratings for all courses")

def create_discussions_and_replies(users, courses):
    """Create discussions and replies"""
    print("\n💬 Creating discussions and replies...")
    
    students = users['students']
    
    for course in courses:
        # Create 2-3 discussions per course
        num_discussions = random.randint(2, 3)
        
        for i in range(num_discussions):
            student = random.choice(students)
            
            discussion_titles = [
                "Question about this topic",
                "Need help understanding this concept",
                "Great course! Quick question",
                "Clarification needed",
                "Best practices for this?",
            ]
            
            discussion = Discussion.objects.create(
                course=course,
                user=student,
                title=random.choice(discussion_titles),
                content=f"I have a question about the content in this course. Can someone help explain?",
                is_pinned=(i == 0)
            )
            
            # Create 1-3 replies
            num_replies = random.randint(1, 3)
            for _ in range(num_replies):
                replier = random.choice(students + users['instructors'])
                Reply.objects.create(
                    discussion=discussion,
                    user=replier,
                    content="Here's my answer to your question. Hope this helps!"
                )
    
    print(f"  ✓ Created discussions and replies")

def create_bookmarks(users, courses):
    """Create bookmarks for students"""
    print("\n🔖 Creating bookmarks...")
    
    students = users['students']
    
    for student in students:
        # Each student bookmarks 1-2 courses
        num_bookmarks = random.randint(1, 2)
        bookmarked_courses = random.sample(courses, num_bookmarks)
        
        for course in bookmarked_courses:
            Bookmark.objects.create(
                student=student,
                course=course
            )
    
    print(f"  ✓ Created bookmarks")

def create_notifications(users):
    """Create notifications for users"""
    print("\n🔔 Creating notifications...")
    
    students = users['students']
    
    notification_data = [
        ('course_update', 'New Chapter Added', 'A new chapter has been added to your enrolled course.'),
        ('quiz_result', 'Quiz Completed', 'You scored 85% on your recent quiz!'),
        ('achievement', 'Achievement Unlocked', 'Congratulations! You completed your first course.'),
        ('enrollment', 'Enrollment Confirmed', 'You have successfully enrolled in a new course.'),
    ]
    
    for student in students:
        # Create 2-3 notifications per student
        num_notifications = random.randint(2, 3)
        
        for _ in range(num_notifications):
            notif_type, title, message = random.choice(notification_data)
            Notification.objects.create(
                user=student,
                title=title,
                message=message,
                notification_type=notif_type,
                is_read=random.choice([True, False])
            )
    
    print(f"  ✓ Created notifications")

def create_certificates(users, courses):
    """Create certificates for completed courses"""
    print("\n🎓 Creating certificates...")
    
    # Get completed enrollments
    completed_progress = Progress.objects.filter(is_completed=True)
    
    for progress in completed_progress:
        import uuid
        Certificate.objects.create(
            student=progress.student,
            course=progress.course,
            certificate_id=str(uuid.uuid4())[:8].upper(),
            is_valid=True
        )
    
    print(f"  ✓ Created {completed_progress.count()} certificates")

def print_summary():
    """Print summary of created data"""
    print("\n" + "="*50)
    print("📊 MOCK DATA SUMMARY")
    print("="*50)
    print(f"👥 Users: {User.objects.count()}")
    print(f"   - Admins: {User.objects.filter(role='admin').count()}")
    print(f"   - Instructors: {User.objects.filter(role='instructor').count()}")
    print(f"   - Students: {User.objects.filter(role='student').count()}")
    print(f"\n📚 Courses: {Course.objects.count()}")
    print(f"📖 Chapters: {Chapter.objects.count()}")
    print(f"❓ Quizzes: {Quiz.objects.count()}")
    print(f"❔ Questions: {Question.objects.count()}")
    print(f"✓ Options: {Option.objects.count()}")
    print(f"\n📝 Enrollments: {Enrollment.objects.count()}")
    print(f"📊 Progress Records: {Progress.objects.count()}")
    print(f"📋 Quiz Attempts: {QuizAttempt.objects.count()}")
    print(f"✍️ Student Answers: {StudentAnswer.objects.count()}")
    print(f"\n⭐ Ratings: {Rating.objects.count()}")
    print(f"💬 Discussions: {Discussion.objects.count()}")
    print(f"💭 Replies: {Reply.objects.count()}")
    print(f"🔖 Bookmarks: {Bookmark.objects.count()}")
    print(f"🔔 Notifications: {Notification.objects.count()}")
    print(f"🎓 Certificates: {Certificate.objects.count()}")
    print("="*50)
    
    print("\n🔑 TEST CREDENTIALS:")
    print("="*50)
    print("Admin:")
    print("  Username: admin")
    print("  Password: admin123")
    print("\nInstructor:")
    print("  Username: john_doe")
    print("  Password: password123")
    print("\nStudent:")
    print("  Username: alice_johnson")
    print("  Password: password123")
    print("="*50)

def main():
    """Main function to create all mock data"""
    print("\n🚀 Starting Mock Data Generation...")
    print("="*50)
    
    # Clear existing data
    clear_all_data()
    
    # Create data
    users = create_users()
    courses = create_courses(users)
    enrollments = create_enrollments_and_progress(users, courses)
    create_quiz_attempts_and_answers(users, courses)
    create_ratings_and_reviews(users, courses)
    create_discussions_and_replies(users, courses)
    create_bookmarks(users, courses)
    create_notifications(users)
    create_certificates(users, courses)
    
    # Print summary
    print_summary()
    
    print("\n✅ Mock data generation complete!")
    print("🎉 You can now test the application with realistic data!\n")

if __name__ == '__main__':
    main()
