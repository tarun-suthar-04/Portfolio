import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
// import { signOut } from "./actions";
import { signOut } from "../actions";
// Admin pages must never be indexed — ARCHITECTURE.md §16 / DESIGN.md.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8">
          <nav className="flex gap-5 text-sm">
            <Link href="/admin/works" className="text-ink hover:text-accent">Works</Link>
            <Link href="/admin/categories" className="text-graphite hover:text-accent">Categories</Link>
            <Link href="/admin/settings" className="text-graphite hover:text-accent">Settings</Link>
          </nav>
          <div className="flex items-center gap-4 text-sm text-graphite">
            <span>{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="hover:text-accent">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
