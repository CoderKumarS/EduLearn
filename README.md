# 🎓 E-Learning Platform

Full-stack E-Learning platform with Django REST Framework backend and React Native frontend.

## 🚀 Quick Start

### Backend
```bash
cd Backend
python manage.py runserver
```

### Frontend
```bash
cd eduLearn
npm start
```

## ✨ Features

- ✅ User authentication (Student, Instructor, Admin)
- ✅ Course management with chapters
- ✅ Quiz system with scoring
- ✅ Progress tracking
- ✅ Certificates
- ✅ Discussions
- ✅ Ratings & Reviews
- ✅ Bookmarks
- ✅ Notifications

## 🛠️ Tech Stack

**Backend**: Django 5.2.7, DRF, JWT, SQLite  
**Frontend**: React Native (Expo), TypeScript, Axios

## 📊 Status

- ✅ Backend: 100% (16 models, 100+ endpoints)
- ✅ Services: 100% (13 services, 80+ methods)
- 🔄 UI: 40% (Core screens done)

## 🔑 Key Endpoints

- `POST /api/auth/login/` - Login
- `GET /api/courses/` - List courses
- `POST /api/enrollments/` - Enroll
- `GET /api/progress/user-stats/` - User stats
- `POST /api/quizzes/{id}/submit/` - Submit quiz

## 📝 Recent Fixes

✅ Fixed authentication endpoints  
✅ Fixed service imports  
✅ Fixed React Hooks order  
✅ Fixed CourseDetailScreen quiz loading

---

**Last Updated**: November 15, 2024
