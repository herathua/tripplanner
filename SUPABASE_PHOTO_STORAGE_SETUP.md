# Complete Profile Photo Flow Setup

This guide explains the complete flow for profile photo management in your Trip Planner app.

## 🔄 **Complete Flow**

```
1. User selects image
   ↓
2. Upload to Supabase storage
   ↓
3. Get photo URL from Supabase
   ↓
4. Update backend database with photo URL
   ↓
5. Show updated photo in frontend
```

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Firebase    │    │    Supabase     │    │     Backend     │
│                 │    │                 │    │                 │
│ • Authentication│    │ • Photo Storage │    │ • User Data     │
│ • Login/Logout  │    │ • profile-photos│    │ • Photo URL     │
│ • Password Reset│    │   bucket        │    │ • Trip Plans    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## ⚙️ **Setup Steps**

### Step 1: Configure Supabase Storage
Create storage policies for your existing `profile-photos` bucket:

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

### Step 2: Backend Database
Your backend already has:
- ✅ `User` model with `photoUrl` field
- ✅ `UserController` with update endpoints
- ✅ `userService` in frontend to call backend APIs

### Step 3: Test the Complete Flow
1. Go to User Management page
2. Try uploading a profile image
3. The flow will be:
   - Upload to Supabase → Get URL
   - Update backend database with URL
   - Show updated photo in frontend

## 🔧 **How It Works**

### **Image Upload Process**
1. **Frontend**: User selects image file
2. **Supabase**: Image uploaded to `profile-photos` bucket
3. **Supabase**: Returns public URL for the image
4. **Backend**: User synced/created with photo URL using `/users/sync` endpoint
5. **Frontend**: UI updated to show new photo

### **Profile Loading Process**
1. **Frontend**: Loads user profile data using `/users/sync` endpoint
2. **Backend**: Creates user if doesn't exist, returns user data including `photoUrl`
3. **Frontend**: Displays photo from backend URL
4. **Fallback**: If no backend photo, shows Firebase photo

### **Fallback System**
- If Supabase storage fails → Personalized avatar generated
- If backend sync fails → Error message shown
- If no photo URL → Shows Firebase photo or initials

## 🎯 **Benefits**

- ✅ **Persistent**: Photo URLs stored in backend database
- ✅ **Reliable**: Multiple fallback options
- ✅ **Scalable**: Uses Supabase for storage, backend for data
- ✅ **Secure**: Proper authentication and authorization
- ✅ **User-friendly**: Clear success/error messages

## 🚨 **Troubleshooting**

### "Storage access denied"
- Check Supabase storage policies are created
- Verify `profile-photos` bucket exists

### "User not found in backend database"
- Make sure user exists in backend
- Check Firebase UID matches backend record

### "Failed to update profile in backend"
- Check backend API is running
- Verify user has permission to update profile

## 📝 **API Endpoints Used**

- `POST /users/sync` - Create or update user profile (handles both cases)
- Supabase Storage API - Upload and get photo URLs

## 🚨 **Troubleshooting**

### "Storage access denied"
- Check Supabase storage policies are created
- Verify `profile-photos` bucket exists

### "User not found in backend database"
- ✅ **FIXED**: Now uses `/users/sync` endpoint which creates user if doesn't exist

### "Failed to update profile in backend"
- Check backend API is running
- Verify user has permission to update profile
