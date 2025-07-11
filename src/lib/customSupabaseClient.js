import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient() {
  const url = localStorage.getItem('supabaseUrl');
  const key = localStorage.getItem('supabaseAnonKey');
  if (!url || !key) return null;
  return createClient(url, key);
}

export const supabase = getSupabaseClient();
