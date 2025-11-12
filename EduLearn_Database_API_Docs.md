# EduLearn - Database Schema & API Documentation

## 📊 Database Schema Details

### Table Specifications

#### **CUSTOM_USER**

```
╔════════════════════════════════════════════════════╗
║                  CUSTOM_USER                       ║
╠════════════════════════════════════════════════════╣
║ Field                Type        Constraints       ║
╠════════════════════════════════════════════════════╣
║ id                  INTEGER     PRIMARY KEY, AUTO  ║
║ username            VARCHAR(150) UNIQUE, NOT NULL ║
║ email               VARCHAR(254) UNIQUE, NOT NULL ║
║ password_hash       VARCHAR(128) NOT NULL         ║
║ first_name          VARCHAR(150) NULL             ║
║ last_name           VARCHAR(150) NULL             ║
║ role                VARCHAR(20)  DEFAULT 'student'║
║                                  (CHECK IN        ║
║                                  student|         ║
║                                  instructor|      ║
║                                  admin)           ║
║ is_active           BOOLEAN      DEFAULT TRUE     ║
║ created_at          TIMESTAMP    DEFAULT NOW()    ║
║ updated_at          TIMESTAMP    DEFAULT NOW()    ║
║ last_login          TIMESTAMP    NULL             ║
╚════════════════════════════════════════════════════╝

INDEXES:
  - PRIMARY KEY (id)
  - UNIQUE (username)
  - UNIQUE (email)
  - INDEX (role)
  - INDEX (is_active)
```

#### **COURSE**

```
╔════════════════════════════════════════════════════╗
║                    COURSE                          ║
╠════════════════════════════════════════════════════╣
║ Field                Type        Constraints       ║
╠════════════════════════════════════════════════════╣
║ id                  INTEGER     PRIMARY KEY, AUTO  ║
║ title               VARCHAR(200) NOT NULL         ║
║ description         TEXT         NULL             ║
║ instructor_id       INTEGER     FOREIGN KEY       ║
║                                  REFERENCES       ║
║                                  CUSTOM_USER(id)  ║
║ created_at          TIMESTAMP    DEFAULT NOW()    ║
║ updated_at          TIMESTAMP    DEFAULT NOW()    ║
║ course_content      TEXT         NULL             ║
║ is_published        BOOLEAN      DEFAULT FALSE    ║
║ total_lessons       INTEGER      DEFAULT 0        ║
╚════════════════════════════════════════════════════╝

INDEXES:
  - PRIMARY KEY (id)
  - FOREIGN KEY (instructor_id)
  - INDEX (title) - For search
  - INDEX (created_at) - For sorting
```

#### **ENROLLMENT**

```
╔════════════════════════════════════════════════════╗
║                 ENROLLMENT                         ║
╠════════════════════════════════════════════════════╣
║ Field                Type        Constraints       ║
╠════════════════════════════════════════════════════╣
║ id                  INTEGER     PRIMARY KEY, AUTO  ║
║ student_id          INTEGER     FOREIGN KEY       ║
║                                  REFERENCES       ║
║                                  CUSTOM_USER(id)  ║
║ course_id           INTEGER     FOREIGN KEY       ║
║                                  REFERENCES       ║
║                                  COURSE(id)       ║
║ enrolled_at         TIMESTAMP    DEFAULT NOW()    ║
║ completed_at        TIMESTAMP    NULL             ║
║ is_active           BOOLEAN      DEFAULT TRUE     ║
╚════════════════════════════════════════════════════╝

CONSTRAINTS:
  - PRIMARY KEY (id)
  - FOREIGN KEY (student_id)
  - FOREIGN KEY (course_id)
  - UNIQUE (student_id, course_id) - Prevent duplicate enrollment

INDEXES:
  - PRIMARY KEY (id)
  - FOREIGN KEY (student_id)
  - FOREIGN KEY (course_id)
  - INDEX (enrolled_at)
```

#### **QUIZ**

