# EduLearn - AI Integration Roadmap & Implementation Guide

**Status:** AI features are PLANNED but NOT YET IMPLEMENTED  
**Current Version:** 1.0  
**Last Updated:** November 12, 2025

---

## 📋 Executive Summary

The EduLearn platform currently does **NOT include AI features**. However, there are significant opportunities to integrate AI/ML capabilities to enhance the learning experience. This document outlines:

1. **Current Status** - What exists today
2. **AI Use Cases** - Where AI can add value
3. **Implementation Strategy** - How to add AI features
4. **Technical Architecture** - Required components
5. **Phase-wise Roadmap** - Deployment timeline

---

## 🔍 Current Implementation Status

### ✅ Features Currently Implemented

```
BACKEND (Django REST API)
├── Authentication & Authorization ✅
│   ├── JWT Token Management
│   ├── Role-Based Access Control (Student, Instructor, Admin)
│   └── User Registration & Login
│
├── Course Management ✅
│   ├── CRUD Operations
│   ├── Instructor Course Assignment
│   └── Course Publishing
│
├── Enrollment System ✅
│   ├── Student Enrollment
│   ├── Unique Constraints (Student per Course)
│   └── Enrollment Tracking
│
├── Quiz System ✅
│   ├── Quiz Creation & Management
│   ├── Multiple Choice Questions
│   ├── Answer Submission
│   ├── Basic Scoring
│   └── Progress Tracking
│
├── Progress Tracking ✅
│   ├── Lesson Completion Count
│   ├── Overall Score Calculation
│   ├── Progress Percentage
│   └── Student Performance Metrics

FRONTEND (React Native/Expo)
├── Authentication UI ✅
├── Course Browsing & Filtering ✅
├── Quiz Interface ✅
├── Progress Dashboard ✅
├── User Profiles ✅
└── Basic Analytics ✅

DATABASE (PostgreSQL/SQLite)
├── 8 Core Tables ✅
├── Proper Relationships ✅
├── Constraints & Validation ✅
└── Index Support ✅
```

### ❌ AI Features Currently NOT Implemented

```
ANALYTICS & RECOMMENDATIONS
├── Personalized Course Recommendations ❌
├── Adaptive Learning Paths ❌
├── Content Recommendations ❌
└── Student Performance Prediction ❌

INTELLIGENT TUTORING
├── Smart Quiz Generation ❌
├── Difficulty Adaptation ❌
├── Hint Generation ❌
└── Misconception Detection ❌

STUDENT SUPPORT
├── AI Chatbot ❌
├── Automated Question Answering ❌
├── Content Summarization ❌
└── Learning Resource Generation ❌

INSTRUCTOR TOOLS
├── Student Performance Analytics ❌
├── Automated Quiz Grading (Essay) ❌
├── Content Quality Analysis ❌
└── Engagement Prediction ❌

OPTIMIZATION
├── Learning Pattern Analysis ❌
├── Optimal Study Time Recommendation ❌
├── Knowledge Gap Identification ❌
└── Personalized Study Plan Generation ❌
```

---

## 🎯 Proposed AI Use Cases

### Phase 1: Foundational AI (Months 1-2)

#### 1. **Student Performance Analytics & Prediction**

**What:** Predict which students are at risk of failing/dropping out

**How:**

```python
# Backend Implementation Sketch
from sklearn.ensemble import RandomForestClassifier
import numpy as np

class StudentRiskPredictor:
    def __init__(self):
        self.model = RandomForestClassifier()

    def extract_features(self, student_id):
        """Extract predictive features"""
        student = User.objects.get(id=student_id)
        enrollments = Enrollment.objects.filter(student=student)

        features = {
            'login_frequency': self.get_login_count(student),
            'quiz_attempts': StudentAnswer.objects.filter(
                student=student
            ).count(),
            'average_score': self.get_avg_score(student),
            'courses_completed': enrollments.filter(
                progress__score__gte=60
            ).count(),
            'days_since_login': self.get_inactive_days(student),
            'assignment_completion_rate': self.get_completion_rate(student),
        }
        return features

    def predict_risk(self, student_id):
        """0 = Success, 1 = At Risk, 2 = High Risk"""
        features = self.extract_features(student_id)
        X = np.array([list(features.values())])
        risk_level = self.model.predict(X)[0]
        confidence = self.model.predict_proba(X)[0].max()

        return {
            'risk_level': risk_level,
            'confidence': confidence,
            'features': features
        }
```

