import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = 'https://jwhndyzjtufmuncoiwnz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3aG5keXpqdHVmbXVuY29pd256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NzI1MjAsImV4cCI6MjA2NTM0ODUyMH0.ATHi6nB6qK8d4S3CnCya80s8WLVQyhDzgXCRdLFPT6M';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});
