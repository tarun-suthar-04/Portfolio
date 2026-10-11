import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client, used in Server Components/Actions so that
// the authenticated user's session (and therefore RLS) applies — per
// ARCHITECTURE.md §12 and CODING_RULES.md §9 ("never bypass RLS").
//
// Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to be
// set (see .env.example). Until a real Supabase project is connected, code
// that calls this will fail at runtime — that's expected at this stage.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }>
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            );
          } catch {
            // Called from a Server Component with no way to set cookies —
            // safe to ignore if middleware refreshes the session instead.
          }
        },
      },
    }
  );
}