**API Endpoint:**

```
GET /api/analytics/student-risk/{student_id}/
Response:
{
    "risk_level": 1,  // 0=Success, 1=At Risk, 2=High Risk
    "confidence": 0.85,
    "recommendations": [
        "Encourage quiz attempts",
        "Suggest review materials",
        "Schedule instructor meeting"
    ]
}
```

**Value:** Identify struggling students early for intervention

---

#### 2. **Personalized Course Recommendations**

**What:** Recommend courses based on student history and preferences

**How:**

```python
# Content-Based + Collaborative Filtering
from sklearn.metrics.pairwise import cosine_similarity

class CourseRecommender:
    def __init__(self):
        self.enrollment_matrix = None
        self.course_features = None

    def extract_course_features(self):
        """Create feature vector for each course"""
        courses = Course.objects.all()
        features = []

        for course in courses:
            feature_vec = {
                'difficulty_level': self.calculate_difficulty(course),
                'completion_rate': self.get_completion_rate(course),
                'avg_rating': self.get_course_rating(course),
                'related_topics': self.extract_topics(course.description),
                'prerequisites_count': course.prerequisites.count(),
                'duration': self.estimate_duration(course),
            }
            features.append(feature_vec)

        return np.array([list(f.values()) for f in features])

    def recommend_courses(self, student_id, top_k=5):
        """Get top K course recommendations"""
        student = User.objects.get(id=student_id)

        # Get student's enrollment history
        student_profile = self.build_student_profile(student)

        # Calculate similarity with all courses
        course_features = self.extract_course_features()
        similarities = cosine_similarity(
            [student_profile],
            course_features
        )[0]

        # Get top K recommendations (excluding already enrolled)
        enrolled_ids = set(
            Enrollment.objects.filter(student=student).values_list(
                'course_id', flat=True
            )
        )

        recommendations = []
        for idx in np.argsort(similarities)[::-1]:
            if idx not in enrolled_ids and len(recommendations) < top_k:
                recommendations.append({
                    'course_id': idx,
                    'score': float(similarities[idx]),
                    'reason': self.generate_reason(student, idx)
                })

        return recommendations
```

**API Endpoint:**

```
GET /api/recommendations/courses/?top_k=5
Response:
{
    "recommendations": [
        {
            "course_id": 12,
            "title": "Advanced Python",
            "score": 0.87,
            "reason": "Based on your interest in programming"
        },
        {
            "course_id": 15,
            "title": "Data Science 101",
            "score": 0.82,
            "reason": "Students like you completed this after Python basics"
        }
    ]
}
```

**Value:** Increase course engagement and student satisfaction

---

#### 3. **Quiz Performance Analysis**

**What:** Analyze which questions are hard/easy and which students struggle

**How:**

