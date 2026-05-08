import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client — uses SERVICE_KEY to bypass RLS.
 * Only use in API routes, never in frontend code.
 */
export const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
