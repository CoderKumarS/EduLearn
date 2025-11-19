"""
Populate database with sample data for testing
Run with: python manage.py shell < populate_data.py
"""

import os
import django
import random
from pathlib import Path

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elearning.settings')
django.setup()

from users.models import CustomUser
from courses.models import (
    Category, Course, Chapter, Topic, Quiz, Question, Option
)
from django.core.files import File
from PIL import Image, ImageDraw, ImageFont
import io

print("=" * 60)
print("POPULATING DATABASE WITH SAMPLE DATA")
print("=" * 60)

# Create media directories if they don't exist
MEDIA_ROOT = Path(__file__).parent / 'media'
COURSE_THUMBNAILS_DIR = MEDIA_ROOT / 'course_thumbnails'
PROFILE_IMAGES_DIR = MEDIA_ROOT / 'profile_images'

COURSE_THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)
PROFILE_IMAGES_DIR.mkdir(parents=True, exist_ok=True)

print(f"\n✓ Created media directories")

# Helper function to create placeholder images
def create_placeholder_image(text, size=(400, 300), bg_color=(100, 150, 200)):
    """Create a placeholder image with text"""
    img = Image.new('RGB', size, color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Try to use a font, fallback to default if not available
    try:
        font = ImageFont.truetype("arial.ttf", 40)
    except:
        font = ImageFont.load_default()
    
    # Calculate text position (center)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((size[0] - text_width) // 2, (size[1] - text_height) // 2)
    
    draw.text(position, text, fill=(255, 255, 255), font=font)
    
    # Save to BytesIO
    img_io = io.BytesIO()
    img.save(img_io, format='PNG')
    img_io.seek(0)
    
    return img_io

# Sample data
FIRST_NAMES = [
    'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa',
    'James', 'Mary', 'William', 'Patricia', 'Richard', 'Jennifer', 'Thomas',
    'Linda', 'Charles', 'Barbara', 'Daniel', 'Susan', 'Matthew', 'Jessica',
    'Anthony', 'Karen', 'Mark', 'Nancy', 'Donald', 'Betty', 'Steven', 'Helen'
]

LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
    'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
    'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis', 'Robinson'
]

CATEGORIES_DATA = [
    {'name': 'Programming', 'slug': 'programming', 'icon': 'code', 'color': '#3B82F6'},
    {'name': 'Web Development', 'slug': 'web-development', 'icon': 'globe', 'color': '#10B981'},
    {'name': 'Data Science', 'slug': 'data-science', 'icon': 'chart', 'color': '#8B5CF6'},
    {'name': 'Mobile Development', 'slug': 'mobile-development', 'icon': 'smartphone', 'color': '#F59E0B'},
    {'name': 'Design', 'slug': 'design', 'icon': 'palette', 'color': '#EC4899'},
    {'name': 'Business', 'slug': 'business', 'icon': 'briefcase', 'color': '#6366F1'},
    {'name': 'Marketing', 'slug': 'marketing', 'icon': 'megaphone', 'color': '#EF4444'},
]