```python
class QuizAnalytics:
    def analyze_question_difficulty(self, quiz_id):
        """Item Difficulty Analysis (IRT)"""
        quiz = Quiz.objects.get(id=quiz_id)
        answers = StudentAnswer.objects.filter(
            question__quiz=quiz
        )

        analysis = {}
        for question in quiz.questions.all():
            question_answers = answers.filter(question=question)
            total = question_answers.count()
            correct = question_answers.filter(
                selected_option__is_correct=True
            ).count()

            difficulty = 1 - (correct / total) if total > 0 else 0.5

            analysis[question.id] = {
                'text': question.text,
                'difficulty': difficulty,  # 0=Easy, 1=Hard
                'discrimination': self.calculate_discrimination(question),
                'attempts': total,
                'success_rate': (correct / total) if total > 0 else 0,
                'common_mistakes': self.get_common_wrong_answers(question)
            }

        return analysis

    def get_common_wrong_answers(self, question):
        """Identify misconceptions"""
        wrong_answers = StudentAnswer.objects.filter(
            question=question,
            selected_option__is_correct=False
        ).values('selected_option').annotate(
            Count('id')
        ).order_by('-id__count')[:3]

        return [
            {
                'option': wrong['selected_option'],
                'count': wrong['id__count'],
                'likely_misconception': self.analyze_misconception(
                    question,
                    wrong['selected_option']
                )
            }
            for wrong in wrong_answers
        ]
```

**API Endpoint:**

```
GET /api/analytics/quiz/{quiz_id}/analysis/
Response:
{
    "questions": [
        {
            "id": 1,
            "text": "What is 2+2?",
            "difficulty": 0.15,  // Easy
            "success_rate": 0.95,
            "common_mistakes": [
                {
                    "option": "5",
                    "count": 2,
                    "misconception": "Off-by-one error"
                }
            ]
        }
    ]
}
```

**Value:** Help instructors improve quiz quality

---

### Phase 2: Intelligent Tutoring (Months 3-4)

#### 4. **Adaptive Learning Path Generation**

**What:** Create personalized study sequences based on knowledge gaps

**How:**

```python
class AdaptiveLearningPath:
    def generate_personalized_path(self, student_id, course_id):
        """Build optimal learning sequence"""
        student = User.objects.get(id=student_id)
        course = Course.objects.get(id=course_id)

        # Assess current knowledge
        knowledge_map = self.assess_knowledge(student, course)

        # Identify gaps
        gaps = self.identify_knowledge_gaps(knowledge_map, course)

        # Recommend sequence
        sequence = self.build_optimal_sequence(gaps, course)

        return {
            'personalized_path': sequence,
            'estimated_completion': self.estimate_duration(sequence),
            'difficulty_progression': 'gradual',
            'knowledge_gaps': gaps
        }

    def assess_knowledge(self, student, course):
        """Evaluate student's current knowledge"""
        completed = StudentAnswer.objects.filter(
            student=student,
            question__quiz__course=course,
            selected_option__is_correct=True
        ).count()

        total = StudentAnswer.objects.filter(
            student=student,
            question__quiz__course=course
        ).count()

        return {
            'overall_score': (completed / total) if total > 0 else 0,
            'topics_mastered': self.get_mastered_topics(student, course),
            'topics_weak': self.get_weak_topics(student, course),
            'learning_speed': self.estimate_learning_speed(student)
        }
```

**Value:** Reduce learning time, improve outcomes

---

#### 5. **Intelligent Hint Generation**

**What:** Provide context-aware hints for difficult questions

**How:**

```python
from transformers import pipeline

class HintGenerator:
    def __init__(self):
        # Using pre-trained models (no training required)
        self.summarizer = pipeline("summarization")
        self.qa_model = pipeline("question-answering")

    def generate_hint(self, question_id, hint_level=1):
        """Generate hint (1=Gentle, 2=Medium, 3=Strong)"""
        question = Question.objects.get(id=question_id)

        if hint_level == 1:
            hint = self.generate_gentle_hint(question)
        elif hint_level == 2:
            hint = self.generate_medium_hint(question)
        else:
            hint = self.generate_strong_hint(question)

        return hint

    def generate_gentle_hint(self, question):
        """Hint that guides thinking"""
        context = question.quiz.course.description
        hint = f"Think about the main concepts from the course: {context[:100]}..."
        return hint

    def generate_strong_hint(self, question):
        """Hint that's almost the answer"""
        correct_option = question.options.filter(is_correct=True).first()
        return f"The answer is related to: {correct_option.text[:30]}..."
```