```
╔════════════════════════════════════════════════════╗
║                     QUIZ                           ║
╠════════════════════════════════════════════════════╣
║ Field                Type        Constraints       ║
╠════════════════════════════════════════════════════╣
║ id                  INTEGER     PRIMARY KEY, AUTO  ║
║ course_id           INTEGER     FOREIGN KEY       ║
║                                  REFERENCES       ║
║                                  COURSE(id)       ║
║ title               VARCHAR(255) NOT NULL         ║
║ description         TEXT         NULL             ║
║ time_limit          INTEGER      DEFAULT 15       ║
║                                  (in minutes)     ║
║ pass_percentage     FLOAT        DEFAULT 70.0     ║
║ created_at          TIMESTAMP    DEFAULT NOW()    ║
║ is_published        BOOLEAN      DEFAULT FALSE    ║
║ max_attempts        INTEGER      DEFAULT 1        ║
╚════════════════════════════════════════════════════╝

INDEXES:
  - PRIMARY KEY (id)
  - FOREIGN KEY (course_id)
  - INDEX (created_at)
```

#### **QUESTION**

```
╔════════════════════════════════════════════════════╗
║                   QUESTION                         ║
╠════════════════════════════════════════════════════╣
║ Field                Type        Constraints       ║
╠════════════════════════════════════════════════════╣
║ id                  INTEGER     PRIMARY KEY, AUTO  ║
║ quiz_id             INTEGER     FOREIGN KEY       ║
║                                  REFERENCES       ║
║                                  QUIZ(id)         ║
║ text                TEXT         NOT NULL         ║
║ question_type       VARCHAR(20)  DEFAULT 'mcq'   ║
║                                  (mcq|short|     ║
║                                  essay)           ║
║ order               INTEGER      NOT NULL         ║
║ created_at          TIMESTAMP    DEFAULT NOW()    ║
║ marks               FLOAT        DEFAULT 1.0      ║
╚════════════════════════════════════════════════════╝

INDEXES:
  - PRIMARY KEY (id)
  - FOREIGN KEY (quiz_id)
  - INDEX (quiz_id, order)
```

#### **OPTION**

```
╔════════════════════════════════════════════════════╗
║                    OPTION                          ║
╠════════════════════════════════════════════════════╣
║ Field                Type        Constraints       ║
╠════════════════════════════════════════════════════╣
║ id                  INTEGER     PRIMARY KEY, AUTO  ║
║ question_id         INTEGER     FOREIGN KEY       ║
║                                  REFERENCES       ║
║                                  QUESTION(id)     ║
║ text                VARCHAR(255) NOT NULL         ║
║ is_correct          BOOLEAN      DEFAULT FALSE    ║
║ order               INTEGER      NOT NULL         ║
║ explanation         TEXT         NULL             ║
╚════════════════════════════════════════════════════╝

INDEXES:
  - PRIMARY KEY (id)
  - FOREIGN KEY (question_id)
  - INDEX (question_id)
```

#### **STUDENT_ANSWER**

```
╔════════════════════════════════════════════════════╗
║               STUDENT_ANSWER                       ║
╠════════════════════════════════════════════════════╣
║ Field                Type        Constraints       ║
╠════════════════════════════════════════════════════╣
║ id                  INTEGER     PRIMARY KEY, AUTO  ║
║ student_id          INTEGER     FOREIGN KEY       ║
║                                  REFERENCES       ║
║                                  CUSTOM_USER(id)  ║
║ question_id         INTEGER     FOREIGN KEY       ║
║                                  REFERENCES       ║
║                                  QUESTION(id)     ║
║ selected_option_id  INTEGER     FOREIGN KEY       ║
║                                  REFERENCES       ║
║                                  OPTION(id)       ║
║ quiz_id             INTEGER     FOREIGN KEY       ║
║                                  REFERENCES       ║
║                                  QUIZ(id)         ║
║ is_correct          BOOLEAN     COMPUTED          ║
║ submitted_at        TIMESTAMP    DEFAULT NOW()    ║
║ time_spent          INTEGER      NULL             ║
║                                  (in seconds)     ║
╚════════════════════════════════════════════════════╝

INDEXES:
  - PRIMARY KEY (id)
  - FOREIGN KEY (student_id, quiz_id)
  - INDEX (quiz_id, student_id) - For analytics
  - INDEX (submitted_at)
```

