import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yukyikdbpxtkgwewrfaj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1a3lpa2RicHh0a2d3ZXdyZmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzUzODgsImV4cCI6MjA2NzMxMTM4OH0.UpB0p8mbdoFM_Pwezu3E1z7_KpVsclP69HCwMqYJdRE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);