**Value:** Increase completion rates, reduce frustration

---

### Phase 3: AI-Powered Content & Support (Months 5-6)

#### 6. **Automated Quiz Generation from Course Content**

**What:** Auto-generate MCQ questions from course materials

**How:**

```python
from transformers import pipeline

class QuizGenerator:
    def __init__(self):
        self.qa_generator = pipeline("text2text-generation",
                                     model="google/flan-t5-base")

    def generate_questions(self, course_id, num_questions=10):
        """Auto-generate questions from course"""
        course = Course.objects.get(id=course_id)

        # Extract key sentences
        key_sentences = self.extract_key_concepts(
            course.description,
            num_questions
        )

        questions = []
        for sentence in key_sentences:
            question = self.generate_question_from_text(sentence)
            questions.append(question)

        return questions

    def generate_question_from_text(self, text):
        """Convert text into question"""
        prompt = f"Generate a multiple choice question from: {text}"
        question_text = self.qa_generator(prompt)[0]['generated_text']

        # Generate options
        options = self.generate_options(text, question_text)

        return {
            'text': question_text,
            'options': options,
            'difficulty': self.estimate_difficulty(question_text)
        }
```

**Value:** Reduce instructor workload

---

#### 7. **AI Chatbot for Student Support**

**What:** 24/7 Q&A chatbot for student queries

**How:**

```python
from transformers import pipeline

class StudentSupportChatbot:
    def __init__(self):
        self.qa_model = pipeline("question-answering")
        self.intent_classifier = pipeline(
            "zero-shot-classification"
        )

    def answer_question(self, user_question, context_course_id=None):
        """Answer student questions"""

        # Classify intent
        intent = self.classify_intent(user_question)

        if intent == 'course_content':
            return self.answer_course_question(
                user_question,
                context_course_id
            )
        elif intent == 'technical':
            return self.answer_technical_question(user_question)
        elif intent == 'administrative':
            return self.answer_admin_question(user_question)

        return "I'm not sure. Please contact support."

    def answer_course_question(self, question, course_id):
        """Use QA model on course materials"""
        course = Course.objects.get(id=course_id)

        # Use course description as context
        context = course.description

        answer = self.qa_model(
            question=question,
            context=context
        )

        return {
            'answer': answer['answer'],
            'confidence': answer['score'],
            'source': f"Course: {course.title}"
        }
```

**API Endpoint:**

```
POST /api/chatbot/ask/
{
    "question": "How do I submit my quiz?",
    "course_id": 5
}

Response:
{
    "answer": "You can submit your quiz by clicking the Submit button...",
    "confidence": 0.92,
    "source": "Course: Python 101",
    "suggestions": [
        "How to review answers?",
        "Quiz time limits"
    ]
}
```

**Value:** 24/7 support, reduced support tickets

---

#### 8. **Content Summarization & Note Generation**

**What:** Auto-generate summaries and study notes

**How:**

```python
from transformers import pipeline

class ContentSummarizer:
    def __init__(self):
        self.summarizer = pipeline("summarization")

    def generate_summary(self, course_id, summary_length='medium'):
        """Create study summary"""
        course = Course.objects.get(id=course_id)

        # Get full course content
        full_text = course.description

        # Summarize
        if summary_length == 'short':
            max_length = 100
        elif summary_length == 'medium':
            max_length = 200
        else:
            max_length = 400

        summary = self.summarizer(
            full_text,
            max_length=max_length,
            min_length=50,
            do_sample=False
        )

        return summary[0]['summary_text']

    def generate_study_notes(self, course_id):
        """Create bullet-point study notes"""
        course = Course.objects.get(id=course_id)

        # Extract key points
        key_points = self.extract_key_points(course.description)

        # Format as bullet points
        notes = [f"• {point}" for point in key_points]

        return {
            'course': course.title,
            'notes': notes,
            'total_points': len(notes)
        }
```

