import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Demo mode: if Supabase env vars not set, export null
// Components should check: if (!supabase) use demoData fallback
export const isDemo = !supabaseUrl || !supabaseAnonKey;

export const supabase = isDemo
  ? null
  : createClient(supabaseUrl, supabaseAnonKey);

if (isDemo) {
  console.warn('[ShilpMitra] Running in DEMO MODE — Supabase not configured. Using local demo data.');
} else {
  console.log('[ShilpMitra] Supabase connected:', supabaseUrl);
}
