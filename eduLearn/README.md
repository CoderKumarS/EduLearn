# eduLearn - E-Learning Mobile App

A comprehensive cross-platform e-learning mobile application built with React Native and Expo, featuring dark/light theme support, user authentication, course management, and quiz functionality.

## Features

### 🎨 UI/UX
- **Dark/Light Theme Support** with system preference detection
- **Cross-platform compatibility** (iOS, Android, Web)
- **Responsive design** with NativeWind (Tailwind CSS for React Native)
- **Professional splash screen** with branding
- **Smooth animations** and transitions

### 🔐 Authentication
- **JWT-based authentication** with secure token storage
- **User registration** with role selection (Student/Instructor)
- **Automatic token refresh** handling
- **Secure logout** with token cleanup

### 📚 Course Management
- **Browse all available courses** with search functionality
- **Course enrollment** for students
- **Course creation** for instructors
- **Detailed course information** with instructor details
- **Course statistics** and enrollment tracking

### 🎯 Quiz System
- **Interactive quizzes** with multiple-choice questions
- **Timed quizzes** with countdown timer
- **Progress tracking** during quiz
- **Automatic submission** when time expires
- **Score calculation** and feedback

### 📊 Dashboard Features
- **Student Dashboard** with enrolled courses and progress
- **Instructor Dashboard** with course management
- **Progress tracking** with visual indicators
- **Learning statistics** and achievements

### 👤 User Profiles
- **Profile management** with user information
- **Theme preferences** (Light/Dark/System)
- **Account settings** and logout functionality

## Tech Stack

- **Framework**: React Native with Expo SDK 50+
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: React Navigation v6
- **State Management**: React Context API with useReducer
- **HTTP Client**: Axios with interceptors
- **Storage**: Expo SecureStore for tokens, AsyncStorage for preferences
- **Authentication**: JWT tokens with automatic refresh

## Project Structure

```
eduLearn/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ThemedView.tsx
│   │   ├── ThemedText.tsx
│   │   ├── Input.tsx
│   │   ├── Button.tsx
│   │   └── index.ts
│   ├── screens/            # Screen components
│   │   ├── SplashScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── CoursesScreen.tsx
│   │   ├── CourseDetailScreen.tsx
│   │   ├── StudentDashboard.tsx
│   │   ├── InstructorDashboard.tsx
│   │   ├── QuizScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── CreateCourseScreen.tsx
│   │   └── index.ts
│   ├── navigation/         # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── services/           # API services
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   └── courseService.ts
│   ├── utils/              # Utility functions
│   │   ├── errorHandler.ts
│   │   └── styling.ts
│   ├── constants/          # App constants
│   │   ├── config.ts
│   │   └── colors.ts
│   └── types/              # TypeScript type definitions
│       ├── auth.ts
│       ├── course.ts
│       ├── theme.ts
│       └── env.ts
├── assets/                 # Images, fonts, etc.
├── .env                   # Environment variables
├── app.config.js          # Expo configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── babel.config.js        # Babel configuration
└── package.json           # Dependencies and scripts
```

## Backend Integration

The app connects to a Django REST API backend with the following endpoints:

### Authentication Endpoints
- `POST /api/auth/register/` - User registration
- `POST /api/auth/token/` - Login/Token generation
- `POST /api/auth/token/refresh/` - Token refresh

### Course Management Endpoints
- `GET/POST /api/courses/` - List/Create courses
- `GET/PUT/DELETE /api/courses/{id}/` - Course details/Update/Delete
- `GET/POST /api/enrollments/` - List/Create enrollments
- `DELETE /api/enrollments/{id}/` - Remove enrollment

### Quiz System Endpoints
- `GET/POST /api/quizzes/` - List/Create quizzes
- `GET/POST /api/questions/` - List/Create questions
- `GET/POST /api/options/` - List/Create answer options
- `POST /api/answers/submit-quiz/` - Submit quiz answers
- `GET /api/progress/` - Get student progress

## Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
API_BASE_URL=http://localhost:8000/api
API_AUTH_URL=http://localhost:8000/api/auth

# App Configuration
APP_NAME=eduLearn
APP_VERSION=1.0.0

# Development Configuration
NODE_ENV=development
```

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eduLearn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your backend API URLs
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on specific platforms**
   ```bash
   # iOS (requires macOS)
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device (macOS only)
- `npm run web` - Run in web browser
- `npm run eject` - Eject from Expo (not recommended)

## Key Features Implementation

### Theme System
- Automatic system theme detection
- Manual theme switching (Light/Dark/System)
- Persistent theme preferences
- Theme-aware components and styling

### Authentication Flow
- Secure JWT token storage using Expo SecureStore
- Automatic token refresh with interceptors
- Protected routes based on authentication state
- Role-based access control (Student/Instructor)

### Course Management
- Real-time course data fetching
- Search and filter functionality
- Enrollment management
- Progress tracking with visual indicators

### Quiz System
- Interactive quiz interface with timer
- Real-time answer selection
- Automatic submission on timeout
- Score calculation and feedback

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@edulearn.com or create an issue in the repository.