**Value:** Improve study efficiency

---

### Phase 4: Advanced Analytics (Months 7-8)

#### 9. **Engagement Prediction & Intervention**

**What:** Predict student disengagement early

```python
class EngagementPredictor:
    def predict_engagement(self, student_id):
        """Predict if student will disengage"""
        student = User.objects.get(id=student_id)

        # Extract engagement features
        features = {
            'login_frequency_last_7d': self.get_login_count(student, 7),
            'quiz_attempts_last_7d': self.get_quiz_attempts(student, 7),
            'forums_posts': self.get_forum_activity(student),
            'time_spent_learning': self.calculate_total_time(student),
            'course_progress_avg': self.get_avg_progress(student),
        }

        # Predict disengagement risk
        risk_score = self.ml_model.predict(features)

        if risk_score > 0.7:
            return {
                'at_risk': True,
                'risk_score': risk_score,
                'interventions': [
                    'Send motivational email',
                    'Offer study group',
                    'Schedule mentor check-in'
                ]
            }

        return {'at_risk': False, 'risk_score': risk_score}
```

**Value:** Reduce dropout rates

---

#### 10. **Learning Pattern Analysis**

**What:** Identify when students learn best

```python
class LearningPatternAnalyzer:
    def analyze_patterns(self, student_id):
        """Find optimal learning times"""
        student = User.objects.get(id=student_id)

        activities = self.get_all_activities(student)

        analysis = {
            'best_learning_hours': self.find_peak_hours(activities),
            'preferred_content_type': self.find_content_preference(activities),
            'learning_pace': self.determine_pace(student),
            'break_frequency': self.calculate_break_needs(activities),
            'recommended_schedule': self.generate_schedule(
                student,
                activities
            )
        }

        return analysis
```

**Value:** Personalized study schedules

---

## 🏗️ Technical Architecture

### Backend Stack (Current + Proposed AI)

```
┌─────────────────────────────────────┐
│   API Layer (Django REST)           │
├─────────────────────────────────────┤
│   AI Services Layer (NEW)           │
│  ├── ML Models (scikit-learn)       │
│  ├── NLP Models (Transformers)      │
│  ├── Recommendation Engine          │
│  └── Prediction Services            │
├─────────────────────────────────────┤
│   Business Logic Layer              │
│  ├── Analytics                      │
│  ├── Recommendations                │
│  └── Engagement Tracking            │
├─────────────────────────────────────┤
│   Data Layer (Current)              │
│  ├── PostgreSQL / SQLite            │
│  └── ORM (Django)                   │
└─────────────────────────────────────┘

NEW COMPONENTS NEEDED:
├── ML Model Store (trained models)
├── Feature Cache (fast feature extraction)
├── Analytics Dashboard
└── Model Serving Infrastructure
```

---

## 📦 Required Dependencies

### Phase 1 (Core ML)

```python
# requirements.txt additions

# Machine Learning
scikit-learn==1.3.2          # ML algorithms
pandas==2.1.3               # Data manipulation
numpy==1.24.3               # Numerical computing
joblib==1.3.2               # Model persistence

# NLP & Deep Learning
transformers==4.35.2        # Pre-trained models (BERT, GPT)
torch==2.1.1                # PyTorch backend
sentencepiece==0.2.0        # Tokenization

# Analytics
plotly==5.18.0              # Data visualization
scikit-plot==0.3.7          # ML visualization

# Data Processing
scipy==1.11.4               # Scientific computing
```

### Phase 2-4 (Advanced)

```
xgboost==2.0.1              # Gradient boosting
lightgbm==4.1.0             # Fast ML algorithms
tensorflow==2.15.0          # Deep learning
faiss==1.7.4                # Vector similarity search
redis==5.0.1                # Caching
celery==5.3.4               # Async tasks
```

---

## 🔧 Database Schema Extensions

### New Tables for AI Features

