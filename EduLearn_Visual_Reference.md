# EduLearn - Visual Reference Guide & Quick Start

## 🎨 Visual Architecture at a Glance

### Complete System Flow

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                         EDULEARN PLATFORM                           ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                                      ┃
┃  📱 CLIENT LAYER (Cross-Platform)                                   ┃
┃  ┌────────────┐  ┌──────────┐  ┌──────────┐                       ┃
┃  │   iOS      │  │ Android  │  │   Web    │                       ┃
┃  │   App      │  │   App    │  │ Browser  │                       ┃
┃  └─────┬──────┘  └────┬─────┘  └────┬─────┘                       ┃
┃        │              │              │                             ┃
┃        └──────────────┼──────────────┘                             ┃
┃                       │                                             ┃
┃                       ▼                                             ┃
┃  🎨 STATE LAYER                                                     ┃
┃  ┌──────────────────────────────────┐                             ┃
┃  │  React Context (Auth, Theme)     │                             ┃
┃  │  AsyncStorage (Persistence)      │                             ┃
┃  └────────────┬─────────────────────┘                             ┃
┃               │                                                     ┃
┃               ▼                                                     ┃
┃  🔌 SERVICES LAYER                                                  ┃
┃  ┌──────────────────────────────────┐                             ┃
┃  │  Axios HTTP Client               │                             ┃
┃  │  Auth | Course | Quiz Services   │                             ┃
┃  └────────────┬─────────────────────┘                             ┃
┃               │                                                     ┃
┃  🌐 TRANSPORT (HTTPS/JWT)                                          ┃
┃               │                                                     ┃
┃               ▼                                                     ┃
┃  🔗 API GATEWAY                                                     ┃
┃  ┌──────────────────────────────────┐                             ┃
┃  │  CORS | Rate Limiting            │                             ┃
┃  │  Request Router                  │                             ┃
┃  └────────────┬─────────────────────┘                             ┃
┃               │                                                     ┃
┃               ▼                                                     ┃
┃  🔧 BACKEND (Django REST)                                           ┃
┃  ┌────────────────────────────────────────────┐                   ┃
┃  │ Auth App      │ Courses App  │ Quiz App   │                   ┃
┃  ├────────────────────────────────────────────┤                   ┃
┃  │ JWT Tokens   │ CRUD Ops    │ Grading   │                   ┃
┃  │ User Mgmt    │ Enrollment  │ Submission│                   ┃
┃  └────────────────────────────────────────────┘                   ┃
┃                       │                                             ┃
┃               ⚙️ MIDDLEWARE                                        ┃
┃       (Auth | Permissions | Validation)                           ┃
┃                       │                                             ┃
┃                       ▼                                             ┃
┃  💾 DATABASE LAYER                                                  ┃
┃  ┌────────────────────────────────────────────┐                   ┃
┃  │ User │ Course │ Quiz │ Progress │ Answer │                   ┃
┃  │ Tables with Indexes & Constraints         │                   ┃
┃  └────────────────────────────────────────────┘                   ┃
┃                                                                      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 📊 Data Model Relationships

```
                        CUSTOM_USER
                         (1 user)
                             │
                    ┌────────┼────────┐
                    │        │        │
              [Creates]  [Enrolls] [Takes]
                    │        │        │
                    ▼        ▼        ▼
                  COURSE  ENROLLMENT QUIZ
                    │        │        │
                    └────────┼────────┘
                             │
                         PROGRESS

QUIZ Structure:
QUIZ ─── (Contains) ──┐
                      └─→ QUESTION ──→ OPTION
                                          │
                         STUDENT_ANSWER ←┘

ENROLLMENT Constraints:
- UNIQUE(student_id, course_id)
- Prevents duplicate enrollment
```

---

## 🔐 Security Layers (Defense in Depth)

```
┌─────────────────────────────────────────┐
│ LAYER 1: HTTPS/TLS ENCRYPTION          │
│ - All data encrypted in transit        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│ LAYER 2: JWT AUTHENTICATION             │
│ - Token validation on each request     │
│ - Auto-refresh mechanism               │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│ LAYER 3: PERMISSION CHECK               │
│ - Role-based access control            │
│ - Custom permission classes            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│ LAYER 4: INPUT VALIDATION               │
│ - Serializer validation                │
│ - Type checking                        │
│ - SQL injection prevention (ORM)       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│ LAYER 5: DATABASE CONSTRAINTS           │
│ - Foreign keys                         │
│ - Unique constraints                   │
│ - Not null checks                      │
└─────────────────────────────────────────┘
```

