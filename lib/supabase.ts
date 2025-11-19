import { createBrowserClient } from "@supabase/ssr"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 🔥 Fix hot reload: use one global instance only
const globalForSupabase = globalThis as unknown as {
  supabase?: ReturnType<typeof createBrowserClient>
}

export const supabase =
  globalForSupabase.supabase ??
  createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const isDevelopment =
  typeof window === "undefined" ? process.env.NODE_ENV !== "production" : process.env.NEXT_PUBLIC_ENV !== "production"

if (isDevelopment) globalForSupabase.supabase = supabase
