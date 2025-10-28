# Deployment Guide

This guide covers how to deploy the eduLearn mobile app to different platforms.

## Prerequisites

- Node.js 18+ installed
- Expo CLI installed globally (`npm install -g @expo/cli`)
- For iOS: macOS with Xcode
- For Android: Android Studio with SDK
- Expo account (free at expo.dev)

## Environment Setup

1. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
2. **Update API URLs in .env**
   ```env
   # For production
   API_BASE_URL=https://your-backend-api.com/api
   API_AUTH_URL=https://your-backend-api.com/api/auth
   ```

## Development Build

### Web Deployment

1. **Build for web**
   ```bash
   npm run build:web
   ```

2. **Deploy to Netlify/Vercel**
   - Upload the `web-build` folder
   - Configure redirects for SPA routing

### Mobile App Store Deployment

#### Android (Google Play Store)

1. **Create Android build**
   ```bash
   expo build:android
   ```

2. **Download APK/AAB**
   ```bash
   expo build:status
   ```

3. **Upload to Google Play Console**
   - Create app listing
   - Upload AAB file
   - Configure store listing
   - Submit for review

#### iOS (App Store)

1. **Create iOS build**
   ```bash
   expo build:ios
   ```

2. **Download IPA**
   ```bash
   expo build:status
   ```

3. **Upload to App Store Connect**
   - Use Xcode or Application Loader
   - Configure app metadata
   - Submit for review

## Expo Application Services (EAS)

For more advanced builds and CI/CD:

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Configure EAS**
   ```bash
   eas build:configure
   ```

3. **Build for all platforms**
   ```bash
   eas build --platform all
   ```

## Backend Requirements

Ensure your Django backend is configured for production:

1. **CORS Settings**
   ```python
   CORS_ALLOWED_ORIGINS = [
       "https://your-app-domain.com",
   ]
   ```

2. **API Rate Limiting**
   ```python
   REST_FRAMEWORK = {
       'DEFAULT_THROTTLE_CLASSES': [
           'rest_framework.throttling.AnonRateThrottle',
           'rest_framework.throttling.UserRateThrottle'
       ],
       'DEFAULT_THROTTLE_RATES': {
           'anon': '100/day',
           'user': '1000/day'
       }
   }
   ```

3. **HTTPS Configuration**
   - Use SSL certificates
   - Configure secure headers
   - Enable HSTS

## Testing Before Deployment

1. **Test on physical devices**
   ```bash
   expo start --tunnel
   ```

2. **Test all user flows**
   - Registration and login
   - Course browsing and enrollment
   - Quiz taking
   - Dashboard functionality

3. **Test offline scenarios**
   - Network connectivity issues
   - Token expiration handling
   - Error boundary functionality

## Monitoring and Analytics

Consider integrating:

- **Sentry** for error tracking
- **Firebase Analytics** for user behavior
- **Crashlytics** for crash reporting

## App Store Optimization

### App Store Listing

1. **App Name**: eduLearn - E-Learning Platform
2. **Description**: Comprehensive mobile learning platform with courses, quizzes, and progress tracking
3. **Keywords**: education, learning, courses, quiz, study, mobile learning
4. **Screenshots**: Include all major screens
5. **App Icon**: Professional, recognizable design

### Privacy Policy

Create a privacy policy covering:
- Data collection practices
- User authentication
- Course progress tracking
- Third-party integrations

## Post-Deployment

1. **Monitor app performance**
2. **Collect user feedback**
3. **Plan regular updates**
4. **Monitor backend API usage**
5. **Update dependencies regularly**

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Expo SDK compatibility
   - Verify all dependencies are compatible
   - Clear cache: `expo start --clear`

2. **API Connection Issues**
   - Verify backend is accessible
   - Check CORS configuration
   - Test API endpoints manually

3. **Authentication Problems**
   - Verify JWT token format
   - Check token expiration handling
   - Test refresh token flow

For more help, check the [Expo documentation](https://docs.expo.dev/) or create an issue in the repository.