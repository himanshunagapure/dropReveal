import { createClient } from "@supabase/supabase-js";

function env(name: string): string | undefined {
  const v = import.meta.env[name] as string | undefined;
  return v?.trim() || undefined;
}

const supabaseUrl =
  env("VITE_SUPABASE_URL") ?? env("SUPABASE_URL");
const supabaseAnonKey =
  env("VITE_SUPABASE_ANON_KEY") ??
  env("SUPABASE_ANON_KEY") ??
  env("SUPABASE_PUBLISHABLE_KEY");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY " +
      "(or SUPABASE_URL and SUPABASE_ANON_KEY / SUPABASE_PUBLISHABLE_KEY with Vite envPrefix)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