```sql
-- Store trained models
CREATE TABLE ml_models (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(255) UNIQUE,
    model_type VARCHAR(100),  -- 'classification', 'clustering', etc
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    accuracy FLOAT,
    model_path VARCHAR(500)
);

-- Cache student features for ML
CREATE TABLE student_features (
    id SERIAL PRIMARY KEY,
    student_id BIGINT REFERENCES custom_user(id),
    feature_vector JSONB,
    computed_at TIMESTAMP,
    risk_score FLOAT,
    engagement_score FLOAT
);

-- Store recommendations
CREATE TABLE course_recommendations (
    id SERIAL PRIMARY KEY,
    student_id BIGINT REFERENCES custom_user(id),
    course_id BIGINT REFERENCES courses_course(id),
    score FLOAT,
    reason TEXT,
    created_at TIMESTAMP
);

-- Learning patterns
CREATE TABLE learning_patterns (
    id SERIAL PRIMARY KEY,
    student_id BIGINT REFERENCES custom_user(id),
    peak_learning_hours TEXT,  -- JSON: {"hours": [9,14,19]}
    preferred_content TEXT,
    learning_pace TEXT,        -- 'fast', 'medium', 'slow'
    created_at TIMESTAMP
);

-- Question difficulty analysis
CREATE TABLE question_analytics (
    id SERIAL PRIMARY KEY,
    question_id BIGINT REFERENCES courses_question(id),
    difficulty_level FLOAT,
    discrimination_index FLOAT,
    success_rate FLOAT,
    common_misconceptions JSONB,
    updated_at TIMESTAMP
);

-- AI Chatbot conversation history
CREATE TABLE chatbot_conversations (
    id SERIAL PRIMARY KEY,
    student_id BIGINT REFERENCES custom_user(id),
    question TEXT,
    answer TEXT,
    confidence_score FLOAT,
    user_rating INT,  -- 1-5 star rating
    created_at TIMESTAMP
);
```

---

## 📊 Implementation Roadmap

```
PHASE 1: FOUNDATIONAL (Months 1-2)
├── Setup ML infrastructure
├── Student Risk Prediction ✅
├── Course Recommendations ✅
├── Quiz Analytics ✅
└── Deploy to staging

PHASE 2: INTELLIGENT TUTORING (Months 3-4)
├── Adaptive Learning Paths
├── Hint Generation
├── Knowledge Gap Analysis
└── Testing & refinement

PHASE 3: CONTENT & SUPPORT (Months 5-6)
├── Quiz Auto-Generation
├── AI Chatbot
├── Content Summarization
└── A/B testing

PHASE 4: ADVANCED ANALYTICS (Months 7-8)
├── Engagement Prediction
├── Learning Pattern Analysis
├── Intervention System
└── Dashboard & Reporting

PHASE 5: OPTIMIZATION & SCALE (Months 9-12)
├── Model retraining pipeline
├── Performance optimization
├── Mobile app integration
└── Production deployment
```

---

## 💰 Resource Requirements

### Computing Resources

- **Training:** GPU instance (2-4 vCPU, 16GB RAM minimum)
- **Inference:** Standard instance (2 vCPU, 8GB RAM)
- **Storage:** 100GB+ for models and training data

### Team

- 1-2 ML Engineers (full-time)
- 1 Backend Developer (part-time for integration)
- 1 Data Scientist (for model validation)

### Timeline

- **Total:** 8-12 months for all phases
- **Phase 1:** 2 months
- **Phase 2:** 2 months
- **Phase 3:** 2 months
- **Phase 4:** 2 months
- **Phase 5:** 2-4 months (optimization & scaling)

---

## ✅ Benefits of AI Integration

