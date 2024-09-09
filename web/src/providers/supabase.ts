import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || typeof supabaseUrl !== 'string') {
  throw new Error('VITE_SUPABASE_URL is not defined or not a string');
}
if (!supabaseAnonKey || typeof supabaseAnonKey !== 'string') {
  throw new Error('VITE_SUPABASE_ANON_KEY is not defined or not a string');
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