#### **PROGRESS**

```
╔════════════════════════════════════════════════════╗
║                   PROGRESS                         ║
╠════════════════════════════════════════════════════╣
║ Field                Type        Constraints       ║
╠════════════════════════════════════════════════════╣
║ id                  INTEGER     PRIMARY KEY, AUTO  ║
║ student_id          INTEGER     FOREIGN KEY       ║
║                                  REFERENCES       ║
║                                  CUSTOM_USER(id)  ║
║ course_id           INTEGER     FOREIGN KEY       ║
║                                  REFERENCES       ║
║                                  COURSE(id)       ║
║ completed_lessons   INTEGER      DEFAULT 0        ║
║ total_lessons       INTEGER      DEFAULT 0        ║
║ score               FLOAT        DEFAULT 0.0      ║
║ last_accessed       TIMESTAMP    DEFAULT NOW()    ║
║ updated_at          TIMESTAMP    DEFAULT NOW()    ║
║ status              VARCHAR(20)  DEFAULT 'in_progress'
║                                  (in_progress|   ║
║                                  completed|      ║
║                                  paused)          ║
╚════════════════════════════════════════════════════╝

INDEXES:
  - PRIMARY KEY (id)
  - UNIQUE (student_id, course_id)
  - FOREIGN KEY (student_id)
  - FOREIGN KEY (course_id)
  - INDEX (last_accessed)
```

---

## 🔗 REST API Endpoints Documentation

### **Authentication Endpoints**

#### POST `/api/auth/register/`

**Description:** Register a new user

