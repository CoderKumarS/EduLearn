# eduLearn - React Native Learning Platform

A comprehensive mobile learning platform built with React Native and Expo, featuring course management, quizzes, AI tutoring, and progress tracking.

---

## 📚 Documentation

### Essential Documentation Files

- **[API_CONFIGURATION.md](./API_CONFIGURATION.md)** - Complete API configuration guide
  - Base URLs and endpoints
  - Authentication flow
  - Troubleshooting
  - Platform-specific setup

- **[API_INTEGRATION_UPDATES.md](./API_INTEGRATION_UPDATES.md)** - Recent API integration changes
  - Service updates
  - Pagination handling
  - Type mappings

- **[TEST_CREDENTIALS.md](./TEST_CREDENTIALS.md)** - Test user credentials

### API Reference (Root Directory)

- **[API_ENDPOINTS_COMPLETE.md](../API_ENDPOINTS_COMPLETE.md)** - Complete API endpoint documentation
- **[API_HEALTH_CHECK.md](../API_HEALTH_CHECK.md)** - API diagnostic and health check information

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd eduLearn
npm install
```

### 2. Configure API

Copy `.env.example` to `.env` and update with your backend URL:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:

```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP_ADDRESS:8000/api
EXPO_PUBLIC_API_AUTH_URL=http://YOUR_IP_ADDRESS:8000/api/auth
```

**Platform-specific URLs:**
- Physical Device: Use your computer's IP address (e.g., `http://192.168.1.100:8000/api`)
- Android Emulator: Use `http://10.0.2.2:8000/api`
- iOS Simulator: Use `http://localhost:8000/api`

### 3. Start Development Server

```bash
npx expo start
```

### 4. Run on Device

- **iOS Simulator:** Press `i`
- **Android Emulator:** Press `a`
- **Physical Device:** Scan QR code with Expo Go app

---

## 🔑 Test Credentials

```
Username: instructor1
Email: instructor1@example.com
Password: StrongPass123!
```

---

## 📱 Features

- **Authentication** - JWT-based login/register
- **Course Management** - Browse, enroll, and manage courses
- **Quizzes** - Interactive quizzes with scoring
- **Progress Tracking** - Track learning progress
- **AI Tutor** - AI-powered learning assistance
- **Dashboards** - Role-based dashboards (Student, Instructor, Admin)
- **Dark/Light Theme** - Theme switching support

---

## 🏗️ Project Structure

```
eduLearn/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation configuration
│   ├── services/        # API services
│   ├── contexts/        # React contexts (Auth, Theme)
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── constants/       # Constants and configuration
├── .env                 # Environment variables
└── App.tsx             # Root component
```

---

## 🔧 Configuration Files

- **`.env`** - Environment variables (API URLs)
- **`src/constants/config.ts`** - App configuration
- **`src/services/api.ts`** - Axios instance with JWT handling
- **`src/services/authService.ts`** - Authentication service

---

## 🛠️ Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Axios** - HTTP client
- **React Navigation** - Navigation
- **Expo SecureStore** - Secure token storage

---

## 📖 API Integration

The app integrates with a Django REST API backend. All API calls:

- Use JWT authentication
- Handle token refresh automatically
- Support paginated responses
- Include comprehensive error handling

See [API_CONFIGURATION.md](./API_CONFIGURATION.md) for details.

---

## 🐛 Troubleshooting

### Network Errors

1. Verify backend server is running
2. Check IP address in `.env` matches your backend
3. Ensure device and backend are on same network
4. Check firewall settings

### Authentication Issues

1. Verify test credentials are correct
2. Check token expiration (60 minutes)
3. Clear app data and try logging in again

### More Help

See [API_CONFIGURATION.md](./API_CONFIGURATION.md) for detailed troubleshooting.

---

## 📝 Development Notes

- Always restart Expo after changing `.env` file
- Use `npx expo start --clear` to clear cache
- Check console logs for API configuration on startup

---

## 🎯 Current Status

✅ Authentication working  
✅ Course management implemented  
✅ Dashboard screens migrated  
✅ API integration complete  
✅ Pagination handling added  
✅ TypeScript errors resolved  

---

**Version:** 1.0.0  
**Last Updated:** November 12, 2025
