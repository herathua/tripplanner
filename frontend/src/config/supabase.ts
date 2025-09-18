import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://waqzavsbpqylztbcgctn.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhcXphdnNicHF5bHp0YmNnY3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODY2MTMsImV4cCI6MjA2Njk2MjYxM30.XEJhtZZKaU233-71DYyJ-emRlH3XhAoYJk9vaYnm-y8';

console.log('Supabase Config:', {
  url: supabaseUrl,
  keySet: !!supabaseKey,
  keyLength: supabaseKey?.length
});

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

// Helper function to check if Supabase is properly configured
export const checkSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.storage.listBuckets();
    console.log('Supabase test result:', { data, error });
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};

// Helper function to test file upload
export const testFileUpload = async (file: File) => {
  try {
    console.log('Testing file upload...');
    const fileName = `test-${Date.now()}.${file.name.split('.').pop()}`;
    const { data, error } = await supabase.storage
      .from('guides')
      .upload(fileName, file);
    
    if (error) {
      console.error('Upload test failed:', error);
      return { success: false, error };
    }
    
    console.log('Upload test successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Upload test error:', error);
    return { success: false, error };
  }
};
