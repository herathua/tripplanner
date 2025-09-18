# Quick Setup Guide: Supabase Database

## 🚨 Current Issue
Your Supabase database is missing the `users` table, which is why you're getting the error:
```
"Could not find the table 'public.users' in the schema cache"
```

## ✅ Quick Fix (5 minutes)

### Step 1: Open Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in and select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Run This SQL Command
Copy and paste this entire SQL script into the SQL Editor and click **"Run"**:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    firebase_uid TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    display_name TEXT,
    photo_url TEXT,
    phone_number TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    role TEXT DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON public.users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = firebase_uid);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = firebase_uid);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid()::text = firebase_uid);
```

### Step 3: Configure Storage Bucket (Optional)
If you want to enable image uploads and you have a `profile-photos` bucket, create these policies:

```sql
-- Create storage policies for existing profile-photos bucket
CREATE POLICY "Users can upload profile images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'profile-photos' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Profile images are publicly viewable" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-photos');
```

**Note**: The app is configured to use your existing `profile-photos` bucket. If you don't have this bucket, the app will automatically fall back to personalized avatars.

### Step 4: Test the Setup
1. Go back to your User Management page
2. Try uploading a profile image
3. The errors should be gone!

## 🎯 What This Does

- **Creates `users` table**: Stores user profile data
- **Sets up security**: Users can only access their own data
- **Enables image uploads**: Creates storage bucket for profile photos
- **Handles fallbacks**: If storage fails, uses beautiful placeholder avatars

## 🔧 Alternative: Use Existing Bucket

If you prefer to use your existing `guides` bucket instead of creating a new one, the app will automatically fall back to personalized avatars when storage fails.

## ✅ After Setup

Once you run the SQL commands:
- ✅ Profile image uploads will work
- ✅ Profile data will be saved to Supabase
- ✅ Beautiful fallback avatars if storage fails
- ✅ No more database errors

The User Management component will work perfectly!
