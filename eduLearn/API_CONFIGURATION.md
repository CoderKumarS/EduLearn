# API Configuration Guide

**Date:** November 12, 2025  
**Status:** ✅ Configured

---

## Current API Configuration

### Base URLs

```
API Base URL: http://172.21.238.45:8000/api/
Auth URL:     http://172.21.238.45:8000/api/auth/
```

### Configuration Files

1. **Environment Variables** (`.env`)
   ```env
   EXPO_PUBLIC_API_BASE_URL=http://172.21.238.45:8000/api
   EXPO_PUBLIC_API_AUTH_URL=http://172.21.238.45:8000/api/auth
   ```

2. **Config File** (`src/constants/config.ts`)
   - Reads from environment variables
   - Provides fallback URLs for different platforms
   - Logs configuration on startup

3. **API Service** (`src/services/api.ts`)
   - Uses `config.apiBaseUrl` for all API calls
   - Automatically adds JWT token to requests
   - Handles token refresh on 401 errors

4. **Auth Service** (`src/services/authService.ts`)
   - Uses `config.apiAuthUrl` for authentication
   - Handles login, register, and token refresh

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/token/` | Login (get JWT tokens) |
| POST | `/api/auth/token/refresh/` | Refresh access token |

### Course Endpoints

| Method | Endpoint | Description | Paginated |
|--------|----------|-------------|-----------|
| GET | `/api/courses/` | List all courses | ✅ |
| GET | `/api/courses/{id}/` | Get course details | ❌ |
| POST | `/api/courses/` | Create course | ❌ |
| PUT | `/api/courses/{id}/` | Update course | ❌ |
| DELETE | `/api/courses/{id}/` | Delete course | ❌ |

### Enrollment Endpoints

| Method | Endpoint | Description | Paginated |
|--------|----------|-------------|-----------|
| GET | `/api/enrollments/` | List enrollments | ✅ |
| POST | `/api/enrollments/` | Enroll in course | ❌ |
| DELETE | `/api/enrollments/{id}/` | Drop course | ❌ |

### Quiz Endpoints

| Method | Endpoint | Description | Paginated |
|--------|----------|-------------|-----------|
| GET | `/api/quizzes/` | List quizzes | ✅ |
| GET | `/api/quizzes/{id}/` | Get quiz with questions | ❌ |
| POST | `/api/quizzes/` | Create quiz | ❌ |

### Progress Endpoints

| Method | Endpoint | Description | Paginated |
|--------|----------|-------------|-----------|
| GET | `/api/progress/` | List progress records | ✅ |
| GET | `/api/progress/{id}/` | Get progress details | ❌ |
| POST | `/api/progress/` | Create progress | ❌ |
| PUT | `/api/progress/{id}/` | Update progress | ❌ |

### Quiz Submission

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/answers/submit-quiz/` | Submit quiz answers |

---

## Paginated Response Structure

All list endpoints (marked with ✅) return paginated responses:

```json
{
  "count": 10,
  "next": "http://172.21.238.45:8000/api/courses/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Course Title",
      ...
    }
  ]
}
```

**Service Handling:**
```typescript
async getCourses(): Promise<Course[]> {
    const response = await api.get('/courses/');
    // Extract results array from paginated response
    return response.data.results || response.data;
}
```

---

## Authentication Flow

### 1. Login Request

```typescript
POST http://172.21.238.45:8000/api/auth/token/

Body:
{
  "username": "instructor1",
  "password": "StrongPass123!"
}

Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 2. Authenticated Request

```typescript
GET http://172.21.238.45:8000/api/courses/

Headers:
{
  "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGc...",
  "Content-Type": "application/json"
}
```

### 3. Token Refresh (Automatic)

When access token expires (401 error), the API service automatically:
1. Retrieves refresh token from SecureStore
2. Calls `/api/auth/token/refresh/`
3. Gets new access token
4. Retries original request
5. If refresh fails, clears tokens and redirects to login

---

## Test Credentials

```
Username: instructor1
Email: instructor1@example.com
Password: StrongPass123!
```

---

## Changing the API URL

### For Development/Testing

1. **Update `.env` file:**
   ```env
   EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:8000/api
   EXPO_PUBLIC_API_AUTH_URL=http://YOUR_IP:8000/api/auth
   ```

2. **Restart Expo:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Clear cache and restart
   npx expo start --clear
   ```

### For Production

1. Update environment variables in your deployment configuration
2. Ensure CORS is configured on the backend for your domain
3. Use HTTPS for production URLs

---

## Platform-Specific URLs

The config file handles different platforms automatically:

### Android Emulator
```
Default: http://10.0.2.2:8000/api
(10.0.2.2 is the special alias for host machine)
```

### iOS Simulator
```
Default: http://localhost:8000/api
```

### Physical Device
```
Use actual IP address: http://172.21.238.45:8000/api
(Configured in .env file)
```

---

## Troubleshooting

### Issue: "Network Error" or "Connection Refused"

**Solutions:**
1. Verify Django server is running: `python manage.py runserver 0.0.0.0:8000`
2. Check IP address is correct: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Ensure device and computer are on same network
4. Check firewall isn't blocking port 8000

### Issue: "401 Unauthorized"

**Solutions:**
1. Check if token is expired (60 minutes lifetime)
2. Try logging in again to get fresh tokens
3. Verify token is being sent in Authorization header

### Issue: "CORS Error"

**Solutions:**
1. Verify Django CORS settings:
   ```python
   CORS_ALLOW_ALL_ORIGINS = True
   CORS_ALLOW_CREDENTIALS = True
   ```
2. Ensure `corsheaders` middleware is first in MIDDLEWARE list

### Issue: "404 Not Found"

**Solutions:**
1. Verify endpoint URL is correct
2. Check Django URL patterns are registered
3. Ensure trailing slash matches API requirements

---

## Service Files Using API Configuration

1. **api.ts** - Base axios instance
   - Uses: `config.apiBaseUrl`
   - Adds JWT token to all requests
   - Handles token refresh

2. **authService.ts** - Authentication
   - Uses: `config.apiAuthUrl`
   - Login, register, token refresh

3. **courseService.ts** - Course operations
   - Uses: `api` instance (inherits baseURL)
   - Handles paginated responses

4. **adminService.ts** - Admin operations
   - Uses: `api` instance (inherits baseURL)
   - Mock data fallback for missing endpoints

5. **profileService.ts** - User profile
   - Uses: `api` instance (inherits baseURL)

6. **aiTutorService.ts** - AI tutor
   - Uses: `api` instance (inherits baseURL)

---

## Configuration Verification

On app startup, check the console for:

```
=== API Configuration ===
Platform: ios
API Base URL: http://172.21.238.45:8000/api
API Auth URL: http://172.21.238.45:8000/api/auth
Environment Variables:
  EXPO_PUBLIC_API_BASE_URL: http://172.21.238.45:8000/api
  EXPO_PUBLIC_API_AUTH_URL: http://172.21.238.45:8000/api/auth
========================
```

---

## Quick Reference

| Component | File | Configuration Source |
|-----------|------|---------------------|
| Environment | `.env` | Manual configuration |
| Config | `src/constants/config.ts` | Reads from .env |
| API Service | `src/services/api.ts` | Uses config.apiBaseUrl |
| Auth Service | `src/services/authService.ts` | Uses config.apiAuthUrl |
| All Services | `src/services/*.ts` | Use api instance |

---

**Status:** ✅ Configured and Ready  
**Base URL:** `http://172.21.238.45:8000/api/`  
**Auth URL:** `http://172.21.238.45:8000/api/auth/`
