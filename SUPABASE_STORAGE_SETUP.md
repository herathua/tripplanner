# Supabase Profile Management Setup Guide

## Overview

The User Management component now uses **Supabase exclusively** for profile data storage and management, while keeping Firebase only for authentication.

## Architecture

- **Firebase**: Authentication only (login, logout, user session)
- **Supabase**: Profile data storage (display name, photo URL, user preferences)
- **Supabase Storage**: Image uploads (with fallback to personalized avatars)

## Database Schema

Make sure your Supabase `users` table has these columns:

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Storage Configuration

### Option 1: Configure Supabase Storage Policies (Recommended)

1. Go to your Supabase dashboard
2. Navigate to Storage → Policies
3. Create policies for the `guides` bucket:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'guides');

-- Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated users to update own files" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'guides' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to uploaded files
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'guides');
```

### Option 2: Use Personalized Avatars (Fallback)

If Supabase storage is not configured, the system automatically falls back to beautiful personalized avatars using the UI-Avatars service.

## Current Behavior

The User Management component handles all scenarios gracefully:

- ✅ **Loads profile data from Supabase database**
- ✅ **Tries Supabase storage for image uploads**
- ✅ **Falls back to personalized avatars if storage fails**
- ✅ **Updates profile data in Supabase database**
- ✅ **No Firebase profile updates (authentication only)**
- ✅ **Consistent user experience regardless of storage configuration**

## Testing

To test the fallback behavior:

1. Try uploading a profile image
2. If Supabase storage is not configured, you'll see an info message
3. A personalized avatar will be generated using UI-Avatars service
4. The avatar will be consistent (same color for same user)
5. The profile will be updated successfully

## Production Recommendations

For production use:

1. **Configure proper Supabase RLS policies** (Option 1)
2. **Set up Firebase Storage** as a backup option
3. **Implement proper image optimization** and resizing
4. **Add CDN support** for better performance
5. **Implement proper error monitoring** for storage failures

## File Structure

```
frontend/src/services/
├── imageUploadService.ts    # Main image upload service with fallbacks
└── ...

frontend/src/components/user/
├── ProfileSettings.tsx      # Profile management component
└── ...
```

The `ImageUploadService` provides a clean abstraction for image uploads with multiple fallback strategies.
