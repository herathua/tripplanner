import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://waqzavsbpqylztbcgctn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhcXphdnNicHF5bHp0YmNnY3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODY2MTMsImV4cCI6MjA2Njk2MjYxM30.XEJhtZZKaU233-71DYyJ-emRlH3XhAoYJk9vaYnm-y8';

export const supabase = createClient(supabaseUrl, supabaseKey);
