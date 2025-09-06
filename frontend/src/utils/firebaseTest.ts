// Supabase Storage Test Utility
import { auth } from '../config/firebase';
import { supabase } from '../config/supabase';

// Test Supabase configuration
export const testSupabaseConfig = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://waqzavsbpqylztbcgctn.supabase.co';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhcXphdnNicHF5bHp0YmNnY3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODY2MTMsImV4cCI6MjA2Njk2MjYxM30.XEJhtZZKaU233-71DYyJ-emRlH3XhAoYJk9vaYnm-y8';
  
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key (first 20 chars):', supabaseKey.substring(0, 20) + '...');
  console.log('Supabase client created:', !!supabase);
  
  return {
    url: supabaseUrl,
    key: supabaseKey,
    client: supabase
  };
};

export const testSupabaseStorage = async (): Promise<boolean> => {
  try {
    console.log('Testing Supabase Storage connection...');
    
    // First, test basic Supabase connection
    console.log('Testing basic Supabase connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('_dummy_table_')
      .select('*')
      .limit(1);
    
    if (connectionError && connectionError.code !== 'PGRST116' && connectionError.code !== 'PGRST205') {
      console.error('Supabase connection failed:', connectionError);
      return false;
    }
    console.log('Supabase connection OK (dummy table test passed)');
    
    // List all buckets to see what's available
    console.log('Listing buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Failed to list buckets:', bucketsError);
      console.error('Buckets error details:', {
        message: bucketsError.message,
        status: bucketsError.status,
        statusText: bucketsError.statusText,
        code: bucketsError.code
      });
      
      // If we can't list buckets, it's likely a permissions issue
      console.log('This usually means:');
      console.log('1. No storage policies are set up');
      console.log('2. The anon key doesn\'t have storage permissions');
      console.log('3. Storage is not enabled for this project');
      return false;
    }
    
    console.log('Available buckets:', buckets);
    console.log('Number of buckets found:', buckets?.length || 0);
    
    if (!buckets || buckets.length === 0) {
      console.log('No buckets found. This could mean:');
      console.log('1. No buckets have been created in your Supabase project');
      console.log('2. Storage policies are blocking access');
      console.log('3. You need to create the buckets first');
      return false;
    }
    
    // Check if profile-photos bucket exists
    const profilePhotosBucket = buckets?.find(bucket => bucket.name === 'profile-photos');
    
    if (!profilePhotosBucket) {
      console.warn('profile-photos bucket not found. Available buckets:', buckets?.map(b => b.name));
      return false;
    }
    
    console.log('profile-photos bucket found:', profilePhotosBucket);
    
    // Create a small test file
    const testContent = 'Supabase Storage Test';
    const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
    
    // Try to upload to a test location
    const fileName = `test/test-file-${Date.now()}.txt`;
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, testFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      throw error;
    }
    
    console.log('Test upload successful:', data);
    
    // Try to get download URL
    const { data: urlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName);
    
    console.log('Test download URL:', urlData.publicUrl);
    
    // Clean up test file
    await supabase.storage
      .from('profile-photos')
      .remove([fileName]);
    
    return true;
  } catch (error) {
    console.error('Supabase Storage test failed:', error);
    console.error('Error details:', {
      code: (error as any)?.code,
      message: (error as any)?.message,
      details: (error as any)?.details
    });
    return false;
  }
};

export const checkFirebaseAuth = (): boolean => {
  const user = auth.currentUser;
  console.log('Current user:', user ? { uid: user.uid, email: user.email } : 'No user');
  return !!user;
};
