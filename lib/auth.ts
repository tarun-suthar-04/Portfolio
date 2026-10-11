import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Server-side authentication check for the entire /admin segment.
// This is a UX convenience — RLS remains the actual security boundary
// (ARCHITECTURE.md §4, CODING_RULES.md §13: "never bypass authentication").
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    redirect("/admin/login");
  }

  return user;
}
