import { createBrowserClient } from "@supabase/ssr";

// Client-side Supabase client. Restricted entirely by RLS via the anon
// key — never given elevated privileges (ARCHITECTURE.md §12).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
