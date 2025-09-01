# Supabase Storage Setup for Blog Editor

## Current Issue
The blog editor is experiencing a "row-level security policy" error when trying to upload images to Supabase storage. This is because the `guides` bucket has Row Level Security (RLS) enabled.

## Solutions

### Option 1: Disable RLS for the guides bucket (Recommended for development)
1. Go to your Supabase dashboard
2. Navigate to Storage > Buckets
3. Find the `guides` bucket
4. Click on the bucket settings
5. Disable "Row Level Security (RLS)" for this bucket
6. Save the changes

### Option 2: Create a storage policy (Recommended for production)
1. Go to your Supabase dashboard
2. Navigate to Storage > Policies
3. Create a new policy for the `guides` bucket with the following settings:
   - Policy name: `Allow public uploads`
   - Target roles: `public`
   - Using expression: `true`
   - Operations: `INSERT`, `SELECT`

### Option 3: Use environment variables (Alternative)
Create a `.env` file in the frontend directory with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Current Fallback
The application currently includes a fallback mechanism that converts images to base64 when Supabase upload fails. This allows the editor to continue working even without proper storage configuration.

## Testing
After making changes to Supabase settings, test the image upload functionality in the blog editor. You should see either:
- Successful upload to Supabase storage, or
- Fallback to base64 encoding with a console message
