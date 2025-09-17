# Trip Planner Application - Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the updated Trip Planner application with the new authentication features and UI theme.

## Changes Made

### Frontend Changes
1. **Removed Anonymous Login**: Anonymous login button has been removed from the login page
2. **Added Password Reset**: Firebase email password reset functionality implemented
3. **Updated UI Theme**: Applied Royal Blue (#4169E1) and Sky Blue (#87CEEB) color scheme
4. **Enhanced Security**: Proper Firebase authentication integration with backend

### Backend Changes
1. **Firebase Authentication**: Proper Firebase token validation
2. **Security Configuration**: Updated Spring Security with Firebase authentication filter
3. **User Synchronization**: Enhanced user sync endpoint for Firebase users

## Prerequisites

### Required Software
- Node.js (v18 or higher)
- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- Firebase CLI (optional, for Firebase management)

### Required Accounts
- Firebase project with Authentication enabled
- MySQL database instance

## Step-by-Step Deployment Instructions

### 1. Firebase Configuration

#### 1.1 Update Firebase Configuration
1. Go to your Firebase Console (https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings > General
4. Scroll down to "Your apps" section
5. Copy the Firebase configuration object

#### 1.2 Update Frontend Firebase Config
Update `frontend/src/config/firebase.ts` with your Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

#### 1.3 Enable Authentication Methods
In Firebase Console:
1. Go to Authentication > Sign-in method
2. Enable Email/Password authentication
3. Enable Google authentication (optional)
4. Configure password reset email templates

### 2. Backend Configuration

#### 2.1 Database Setup
1. Create MySQL database:
```sql
CREATE DATABASE tripplanner;
```

2. Update `backend/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/tripplanner?useSSL=false&serverTimezone=UTC
    username: your-db-username
    password: your-db-password
    driver-class-name: com.mysql.cj.jdbc.Driver
```

#### 2.2 Firebase Service Account
1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Place it in `backend/src/main/resources/firebase-service-account.json`

#### 2.3 Build and Run Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will be available at `http://localhost:8080`

### 3. Frontend Configuration

#### 3.1 Environment Variables
Create `frontend/.env.local`:
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

#### 3.2 Install Dependencies and Build
```bash
cd frontend
npm install
npm run build
```

#### 3.3 Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Production Deployment

#### 4.1 Backend Production Setup
1. **Environment Variables**: Set production database credentials
2. **Firebase Service Account**: Ensure production Firebase service account is configured
3. **Build**: `mvn clean package -Pproduction`
4. **Deploy**: Deploy the JAR file to your server

#### 4.2 Frontend Production Setup
1. **Build**: `npm run build`
2. **Deploy**: Deploy the `dist` folder to your web server
3. **Environment**: Update API URLs for production

### 5. Testing the Implementation

#### 5.1 Test Authentication Flow
1. Navigate to the login page
2. Verify anonymous login button is removed
3. Test email/password login
4. Test password reset functionality
5. Test Google login (if enabled)

#### 5.2 Test UI Theme
1. Verify Royal Blue (#4169E1) is used for primary buttons
2. Verify Sky Blue (#87CEEB) is used for accents
3. Check hover states use darker Royal Blue (#2E4A8A)

#### 5.3 Test Backend Integration
1. Verify user synchronization works
2. Check Firebase token validation
3. Test protected endpoints

### 6. Security Considerations

#### 6.1 Firebase Security Rules
Update Firebase Security Rules if using Firestore:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### 6.2 Environment Security
- Never commit Firebase service account keys to version control
- Use environment variables for sensitive configuration
- Enable HTTPS in production
- Configure proper CORS settings

### 7. Troubleshooting

#### 7.1 Common Issues

**Firebase Authentication Not Working**
- Check Firebase configuration
- Verify API keys are correct
- Ensure authentication methods are enabled

**Backend Authentication Errors**
- Verify Firebase service account is properly configured
- Check token validation in logs
- Ensure CORS is properly configured

**UI Theme Not Applied**
- Clear browser cache
- Verify Tailwind CSS is properly configured
- Check for CSS conflicts

#### 7.2 Logs and Debugging
- Frontend: Check browser console for errors
- Backend: Check application logs for authentication issues
- Firebase: Check Firebase Console for authentication events

### 8. Monitoring and Maintenance

#### 8.1 Monitoring
- Set up Firebase Analytics for authentication events
- Monitor backend logs for authentication failures
- Track user registration and login success rates

#### 8.2 Maintenance
- Regularly update Firebase SDK versions
- Monitor Firebase quotas and limits
- Update security configurations as needed

## Summary

The Trip Planner application has been successfully updated with:
- ✅ Anonymous login removed
- ✅ Password reset functionality added
- ✅ Royal Blue and Sky Blue theme applied
- ✅ Firebase authentication properly integrated
- ✅ Backend security enhanced
- ✅ End-to-end authentication flow working

The application is now ready for production deployment with improved security and user experience.