---

## 🎯 Feature Matrix

### User Capabilities by Role

```
┌─────────────────────────────────────────────────────────────────┐
│                    FEATURE MATRIX                               │
├──────────────────────┬──────────┬──────────┬──────────┐         │
│ Feature              │ Student  │Instructor│  Admin   │         │
├──────────────────────┼──────────┼──────────┼──────────┤         │
│ Browse Courses       │    ✅    │    ✅    │    ✅    │         │
│ Enroll Course        │    ✅    │    ❌    │    ✅    │         │
│ View Progress        │    ✅    │    ✅    │    ✅    │         │
│ Create Course        │    ❌    │    ✅    │    ✅    │         │
│ Edit Course          │    ❌    │    ✅*   │    ✅    │         │
│ Create Quiz          │    ❌    │    ✅    │    ✅    │         │
│ Take Quiz            │    ✅    │    ❌    │    ✅    │         │
│ View Results         │    ✅    │    ✅    │    ✅    │         │
│ Manage Users         │    ❌    │    ❌    │    ✅    │         │
│ View Analytics       │    ❌    │    ✅    │    ✅    │         │
│                      │          │   own    │    all   │         │
└──────────────────────┴──────────┴──────────┴──────────┘         │
                                                                  │
* Can only edit own courses                                       │
```

---

## 🔄 Request-Response Cycle Visualization

```
CLIENT SIDE                    NETWORK                  SERVER SIDE
┌──────────┐                ┌─────────────┐          ┌──────────┐
│          │                │             │          │          │
│  UI      │                │   HTTPS     │          │ Django   │
│ Component├─ 1. Action ───→│  + JWT      │──────────→ Handler  │
│          │                │   Headers   │          │          │
└──────────┘                └─────────────┘          ├──────────┤
     │                                               │ Middleware│
     │  2. State Update      ← Response JSON ←      │ (Auth,    │
     │  (Context)               + Headers           │ Perms,    │
     │                                              │ Validation│
     ▼                                              └────┬─────┘
┌──────────┐                ┌─────────────┐             │
│ Cache    │ ← 3. Save ────→│  Local DB   │             │
│ Update   │                │ (AsyncStore)│          ┌──▼──────┐
└──────────┘                └─────────────┘          │ Models   │
                                                     │ & ORM    │
                                                     └────┬─────┘
                                                          │
                                                     ┌────▼──────┐
                                                     │ PostgreSQL│
                                                     │ Database  │
                                                     └───────────┘

TIME FLOW: ──→ ──→ ──→ ──→ ──→ ──→ ──→ ──→
Response: ← ← ← ← ← ← ← ← ← ← ← ← (same path reversed)
```

---

## 📱 Mobile App Screen Structure

```
EduLearn App Root
│
├── 🔐 Authentication Stack
│   ├── Login Screen
│   │   ├── Email Input
│   │   ├── Password Input
│   │   ├── Login Button
│   │   └── Register Link
│   │
│   └── Register Screen
│       ├── Email Input
│       ├── Password Input
│       ├── Name Inputs
│       ├── Role Selector
│       └── Register Button
│
└── 📱 Main Stack (Authenticated)
    │
    ├── 🏠 Home Tab
    │   ├── Dashboard
    │   ├── Recent Courses
    │   ├── Upcoming Quizzes
    │   └── Quick Stats
    │
    ├── 📚 Courses Tab
    │   ├── Course List
    │   ├── Search & Filter
    │   ├── Course Details
    │   │   ├── Course Info
    │   │   ├── Instructor Bio
    │   │   ├── Enroll Button
    │   │   └── Reviews
    │   │
    │   └── Enrolled Courses
    │       └── Access Course Content
    │
    ├── 🎯 Quiz Tab
    │   ├── Available Quizzes
    │   ├── Quiz Attempt Screen
    │   │   ├── Question Display
    │   │   ├── Options
    │   │   ├── Timer
    │   │   ├── Navigation
    │   │   └── Submit Button
    │   │
    │   └── Results Screen
    │       ├── Score Display
    │       ├── Correct/Incorrect
    │       ├── Answer Review
    │       └── Share/Retry
    │
    └── 👤 Profile Tab
        ├── User Info
        ├── Progress
        │   ├── Course List
        │   ├── Progress Bars
        │   └── Statistics
        ├── Settings
        │   ├── Theme Toggle
        │   ├── Notifications
        │   └── Language
        └── Logout
```

