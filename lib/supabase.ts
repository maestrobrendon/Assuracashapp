import { createBrowserClient } from "@supabase/ssr"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a singleton instance for the browser using SSR-compatible client
let client: ReturnType<typeof createBrowserClient> | undefined

export function getSupabaseBrowserClient() {
  if (client) {
    return client
  }

  client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  return client
}

// Export singleton instance for backward compatibility
export const supabase = getSupabaseBrowserClient()
