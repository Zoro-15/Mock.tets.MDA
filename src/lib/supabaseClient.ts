import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  supabaseUrl !== 'YOUR_SUPABASE_URL_HERE' &&
  supabaseUrl.trim() !== '' &&
  Boolean(supabaseAnonKey) &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE' &&
  supabaseAnonKey.trim() !== '';

let supabaseInstance = null;

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
  }
}

export const supabase = supabaseInstance;