COURSE_TEMPLATES = [
    # Programming
    {
        'title': 'Python Programming Fundamentals',
        'description': 'Learn Python from scratch with hands-on projects and real-world examples.',
        'category': 'Programming',
        'difficulty': 'beginner',
    },
    {
        'title': 'Java Object-Oriented Programming',
        'description': 'Master Java and OOP concepts with practical applications.',
        'category': 'Programming',
        'difficulty': 'intermediate',
    },
    {
        'title': 'C++ Advanced Programming',
        'description': 'Deep dive into C++ with memory management and performance optimization.',
        'category': 'Programming',
        'difficulty': 'advanced',
    },
    # Web Development
    {
        'title': 'Advanced JavaScript Techniques',
        'description': 'Master modern JavaScript including ES6+, async/await, and design patterns.',
        'category': 'Web Development',
        'difficulty': 'advanced',
    },
    {
        'title': 'Full Stack Web Development',
        'description': 'Become a full-stack developer with MERN stack.',
        'category': 'Web Development',
        'difficulty': 'intermediate',
    },
    {
        'title': 'HTML & CSS Mastery',
        'description': 'Build beautiful responsive websites with HTML5 and CSS3.',
        'category': 'Web Development',
        'difficulty': 'beginner',
    },
    # Data Science
    {
        'title': 'Machine Learning with Python',
        'description': 'Dive into machine learning algorithms and build predictive models.',
        'category': 'Data Science',
        'difficulty': 'intermediate',
    },
    {
        'title': 'Data Analysis with Pandas',
        'description': 'Master data analysis and visualization with Python Pandas.',
        'category': 'Data Science',
        'difficulty': 'intermediate',
    },
    {
        'title': 'Deep Learning and Neural Networks',
        'description': 'Build and train neural networks using TensorFlow and Keras.',
        'category': 'Data Science',
        'difficulty': 'advanced',
    },
    # Mobile Development
    {
        'title': 'React Native Mobile Apps',
        'description': 'Build cross-platform mobile applications using React Native.',
        'category': 'Mobile Development',
        'difficulty': 'intermediate',
    },
    {
        'title': 'iOS App Development',
        'description': 'Build native iOS applications using Swift and SwiftUI.',
        'category': 'Mobile Development',
        'difficulty': 'intermediate',
    },
    {
        'title': 'Android Development with Kotlin',
        'description': 'Create modern Android apps using Kotlin and Jetpack Compose.',
        'category': 'Mobile Development',
        'difficulty': 'intermediate',
    },
    # Design
    {
        'title': 'UI/UX Design Principles',
        'description': 'Learn the fundamentals of user interface and user experience design.',
        'category': 'Design',
        'difficulty': 'beginner',
    },
    {
        'title': 'Graphic Design Essentials',
        'description': 'Learn graphic design principles and tools like Adobe Photoshop.',
        'category': 'Design',
        'difficulty': 'beginner',
    },
    {
        'title': 'Advanced Figma for Designers',
        'description': 'Master Figma for professional UI/UX design and prototyping.',
        'category': 'Design',
        'difficulty': 'intermediate',
    },
    # Business
    {
        'title': 'Business Strategy Fundamentals',
        'description': 'Learn strategic planning and business model development.',
        'category': 'Business',
        'difficulty': 'beginner',
    },
    {
        'title': 'Project Management Professional',
        'description': 'Master project management methodologies and tools.',
        'category': 'Business',
        'difficulty': 'intermediate',
    },
    {
        'title': 'Entrepreneurship and Startups',
        'description': 'Learn how to start and grow a successful business.',
        'category': 'Business',
        'difficulty': 'beginner',
    },
    # Marketing
    {
        'title': 'Digital Marketing Mastery',
        'description': 'Complete guide to digital marketing strategies and tools.',
        'category': 'Marketing',
        'difficulty': 'beginner',
    },
    {
        'title': 'Social Media Marketing',
        'description': 'Master social media platforms for business growth.',
        'category': 'Marketing',
        'difficulty': 'beginner',
    },
]

# Step 1: Create Categories
print("\n" + "=" * 60)
print("STEP 1: Creating Categories")
print("=" * 60)

categories = {}
for cat_data in CATEGORIES_DATA:
    category, created = Category.objects.get_or_create(
        slug=cat_data['slug'],
        defaults=cat_data
    )
    categories[cat_data['name']] = category
    status = "Created" if created else "Already exists"
    print(f"  {status}: {category.name}")

print(f"\n✓ Total categories: {len(categories)}")

# Step 2: Create Students
print("\n" + "=" * 60)
print("STEP 2: Creating 15 Students")
print("=" * 60)

students = []
for i in range(15):
    first_name = random.choice(FIRST_NAMES)
    last_name = random.choice(LAST_NAMES)
    username = f"student{i+1}"
    email = f"{username}@example.com"
    
    # Create placeholder profile image
    img_io = create_placeholder_image(f"S{i+1}", size=(200, 200), bg_color=(random.randint(50, 200), random.randint(50, 200), random.randint(50, 200)))
    
    user, created = CustomUser.objects.get_or_create(
        username=username,
        defaults={
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
            'role': 'student',
            'bio': f'Passionate learner interested in technology and innovation.',
        }
    )
    
    if created:
        user.set_password('password123')
        user.profile_image.save(f'{username}.png', File(img_io), save=True)
        user.save()
        print(f"  Created: {username} ({first_name} {last_name})")
    else:
        print(f"  Already exists: {username}")
    
    students.append(user)

print(f"\n✓ Total students: {len(students)}")

# Step 3: Create Instructors
print("\n" + "=" * 60)
print("STEP 3: Creating 10 Instructors")
print("=" * 60)