**Request:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "password2": "securePassword123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "student" // student | instructor | admin
}
```

**Response (201 Created):**

```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "student",
  "message": "User registered successfully"
}
```

**Error (400 Bad Request):**

```json
{
  "username": ["Username already exists"],
  "email": ["Email already registered"]
}
```

---

#### POST `/api/auth/login/`

**Description:** Login user and receive JWT token

**Request:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

**Error (401 Unauthorized):**

```json
{
  "detail": "Invalid email or password"
}
```

---

### **Course Endpoints**

#### GET `/api/courses/`

**Description:** List all courses

**Query Parameters:**

- `page`: Page number (default: 1)
- `page_size`: Results per page (default: 10)
- `search`: Search by title or description
- `instructor_id`: Filter by instructor

**Response (200 OK):**

```json
{
  "count": 15,
  "next": "http://api.example.com/courses/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Python for Beginners",
      "description": "Learn Python basics",
      "instructor": {
        "id": 5,
        "username": "instructor1",
        "role": "instructor"
      },
      "created_at": "2025-01-15T10:30:00Z",
      "total_lessons": 10,
      "is_published": true
    }
  ]
}
```

---

#### POST `/api/courses/`

**Description:** Create a new course (Instructor only)

**Authorization:** Bearer {access_token}

**Request:**

```json
{
  "title": "Advanced Python",
  "description": "Master Python programming",
  "course_content": "HTML/Rich text content"
}
```

**Response (201 Created):**

```json
{
  "id": 16,
  "title": "Advanced Python",
  "description": "Master Python programming",
  "instructor": {
    "id": 5,
    "username": "instructor1"
  },
  "created_at": "2025-01-20T14:22:00Z"
}
```

**Error (403 Forbidden):**

```json
{
  "detail": "Only instructors can create courses"
}
```

---

#### GET `/api/courses/{id}/`

**Description:** Get course details

**Response (200 OK):**

```json
{
  "id": 1,
  "title": "Python for Beginners",
  "description": "Learn Python basics",
  "instructor": {
    "id": 5,
    "username": "instructor1",
    "email": "instructor1@example.com"
  },
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-18T15:45:00Z",
  "total_lessons": 10,
  "is_published": true,
  "enrollment_count": 25
}
```

---

### **Enrollment Endpoints**

#### POST `/api/enrollments/`

**Description:** Enroll a student in a course

**Authorization:** Bearer {access_token}

**Request:**

```json
{
  "course_id": 1
}
```

**Response (201 Created):**

```json
{
  "id": 42,
  "student": {
    "id": 1,
    "username": "john_doe"
  },
  "course": {
    "id": 1,
    "title": "Python for Beginners"
  },
  "enrolled_at": "2025-01-22T09:15:00Z"
}
```

**Error (400 Bad Request):**

```json
{
  "detail": "Already enrolled in this course"
}
```

---

#### GET `/api/enrollments/`

**Description:** List user's course enrollments

**Authorization:** Bearer {access_token}

**Response (200 OK):**

```json
{
  "count": 3,
  "results": [
    {
      "id": 42,
      "course": {
        "id": 1,
        "title": "Python for Beginners"
      },
      "enrolled_at": "2025-01-22T09:15:00Z"
    }
  ]
}
```

---

### **Quiz Endpoints**

#### GET `/api/quizzes/`

**Description:** List all quizzes

**Query Parameters:**

- `course_id`: Filter by course
- `page`: Page number

**Response (200 OK):**

```json
{
  "count": 8,
  "results": [
    {
      "id": 1,
      "course": 1,
      "title": "Python Basics Quiz",
      "description": "Test your basics",
      "time_limit": 15,
      "pass_percentage": 70,
      "question_count": 10,
      "created_at": "2025-01-16T11:20:00Z"
    }
  ]
}
```

---

#### GET `/api/quizzes/{id}/`

**Description:** Get quiz details with questions

**Authorization:** Bearer {access_token}

**Response (200 OK):**

```json
{
  "id": 1,
  "course": 1,
  "title": "Python Basics Quiz",
  "description": "Test your basics",
  "time_limit": 15,
  "pass_percentage": 70,
  "questions": [
    {
      "id": 101,
      "text": "What is Python?",
      "question_type": "mcq",
      "order": 1,
      "marks": 1,
      "options": [
        {
          "id": 201,
          "text": "A programming language",
          "order": 1
        },
        {
          "id": 202,
          "text": "A snake",
          "order": 2
        }
      ]
    }
  ]
}
```

---

#### POST `/api/quizzes/{id}/submit-quiz/`

**Description:** Submit quiz answers

**Authorization:** Bearer {access_token}

**Request:**

```json
{
  "answers": [
    {
      "question_id": 101,
      "selected_option_id": 201
    },
    {
      "question_id": 102,
      "selected_option_id": 205
    }
  ]
}
```

**Response (200 OK):**

```json
{
  "quiz_id": 1,
  "score": 85,
  "total_marks": 100,
  "pass": true,
  "message": "Quiz submitted successfully",
  "results": [
    {
      "question_id": 101,
      "your_answer": 201,
      "correct_answer": 201,
      "is_correct": true,
      "marks_obtained": 1
    }
  ]
}
```

---

### **Progress Endpoints**

#### GET `/api/progress/`

**Description:** Get user's learning progress

**Authorization:** Bearer {access_token}

**Response (200 OK):**

```json
{
  "count": 2,
  "results": [
    {
      "id": 15,
      "student": 1,
      "course": {
        "id": 1,
        "title": "Python for Beginners"
      },
      "completed_lessons": 7,
      "total_lessons": 10,
      "progress_percentage": 70,
      "score": 85.5,
      "last_accessed": "2025-01-22T14:30:00Z",
      "status": "in_progress"
    }
  ]
}
```

---

#### GET `/api/progress/{course_id}/`

**Description:** Get progress in specific course

**Authorization:** Bearer {access_token}

**Response (200 OK):**

```json
{
  "course_id": 1,
  "course_title": "Python for Beginners",
  "completed_lessons": 7,
  "total_lessons": 10,
  "progress_percentage": 70,
  "score": 85.5,
  "quiz_scores": [
    {
      "quiz_id": 1,
      "title": "Basics Quiz",
      "score": 90,
      "attempted_at": "2025-01-20T10:15:00Z"
    }
  ],
  "lessons_completed": [
    {
      "lesson_id": 1,
      "title": "Introduction to Python",
      "completed_at": "2025-01-16T15:30:00Z"
    }
  ]
}
```

---

## 🔐 Authentication Headers

All protected endpoints require the following header:

```
Authorization: Bearer <access_token>
```

**Example:**

```
GET /api/courses/ HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json
```

---

## 📝 HTTP Status Codes

| Code | Meaning           | Description                         |
| ---- | ----------------- | ----------------------------------- |
| 200  | OK                | Request successful                  |
| 201  | Created           | Resource created successfully       |
| 204  | No Content        | Request successful, no content      |
| 400  | Bad Request       | Invalid request parameters          |
| 401  | Unauthorized      | Missing/invalid authentication      |
| 403  | Forbidden         | Insufficient permissions            |
| 404  | Not Found         | Resource not found                  |
| 409  | Conflict          | Resource conflict (e.g., duplicate) |
| 429  | Too Many Requests | Rate limit exceeded                 |
| 500  | Server Error      | Internal server error               |

---

## 🔗 Relationships & Constraints

### User-Course Relationship

```
CUSTOM_USER (1) ──── (∞) COURSE
     │
     └─ instructor_id → course.instructor_id