---

## 🔌 API Endpoint Categories

```
┌────────────────────────────────────────────────────┐
│              API ENDPOINTS MAP                     │
├────────────────────────────────────────────────────┤
│                                                    │
│ 🔐 Authentication                                 │
│   └─ POST /auth/register/                        │
│   └─ POST /auth/login/                           │
│   └─ POST /auth/logout/                          │
│   └─ POST /auth/refresh/                         │
│                                                    │
│ 📚 Courses                                         │
│   └─ GET    /courses/                            │
│   └─ POST   /courses/                            │
│   └─ GET    /courses/{id}/                       │
│   └─ PUT    /courses/{id}/                       │
│   └─ DELETE /courses/{id}/                       │
│                                                    │
│ 📝 Enrollment                                      │
│   └─ POST   /enrollments/                        │
│   └─ GET    /enrollments/                        │
│   └─ DELETE /enrollments/{id}/                   │
│                                                    │
│ 🎯 Quiz                                            │
│   └─ GET    /quizzes/                            │
│   └─ GET    /quizzes/{id}/                       │
│   └─ POST   /quizzes/{id}/submit-quiz/           │
│                                                    │
│ 📊 Progress                                        │
│   └─ GET    /progress/                           │
│   └─ GET    /progress/{course_id}/               │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 💾 Database Relationships Diagram

```
CUSTOM_USER (Users Table)
│
├─┬─ id (PK)
│ ├─ username (UNIQUE)
│ ├─ email (UNIQUE)
│ ├─ role (ENUM: student|instructor|admin)
│ └─ password_hash
│
├────→ COURSE (instructor_id FK)
│       ├─ id (PK)
│       ├─ title
│       ├─ description
│       ├─ instructor_id (FK) ──────→ CUSTOM_USER.id
│       └─ created_at
│
├────→ ENROLLMENT (student_id FK)
│       ├─ id (PK)
│       ├─ student_id (FK)
│       ├─ course_id (FK)
│       ├─ enrolled_at
│       └─ UNIQUE(student_id, course_id)
│
├────→ PROGRESS (student_id, course_id FK)
│       ├─ score
│       ├─ completed_lessons
│       └─ total_lessons
│
└────→ STUDENT_ANSWER (student_id FK)
        ├─ question_id (FK)
        ├─ selected_option_id (FK)
        └─ is_correct (computed)

COURSE ──→ QUIZ ──→ QUESTION ──→ OPTION
                         ↓
                    STUDENT_ANSWER
```

---

## 🌊 Data Flow Example: Login Process

```
USER INPUT                               BACKEND PROCESSING
┌──────────────┐                        ┌──────────────┐
│ Email        │                        │              │
│ Password     │                        │ 1. Receive   │
└──────┬───────┘                        │    Request   │
       │                                │              │
       │                                ├──────────────┤
       │    1️⃣ POST /auth/login/        │ 2. Validate  │
       ├───────────────────────────────→│    Input     │
       │    {email, password}           │              │
       │                                ├──────────────┤
       │                                │ 3. Query     │
       │                                │    Database  │
       │                                │              │
       │                                ├──────────────┤
       │                                │ 4. Check     │
       │                                │    Password  │
       │                                │              │
       │                                ├──────────────┤
       │                                │ 5. Generate  │
       │    2️⃣ Response                 │    JWT       │
       │    {access_token,              │              │
       │     refresh_token,   ←─────────┤ 6. Send      │
       │     user_data}                 │    Response  │
       │                                │              │
       ▼                                └──────────────┘
    STORE TOKENS
    IN SECURE STORAGE
       ↓
    UPDATE AUTH CONTEXT
       ↓
    NAVIGATE TO HOME