instructors = []
for i in range(10):
    first_name = random.choice(FIRST_NAMES)
    last_name = random.choice(LAST_NAMES)
    username = f"instructor{i+1}"
    email = f"{username}@example.com"
    
    # Create placeholder profile image
    img_io = create_placeholder_image(f"I{i+1}", size=(200, 200), bg_color=(random.randint(100, 255), random.randint(50, 150), random.randint(50, 150)))
    
    user, created = CustomUser.objects.get_or_create(
        username=username,
        defaults={
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
            'role': 'instructor',
            'bio': f'Experienced educator with {random.randint(5, 15)} years of teaching experience.',
        }
    )
    
    if created:
        user.set_password('password123')
        user.profile_image.save(f'{username}.png', File(img_io), save=True)
        user.save()
        print(f"  Created: {username} ({first_name} {last_name})")
    else:
        print(f"  Already exists: {username}")
    
    instructors.append(user)

print(f"\n✓ Total instructors: {len(instructors)}")

# Step 4: Create Courses
print("\n" + "=" * 60)
print("STEP 4: Creating 20 Courses")
print("=" * 60)

courses = []
difficulty_levels = ['beginner', 'intermediate', 'advanced']

for i in range(20):
    template = COURSE_TEMPLATES[i % len(COURSE_TEMPLATES)]
    instructor = random.choice(instructors)
    category = categories[template['category']]
    
    title = f"{template['title']} - Part {(i // len(COURSE_TEMPLATES)) + 1}" if i >= len(COURSE_TEMPLATES) else template['title']
    
    # Create placeholder thumbnail
    img_io = create_placeholder_image(f"Course\n{i+1}", size=(400, 300), bg_color=(random.randint(50, 150), random.randint(100, 200), random.randint(150, 255)))
    
    course, created = Course.objects.get_or_create(
        title=title,
        defaults={
            'description': template['description'],
            'instructor': instructor,
            'category': template['category'],  # String field (legacy)
            'category_obj': category,  # Foreign key (new)
            'difficulty_level': template['difficulty'],
            'is_free': random.choice([True, True, False]),  # 66% free
            'price': 0 if random.random() < 0.66 else random.choice([29.99, 49.99, 99.99]),
            'duration_hours': random.randint(5, 40),
            'is_published': True,
        }
    )
    
    if created:
        course.thumbnail_image.save(f'course_{i+1}.png', File(img_io), save=True)
        course.save()
        print(f"  Created: {title[:50]}... by {instructor.username}")
    else:
        # Update existing courses to have both category fields
        if not course.category:
            course.category = template['category']
            course.save()
        print(f"  Already exists: {title[:50]}...")
    
    courses.append(course)

print(f"\n✓ Total courses: {len(courses)}")

# Step 5: Create Chapters, Topics, and Quizzes
print("\n" + "=" * 60)
print("STEP 5: Creating Chapters, Topics, and Quizzes")
print("=" * 60)

chapter_topics = [
    'Introduction', 'Getting Started', 'Core Concepts', 'Advanced Techniques', 'Best Practices'
]

topic_templates = [
    'Understanding {}', 'Working with {}', 'Mastering {}', 'Practical {} Examples', 'Common {} Patterns'
]

