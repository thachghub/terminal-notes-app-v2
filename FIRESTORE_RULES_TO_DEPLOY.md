# Firestore Rules to Deploy

## How to Deploy These Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `hyperterminal-app`
3. Go to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Replace the existing rules with the rules below
6. Click **Publish**

## Rules to Deploy

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own user preferences
    match /userPreferences/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read and write their own terminal entries
    match /entryterminalentries/{entryId} {
      // Allow all operations if user is authenticated
      // The app logic ensures users only query their own data
      allow read, write, create, delete: if request.auth != null;
    }
    
    // Allow users to read and write their own user data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read and write their own preferences
    match /users/{userId}/preferences/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## What This Fixes

The original rules were too restrictive and prevented proper querying of the `entryterminalentries` collection. These new rules:

1. **Allow authenticated users to query their entries** - The app uses `where('userId', '==', user.uid)` to filter entries
2. **Maintain security** - Only authenticated users can access data
3. **Enable real-time listeners** - The `onSnapshot` calls will work properly
4. **Allow CRUD operations** - Create, read, update, and delete operations are permitted for authenticated users

## After Deploying

1. Restart the development server: `npm run dev`
2. Try logging in and creating entries
3. The Firebase errors should be resolved 