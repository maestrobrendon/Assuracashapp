import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 🔥 Fix hot reload: use one global instance only
const globalForSupabase = globalThis as unknown as {
  supabase?: ReturnType<typeof createClient>
}

export const supabase =
  globalForSupabase.supabase ??
  createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storageKey: "assuracash-auth",
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

const isDevelopment =
  typeof window === "undefined" ? process.env.NODE_ENV !== "production" : process.env.NEXT_PUBLIC_ENV !== "production"

if (isDevelopment) globalForSupabase.supabase = supabase