for course_idx, course in enumerate(courses):
    print(f"\n  Course {course_idx + 1}/{len(courses)}: {course.title[:40]}...")
    
    # Create 5 chapters per course
    for chapter_num in range(1, 6):
        chapter_title = f"Chapter {chapter_num}: {chapter_topics[chapter_num - 1]}"
        
        chapter, created = Chapter.objects.get_or_create(
            course=course,
            order=chapter_num,
            defaults={
                'title': chapter_title,
                'description': f'Learn about {chapter_topics[chapter_num - 1].lower()} in this comprehensive chapter.',
                'is_free_preview': chapter_num == 1,  # First chapter is free preview
            }
        )
        
        if created:
            print(f"    ✓ {chapter_title}")
        
        # Create 5 topics per chapter
        for topic_num in range(1, 6):
            topic_title = topic_templates[topic_num - 1].format(chapter_topics[chapter_num - 1])
            
            topic, created = Topic.objects.get_or_create(
                chapter=chapter,
                order=topic_num,
                defaults={
                    'title': topic_title,
                    'content': f'''
# {topic_title}

## Overview
This topic covers essential concepts related to {chapter_topics[chapter_num - 1].lower()}.

## Key Points
- Understanding the fundamentals
- Practical applications
- Real-world examples
- Best practices and tips

## Learning Objectives
By the end of this topic, you will be able to:
1. Understand core concepts
2. Apply knowledge in practical scenarios
3. Solve common problems
4. Implement best practices

## Content
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

### Section 1: Fundamentals
Detailed explanation of fundamental concepts...

### Section 2: Practical Application
How to apply these concepts in real-world scenarios...

### Section 3: Advanced Topics
Deep dive into advanced techniques and patterns...

## Summary
Key takeaways from this topic...
                    ''',
                    'example': f'''
# Example Code

```python
# Example implementation
def example_function():
    """
    This is an example function demonstrating {topic_title.lower()}
    """
    result = "Hello, World!"
    return result

# Usage
output = example_function()
print(output)
```

## Explanation
This example demonstrates how to implement {topic_title.lower()} effectively.
                    ''',
                    'video_url': f'https://www.youtube.com/watch?v=dQw4w9WgXcQ',  # Placeholder
                    'duration_minutes': random.randint(10, 30),
                }
            )
        
        # Create 2 quizzes per chapter
        for quiz_num in range(1, 3):
            quiz_title = f"{chapter_title} - Quiz {quiz_num}"
            
            quiz, created = Quiz.objects.get_or_create(
                course=course,
                chapter=chapter,
                order=(chapter_num - 1) * 2 + quiz_num,
                defaults={
                    'title': quiz_title,
                    'description': f'Test your knowledge of {chapter_topics[chapter_num - 1].lower()}',
                    'time_limit_minutes': random.choice([15, 20, 30]),
                    'passing_score': random.choice([60, 70, 80]),
                    'max_attempts': random.choice([2, 3, 5]),
                    'is_required': quiz_num == 1,  # First quiz is required
                    'is_active': True,
                }
            )
            
            if created:
                # Create 5 questions per quiz
                for q_num in range(1, 6):
                    question_types = ['multiple_choice', 'true_false', 'short_answer']
                    q_type = random.choice(question_types)
                    
                    if q_type == 'multiple_choice':
                        question_text = f"What is the best approach to {chapter_topics[chapter_num - 1].lower()}?"
                        
                        question = Question.objects.create(
                            quiz=quiz,
                            question_text=question_text,
                            question_type='multiple_choice',
                            points=random.choice([1, 2, 5]),
                            order=q_num,
                            explanation=f'The correct answer demonstrates proper understanding of {chapter_topics[chapter_num - 1].lower()}.'
                        )
                        
                        # Create 4 options
                        options_text = [
                            f'Use method A for {chapter_topics[chapter_num - 1].lower()}',
                            f'Apply technique B to achieve {chapter_topics[chapter_num - 1].lower()}',
                            f'Implement pattern C for better {chapter_topics[chapter_num - 1].lower()}',
                            f'Follow approach D when working with {chapter_topics[chapter_num - 1].lower()}'
                        ]
                        
                        for opt_num, opt_text in enumerate(options_text):
                            Option.objects.create(
                                question=question,
                                option_text=opt_text,
                                is_correct=(opt_num == 0),  # First option is correct
                                order=opt_num + 1
                            )
                    
                    elif q_type == 'true_false':
                        question_text = f"{chapter_topics[chapter_num - 1]} is an essential concept in this course."
                        
                        question = Question.objects.create(
                            quiz=quiz,
                            question_text=question_text,
                            question_type='true_false',
                            points=1,
                            order=q_num,
                            explanation='This statement is true based on the course content.'
                        )
                        
                        Option.objects.create(question=question, option_text='True', is_correct=True, order=1)
                        Option.objects.create(question=question, option_text='False', is_correct=False, order=2)
                    
                    else:  # short_answer
                        question_text = f"Explain the importance of {chapter_topics[chapter_num - 1].lower()} in your own words."
                        
                        Question.objects.create(
                            quiz=quiz,
                            question_text=question_text,
                            question_type='short_answer',
                            points=5,
                            order=q_num,
                            explanation='A good answer should cover the key concepts and practical applications.'
                        )

print("\n" + "=" * 60)
print("DATA POPULATION COMPLETE!")
print("=" * 60)

# Print summary
print("\n📊 SUMMARY:")
print(f"  ✓ Categories: {Category.objects.count()}")
print(f"  ✓ Students: {CustomUser.objects.filter(role='student').count()}")
print(f"  ✓ Instructors: {CustomUser.objects.filter(role='instructor').count()}")
print(f"  ✓ Courses: {Course.objects.count()}")
print(f"  ✓ Chapters: {Chapter.objects.count()}")
print(f"  ✓ Topics: {Topic.objects.count()}")
print(f"  ✓ Quizzes: {Quiz.objects.count()}")
print(f"  ✓ Questions: {Question.objects.count()}")
print(f"  ✓ Options: {Option.objects.count()}")

print("\n🔐 TEST CREDENTIALS:")
print("  Students: student1 to student15 (password: password123)")
print("  Instructors: instructor1 to instructor10 (password: password123)")

print("\n✅ All data has been created successfully!")
print("=" * 60)