| Feature                 | Benefit              | Impact                     |
| ----------------------- | -------------------- | -------------------------- |
| Student Risk Prediction | Early intervention   | ↑ 15-20% completion rate   |
| Course Recommendations  | Better engagement    | ↑ 25-30% course enrollment |
| Adaptive Learning       | Faster learning      | ↓ 20% study time           |
| AI Chatbot              | 24/7 support         | ↓ 40% support tickets      |
| Content Summarization   | Better retention     | ↑ 15% test scores          |
| Quiz Auto-Generation    | Less instructor work | ↓ 50% quiz creation time   |
| Pattern Analysis        | Optimal schedules    | ↑ 10-15% completion rate   |

---

## 🚀 Quick Start: Phase 1 Implementation

### Step 1: Setup

```bash
# Create ML microservice
mkdir elearning-ml-service
cd elearning-ml-service

# Install dependencies
pip install scikit-learn pandas numpy transformers torch

# Create project structure
mkdir models service utils
touch requirements.txt app.py
```

### Step 2: First Model (Student Risk Predictor)

```python
# service/risk_predictor.py

from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import json

class StudentRiskPredictorService:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100)
        self.scaler = StandardScaler()

    def train(self, X_train, y_train):
        """Train model on historical data"""
        X_scaled = self.scaler.fit_transform(X_train)
        self.model.fit(X_scaled, y_train)

        # Save model
        joblib.dump(self.model, 'models/risk_predictor.pkl')
        joblib.dump(self.scaler, 'models/scaler.pkl')

    def predict(self, features_dict):
        """Predict for new student"""
        X = self.prepare_features(features_dict)
        X_scaled = self.scaler.transform([X])

        prediction = self.model.predict(X_scaled)[0]
        probability = self.model.predict_proba(X_scaled)[0].max()

        return {
            'risk_level': int(prediction),
            'confidence': float(probability)
        }

# Connect to Django
from django.views import APIView
from rest_framework.response import Response
from rest_framework import status

class StudentRiskAPIView(APIView):
    def __init__(self):
        self.predictor = StudentRiskPredictorService()

    def get(self, request, student_id):
        """Get risk prediction for student"""
        try:
            features = extract_student_features(student_id)
            prediction = self.predictor.predict(features)
            return Response(prediction)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
```

### Step 3: Add to Django URLs

```python
# Backend/courses/urls.py

from django.urls import path
from .views import StudentRiskAPIView

urlpatterns = [
    # ... existing urls
    path('analytics/student-risk/<int:student_id>/',
         StudentRiskAPIView.as_view(),
         name='student-risk'),
]
```

### Step 4: Train on Historical Data

```python
# scripts/train_models.py

from service.risk_predictor import StudentRiskPredictorService
from courses.models import StudentAnswer, Progress
import pandas as pd
import numpy as np

# Extract historical data
data = []
for student in User.objects.filter(role='student'):
    features = extract_student_features(student.id)
    target = 1 if student_is_at_risk(student) else 0
    data.append((*features.values(), target))

# Train
df = pd.DataFrame(data)
X = df.iloc[:, :-1].values
y = df.iloc[:, -1].values

predictor = StudentRiskPredictorService()
predictor.train(X, y)
print("Model trained successfully!")
```

---

## 📝 Next Steps

1. **Get Team Alignment** - Review roadmap with stakeholders
2. **Start Phase 1** - Begin with risk prediction and recommendations
3. **Build Data Pipeline** - Set up ML infrastructure
4. **Develop & Test** - Build and validate each AI feature
5. **Deploy Gradually** - Roll out features to production
6. **Monitor & Iterate** - Track performance and improve

---

## 📚 References

- Scikit-learn Documentation: https://scikit-learn.org
- Transformers (Hugging Face): https://huggingface.co/transformers
- Learning Analytics: https://en.wikipedia.org/wiki/Learning_analytics
- Adaptive Learning: https://www.adl.gov/

---

**Document Status:** DRAFT - Ready for Review  
**Last Updated:** November 12, 2025  
**Version:** 1.0

---

**This document provides a comprehensive roadmap for adding AI capabilities to EduLearn. Use this as a reference for planning AI integration phases.**
