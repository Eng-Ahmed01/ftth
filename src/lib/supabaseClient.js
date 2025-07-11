import { createClient } from '@supabase/supabase-js';

let supabase = null;

export function initSupabase(url, key) {
  supabase = createClient(url, key);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('supabaseUrl', url);
    localStorage.setItem('supabaseApiKey', key);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('supabase:init'));
  }
  return supabase;
}

export function getSupabase() {
  if (supabase) return supabase;
  if (typeof localStorage === 'undefined') return null;
  const url = localStorage.getItem('supabaseUrl');
  const key = localStorage.getItem('supabaseApiKey');
  if (url && key) {
    supabase = createClient(url, key);
  }
  return supabase;
}