```

### Course-Enrollment Relationship

```
COURSE (1) ──── (∞) ENROLLMENT ──── (∞) CUSTOM_USER
     │                                      │
     ├─ Unique constraint on               └─ role = 'student'
     │  (student_id, course_id)
     │
     └─ Tracks enrollment status
```

### Quiz-Question-Option Relationship

```
QUIZ (1) ──── (∞) QUESTION (1) ──── (∞) OPTION
  │
  ├─ Belongs to COURSE
  └─ Questions ordered by 'order' field
```

### Answer Tracking

```
STUDENT_ANSWER
  ├─ student_id → CUSTOM_USER
  ├─ question_id → QUESTION
  ├─ selected_option_id → OPTION
  ├─ quiz_id → QUIZ
  └─ is_correct: COMPUTED from selected_option.is_correct
```

---

## 📊 Sample Data Queries

### Get All Students in a Course

```sql
SELECT u.*, e.enrolled_at
FROM CUSTOM_USER u
JOIN ENROLLMENT e ON u.id = e.student_id
WHERE e.course_id = 1
AND u.role = 'student'
ORDER BY e.enrolled_at DESC;
```

### Get Course Statistics

```sql
SELECT
  c.id,
  c.title,
  COUNT(DISTINCT e.student_id) as enrollment_count,
  AVG(p.score) as average_score,
  COUNT(DISTINCT q.id) as quiz_count
FROM COURSE c
LEFT JOIN ENROLLMENT e ON c.id = e.course_id
LEFT JOIN PROGRESS p ON c.id = p.course_id
LEFT JOIN QUIZ q ON c.id = q.course_id
WHERE c.id = 1
GROUP BY c.id, c.title;
```

### Get Student's Quiz Performance

```sql
SELECT
  q.title,
  q.time_limit,
  COUNT(DISTINCT sa.id) as attempts,
  MAX(CASE WHEN sa.is_correct THEN 1 ELSE 0 END) as best_score,
  sa.submitted_at
FROM QUIZ q
LEFT JOIN STUDENT_ANSWER sa ON q.id = sa.quiz_id
WHERE sa.student_id = 1
GROUP BY q.id, q.title, q.time_limit, sa.submitted_at
ORDER BY sa.submitted_at DESC;
```

---

**Database & API Documentation Complete**  
_Version 1.0 | Last Updated: November 11, 2025_
