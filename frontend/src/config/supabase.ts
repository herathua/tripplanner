import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://waqzavsbpqylztbcgctn.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhcXphdnNicHF5bHp0YmNnY3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODY2MTMsImV4cCI6MjA2Njk2MjYxM30.XEJhtZZKaU233-71DYyJ-emRlH3XhAoYJk9vaYnm-y8';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to check if Supabase is properly configured
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('_dummy_table_').select('*').limit(1);
    if (error && error.code === 'PGRST116') {
      // This error means the table doesn't exist, but connection is working
      return true;
    }
    return !error;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};
