import { createClient } from '@supabase/supabase-js';

let supabase = null;

export function getSupabaseClient() {
  if (supabase) return supabase;
  const url = localStorage.getItem('supabaseUrl');
  const key = localStorage.getItem('supabaseAnonKey');
  if (!url || !key) return null;
  supabase = createClient(url, key);
  return supabase;
}

export function setSupabaseConfig(url, key) {
  if (url && key) {
    localStorage.setItem('supabaseUrl', url);
    localStorage.setItem('supabaseAnonKey', key);
    supabase = createClient(url, key);
  } else {
    localStorage.removeItem('supabaseUrl');
    localStorage.removeItem('supabaseAnonKey');
    supabase = null;
  }
  window.dispatchEvent(new Event('supabase-config-changed'));
}

export { supabase };
