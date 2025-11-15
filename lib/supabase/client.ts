// Re-export the single Supabase instance for backward compatibility
import { supabase } from "@/lib/supabase"

export { supabase }

export const createClient = () => {
  return supabase
}
