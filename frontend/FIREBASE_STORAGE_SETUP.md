# Firebase Storage Setup Guide

## Issue: Profile Photo Upload Not Working

The profile photo upload functionality may not be working due to Firebase Storage security rules or configuration issues. Follow this guide to fix the problem.

## Step 1: Check Firebase Storage Rules

The most common issue is that Firebase Storage security rules are blocking uploads. You need to set up proper rules in your Firebase Console.

### Go to Firebase Console:
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `chatbot-3be85`
3. Go to **Storage** in the left sidebar
4. Click on **Rules** tab

### Set the following rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload profile photos
    match /profile-photos/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read all profile photos (for display)
    match /profile-photos/{allPaths=**} {
      allow read: if request.auth != null;
    }
    
    // Allow authenticated users to upload test files
    match /test/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Alternative (Less Secure - For Development Only):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 2: Verify Firebase Configuration

Make sure your Firebase configuration in `frontend/src/config/firebase.ts` is correct:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyCkd1INtaVbv7zUoK35aRotDC1G3p3Wdic",
  authDomain: "chatbot-3be85.firebaseapp.com",
  projectId: "chatbot-3be85",
  storageBucket: "chatbot-3be85.firebasestorage.app", // Make sure this is correct
  messagingSenderId: "698958722407",
  appId: "1:698958722407:web:f357f8d381d5cbd205abc2",
  measurementId: "G-YNEBZ1BK3V"
};
```

## Step 3: Test the Connection

1. Go to the User Settings page
2. Click the "Test Firebase Connection" button
3. Check the browser console for detailed logs
4. Look for any error messages

## Step 4: Common Issues and Solutions

### Issue 1: "Permission denied" error
**Solution**: Update Firebase Storage rules as shown in Step 1

### Issue 2: "User not authenticated" error
**Solution**: Make sure the user is logged in before trying to upload

### Issue 3: "Storage bucket not found" error
**Solution**: Verify the storage bucket name in Firebase configuration

### Issue 4: "Network error" or "CORS error"
**Solution**: Check if Firebase project is properly configured and accessible

## Step 5: Debug Steps

1. **Check Browser Console**: Look for error messages when uploading
2. **Check Network Tab**: See if requests are being made to Firebase
3. **Check Firebase Console**: Look at the Storage section to see if files are being uploaded
4. **Test with Small Files**: Try uploading a very small image first

## Step 6: Manual Testing

You can also test Firebase Storage directly in the browser console:

```javascript
// Test in browser console (make sure you're logged in)
import { storage } from './src/config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Create a test file
const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
const testRef = ref(storage, 'test/test-file.txt');

// Try to upload
uploadBytes(testRef, testFile)
  .then(snapshot => {
    console.log('Upload successful:', snapshot);
    return getDownloadURL(snapshot.ref);
  })
  .then(url => {
    console.log('Download URL:', url);
  })
  .catch(error => {
    console.error('Upload failed:', error);
  });
```

## Step 7: Enable Firebase Storage

Make sure Firebase Storage is enabled in your Firebase project:

1. Go to Firebase Console
2. Select your project
3. Go to **Storage** in the left sidebar
4. If you see "Get started", click it to enable Storage
5. Choose your storage location (preferably close to your users)

## Troubleshooting Checklist

- [ ] Firebase Storage is enabled in the project
- [ ] Storage rules allow authenticated users to upload
- [ ] User is authenticated before uploading
- [ ] Firebase configuration is correct
- [ ] Storage bucket name matches the configuration
- [ ] No CORS issues (check browser network tab)
- [ ] File size is under 5MB
- [ ] File type is supported (JPG, PNG, GIF)

## Contact

If the issue persists after following these steps, check the browser console for specific error messages and share them for further debugging.