```

---

## 📊 Component Dependency Tree

```
App.tsx (Root)
│
├── ErrorBoundary
│   │
│   └── GestureHandlerRootView
│       │
│       └── SafeAreaProvider
│           │
│           └── ThemeProvider
│               │
│               └── AuthProvider
│                   │
│                   ├── StatusBar
│                   │
│                   └── AppNavigator
│                       │
│                       ├── AuthStack (Not Auth)
│                       │   ├── LoginScreen
│                       │   │   ├── LoginForm Component
│                       │   │   └── Auth Services
│                       │   │
│                       │   └── RegisterScreen
│                       │       ├── RegisterForm Component
│                       │       └── Auth Services
│                       │
│                       └── MainStack (Authenticated)
│                           ├── HomeTab
│                           │   └── DashboardComponents
│                           │
│                           ├── CoursesTab
│                           │   ├── CourseList Component
│                           │   ├── CourseCard Component
│                           │   └── CourseDetail Screen
│                           │
│                           ├── QuizTab
│                           │   ├── QuizList Component
│                           │   ├── QuizAttempt Screen
│                           │   │   ├── QuestionCard
│                           │   │   ├── OptionButton
│                           │   │   └── QuizTimer
│                           │   │
│                           │   └── ResultScreen
│                           │       └── ResultDisplay
│                           │
│                           └── ProfileTab
│                               ├── ProfileInfo
│                               ├── ProgressCards
│                               └── Settings Menu
```

---

## ⏱️ Key Performance Metrics

```
Operation                Target Time    Status
────────────────────────────────────────────────
User Login               < 100ms        ✅ Good
Course List Load         < 500ms        ✅ Good
Course Details           < 300ms        ✅ Good
Quiz Load                < 400ms        ✅ Good
Quiz Submit              < 800ms        ✅ Good
Progress Update          < 200ms        ✅ Good
Search Courses           < 600ms        ✅ Good
```

---

## 🔧 Configuration Overview

### Backend Configuration

```
Django Settings (settings.py)
│
├── DATABASES
│   ├── ENGINE: postgresql / sqlite3
│   ├── NAME: database name
│   └── Credentials
│
├── INSTALLED_APPS
│   ├── django.contrib.*
│   ├── rest_framework
│   ├── corsheaders
│   ├── users
│   └── courses
│
├── REST_FRAMEWORK
│   ├── DEFAULT_AUTHENTICATION_CLASSES
│   └── DEFAULT_PERMISSION_CLASSES
│
└── CORS_ALLOWED_ORIGINS
    └── Frontend URLs
```

### Frontend Configuration

```
Environment Variables (.env)
│
├── EXPO_PUBLIC_API_URL
│   └── Backend API endpoint
│
├── EXPO_PUBLIC_APP_NAME
│   └── EduLearn
│
└── EXPO_PUBLIC_VERSION
    └── 1.0.0
```

---

## 🚀 Deployment Checklist

```
PRE-DEPLOYMENT
☐ All tests passing
☐ Code review completed
☐ Database migrations ready
☐ Environment variables set
☐ API endpoints verified
☐ Security audit complete

DEPLOYMENT
☐ Build APK/IPA
☐ Deploy backend
☐ Migrate database
☐ Configure CDN
☐ Setup monitoring
☐ Enable logging

POST-DEPLOYMENT
☐ Smoke testing
☐ Monitor errors
☐ Check performance
☐ Verify backups
☐ Update documentation
☐ Notify users
```

---

## 📚 Documentation Quick Links

| Document                         | Purpose            |
| -------------------------------- | ------------------ |
| EduLearn_Project_Architecture.md | Full system design |
| EduLearn_Mermaid_Diagrams.md     | Visual workflows   |
| EduLearn_Database_API_Docs.md    | DB schema & APIs   |
| EduLearn_Executive_Summary.md    | Project overview   |
| EduLearn_Visual_Reference.md     | This file          |

---

**Visual Reference Guide - Version 1.0**  
_Last Updated: November 11, 2025_  
**Use this as a quick reference for system architecture and workflows**
